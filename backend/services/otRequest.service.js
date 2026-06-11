const mongoose = require("mongoose");
const config = require("../configs/app");
const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Model = require("../models/OtRequest");

const methods = {
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const page = +(req.query.page || 1);
    const skip = limit * (page - 1);

    // Build query
    const query = {};
    if (req?.params?.id) query._id = req.params.id;
    if (req?.query?.me) query.employee = req.query.me;

    // Find and populate
    let rows = await Model.find(query)
      .populate([
        {
          path: "resquester",
          populate: [{ path: "department" }, { path: "role" }],
        },
        {
          path: "timestamp",
          populate: [{ path: "project_in" }, { path: "employee" }],
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
      .lean();

    // // ถ้ามี me ให้ filter ตาม employee ใน timestamp array
    // if (req?.query?.me) {
    //   rows = rows.filter(
    //     (row) =>
    //       Array.isArray(row.timestamp) &&
    //       row.timestamp.some(
    //         (ts) =>
    //           ts?.employee._id && ts.employee._id.toString() === req.query.me
    //       )
    //   );
    // }
    // console.log("rows after filtering", rows);

    const count = rows.length;

    // Map project field for compatibility with old structure
    const mappedRows = rows.map((row) => ({
      ...row,
      approver: row.status_approve?.approver || null,
      id: row._id,
    }));

    return {
      total: count,
      lastPage: Math.ceil(count / limit),
      currPage: page,
      rows: mappedRows,
    };
  },

  async findById(id) {
    const row = await Model.findById(id)
      .populate([
        {
          path: "employee",
          populate: [{ path: "department" }, { path: "role" }],
        },
        {
          path: "timestamp",
          populate: { path: "project_in" },
        },
        {
          path: "status_approve.approver",
          model: "Employee",
        },
      ])
      .lean();
    if (!row) throw ErrorNotFound("not found");
    return {
      ...row,
      project: row.timestamp?.project_in || null,
      approver: row.status_approve?.approver || null,
      id: row._id,
    };
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
    console.log("id", id, data);

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
