const config = require("../configs/app");

const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorForbidden,
} = require("../configs/errorMethods");
const Employee = require("../models/Employee");
const RoleType = require("../models/RoleType");

const methods = {
  scopeSearch(req) {
    $or = [];
    if (req.query.name) {
      $or.push({ name: { $regex: req.query.name } });
      $or.push({ type_code: { $regex: req.query.name } });
    }
    const query = $or.length > 0 ? { $or } : {};
    const sort = { type_code: 1  };
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
          RoleType.find(_q.query).sort(_q.sort).limit(limit).skip(offset),
          RoleType.countDocuments(_q.query),
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
        const obj = await RoleType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = new RoleType(data);
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
        const obj = await RoleType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        await RoleType.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await RoleType.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }

        const count = await Employee.countDocuments({ "roles.role": id });

        if (count !== 0) {
          reject(
            ErrorForbidden("Can not delete because vehicle type have data")
          );
        } else {
          await RoleType.deleteOne({ _id: id });
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
