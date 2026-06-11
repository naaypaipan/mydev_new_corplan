const { ErrorNotFound } = require("../configs/errorMethods");
const CONSTANT = require("../constants");
const config = require("../configs/app");
const Image = require("../models/Image");
const Information = require("../models/Information");
const mongoose = require("mongoose");

const UploadService = require("./upload.service");

const lineNotifyInfo = {
  lineNotify: {
    clientId: config.lineNotifyClientId,
    redirectURL: config.lineNotifyRedirectURL,
  },
  lineNotifyTimestamp: {
    clientIdTimestamp: config.lineNotifyClientIdTimestamp,
    redirectURLTimestamp: config.lineNotifyRedirectURLTimestamp,
  },
};
const methods = {
  find() {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Information.findOne()
          .populate("logo")
          .populate("expense_approver_1")
          .populate("expense_approver_2")
          .populate("expense_approver_3");
        if (!obj) {
          const initObj = new Information(CONSTANT.information);
          await initObj.save();
          const initResult = await Information.findOne()
            .populate("logo")
            .populate("expense_approver_1")
            .populate("expense_approver_2")
            .populate("expense_approver_3");

          resolve({ ...initResult, ...lineNotifyInfo });
        }
        resolve({ ...obj.toJSON(), ...lineNotifyInfo });
      } catch (error) {
        reject(ErrorNotFound("error : not found"));
      }
    });
  },

  update(id, data) {
    console.log("data", data);
    console.log("id", id);
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Information.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Information id: not found"));
        }

        const { image } = data;
        if (image && !image?.src) {
          try {
            const uploadedImage = await UploadService.upload(image);
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image = databasedImage.id;
            console.info("Image update success");
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }
        console.log("data", data);
        console.log("id", id);

        await Information.updateOne({ _id: id }, data);
        await session.commitTransaction();
        resolve(Object.assign(obj, data));
      } catch (error) {
        await session.abortTransaction();
        reject(error);
      } finally {
        session.endSession();
      }
    });
  },
};

module.exports = { ...methods };
