const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Budget = require("../models/Budget");
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
        from: "expenses",
        localField: "_id",
        foreignField: "budget",
        as: "expenses",
      },
    });

    pipeline.push({
      $addFields: {
        total_expenses: {
          $sum: "$expenses.price",
        },
      },
    });
    pipeline.push({
      $addFields: {
        remain: {
          $subtract: ["$cost", "$total_expenses"],
        },
      },
    });

    pipeline.push({
      $addFields: {
        percentage: {
          $multiply: [
            {
              $cond: [
                { $eq: ["$cost", 0] },
                0,
                { $divide: ["$total_expenses", "$cost"] },
              ],
            },
            100,
          ],
        },
      },
    });

    pipeline.push({
      $addFields: {
        totalExpensesByStatus: {
          $reduce: {
            input: "$expenses",
            initialValue: {
              APPROVE: 0,
              SUCCESS: 0,
            },
            in: {
              $cond: {
                if: { $eq: ["$$this.status", "APPROVE"] },
                then: {
                  $mergeObjects: [
                    "$$value",
                    { APPROVE: { $add: ["$$value.APPROVE", "$$this.price"] } },
                  ],
                },
                else: {
                  $mergeObjects: [
                    "$$value",
                    { SUCCESS: { $add: ["$$value.SUCCESS", "$$this.price"] } },
                  ],
                },
              },
            },
          },
        },
      },
    });

    pipeline.push({
      $addFields: {
        totalStatus: {
          $map: {
            input: { $objectToArray: "$totalExpensesByStatus" },
            as: "status",
            in: {
              status: "$$status.k",
              totalExpenses: "$$status.v",
            },
          },
        },
      },
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
        Promise.all([Budget.aggregate(this.createPipeline(req).pipeline)])
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
        const obj = await Budget.findById(id);

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
        const obj = await Budget.findOne({ uid });

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
        if (data.arr && Array.isArray(data.arr)) {
          try {
            for await (const each of data.arr) {
              const reformat = {
                budget_number: each?.DCCODE || "",
                name: each?.DCDESCRIPTION,
                date: new Date(),
                description: each?.DCREMARK || "",
                cost: parseFloat(
                  each?.DCESTEXPENSE?.toString().replace(/,/g, "")
                ),
                project_id: data.project_id,
              };
              const obj = new Budget(reformat);
              const inserted = await obj.save({});
              resolve(inserted);
            }
          } catch (error) {
            console.error("Budget Not Found", error?.message);
          }
        }
        const obj = new Budget(data);
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
        const obj = await Budget.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Budget id: not found"));
        }

        await Budget.updateOne({ _id: id }, data);
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
        const obj = await Budget.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Budget.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
