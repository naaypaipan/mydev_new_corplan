const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Project = require("../models/Project");
const User = require("../models/User");
const Budget = require("../models/Budget");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
      });
    }
    if (req.query.profile) {
      pipeline.push({
        $match: { engineer: new mongoose.Types.ObjectId(req.query.profile) },
      });
    }

    if (req?.query?.status_deliver === "true") {
      pipeline.push({
        $match: { "deliver_status.status": false },
      });
    }
    // กรองเฉพาะเมื่อขอ explicitly (เช่น หน้าลงเวลา ส่ง time_tracking_enabled=true)
    if (req?.query?.time_tracking_enabled === "true") {
      pipeline.push({
        $match: { time_tracking_enabled: true },
      });
    }

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "engineer",
        foreignField: "_id",
        as: "engineer",
      },
    });

    pipeline.push({
      $set: { engineer: { $arrayElemAt: ["$engineer", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "budgets",
        localField: "_id",
        foreignField: "project_id",
        as: "budget",
      },
    });

    pipeline.push({
      $lookup: {
        from: "billings",
        localField: "_id",
        foreignField: "project_id",
        as: "billing",
      },
    });

    pipeline.push({
      $lookup: {
        from: "expenses",
        localField: "_id",
        foreignField: "project",
        as: "expenses",
      },
    });

    pipeline.push({
      $lookup: {
        from: "timestamps",
        let: { projectId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$project_in", "$$projectId"] },
            },
          },
          // Calculate check-in time
          {
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
          },
          // Calculate working hours
          {
            $set: {
              hour: { $hour: "$checkIn" },
              amount: {
                $cond: [
                  {
                    $lt: [
                      {
                        $dateDiff: {
                          startDate: "$checkIn_cal",
                          endDate: "$checkOut",
                          unit: "hour",
                        },
                      },
                      0,
                    ],
                  },
                  1,
                  {
                    $dateDiff: {
                      startDate: "$checkIn_cal",
                      endDate: "$checkOut",
                      unit: "hour",
                    },
                  },
                ],
              },
            },
          },
          // Calculate OT and normal hours
          {
            $set: {
              ot_time: {
                $cond: [
                  { $gt: ["$amount", 9] },
                  { $subtract: ["$amount", 9] },
                  0,
                ],
              },
              normal_time: {
                $cond: [{ $gte: ["$amount", 9] }, 8, "$amount"],
              },
            },
          },
          // Calculate final price
          {
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
                          { $multiply: ["$salary.hr", "$extra_ot"] },
                        ],
                      },
                    ],
                  },
                  { $multiply: [8, { $multiply: ["$salary.hr", "$extra"] }] },
                ],
              },
            },
          },
        ],
        as: "timestamps",
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
        total_labor: {
          $sum: "$timestamps.price",
        },
      },
    });

    pipeline.push({
      $addFields: {
        total_budget: {
          $sum: "$budget.cost",
        },
      },
    });
    pipeline.push({
      $addFields: {
        estprofit: {
          $subtract: ["$cost", "$total_budget"],
        },
      },
    });

    pipeline.push({
      $addFields: {
        realprofit: {
          $subtract: ["$cost", { $add: ["$total_expenses", "$total_labor"] }],
        },
      },
    });

    pipeline.push({
      $addFields: {
        expenses_percentage: {
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
        percentage: {
          $multiply: [
            {
              $cond: [
                { $eq: ["$cost", 0] },
                0,
                { $divide: ["$estprofit", "$cost"] },
              ],
            },
            100,
          ],
        },
      },
    });

    pipeline.push({
      $addFields: {
        real_percentage: {
          $multiply: [
            {
              $cond: [
                { $eq: ["$cost", 0] },
                0,
                { $divide: ["$realprofit", "$cost"] },
              ],
            },
            100,
          ],
        },
      },
    });

    pipeline.push({
      $addFields: {
        labor_percentage: {
          $multiply: [
            {
              $cond: [
                { $eq: ["$cost", 0] },
                0,
                { $divide: ["$total_labor", "$cost"] },
              ],
            },
            100,
          ],
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
        Promise.all([Project.aggregate(this.createPipeline(req).pipeline)])
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
        const result = await Project.aggregate(
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
        const obj = new Project(data);
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
        const obj = await Project.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Project id: not found"));
        }

        await Project.updateOne({ _id: id }, data);
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
        const obj = await Project.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Project.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
