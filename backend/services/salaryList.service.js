const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Model = require("../models/SalaryList");
const Salary = require("../models/Salary");
const Timestamp = require("../models/Timestamp");
const SsoTransection = require("../models/SsoTransection");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: "salaries",
        localField: "_id",
        foreignField: "salaryList",
        as: "salaryData",
      },
    });

    // pipeline.push({
    //   $lookup: {
    //     from: "employees",
    //     localField: "salaryData.employee",
    //     foreignField: "_id",
    //     as: "salaryData.employee",
    //   },
    // });

    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
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
      // console.log("data", data);

      try {
        const obj = new Model(data);
        const inserted = await obj.save({ session });
        const salaryPromises = [];
        const projectStats = {};

        if (data.salaryData && Array.isArray(data.salaryData)) {
          for (const salary of data.salaryData) {
            const salaryData = {
              ...salary,
              salaryList: inserted._id,
              timesTampData: salary?.checkins || [],
              dateStart: data.dateStart,
              dateEnd: data.dateEnd,
            };
            if (salaryData._id) {
              delete salaryData._id;
            }
            const salaryObj = new Salary(salaryData);
            salaryPromises.push(salaryObj.save({ session }));

            const ssoObj = new SsoTransection({
              employee: salary.employee,
              price: salary.expenses.sso,
              month_period: data.dateStart,
              salaryList: inserted._id,
            });
            await ssoObj.save();
            // console.log("salary", salary);

            // Calculate costs per timestamp
            if (salary?.checkins && salary.checkins.length > 0) {
              const ssoTotal = salary?.expenses?.sso || 0;
              const salaryTotal = salary?.revenue?.salary || 0;
              const allowanceTotal = salary?.revenue?.allowances || 0;
              const bonusTotal = salary?.revenue?.bonus || 0;

              const taxTotal = salary?.expenses?.tax || 0;
              const otherTotal = salary?.expenses?.other || 0;
              const lateTotal = salary?.expenses?.late || 0;

              const ssoPerTimestamp = ssoTotal / salary.checkins.length;
              const salaryPerTimestamp = salaryTotal / salary.checkins.length;
              const taxPerTimestamp = taxTotal / salary.checkins.length;
              const otherPerTimestamp = otherTotal / salary.checkins.length;
              const latePerTimestamp = lateTotal / salary.checkins.length;
              const allowancePerTimestamp =
                allowanceTotal / salary.checkins.length;
              const bonusPerTimestamp = bonusTotal / salary.checkins.length;

              const timestamps = await Timestamp.find({
                _id: { $in: salary.checkins },
              }).session(session);

              for (const timestamp of timestamps) {
                // Update Timestamp with SSO cost
                timestamp.sso_cost = ssoPerTimestamp;
                timestamp.status_payroll = true;
                await timestamp.save({ session });

                if (timestamp.project_in) {
                  const projectId = timestamp.project_in.toString();
                  if (!projectStats[projectId]) {
                    projectStats[projectId] = {
                      total_sso: 0,
                      total_salary: 0,
                      total_tax: 0,
                      total_expenses_other: 0,
                      total_late: 0,
                      total_allowance: 0,
                      total_bonus: 0,
                    };
                  }
                  projectStats[projectId].total_sso += ssoPerTimestamp;
                  projectStats[projectId].total_salary += salaryPerTimestamp;
                  projectStats[projectId].total_tax += taxPerTimestamp;
                  projectStats[
                    projectId
                  ].total_expenses_other += otherPerTimestamp;
                  projectStats[
                    projectId
                  ].total_late += latePerTimestamp;
                  projectStats[
                    projectId
                  ].total_allowance += allowancePerTimestamp;
                  projectStats[projectId].total_bonus += bonusPerTimestamp;
                }
              }
            }
          }
          await Promise.all(salaryPromises);

          // Update dashboard
          if (inserted.dashboard && inserted.dashboard.length > 0) {
            inserted.dashboard.forEach((item) => {
              if (item.project_id && projectStats[item.project_id.toString()]) {
                item.total_sso =
                  projectStats[item.project_id.toString()].total_sso;
                item.total_salary =
                  projectStats[item.project_id.toString()].total_salary;
                item.total_allowance =
                  projectStats[item.project_id.toString()].total_allowance;
                item.total_bonus =
                  projectStats[item.project_id.toString()].total_bonus;
                item.total_tax =
                  projectStats[item.project_id.toString()].total_tax +
                  projectStats[item.project_id.toString()].total_expenses_other;
                item.total_expenses_other =
                  projectStats[item.project_id.toString()].total_expenses_other;
                item.total_late =
                  projectStats[item.project_id.toString()].total_late;
                item.amount =
                  item.total_salary -
                  projectStats[item.project_id.toString()].total_sso -
                  projectStats[item.project_id.toString()].total_tax -
                  projectStats[item.project_id.toString()].total_expenses_other -
                  projectStats[item.project_id.toString()].total_late;
                item.total_spent =
                  item.total_salary +
                  item.total_ot +
                  item.total_allowance +
                  projectStats[item.project_id.toString()].total_bonus -
                  projectStats[item.project_id.toString()].total_sso -
                  projectStats[item.project_id.toString()].total_tax -
                  projectStats[item.project_id.toString()].total_expenses_other -
                  projectStats[item.project_id.toString()].total_late;
              }
            });

            // Calculate total_sso for the whole list
            const totalSso = Object.values(projectStats).reduce(
              (a, b) => a + b.total_sso,
              0
            );
            inserted.total_sso = totalSso;

            // Calculate total_tax for the whole list
            const totalTax = Object.values(projectStats).reduce(
              (a, b) => a + b.total_tax,
              0
            );
            inserted.total_tax = totalTax;

            await inserted.save({ session });
          }
        }

        await session.commitTransaction();
        resolve(inserted);
      } catch (error) {
        await session.abortTransaction();

        console.error("Error creating salary list:", error.message);

        // ส่ง error message ที่เข้าใจง่าย
        if (error.message.includes("unique")) {
          reject(ErrorBadRequest("ข้อมูลซ้ำกัน กรุณาตรวจสอบข้อมูลอีกครั้ง"));
        } else if (error.message.includes("Employee")) {
          reject(ErrorBadRequest("ไม่พบข้อมูลพนักงาน กรุณาตรวจสอบรหัสพนักงาน"));
        } else {
          reject(
            ErrorBadRequest(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`)
          );
        }
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
        const salaryList = await Salary.find({ salaryList: id });

        // Update timestamp status_payroll to false before deleting
        if (salaryList.length > 0) {
          const allTimestampIds = [];
          salaryList.forEach((salary) => {
            if (salary.timesTampData && salary.timesTampData.length > 0) {
              allTimestampIds.push(...salary.timesTampData);
            }
          });

          if (allTimestampIds.length > 0) {
            await Timestamp.updateMany(
              { _id: { $in: allTimestampIds } },
              { $set: { status_payroll: false } }
            );
          }

          await Salary.deleteMany({ salaryList: id });
        }

        const ssoList = await SsoTransection.find({ salaryList: id });
        if (ssoList.length > 0) {
          await SsoTransection.deleteMany({ salaryList: id });
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
