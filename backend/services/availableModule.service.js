const { ErrorNotFound } = require("../configs/errorMethods");
const CONSTANT = require("../constants");
const { AvailableModule } = require("../models/Access");

const methods = {
  find() {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await AvailableModule.findOne();
        if (!obj) {
          const initObj = new AvailableModule(
            CONSTANT.information.available_module
          );
          await initObj.save();
          const initResult = await AvailableModule.findOne();

          resolve(initResult);
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("error : not found"));
      }
    });
  },
  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await AvailableModule.findById(id);
        if (!obj) {
          console.log("not have ID");
          reject(ErrorNotFound("id: not found"));
        }
        await AvailableModule.updateOne({ _id: id }, data);
        resolve(Object.assign(obj, data));
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };