/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-undef */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/order */
// eslint-disable-next-line import/no-extraneous-dependencies
const config = require("../configs/app");
const _ = require("lodash");
const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorForbidden,
} = require("../configs/errorMethods");
const EmployeeType = require("../models/EmployeeType");

const methods = {
  scopeSearch(req) {
    $or = [];
    if (req.query.name) {
      $or.push({ name: { $regex: req.query.name } });
    }
    const query = $or.length > 0 ? { $or } : {};
    const sort = { createdAt: -1 };
    if (req.query.orderByField && req.query.orderBy) {
      sort[req.query.orderByField] =
        req.query.orderBy.toLowerCase() === "desc" ? -1 : 1;
    }

    return { query, sort };
  },

  find(req) {
    const limit = +(req.query.size || config.pageLimit);
    const offset = +(limit * ((req.query.page || 1) - 1));
    const _q = methods.scopeSearch(req);
    return new Promise(async (resolve, reject) => {
      try {
        const result = await EmployeeType.find(_q.query)
          .sort(_q.sort)
          .limit(limit)
          .skip(offset);

        const count = await EmployeeType.countDocuments(_q.query);
        const rows = result;

        if (_.isEmpty(rows)) {
          console.log("initial EmployeeType : ");
          await EmployeeType.insertMany(EmployeeType, { ordered: true });
          const initResult = await EmployeeType.find(_q.query)
            .sort(_q.sort)
            .limit(limit)
            .skip(offset);

          const initCount = await EmployeeType.countDocuments(_q.query);
          const initRows = initResult;
          resolve({
            total: initCount,
            lastPage: Math.ceil(initCount / limit),
            currPage: +req.query.page || 1,
            rows: initRows,
          });
        }

        resolve({
          total: count,
          lastPage: Math.ceil(count / limit),
          currPage: +req.query.page || 1,
          rows,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await EmployeeType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("EMPLOYEE TYPE : id not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("EMPLOYEE TYPE : id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new EmployeeType(data);
        const inserted = await obj.save();
        resolve(inserted);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await EmployeeType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await EmployeeType.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await EmployeeType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await EmployeeType.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
