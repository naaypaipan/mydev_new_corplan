const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");

const config = require("../configs/app");

const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorUnauthorized,
} = require("../configs/errorMethods");
const Employee = require("../models/Employee");
const User = require("../models/User");

const EmployeeService = require("./employee.service");

const methods = {
  scopeSearch(req) {
    $or = [];
    if (req.query.name) {
      $or.push({ username: { $regex: req.query.name } });
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
          User.find(_q.query).sort(_q.sort).limit(limit).skip(offset),
          User.countDocuments(_q.query),
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
        const obj = await User.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        const userObj = await EmployeeService.findByUid(obj._id);
        if (!userObj) {
          reject(ErrorUnauthorized("Username not found data"));
        }
        resolve({ userData: userObj });
      } catch (error) {
        console.log(error);
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const userObj = new User(data);
        await userObj.save({ session });
        data.uid = userObj._id;
        const inserted = await EmployeeService.insert(data);
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

  registerWithoutEmployee(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const userObj = new User(data);
        await userObj.save({ session });
        data.uid = userObj._id;
        await session.commitTransaction();
        resolve(data);
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
      try {
        const obj = await User.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        obj.password = obj.passwordHash(data.password);
        data.password = obj.password;
        await User.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await User.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await Employee.deleteOne({ uid: id });
        await User.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  login(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const userObj = await User.findOne({
          username: data.username,
        });

        if (!userObj) {
          reject(ErrorUnauthorized("username not found"));
        }

        if (!userObj.validPassword(data.password)) {
          reject(ErrorUnauthorized("password is invalid."));
        }

        const obj = await EmployeeService.findByUid(userObj._id);

        if (!obj) {
          reject(ErrorUnauthorized("username not found data"));
        }

        resolve({ accessToken: userObj.generateJWT(userObj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },

  refreshToken(accessToken) {
    return new Promise(async (resolve, reject) => {
      try {
        const decoded = jwt.decode(accessToken);
        const obj = await User.findOne({ username: decoded.username });
        if (!obj) {
          reject(ErrorUnauthorized("username not found"));
        }
        resolve({ accessToken: obj.generateJWT(obj), userData: obj });
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
