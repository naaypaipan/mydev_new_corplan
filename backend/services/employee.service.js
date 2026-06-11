const mongoose = require("mongoose");
const dayjs = require("dayjs");
const config = require("../configs/app");
require("dayjs/locale/th");
const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Employee = require("../models/Employee");
const Image = require("../models/Image");
const User = require("../models/User");
const _ = require("lodash");
const RoleTypeService = require("./roleType.service");
const UploadService = require("./upload.service");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    // if(req.query.summary) {
    pipeline.push({
      $lookup: {
        from: "timestamps",
        localField: "_id",
        foreignField: "employee",
        as: "timestamps",
      },
    });
    // }
    pipeline.push({
      $set: {
        amount: {
          $sum: {
            $map: {
              input: "$timestamps",
              as: "timestamp",
              in: {
                $dateDiff: {
                  startDate: "$$timestamp.checkIn",
                  endDate: "$$timestamp.checkOut",
                  unit: "hour",
                },
              },
            },
          },
        },
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
        from: "users",
        localField: "uid",
        foreignField: "_id",
        as: "uid",
      },
    });

    pipeline.push({
      $set: { uid: { $arrayElemAt: ["$uid", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "departments",
        localField: "department",
        foreignField: "_id",
        as: "department",
      },
    });

    pipeline.push({
      $set: { department: { $arrayElemAt: ["$department", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "roletypes",
        localField: "role",
        foreignField: "_id",
        as: "role",
      },
    });

    pipeline.push({
      $set: { role: { $arrayElemAt: ["$role", 0] } },
    });

    if (req.query.name) {
      console.log(req.query.name);

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

    if (req.query.em) {
      pipeline.push({
        $match: {
          $or: [
            { firstname: req.query.em },
            { check_key: req.query.em },
            { employee_id: req.query.em },
          ],
        },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $set: { id: "$_id" } });

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
      },
    });

    return { pipeline };
  },
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Employee.aggregate(this.createPipeline(req).pipeline)])
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

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Employee.findById(id)
          .populate("uid")
          .populate("role")
          .populate("department")
          .populate("image");

        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  findByUid(uid) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Employee.findOne({ uid })
          .populate("uid")
          .populate("role")
          .populate("image")
          .populate("department");

        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        if (data.arr && !_.isEmpty(data.arr)) {
          try {
            for await (const employee of data.arr) {
              const obj = new Employee(employee);
              const inserted = await obj.save({});
              resolve(inserted);
            }
          } catch (error) {
            console.error("Employee Not Found", error?.message);
          }
        } else {
          const { image } = data;
          // console.log('data', data)

          if (image) {
            try {
              const uploadedImage = await UploadService.upload(image);
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.image = databasedImage.id;
            } catch (error) {
              console.error("Upload Image have a problem", error);
            }
          }
          const obj = new Employee(data);
          const inserted = await obj.save();
          resolve(inserted);
        }
        await session.commitTransaction();
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
        console.log("Data", data);
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

        const obj = new Employee(data);
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
        const obj = await Employee.findById(id);
        if (!obj) {
          reject(ErrorNotFound("employee id: not found"));
        }

        const { image } = data;
        console.log('data', data)
        if (image && !image?.src) {
          try {
            const uploadedImage = await UploadService.upload(image);
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image = databasedImage.id;
            console.info("Image update success");
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }

        await Employee.updateOne({ _id: id }, data);
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
        const obj = await Employee.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        const objUser = obj.uid;
        if (objUser) {
          await User.deleteOne({ _id: objUser });
        }
        await Employee.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
