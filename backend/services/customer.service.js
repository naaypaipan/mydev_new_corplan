/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-undef */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/order */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");
const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Customer = require("../models/Customer");
const CustomerTypeService = require("./customerType.service");
const CONSTANT = require("../constants");
const _ = require("lodash");

const methods = {
  scopeSearch(req) {
    $or = [];
    if (req.query.name) {
      $or.push({ name: { $regex: req.query.name, $options: "$i" } });
      $or.push({ telephone: { $regex: req.query.name } });
      $or.push({ "contact.firstname": { $regex: req.query.name } });
      $or.push({ "contact.lastname": { $regex: req.query.name } });
    }
    if (req.query.customerType) {
      $or.push({
        type: { $eq: mongoose.Types.ObjectId(req.query.customerType) },
      });
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
          Customer.find(_q.query)
            .sort(_q.sort)
            .limit(limit)
            .skip(offset)
            .populate("type"),
          Customer.countDocuments(_q.query),
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
  findOne(telephone) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Customer.findOne({ telephone }).populate("type");
        if (!obj) {
          resolve({});
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("CUSTOMER | id: not found"));
      }
    });
  },
  findById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Customer.findById(id).populate("type");
        if (!obj) {
          reject(ErrorNotFound("CUSTOMER | id: not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("CUSTOMER | id: not found"));
      }
    });
  },
  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (data.arr && !_.isEmpty(data.arr)) {
          const objs = await Customer.insertMany(data.arr);
          resolve(objs);
        } else {
          const obj = new Customer(data);
          const inserted = await obj.save();
          resolve(inserted);
        }
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },
  insertWithSession(data, session) {
    return new Promise(async (resolve, reject) => {
      try {
        const statusObj = await CustomerTypeService.find({
          query: { size: null },
        });

        if (!statusObj) {
          reject(ErrorNotFound("CUSTOMER TYPE | can not find  customer type"));
        }

        const initType = _.find(
          statusObj.rows,
          (row) => row.type_code === CONSTANT.customerType[0].type_code
        );

        if (!initType) {
          reject(ErrorNotFound("CUSTOMER TYPE | can not find  customer type"));
        }

        // eslint-disable-next-line no-param-reassign
        data.type = initType.id;

        const obj = new Customer(data);
        const inserted = await obj.save({ session });
        resolve(inserted);
      } catch (error) {
        reject(ErrorBadRequest(error.message));
      }
    });
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Customer.findById(id);
        if (!obj) {
          reject(ErrorNotFound("CUSTOMER | id: not found"));
        }
        await Customer.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },
  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Customer.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Customer.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
