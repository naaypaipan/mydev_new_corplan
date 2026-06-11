const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Model = require("../models/Claim");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
      });
    }
    if (req?.query?.bill) {
      pipeline.push({
        $match: { billing: new mongoose.Types.ObjectId(req?.query?.bill) },
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
              (req?.query?.size || config?.pageLimit) *
              ((req?.query?.page || 1) - 1)
            ),
          },
          {
            $limit: parseInt(req?.query?.size, 10) || config?.pageLimit,
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
        Promise.all([Model.aggregate(this.createPipeline(req).pipeline)])
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
        console.log(id);
        const result = await Model.aggregate(this.createPipeline(id).pipeline);
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
        const obj = new Model(data);
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
        const obj = await Model.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Model id: not found"));
        }

        await Model.updateOne({ _id: id }, data);
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
        const obj = await Model.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Model.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
