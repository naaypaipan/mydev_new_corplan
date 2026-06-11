/* eslint-disable no-restricted-syntax */
/* eslint-disable fp/no-loops */
const axios = require("axios");
const _ = require("lodash");
const qs = require("qs");

const config = require("../configs/app");
const { ErrorNotFound, ErrorBadRequest } = require("../configs/errorMethods");

const EmployeeService = require("./employee.service");
const InformationService = require("./information.service");
const Information = require("../models/Information");
const dayjs = require("dayjs");

/**
 * @typedef NotifyPayload
 * @property   {string} message ข้อความที่จะส่ง
 * @property  {string} imageThumbnail URL รูปภาพที่จะส่ง
 * @property {string} imageFullsize URL รูปภาพที่จะส่ง
 * @property {string|number} stickerId Id ของสติกเกอร์ที่จะส่ง
 */
const methods = {
  // Frontend get accessCode from redirectURL and handle to backend to request accessToken
  // Must Send payload that include accessCode and employeeId
  requestAccessToken(data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const { accessCode, employeeId } = data;
        const requestPayload = {
          grant_type: "authorization_code",
          code: accessCode,
          redirect_uri: config.lineNotifyRedirectURL,
          client_id: config.lineNotifyClientId,
          client_secret: config.lineNotifyClientSecret,
        };

        const obj = await Information.findOne();
        /**
         * เขียนแบบนี้เพื่อให้ VSCode ช่วย Hint Type ให้เรา
         * @type {axios.AxiosRequestConfig} axiosConfig
         */
        const axiosConfig = {
          url: "https://notify-bot.line.me/oauth/token",
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          data: qs.stringify(requestPayload),
        };

        const response = await axios(axiosConfig);

        if (response.data.access_token) {
          const updated = await InformationService.update(obj?._id, {
            line_token_expenses: response.data.access_token,
          });

          resolve(updated);
        } else {
          reject(ErrorNotFound("Cannot get Authorization token"));
        }
      } catch (error) {
        console.error("Error on Request Access Tokennnnnnnnn", error.message);
        console.log("error.message", error.response.data);

        reject(error);
      }
    });
  },

  requestAccessTokenTimestamp(data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const { accessCode, employeeId } = data;
        const requestPayload = {
          grant_type: "authorization_code",
          code: accessCode,
          redirect_uri: config.lineNotifyRedirectURLTimestamp,
          client_id: config.lineNotifyClientIdTimestamp,
          client_secret: config.lineNotifyClientSecretTimestamp,
        };

        const obj = await Information.findOne();
        /**
         * เขียนแบบนี้เพื่อให้ VSCode ช่วย Hint Type ให้เรา
         * @type {axios.AxiosRequestConfig} axiosConfig
         */
        const axiosConfig = {
          url: "https://notify-bot.line.me/oauth/token",
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          data: qs.stringify(requestPayload),
        };

        const response = await axios(axiosConfig);

        if (response.data.access_token) {
          const updated = await InformationService.update(obj?._id, {
            line_token_timestamp: response.data.access_token,
          });

          resolve(updated);
        } else {
          reject(ErrorNotFound("Cannot get Authorization token"));
        }
      } catch (error) {
        console.error("Error on Request Access Tokennnnnnnnn", error.message);
        console.log("error.message", error.response.data);

        reject(error);
      }
    });
  },
  /**
   * @param {NotifyPayload} data Payload ที่จะส่งมา Notify
   */
  directNotify(data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const { message = "", imageThumbnail, imageFullsize, stickerId } = data;

        try {
          const selectedEmployee = await InformationService.find();
          if (selectedEmployee) {
            resolve({
              status: "Fail",
              message: "Not Found User ",
            });
          }
          if (!selectedEmployee.line_token_expenses) {
            resolve({
              status: "Fail",
              message: "Not Found User Line Authentication Token",
            });
          }

          const axiosConfig = {
            url: "https://notify-api.line.me/api/notify",
            method: "POST",
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${selectedEmployee.line_token_expenses}`,
            },
            data: qs.stringify({
              message,
              imageThumbnail,
              imageFullsize,
              stickerId,
            }),
          };

          const response = await axios(axiosConfig);
          if (response.status === 200) {
            console.log("Notify Direct Success");
            resolve({ status: "Success", message: "Notify Success" });
          } else {
            resolve({
              status: "error",
              message: "Cannot get Authorization token",
            });
          }
        } catch (error) {
          resolve({
            status: "error",
            message: error.message,
          });
        }
      } catch (error) {
        console.log(error);
        console.error("Notify Direct Error", error?.response?.data?.message);
        resolve({ status: "error", message: error?.response?.data?.message });
      }
    });
  },

  newNotifyExpenses(data) {
    return new Promise(async (resolve, reject) => {
      const info = await InformationService.find();

      if (info) {
        const dataLine = {
          method: "post",
          url: "https://api.line.me/v2/bot/message/push",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${info?.line_token_id}`,
          },
          data: {
            to: `${info?.line_token_group_Expenses}`,
            messages: data?.message,
          },
        };
        const message = await axios(dataLine);
        resolve(message.data);
      }

      if (!info.line_token_group_Expenses) {
        resolve({
          status: "Fail",
          message: "Not Found User Line Authentication Token",
        });
      }
    });
  },

  timestampNotify(data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const { message = "", imageThumbnail, imageFullsize, stickerId } = data;

        try {
          const selectedEmployee = await InformationService.find();

          if (selectedEmployee) {
            resolve({
              status: "Fail",
              message: "Not Found User ",
            });
          }

          if (!selectedEmployee.line_token_timestamp) {
            resolve({
              status: "Fail",
              message: "Not Found User Line Authentication Token",
            });
          }

          const axiosConfig = {
            url: "https://notify-api.line.me/api/notify",
            method: "POST",
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              Authorization: `Bearer ${selectedEmployee.line_token_timestamp}`,
            },
            data: qs.stringify({
              message,
              imageThumbnail,
              imageFullsize,
              stickerId,
            }),
          };

          const response = await axios(axiosConfig);
          if (response.status === 200) {
            console.log("Notify Direct Success");
            resolve({ status: "Success", message: "Notify Success" });
          } else {
            resolve({
              status: "error",
              message: "Cannot get Authorization token",
            });
          }
        } catch (error) {
          resolve({
            status: "error",
            message: error.message,
          });
        }
      } catch (error) {
        console.log(error);
        console.error("Notify Direct Error", error?.response?.data?.message);
        resolve({ status: "error", message: error?.response?.data?.message });
      }
    });
  },
  /**
   * @param {NotifyPayload} data Payload ที่จะส่งมา Notify
   */
  notifyOverDepartment(departmentId, data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Department ID", departmentId);
        const employees = await EmployeeService.find({
          query: {
            departmentId,
          },
        });

        if (_.isEmpty(employees.rows)) {
          resolve({
            status: "Fail",
            message:
              "There're no Employee in this department or maybe departmentId was wrong.",
          });
        }

        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        for await (const employee of employees.rows) {
          try {
            console.log("Notify to employee", employee.firstname);
            await this.directNotify(employee._id, data);
          } catch (error) {
            console.log("Detect Employee that cannot notify ");
          }
        }

        console.log("-----------");
        resolve({
          status: "Success",
          message: "Notify Over Department Success",
        });
      } catch (error) {
        console.error("Error on Notify Over Department", error);
        reject(ErrorBadRequest(error?.message));
      }
    });
  },
  /**
   * @fuction notifyOverModule
   * @param {string} moduleCode Code ของโมดูล ได้แก่ MMS WMS  IMS PMS SPM ตัวใดตัวหนึ่ง
   * @param {NotifyPayload} data Payload ที่จะส่งมา Notify
   */
  notifyOverModule(moduleCode, data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Notify Over Module is Working");
        const currentInformation = await InformationService.find();
        const moduleNotifyInfo =
          currentInformation?.setting?.notify[moduleCode];

        if (!moduleNotifyInfo) {
          resolve({
            status: "Fail",
            message:
              "Cannot Find Notify Setting of This Module code,Maybe send wrong module code",
          });
        }

        if (moduleNotifyInfo?.enable === false) {
          resolve({
            status: "Fail",
            message: "System Disable Notify in this module",
          });
        }

        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        for await (const department of moduleNotifyInfo.departments) {
          try {
            await this.notifyOverDepartment(department, data);
          } catch (error) {
            console.log("Detect Department that cannot notify");
          }
        }

        resolve({ status: "Success", message: "Notify Success" });
      } catch (error) {
        console.error("Notify Over Module Error", error.message);
        reject(ErrorBadRequest(error?.message));
      }
    });
  },
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
module.exports = { ...methods };
