/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-async-promise-executor */
/* eslint-disable no-undef */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/order */
// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require("mongoose");
const config = require("../configs/app");

const {
  ErrorBadRequest,
  ErrorNotFound,
  ErrorForbidden,
} = require("../configs/errorMethods");

const Employee = require("../models/Employee");
const Timestamp = require("../models/Timestamp");
const Salary = require("../models/Salary");

const methods = {
  find(req) {
    return new Promise(async (resolve, reject) => {
      try {
        const query = {};
        const { firstname, lastname, taxId, name } = req?.query || {};

        if (firstname && lastname && taxId) {
          query.$and = [
            {
              $or: [
                { firstname: { $regex: `^${firstname}$`, $options: "i" } },
                { firstname_th: { $regex: `^${firstname}$`, $options: "i" } },
              ],
            },
            {
              $or: [
                { lastname: { $regex: `^${lastname}$`, $options: "i" } },
                { lastname_th: { $regex: `^${lastname}$`, $options: "i" } },
              ],
            },
            { tax_id: taxId },
          ];
        } else if (name) {
          query.$or = [
            { firstname: { $regex: name, $options: "i" } },
            { lastname: { $regex: name, $options: "i" } },
            { firstname_th: { $regex: name, $options: "i" } },
            { lastname_th: { $regex: name, $options: "i" } },
          ];
        } else {
          return reject(
            ErrorBadRequest("กรุณากรอกข้อมูลให้ครบ ชื่อ นามสกุล และเลขบัตรประชาชน")
          );
        }

        const employee = await Employee.findOne(query)
          .sort({ createdAt: -1 })
          .lean();

        // ถ้าไม่พบพนักงาน ให้ return ข้อมูลว่าง (200) แทน 404 เพื่อให้ frontend แสดง "ไม่พบรายการ" ได้
        if (!employee) {
          return resolve({
            timestamps: [],
            salaries: [],
            id: null,
          });
        }

        // ดึงข้อมูล timestamps และ salaries แบบขนาน

        const [timestamps, salaries] = await Promise.all([
          Timestamp.find({ employee: employee._id })
            .sort({ createdAt: -1 })
            .lean(),
          Salary.find({ employee: employee._id })
            .sort({ createdAt: -1 })
            .lean(),
        ]);

        resolve({
          ...employee,
          id: employee._id,
          timestamps,
          salaries,
        });
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
