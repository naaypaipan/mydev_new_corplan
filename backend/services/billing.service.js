const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Billing = require("../models/Billing");
const User = require("../models/User");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    if (req?.query?.project_id) {
      pipeline.push({
        $match: {
          project_id: new mongoose.Types.ObjectId(req?.query?.project_id),
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "projects",
        localField: "project_id",
        foreignField: "_id",
        as: "project_id",
      },
    });

    pipeline.push({
      $set: { project_id: { $arrayElemAt: ["$project_id", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    });

    pipeline.push({
      $set: { customer: { $arrayElemAt: ["$customer", 0] } },
    });

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
        Promise.all([Billing.aggregate(this.createPipeline(req).pipeline)])
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
        const obj = await Billing.findById(id)
          .populate("project_id")
          .populate("customer");

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
        const obj = await Billing.findOne({ uid });

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
        const obj = new Billing(data);
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

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Billing.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Billing id: not found"));
        }

        await Billing.updateOne({ _id: id }, data);
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
        const obj = await Billing.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Billing.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
