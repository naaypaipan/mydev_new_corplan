/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-undef */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/order */
// eslint-disable-next-line import/no-extraneous-dependencies
const config = require("../configs/app");
const _ = require("lodash");
const { customerType } = require("../constants");
const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorForbidden,
} = require("../configs/errorMethods");
const CustomerType = require("../models/CustomerType");
const Customer = require("../models/Customer");

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
        const result = await CustomerType.find(_q.query)
          .sort(_q.sort)
          .limit(limit)
          .skip(offset);

        const count = await CustomerType.countDocuments(_q.query);
        const rows = result;

        if (_.isEmpty(rows)) {
          console.log("initial customerType : ");
          await CustomerType.insertMany(customerType, { ordered: true });
          const initResult = await CustomerType.find(_q.query)
            .sort(_q.sort)
            .limit(limit)
            .skip(offset);

          const initCount = await CustomerType.countDocuments(_q.query);
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
        const obj = await CustomerType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("CUSTOMER TYPE : id not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("CUSTOMER TYPE : id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new CustomerType(data);
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
        const obj = await CustomerType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await CustomerType.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await CustomerType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }

        const count = await Customer.countDocuments({ type: id });
        console.log("count", count);
        // eslint-disable-next-line eqeqeq
        if (count != 0) {
          reject(
            ErrorForbidden("Can not delete because customer type have data")
          );
        } else {
          await CustomerType.deleteOne({ _id: id });
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
