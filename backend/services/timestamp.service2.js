const mongoose = require("mongoose");
const dayjs = require("dayjs");
const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Timestamp = require("../models/Timestamp");
const Image = require("../models/Image");
const User = require("../models/User");
const NotifyService = require("./notify.service");

const RoleTypeService = require("./roleType.service");
const UploadService = require("./upload.service");
require("dayjs/locale/th");

const methods = {
  createPipeline(req) {
    const pipeline = [];
    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
      });
    }
    if (req.query.ot === "true") {
      pipeline.push({
        $match: {
          "ot_status.require": { $exists: true, $eq: true },
        },
      });
    }

    if (req.query.type) {
      pipeline.push({
        $match: {
          employeeType: req.query.type,
        },
      });
    }

    if (req.query.profile) {
      pipeline.push({
        $match: { employee: new mongoose.Types.ObjectId(req.query.profile) },
      });
    }
    if (req.query.me) {
      pipeline.push({
        $match: { employee: new mongoose.Types.ObjectId(req.query.me) },
      });

      pipeline.push({
        $match: { status_checkOut: false },
      });
    }

    if (req.query.project_id) {
      pipeline.push({
        $match: {
          project_in: new mongoose.Types.ObjectId(req.query.project_id),
        },
      });
    }

    if (req.query.dateStart) {
      pipeline.push({
        $match: {
          checkIn: {
            $lte: new Date(req.query.dateEnd),
          },
        },
      });
      pipeline.push({
        $match: {
          checkIn: { $gte: new Date(req.query.dateStart) },
        },
      });
      // pipeline.push({ $sort: { "department.department_code": 1 } });
    }

    if (req.query.checkoutem) {
      pipeline.push({
        $match: {
          $or: [
            { employeekey: req.query.checkoutem },
            { employee_firstname: req.query.checkoutem },
            { employee_id: req.query.checkoutem },
          ],
        },
      });
      pipeline.push({
        $match: {
          status_checkOut: false,
        },
      });
    }

    if (req.query.em) {
      pipeline.push({
        $match: {
          employee: new mongoose.Types.ObjectId(req.query.em),
        },
      });
    }

    if (req.query.ot === "true") {
      pipeline.push({
        $match: {
          "ot_status.require": { $exists: true, $eq: true },
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "ot_status.approver",
        foreignField: "_id",
        as: "ot_status.approver",
      },
    });

    pipeline.push({
      $set: {
        "ot_status.approver": { $arrayElemAt: ["$ot_status.approver", 0] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "images",
        localField: "image",
        foreignField: "_id",
        as: "image",
      },
    });

    pipeline.push({
      $set: { image: { $arrayElemAt: ["$image", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "images",
        localField: "image_out",
        foreignField: "_id",
        as: "image_out",
      },
    });

    pipeline.push({
      $set: { image_out: { $arrayElemAt: ["$image_out", 0] } },
    });

    pipeline.push({
      $set: {
        checkIn_cal: {
          $cond: {
            if: { $lt: [{ $hour: "$checkIn" }, 1] },
            then: {
              $dateFromParts: {
                year: { $year: "$checkIn" },
                month: { $month: "$checkIn" },
                day: { $dayOfMonth: "$checkIn" },
                hour: 1,
                minute: 0,
                second: 0,
              },
            },
            else: "$checkIn",
          },
        },
      },
    });
    pipeline.push({
      $set: { hour: { $hour: "$checkIn" } },
    });

    pipeline.push({
      $set: {
        amount: {
          $dateDiff: {
            startDate: "$checkIn_cal",
            endDate: "$checkOut",
            unit: "hour",
          },
        },
      },
    });

    pipeline.push({
      $set: {
        amount: {
          $cond: [{ $lt: ["$amount", 0] }, 1, "$amount"],
        },
      },
    });

    pipeline.push({
      $set: {
        ot_time: {
          $cond: [
            { $gt: ["$amount", 9] },
            { $subtract: ["$amount", 9] },
            // {
            //   $cond: [{ $lt: ["$ot_time", 0] }, 0, "$ot_time"],
            // },
            0,
          ],
        },
      },
    });

    pipeline.push({
      $set: {
        normal_time: { $cond: [{ $gte: ["$amount", 9] }, 8, "$amount"] },
      },
    });

    pipeline.push({
      $set: {
        ot_show: {
          $cond: [{ $eq: ["$ot_status.status", "APPROVE"] }, "$ot_time", 0],
        },
      },
    });

    pipeline.push({
      $set: {
        price: {
          $cond: [
            { $eq: ["$ot_status.status", "APPROVE"] },
            {
              $add: [
                { $multiply: ["$salary.day", "$extra"] },
                {
                  $multiply: [
                    "$ot_time",
                    {
                      $multiply: ["$salary.hr", "$extra_ot"],
                    },
                  ],
                },
              ],
            },
            // {
            //   $multiply: [
            //     "$normal_time", // chacked to 8
            //     { $multiply: ["$salary.hr", "$extra"] },
            //   ],
            // },
            {
              $multiply: [8, { $multiply: ["$salary.hr", "$extra"] }],
            },
          ],
        },
      },
    });

    pipeline.push({
      $set: {
        priceLabor: "$price",
      },
    });

    pipeline.push({
      $set: {
        totalPrice: {
          $add: ["$price", "$salary_extra.day"],
        },
      },
    });

    if (req.query.dash === "true") {
      pipeline.push({
        $group: {
          _id: "$project_in",
          timesTampData: { $push: "$$ROOT" }, // Preserve all timestamp data within each project
          totalWork: { $sum: "$normal_time" },
          totalWork_OT: { $sum: "$ot_show" },
          totalLabor: { $sum: "$priceLabor" },
        },
      });

      pipeline.push({
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "projectDetails",
        },
      });

      pipeline.push({
        $set: {
          projectDetails: { $arrayElemAt: ["$projectDetails", 0] }, // Extract project details
          totalRecords: { $size: "$timesTampData" }, // Count the number of timestamp entries
        },
      });

      // Unwind timesTampData to allow lookup inside the array
      pipeline.push({
        $unwind: {
          path: "$timesTampData",
          preserveNullAndEmptyArrays: true,
        },
      });

      // Lookup employee details for each timestamp entry
      pipeline.push({
        $lookup: {
          from: "employees",
          localField: "timesTampData.employee",
          foreignField: "_id",
          as: "timesTampData.employeeDetails",
        },
      });

      // Flatten employee details
      pipeline.push({
        $set: {
          "timesTampData.employeeDetails": {
            $arrayElemAt: ["$timesTampData.employeeDetails", 0],
          },
        },
      });
      pipeline.push({
        $lookup: {
          from: "departments", // Assuming the department details are stored in this collection
          localField: "timesTampData.employeeDetails.department", // Reference the department field in employeeDetails
          foreignField: "_id", // Match with the _id field in the departments collection
          as: "timesTampData.employeeDetails.department",
        },
      });

      // Flatten department details
      pipeline.push({
        $set: {
          "timesTampData.employeeDetails.department": {
            $arrayElemAt: ["$timesTampData.employeeDetails.department", 0],
          },
        },
      });

      pipeline.push({
        $unwind: {
          path: "$timesTampData",
          preserveNullAndEmptyArrays: true, // Keep projects without timestamps
        },
      });

      // Calculate total salary.day
      pipeline.push({
        $group: {
          _id: "$_id",
          projectDetails: { $first: "$projectDetails" },
          totalRecords: { $first: "$totalRecords" },
          totalLabor: { $first: "$totalLabor" },
          totalSalaryDay: { $sum: "$timesTampData.salary.day" }, // Sum salary.day
          totalSalaryHr: { $sum: "$timesTampData.salary.hr" }, // Sum salary.day
          timesTampData: { $push: "$timesTampData" }, // Reconstruct timesTampData array
        },
      });

      // Count total timestamp entries after re-grouping
      pipeline.push({
        $set: {
          totalTimestampEntries: { $size: "$timesTampData" }, // Count all timestamp entries
        },
      });

      // Final projection
      pipeline.push({
        $project: {
          _id: 0,
          projectId: "$_id",
          projectDetails: 1,
          totalLabor: 1,
          totalRecords: 1,
          totalSalaryDay: 1, // Include total sum of salary.day
          totalSalaryHr: 1, // Include total sum of salary.day
          totalTimestampEntries: 1, // Include count of all timestamp entries
          timesTampData: 1,
        },
      });
    }

    if (req.query.cal === "true") {
      pipeline.push({
        $group: {
          _id: "$employee", // Group by employee ID
          timesTampData: { $push: "$$ROOT" }, // Push all original fields into an array
        },
      });

      pipeline.push({
        $lookup: {
          from: "employees", // Employee collection
          localField: "_id", // _id is the employee ID
          foreignField: "_id", // Match with employee collection's _id
          as: "employeeDetails",
        },
      });

      pipeline.push({
        $unwind: {
          path: "$timesTampData",
          preserveNullAndEmptyArrays: true, // Keep records even if no timestamps exist
        },
      });

      pipeline.push({
        $lookup: {
          from: "projects", // Collection containing project details
          localField: "timesTampData.project_in", // Match with `project_in` field in timesTampData
          foreignField: "_id", // Match with the project `_id` in the projects collection
          as: "timesTampData.projectDetails", // Embed project details
        },
      });

      pipeline.push({
        $set: {
          "timesTampData.projectDetails": {
            $arrayElemAt: ["$timesTampData.projectDetails", 0], // Get the first element of the array
          },
        },
      });

      pipeline.push({
        $group: {
          _id: "$_id", // Re-group by employee ID
          employeeDetails: { $first: "$employeeDetails" }, // Preserve employee details
          timesTampData: { $push: "$timesTampData" }, // Recreate the array of timestamp data
        },
      });

      pipeline.push({
        $project: {
          employeeId: "$_id", // Rename `_id` to `employeeId`
          timesTampData: 1, // Include timesTampData with enriched project details
          employeeDetails: { $arrayElemAt: ["$employeeDetails", 0] }, // Flatten employee details array
        },
      });

      pipeline.push({
        $set: {
          totalWork: {
            $size: "$timesTampData.normal_time",
          },
        },
      });

      pipeline.push({
        $set: {
          totalWork_OT: {
            $sum: "$timesTampData.ot_show",
          },
        },
      });
      pipeline.push({
        $set: {
          totalLabor: {
            $sum: "$timesTampData.priceLabor",
          },
        },
      });
    }

    if (req.query.role && req.query.cal === "true") {
      pipeline.push({
        $match: {
          "employeeDetails.role": new mongoose.Types.ObjectId(req.query.role),
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    });

    pipeline.push({
      $set: { employee: { $arrayElemAt: ["$employee", 0] } },
    });

    if (req.query.role && req.query.cal !== "true") {
      pipeline.push({
        $match: {
          "employee.role": new mongoose.Types.ObjectId(req.query.role),
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "departments",
        localField: "employee.department",
        foreignField: "_id",
        as: "department",
      },
    });

    pipeline.push({
      $set: {
        department: { $arrayElemAt: ["$department", 0] }, // Flatten the `role` array
      },
    });

    pipeline.push({
      $lookup: {
        from: "roletypes",
        localField: "employee.role",
        foreignField: "_id",
        as: "role",
      },
    });

    pipeline.push({
      $set: {
        role: { $arrayElemAt: ["$role", 0] }, // Flatten the `role` array
      },
    });

    pipeline.push({
      $lookup: {
        from: "projects",
        localField: "project_in",
        foreignField: "_id",
        as: "project_in",
      },
    });

    pipeline.push({
      $set: { project_in: { $arrayElemAt: ["$project_in", 0] } },
    });

    if (req.query.name) {
      pipeline.push({
        $match: {
          $or: [
            { firstname: { $regex: req.query.name } },
            { lastname: { $regex: req.query.name } },
            { phone_number: { $regex: req.query.name } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $set: { id: "$_id" } });
    if (req.query.sort === "true") {
      pipeline.push({ $sort: { "department.department_code": 1 } });
    }

    pipeline.push({
      $facet: {
        count: [{ $count: "total" }],
        data: [
          {
            $skip: +(
              (req.query.size || config.pageLimit) *
              ((req.query.page || 1) - 1)
            ),
          },
          {
            $limit: parseInt(req.query.size, 10) || config.pageLimit,
          },
        ],
        totalpriceExtra: [
          {
            $group: {
              _id: null, // Group all records
              totalPriceSumExtra: { $sum: "$salary_extra.day" }, // Calculate the total sum of totalPrice
            },
          },
        ],
        totalSum: [
          {
            $group: {
              _id: null, // Group all records
              totalPriceSum: { $sum: "$priceLabor" }, // Calculate the total sum of totalPrice
            },
          },
        ],
        allPrice: [
          {
            $group: {
              _id: null, // Group all records
              totalPriceSum: { $sum: "$totalPrice" }, // Calculate the total sum of totalPrice
            },
          },
        ],
      },
    });

    return { pipeline };
  },
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Timestamp.aggregate(this.createPipeline(req).pipeline)])
          .then((result) => {
            const rows = result[0][0]?.data;
            const queryResult = rows;
            const priceSum = result[0][0]?.totalSum[0]?.totalPriceSum;
            const allSum = result[0][0]?.allPrice[0]?.totalPriceSum;
            const priceExtra =
              result[0][0]?.totalpriceExtra[0]?.totalPriceSumExtra;
            const count = result[0][0]?.count?.[0]?.total;
            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: queryResult,
              totalLabor: priceSum,
              totalpriceExtra: priceExtra,
              allPrice: allSum,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  async findNotify(req) {
    const limit = +(req.query.size || config.pageLimit);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Timestamp.aggregate(this.createPipeline(req).pipeline)])
          .then((result) => {
            const rows = result[0][0]?.data;
            const queryResult = rows;

            const count = result[0][0]?.count?.[0]?.total;
            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: queryResult,
            });
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  async findCheckin(req) {
    const limit = +(req.query.size || config.pageLimit);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Timestamp.aggregate(this.createPipeline(req).pipeline)])
          .then((result) => {
            const rows = result[0][0]?.data[0];
            const queryResult = rows;
            resolve(queryResult);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await Timestamp.aggregate(
          this.createPipeline(id).pipeline
        );
        const obj = result[0].data[0];
        if (!obj) {
          reject(ErrorNotFound("not found"));
        }

        resolve(obj);
      } catch (error) {
        reject(ErrorNotFound(`not found , ${error}`));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // if (data.employee) {
        //   const existingCheckIn = await Timestamp.findOne({
        //     employee: data.employee,
        //     status_checkOut: false, // ยังไม่ได้ check-out
        //   }).session(session);

        //   if (existingCheckIn) {
        //     await session.abortTransaction();
        //     return resolve();
        //   }
        // }
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0
        );
        const endOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );

        const todayCheckIn = await Timestamp.findOne({
          employee: data.employee,
          status_checkOut: false, // ยังไม่ได้ check-out
          checkIn: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        }).session(session);

        if (todayCheckIn) {
          await session.abortTransaction();
          return resolve({ message: "Already checked in today" });
        }

        const { image } = data;
        if (image) {
          try {
            const uploadedImage = await UploadService.uploadBase64(data);
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image = databasedImage.id;
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }
        const payload = { ...data, checkIn: new Date() };
        const obj = new Timestamp(payload);
        const inserted = await obj.save();
        await session.commitTransaction();
        resolve(inserted);
      } catch (error) {
        await session.abortTransaction();
        reject(ErrorBadRequest(error.message));
      } finally {
        session.endSession();
      }
    });
  },

  insertWithSession(data, importedSession) {
    return new Promise(async (resolve, reject) => {
      let session;
      if (importedSession) {
        session = importedSession;
      } else {
        session = await mongoose.startSession();
        session.startTransaction();
      }

      try {
        const { image } = data;

        const roleTypeObj = await RoleTypeService.findById(data.role);
        if (!roleTypeObj) {
          console.log("Not Found Role Type Object");
          reject(ErrorNotFound("roleType id: not found"));
        }

        if (image) {
          try {
            const uploadedImage = await UploadService.upload(image);
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image = databasedImage.id;
            console.info("Image add success");
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }

        const obj = new Timestamp(data);
        const inserted = await obj.save({ session });
        if (!importedSession) {
          await session.commitTransaction();
        }
        resolve(inserted);
      } catch (error) {
        if (!importedSession) {
          await session.abortTransaction();
        }
        reject(ErrorBadRequest(error.message));
      } finally {
        if (!importedSession) {
          session.endSession();
        }
      }
    });
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Timestamp.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Timestamp id: not found"));
        }

        const { image } = data;
        const images = { image: data.image_out };

        if (images) {
          try {
            const uploadedImage = await UploadService.uploadBase64(images);
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image_out = databasedImage.id;
            console.info("Image update success");
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }

        // if (data?.ot_approve) {
        data.checkOut = new Date();
        // } else {
        //   if (new Date() > new Date(new Date().setHours(17, 0, 0))) {
        // data.checkOut = new Date(data?.checkIn).setHours(17, 0, 0); // Set checkOut to 17:00 of checkIn date
        //   }
        // }
        const payload = { ...data };

        await Timestamp.updateOne({ _id: id }, payload);

        NotifyService.timestampNotify({
          message: `${data.employee_firstname} ${
            data.employee_lastname
          } \nproject:${payload?.project_out?.name}\n check in ${dayjs(
            data?.checkIn
          )
            .locale("th")
            .format("DD/MM/YYYY : HH.mm นาที")}\n check out ${dayjs(
            payload?.checkOut
          )
            .locale("th")
            .format("DD/MM/YYYY : HH.mm นาที")} `,
        });
        await session.commitTransaction();
        resolve(Object.assign(obj, data));
      } catch (error) {
        await session.abortTransaction();
        reject(error);
      } finally {
        session.endSession();
      }
    });
  },

  updateOT(id, data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Timestamp.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Timestamp id: not found"));
        }

        const payload = { ...data.datasubmit };
        // console.log(payload);

        await Timestamp.updateOne({ _id: id }, payload);

        await session.commitTransaction();
        resolve(Object.assign(obj, data));
      } catch (error) {
        await session.abortTransaction();
        reject(error);
      } finally {
        session.endSession();
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Timestamp.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        const objUser = obj.uid;
        if (objUser) {
          await User.deleteOne({ _id: objUser });
        }
        await Timestamp.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
