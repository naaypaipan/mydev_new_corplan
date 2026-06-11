/* eslint-disable fp/no-loops */
const { ErrorNotFound } = require("../configs/errorMethods");

const Employee = require("../models/Employee");

const NotifyService = require("./notify.service");
// const SettingService = require("./setting.service");

const methods = {
  find() {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const EmployeeObj = await Employee.find({});
        // const SettingObj = await SettingService.find({});
        // eslint-disable-next-line no-restricted-syntax, node/no-unsupported-features/es-syntax
        for await (const eachEmployee of EmployeeObj) {
          if (eachEmployee.line_token) {
            try {
              NotifyService.directNotify(eachEmployee?._id, {
                message: `คุณมีการขอใบเสนอราคาใหม่ 1 รายการ โปรดเข้าไปตรวจสอบในอีเมล`,
              });
            } catch (error) {
              console.log("Cannot Notify");
            }
          }
        }

        resolve();
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
module.exports = { ...methods };
