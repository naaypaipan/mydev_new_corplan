const mongoose = require("mongoose");
const config = require("../configs/app");
const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Model = require("../models/OtRequestOrder");
const OtRequest = require("../models/OtRequest");
const notifications = require("../services/linenotifyMessageApi");
const dayjs = require("dayjs");

/** Normalize to start of day (UTC) for same-day query */
function toStartOfDay(dateVal) {
  const d = new Date(dateVal);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Combine date (day) and time into one Date for overlap comparison */
function combineDateAndTime(dateVal, timeVal) {
  const d = new Date(dateVal);
  const t = new Date(timeVal);
  d.setUTCHours(t.getUTCHours(), t.getUTCMinutes(), t.getUTCSeconds(), 0);
  return d;
}

/** Check if two time ranges overlap: [s1,e1] and [s2,e2] */
function timeRangesOverlap(s1, e1, s2, e2) {
  return s1.getTime() < e2.getTime() && e1.getTime() > s2.getTime();
}

/**
 * Find an existing OT request for the same employee and overlapping date/time.
 * Only considers "active" requests (not rejected/cancelled).
 */
async function findOverlappingOtRequest(employeeId, date, startTime, endTime) {
  const dayStart = toStartOfDay(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const newStart = combineDateAndTime(date, startTime);
  const newEnd = combineDateAndTime(date, endTime);

  const existingList = await OtRequest.find({
    employee: employeeId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ["REJECT", "REJECTED", "CANCELLED"] },
  })
    .select("startTime endTime employee_name date")
    .lean();

  for (const existing of existingList) {
    const exStart = existing.startTime ? new Date(existing.startTime) : null;
    const exEnd = existing.endTime ? new Date(existing.endTime) : null;
    if (exStart && exEnd && timeRangesOverlap(newStart, newEnd, exStart, exEnd)) {
      return existing;
    }
  }
  return null;
}

const methods = {
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const page = +(req.query.page || 1);
    const skip = limit * (page - 1);

    // Build query
    const query = {};
    if (req?.params?.id) query._id = req.params.id;
    if (req?.query?.me) query.resquester = req.query.me;

    // Find and populate
    const [rows, count] = await Promise.all([
      Model.find(query)
        .populate([
          {
            path: "resquester",
            populate: [{ path: "department" }, { path: "role" }],
          },
          {
            path: "status_approve.approver",
            model: "Employee",
          },
          {
            path: "project",
            model: "Project",
          },
        ])

        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Model.countDocuments(query),
    ]);

    // ดึง otRequest ที่ otRequest.order == OtRequestOrder._id
    const orderIds = rows.map((r) => r._id);
    const otRequests = await OtRequest.find({
      order: { $in: orderIds },
    }).lean();

    // ผูก otRequests กับแต่ละ row
    const mappedRows = rows.map((row) => ({
      ...row,
      id: row._id,
      ot_lists: otRequests.filter(
        (o) => o.order?.toString() === row._id.toString()
      ),
    }));

    return {
      total: count,
      lastPage: Math.ceil(count / limit),
      currPage: page,
      rows: mappedRows,
    };
  },

  async findById(id) {
    const rows = await Model.findById(id)
      .populate([
        {
          path: "resquester",
          populate: [{ path: "department" }, { path: "role" }],
        },
        {
          path: "status_approve.approver",
          model: "Employee",
        },
        {
          path: "project",
          model: "Project",
        },
      ])
      .lean();

    const otRequests = await OtRequest.find({
      order: { $in: rows._id },
    }).lean();

    // ผูก otRequests กับแต่ละ row
    const mappedRows = {
      ...rows,
      id: rows._id,
      ot_lists: otRequests,
    };

    if (!rows) throw ErrorNotFound("not found");
    return mappedRows;
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // ตรวจสอบซ้ำก่อนสร้าง order – ไม่ให้บันทึกอะไรถ้ามีรายการซ้อน
        for (const ot of data.timestamp || []) {
          const overlapping = await findOverlappingOtRequest(
            ot.employee_id,
            data.date,
            data.startTime,
            data.endTime
          );
          if (overlapping) {
            const name = ot?.name || ot.employee_id;
            throw ErrorBadRequest(
              `ไม่สามารถขอ OT ซ้ำได้: พนักงาน ${name} มีคำขอ OT ในช่วงเวลาเดียวกันแล้ว (วันที่ตรงกันและเวลาทับซ้อน)`
            );
          }
        }

        const obj = new Model(data);
        const inserted = await obj.save({ session });

        console.log("data", data);

        for (const ot of data.timestamp) {
          const dataOt = {
            ...data,
            order: obj?._id,
            timestamp: ot,
            employee: ot.employee_id,
            employee_name: ot?.name,
            salary: {
              month: ot?.salary?.month,
              day: ot?.salary?.day,
              hr: ot?.salary?.hr,
            },
            total_price: data.total_hours * data.rate * (ot?.salary?.hr || 0),
          };
          const otObj = new OtRequest(dataOt);
          await otObj.save({ session });
        }
        await notifications.otNotify({
          ...data,
          orderId: inserted._id,
          createdAt: inserted.createdAt,
        });
        await session.commitTransaction();
        resolve(inserted);
      } catch (error) {
        await session.abortTransaction();
        reject(error.status != null ? error : ErrorBadRequest(error.message));
      } finally {
        session.endSession();
      }
    });
  },

  insertWithOutNotify(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // ตรวจสอบซ้ำก่อนสร้าง order – ไม่ให้บันทึกอะไรถ้ามีรายการซ้อน
        for (const ot of data.timestamp || []) {
          const overlapping = await findOverlappingOtRequest(
            ot.employee_id,
            data.date,
            data.startTime,
            data.endTime
          );
          if (overlapping) {
            const name = ot?.name || ot.employee_id;
            throw ErrorBadRequest(
              `ไม่สามารถขอ OT ซ้ำได้: พนักงาน ${name} มีคำขอ OT ในช่วงเวลาเดียวกันแล้ว (วันที่ตรงกันและเวลาทับซ้อน)`
            );
          }
        }

        const obj = new Model(data);
        const inserted = await obj.save({ session });

        // console.log("data", data);

        for (const ot of data.timestamp) {
          const dataOt = {
            ...data,
            order: obj?._id,
            timestamp: ot,
            employee: ot.employee_id,
            employee_name: ot?.name,
            salary: {
              month: ot?.salary?.month,
              day: ot?.salary?.day,
              hr: ot?.salary?.hr,
            },
            total_price: data.total_hours * data.rate * (ot?.salary?.hr || 0),
          };
          const otObj = new OtRequest(dataOt);
          await otObj.save({ session });
        }
        await session.commitTransaction();
        resolve(inserted);
      } catch (error) {
        await session.abortTransaction();
        reject(error.status != null ? error : ErrorBadRequest(error.message));
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
        const obj = await Model.findById(id).session(session);
        if (!obj) {
          await session.abortTransaction();
          return reject(ErrorNotFound("Model id: not found"));
        }

        const lines = await OtRequest.find({ order: id }).session(session);

        for await (const ot of lines) {
          const childUpdate = {};

          if (data.startTime !== undefined) childUpdate.startTime = data.startTime;
          if (data.endTime !== undefined) childUpdate.endTime = data.endTime;
          if (data.rate !== undefined) childUpdate.rate = data.rate;
          if (data.description !== undefined)
            childUpdate.description = data.description;

          if (data.total_hours !== undefined) {
            const rate =
              data.rate !== undefined ? data.rate : ot.rate;
            childUpdate.total_hours = data.total_hours;
            childUpdate.total_price =
              data.total_hours * (rate || 0) * (ot?.salary?.hr || 0);
          } else if (data.rate !== undefined && ot.total_hours != null) {
            childUpdate.total_price =
              ot.total_hours * data.rate * (ot?.salary?.hr || 0);
          }

          if (data.status !== undefined) childUpdate.status = data.status;
          if (data.status_approve !== undefined)
            childUpdate.status_approve = data.status_approve;

          if (Object.keys(childUpdate).length > 0) {
            await OtRequest.updateOne(
              { _id: ot._id },
              childUpdate
            ).session(session);
          }
        }

        await Model.updateOne({ _id: id }, data).session(session);
        await session.commitTransaction();
        resolve(Object.assign(obj.toObject ? obj.toObject() : obj, data));
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
        // ลบ otRequest ที่ order ตรงกับ id นี้ด้วย
        await OtRequest.deleteMany({ order: id });
        await Model.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
