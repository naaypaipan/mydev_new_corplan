const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Model = require("../models/ChatExpenses");
const { getIO } = require("../configs/socket");

const populateUser = {
  path: "user",
  select: "firstname lastname image role department",
  populate: {
    path: "department",
    select: "name",
  },
};

const methods = {
  async find(req) {
    const query = {};

    // filter by expenses id if provided via req.query.ex (no populate of expenses)
    if (req?.query?.ex) {
      try {
        query.expenses_id = new mongoose.Types.ObjectId(req.query.ex);
      } catch (e) {
        // invalid id -> will return empty result
        query.expenses_id = req.query.ex;
      }
    }

    return new Promise(async (resolve, reject) => {
      try {
        const [rows, total] = await Promise.all([
          Model.find(query)
            .populate(populateUser)
            .sort({ createdAt: 1 })
            .lean(),
          Model.countDocuments(query),
        ]);

        resolve({
          rows,
        });
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  async findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Model.findById(id).populate(populateUser).lean();
        if (!obj) {
          return reject(ErrorNotFound("not found"));
        }
        resolve(obj);
      } catch (error) {
        reject(ErrorNotFound(`not found , ${error.message}`));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = new Model(data);
        const inserted = await obj.save({ session });
        await session.commitTransaction();

        // return populated document (user populated), do not populate expenses
        const result = await Model.findById(inserted._id)
          .populate(populateUser)
          .lean();

        // Emit socket event (non-blocking)
        const io = getIO();
        if (io) io.emit("chat:created", { expenses_id: data.expenses_id, id: result._id });

        resolve(result);
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
          await session.abortTransaction();
          return reject(ErrorNotFound("Model id: not found"));
        }

        await Model.updateOne({ _id: id }, data, { session });
        await session.commitTransaction();

        const updated = await Model.findById(id).populate(populateUser).lean();
        resolve(updated);
      } catch (error) {
        await session.abortTransaction();
        reject(ErrorBadRequest(error.message));
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
          return reject(ErrorNotFound("id: not found"));
        }
        await Model.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
};

module.exports = { ...methods };
