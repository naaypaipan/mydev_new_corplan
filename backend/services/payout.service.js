const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Model = require("../models/Payout");
const Expenses = require("../models/Expenses");
const Image = require("../models/Image");
const UploadService = require("./upload.service");
const googleSheetService = require("./googlesheet.service");
const { getIO } = require("../configs/socket");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
      });
    }
    if (req?.query?.ex) {
      pipeline.push({
        $match: { expenses: new mongoose.Types.ObjectId(req?.query?.ex) },
      });
    }

    // Populate slip image
    pipeline.push({
      $lookup: {
        from: "images",
        localField: "slip",
        foreignField: "_id",
        as: "slip",
      },
    });
    pipeline.push({
      $set: { slip: { $arrayElemAt: ["$slip", 0] } },
    });

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $set: { id: "$_id" } });

    pipeline.push({
      $facet: {
        count: [{ $count: "total" }],
        data: [
          {
            $skip: +(
              (req?.query?.size || config?.pageLimit) *
              ((req?.query?.page || 1) - 1)
            ),
          },
          {
            $limit: parseInt(req?.query?.size, 10) || config?.pageLimit,
          },
        ],
      },
    });

    return { pipeline };
  },
  async find(req) {
    const limit = +(req.query.size || config.pageLimit);
    return new Promise(async (resolve, reject) => {
      try {
        Promise.all([Model.aggregate(this.createPipeline(req).pipeline)])
          .then((result) => {
            const rows = result[0][0]?.data;
            const queryResult = rows;

            const count = result[0][0]?.count?.[0]?.total;
            resolve({
              total: count,
              lastPage: Math.ceil(count / limit),
              currPage: +req.query.page || 1,
              rows: queryResult,
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
        console.log(id);
        const result = await Model.aggregate(this.createPipeline(id).pipeline);
        const obj = result[0].data[0];
        if (!obj) {
          reject(ErrorNotFound("not found"));
        }

        resolve(obj);
      } catch (error) {
        reject(ErrorNotFound(`not found , ${error}`));
      }
    });
  },

  /**
   * ส่ง payout data ไปเก็บใน Google Sheet (non-blocking)
   * @param {Object} payoutDoc - payout document
   * @param {string} expensesId - expenses _id
   * @param {Object} options - { sheetTitle?: string } ชื่อแผ่นงาน Google Sheet
   */
  async _sendToGoogleSheet(payoutDoc, expensesId, options = {}) {
    try {
      if (!expensesId) return;
      const expensesDoc = await Expenses.findById(expensesId)
        .populate("project", "name project_number customer")
        .populate("budget", "name prefix budget_number")
        .populate({ path: "employee", select: "firstname lastname team role", populate: { path: "role", select: "name" } })
        .populate("customer", "name")
        .lean();
      const sheetOpt = options.sheetTitle ? { sheetTitle: options.sheetTitle } : {};
      await googleSheetService.appendPayoutRow(payoutDoc, expensesDoc, sheetOpt);
    } catch (err) {
      console.error("Google Sheet send error (non-blocking):", err.message);
    }
  },

  insert(data) {
    return (
      new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        const inserted = {};

        try {
          // รองรับรูปแบบใหม่: { items: [...], googleSheetName: "Sheet1" }
          let items = Array.isArray(data) ? data : null;
          let googleSheetName = null;
          if (data && !Array.isArray(data) && data.items && Array.isArray(data.items)) {
            items = data.items;
            googleSheetName = data.googleSheetName || null;
          }
          const sheetOpt = googleSheetName ? { sheetTitle: googleSheetName } : {};

          if (items) {
            const savedItems = [];
            for await (const item of items) {
              const expenseId = item._id || item.expenses;
              console.log("-----------", item);

              const dataSubmit = {
                expenses: expenseId,
                price: item.price,
                date: item.date,
              };
              const obj = new Model(dataSubmit);
              const saved = await obj.save();
              savedItems.push({ payout: saved, expensesId: expenseId });
              await Expenses.updateOne(
                { _id: expenseId },
                { status: "SUCCESS" }
              );
            }
            await session.commitTransaction();

            // ส่ง Google Sheet (non-blocking, หลัง commit)
            for (const { payout, expensesId } of savedItems) {
              this._sendToGoogleSheet(payout, expensesId, sheetOpt);
            }

            resolve(savedItems.map((s) => s.payout));
          } else {
            // Handle slip image upload
            if (data.slipImage && data.slipImage.length > 0) {
              try {
                const imgData = data.slipImage[0];
                const uploadedImage = await UploadService.upload({
                  image: imgData.data_url || imgData.image,
                  imageType: "others",
                  alt: "payment-slip",
                });
                const databasedImage = new Image(uploadedImage);
                await databasedImage.save();
                data.slip = databasedImage.id;
              } catch (error) {
                console.error("Upload Slip Image have a problem", error);
              }
              delete data.slipImage;
            }

            const obj = new Model(data);
            const saved = await obj.save();
            if (data.expenses) {
              await Expenses.updateOne(
                { _id: data.expenses },
                { status: "SUCCESS" }
              );
            }
            await session.commitTransaction();

            // ส่ง Google Sheet (non-blocking, หลัง commit)
            const sheetOpt = data.googleSheetName ? { sheetTitle: data.googleSheetName } : {};
            this._sendToGoogleSheet(saved, data.expenses, sheetOpt);

            resolve(saved);
          }
        } catch (error) {
          await session.abortTransaction();
          reject(ErrorBadRequest(error.message));
        } finally {
          session.endSession();
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then((result) => {
          const io = getIO();
          if (io)
            io.emit("payout:created", {
              id: result?._id,
              expenses: data?.expenses,
            });
          return result;
        })
    );
  },

  update(id, data) {
    return (
      new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const obj = await Model.findById(id);
          if (!obj) {
            reject(ErrorNotFound("Model id: not found"));
          }

          // Handle slip image upload
          if (data.slipImage && data.slipImage.length > 0) {
            try {
              const imgData = data.slipImage[0];
              const uploadedImage = await UploadService.upload({
                image: imgData.data_url || imgData.image,
                imageType: "others",
                alt: "payment-slip",
              });
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.slip = databasedImage.id;
            } catch (error) {
              console.error("Upload Slip Image have a problem", error);
            }
            delete data.slipImage;
          }

          // Handle legacy single image upload
          const { image } = data;
          if (image && !image?.src) {
            try {
              const uploadedImage = await UploadService.upload(image);
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.slip = databasedImage.id;
            } catch (error) {
              console.error("Upload Image have a problem", error);
            }
          }

          await Model.updateOne({ _id: id }, data);
          await session.commitTransaction();
          resolve(Object.assign(obj, data));
        } catch (error) {
          await session.abortTransaction();
          reject(error);
        } finally {
          session.endSession();
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then((result) => {
          const io = getIO();
          if (io) io.emit("payout:updated", { id: result?._id || id });
          return result;
        })
    );
  },

  delete(id) {
    return (
      new Promise(async (resolve, reject) => {
        try {
          const obj = await Model.findById(id);
          if (!obj) {
            reject(ErrorNotFound("id: not found"));
          }
          await Model.deleteOne({ _id: id });
          resolve();
        } catch (error) {
          reject(error);
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then(() => {
          const io = getIO();
          if (io) io.emit("payout:deleted", { id });
        })
    );
  },
};

module.exports = { ...methods };
