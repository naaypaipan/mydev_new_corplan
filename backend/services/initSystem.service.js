const mongoose = require("mongoose");

const { ErrorBadRequest } = require("../configs/errorMethods");
const User = require("../models/User");
const RoleType = require("../models/RoleType");

const EmployeeService = require("./employee.service");
const Department = require("../models/Department");

const methods = {
  initSystem() {
    const data = {
      firstname: "admin",
      lastname: "admin",
      username: "superuser",
      password: "123456",
    };
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const iarcUser = await User.findOne({ username: "superuser" });

        if (iarcUser) {
          await session.commitTransaction();
          resolve({ status: "System is Already Initialize" });
        } else {
          const iarcRoleType = await RoleType.findOne({
            type_code: "RT_001",
          });

          if (!iarcRoleType) {
            const roleTypeObj = new RoleType({
              type_code: "RT_001",
              name: "พนักงานประจำ",
              description: "System Master",
              level: 2,
            });
            await roleTypeObj.save();
            data.role = roleTypeObj?._id;
          } else {
            data.role = iarcRoleType?._id;
          }
          const dp = await Department.findOne({
            type_code: "DP001",
          });

          if (!dp) {
            const departmentObj = new Department({
              department_code: "DP001",
              name: "Admin",
              access: {
                MANAGEMENT: true,
              },
            });
            await departmentObj.save();

            data.department = departmentObj?._id;
          }

          const userObj = new User(data);
          await userObj.save({ session });

          data.uid = userObj._id;

          const inserted = await EmployeeService.insertWithSession(
            data,
            session
          );
          await session.commitTransaction();
          resolve(inserted);
        }
      } catch (error) {
        console.error(error.message);
        await session.abortTransaction();
        reject(ErrorBadRequest(error.message));
      } finally {
        session.endSession();
      }
    });
  },
};

module.exports = { ...methods };
