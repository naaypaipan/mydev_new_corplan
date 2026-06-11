/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-undef */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/order */
// eslint-disable-next-line import/no-extraneous-dependencies
const config = require("../configs/app");

const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorForbidden,
} = require("../configs/errorMethods");
const Department = require("../models/Department");
const Employee = require("../models/Employee");

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
        Promise.all([
          Department.find(_q.query).sort(_q.sort).limit(limit).skip(offset),
          Department.countDocuments(_q.query),
        ])
          .then((result) => {
            const rows = result[0];
            const count = result[1];
            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows,
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
        const obj = await Department.findById(id);
        if (!obj) {
          reject(ErrorNotFound("department id: not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("department id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new Department(data);
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
        const obj = await Department.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Department.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Department.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }

        const count = await Employee.countDocuments({ department: id });

        if (count !== 0) {
          reject(
            ErrorForbidden("Can not delete because vehicle type have data")
          );
        } else {
          await Department.deleteOne({ _id: id });
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
