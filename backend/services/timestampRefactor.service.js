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
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const page = +(req.query.page || 1);
    const skip = limit * (page - 1);

    // Build query
    const query = {};
    if (req?.params?.id) query._id = req.params.id;
    if (req.query.ot === "true") query["ot_status.require"] = true;
    if (req.query.type) query.employeeType = req.query.type;
    if (req.query.profile) query.employee = req.query.profile;
    if (req.query.me) {
      query.employee = req.query.me;
      query.status_checkOut = false;
    }
    if (req.query.project_id) query.project_in = req.query.project_id;
    if (req.query.dateStart && req.query.dateEnd) {
      query.checkIn = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    if (req.query.checkoutem) {
      query.$or = [
        { employeekey: req.query.checkoutem },
        { employee_firstname: req.query.checkoutem },
        { employee_id: req.query.checkoutem },
      ];
      query.status_checkOut = false;
    }
    if (req.query.em) query.employee = req.query.em;
    if (req.query.role) query["employee.role"] = req.query.role;
    if (req.query.name) {
      query.$or = [
        { firstname: { $regex: req.query.name } },
        { lastname: { $regex: req.query.name } },
        { phone_number: { $regex: req.query.name } },
      ];
    }

    // Populate
    let findQuery = Timestamp.find(query)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const [
      rows,
      count,
      totalLabor,
      totalPriceExtra,
      allPrice,
    ] = await Promise.all([
      findQuery,
      Timestamp.countDocuments(query),
      Timestamp.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$priceLabor" } } },
      ]),
      Timestamp.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$salary_extra.day" } } },
      ]),
      Timestamp.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    return {
      total: count,
      lastPage: Math.ceil(count / limit),
      currPage: page,
      rows,
      totalLabor: totalLabor[0]?.total || 0,
      totalpriceExtra: totalPriceExtra[0]?.total || 0,
      allPrice: allPrice[0]?.total || 0,
    };
  },

  async findNotify(req) {
    const limit = +(req.query.size || config.pageLimit);
    const page = +(req.query.page || 1);
    const skip = limit * (page - 1);

    const query = {};
    if (req?.params?.id) query._id = req.params.id;
    if (req.query.ot === "true") query["ot_status.require"] = true;
    if (req.query.type) query.employeeType = req.query.type;
    if (req.query.profile) query.employee = req.query.profile;
    if (req.query.me) {
      query.employee = req.query.me;
      query.status_checkOut = false;
    }
    if (req.query.project_id) query.project_in = req.query.project_id;
    if (req.query.dateStart && req.query.dateEnd) {
      query.checkIn = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    if (req.query.checkoutem) {
      query.$or = [
        { employeekey: req.query.checkoutem },
        { employee_firstname: req.query.checkoutem },
        { employee_id: req.query.checkoutem },
      ];
      query.status_checkOut = false;
    }
    if (req.query.em) query.employee = req.query.em;
    if (req.query.role) query["employee.role"] = req.query.role;
    if (req.query.name) {
      query.$or = [
        { firstname: { $regex: req.query.name } },
        { lastname: { $regex: req.query.name } },
        { phone_number: { $regex: req.query.name } },
      ];
    }

    const [rows, count] = await Promise.all([
      Timestamp.find(query)
        .populate([
          {
            path: "employee",
            populate: [{ path: "department" }, { path: "role" }],
          },
          { path: "project_in" },
          { path: "image" },
          { path: "image_out" },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Timestamp.countDocuments(query),
    ]);

    return {
      total: count,
      lastPage: Math.ceil(count / limit),
      currPage: page,
      rows,
    };
  },

  async findCheckin(req) {
    const query = {};
    if (req?.params?.id) query._id = req.params.id;
    if (req.query.ot === "true") query["ot_status.require"] = true;
    if (req.query.type) query.employeeType = req.query.type;
    if (req.query.profile) query.employee = req.query.profile;
    if (req.query.me) {
      query.employee = req.query.me;
      query.status_checkOut = false;
    }
    if (req.query.project_id) query.project_in = req.query.project_id;
    if (req.query.dateStart && req.query.dateEnd) {
      query.checkIn = {
        $gte: new Date(req.query.dateStart),
        $lte: new Date(req.query.dateEnd),
      };
    }
    if (req.query.checkoutem) {
      query.$or = [
        { employeekey: req.query.checkoutem },
        { employee_firstname: req.query.checkoutem },
        { employee_id: req.query.checkoutem },
      ];
      query.status_checkOut = false;
    }
    if (req.query.em) query.employee = req.query.em;
    if (req.query.role) query["employee.role"] = req.query.role;
    if (req.query.name) {
      query.$or = [
        { firstname: { $regex: req.query.name } },
        { lastname: { $regex: req.query.name } },
        { phone_number: { $regex: req.query.name } },
      ];
    }

    const row = await Timestamp.findOne(query)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .sort({ createdAt: -1 })
      .lean();

    return row;
  },

  async findById(id) {
    const row = await Timestamp.findById(id)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        { path: "project_in" },
        { path: "image" },
        { path: "image_out" },
      ])
      .lean();
    if (!row) throw ErrorNotFound("not found");
    return row;
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
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
          status_checkOut: false,
          checkIn: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        }).session(session);

        if (todayCheckIn) {
          await session.abortTransaction();
          return resolve({ message: "Already checked in today" });
        }

        if (data.image) {
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
        if (data.image) {
          try {
            const uploadedImage = await UploadService.upload(data.image);
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

        if (data.image_out) {
          try {
            const uploadedImage = await UploadService.uploadBase64({
              image: data.image_out,
            });
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image_out = databasedImage.id;
            console.info("Image update success");
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }

        data.checkOut = new Date();

        await Timestamp.updateOne({ _id: id }, data);

        NotifyService.timestampNotify({
          message: `${data.employee_firstname} ${
            data.employee_lastname
          } \nproject:${data?.project_out?.name}\n check in ${dayjs(
            data?.checkIn
          )
            .locale("th")
            .format("DD/MM/YYYY : HH.mm นาที")}\n check out ${dayjs(
            data?.checkOut
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
