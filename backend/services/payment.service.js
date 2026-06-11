const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const expensesService = require("./expenses.service");
const payoutService = require("./payout.service");
const UploadService = require("./upload.service");
const Image = require("../models/Image");
const Expenses = require("../models/Expenses");
const Model = require("../models/Payment");

const methods = {
  createPipeline(req) {
    const pipeline = [];

    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
      });
    }

    // Filter by createdAt (for daily report / date range)
    if (req?.query?.date) {
      const d = new Date(req.query.date);
      if (!isNaN(d.getTime())) {
        const start = new Date(d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(d);
        end.setHours(23, 59, 59, 999);
        pipeline.push({
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        });
      }
    } else {
      if (req?.query?.dateStart) {
        const start = new Date(req.query.dateStart);
        if (!isNaN(start.getTime())) {
          pipeline.push({ $match: { createdAt: { $gte: start } } });
        }
      }
      if (req?.query?.dateEnd) {
        const end = new Date(req.query.dateEnd);
        if (!isNaN(end.getTime())) {
          pipeline.push({ $match: { createdAt: { $lte: end } } });
        }
      }
    }

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "requester",
        foreignField: "_id",
        as: "requester",
      },
    });
    pipeline.push({
      $set: { requester: { $arrayElemAt: ["$requester", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "creater",
        foreignField: "_id",
        as: "creater",
      },
    });
    pipeline.push({
      $set: { creater: { $arrayElemAt: ["$creater", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "paytypes",
        localField: "pay_type",
        foreignField: "_id",
        as: "pay_type",
      },
    });
    pipeline.push({
      $set: { pay_type: { $arrayElemAt: ["$pay_type", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "images",
        localField: "slip",
        foreignField: "_id",
        as: "slip",
      },
    });
    pipeline.push({
      $set: {
        slip: {
          $cond: [
            { $gt: [{ $size: "$slip" }, 0] },
            { $arrayElemAt: ["$slip", 0] },
            null,
          ],
        },
      },
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

  insert(data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = new Model(data);
        const inserted = await obj.save();
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

  async insertPaymentWithExpense(data) {
    try {
      const expenses = await expensesService.findDaily({
        query: {
          date: data.date,
          dateStart: data.dateStart,
          dateEnd: data.dateEnd,
        },
      });

      const result = [];
      for (const item of expenses.rows) {
        console.log("item", item);

        const payload = {
          payee: item.payee,
          date: new Date(),
          dateRequest: new Date(),
          totalAmount: item.totalAmount,
          // pay_type: item.type,
          requester: item.expenses[0].employee?._id,
          expenses_list: item.expenses.map((expense) => ({
            expenses_id: expense._id,
            budget: {
              _id: expense.budget?._id,
              prefix: expense.budget?.prefix,
              budget_number: expense.budget?.budget_number,
            },
            project: {
              id: expense.project?._id,
              name: expense.project?.name,
              project_number: expense.project?.project_number,
            },
            price: expense.price,
            name: expense.name,
          })),
          create_by: data.create_by,
        };
        const payment = await this.insert(payload);

        // Update expenses status to PREPARE
        await Promise.all(
          item.expenses.map((expense) =>
            expensesService.update(expense._id, { status: "PREPARE" })
          )
        );

        result.push(payment);
      }
      return result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * สร้างรายการเตรียมจ่ายตามผู้รับเงิน: ดึง expenses ที่ APPROVE แล้ว จัดกลุ่มตาม payee สร้าง Payment ต่อ 1 ผู้รับเงิน
   */
  async createPrepareByPayee(data = {}) {
    const _ = require("lodash");
    const req = {
      query: { status: "APPROVE", size: 99999, page: 1 },
    };
    const { rows } = await expensesService.find(req);
    if (!rows || rows.length === 0) {
      return { created: 0, payments: [] };
    }

    const payeeKey = (e) => {
      const p = e?.payee || {};
      const name = (p.name || "").toString().trim();
      const bank = (p.bank || "").toString().trim();
      const acc = (p.account_number || "").toString().trim();
      return `${name}|${bank}|${acc}`;
    };
    const groups = _.groupBy(rows, payeeKey);

    const result = [];
    for (const key of Object.keys(groups)) {
      const list = groups[key];
      const first = list[0];
      const payee = first?.payee
        ? {
            name: first.payee.name || "",
            bank: first.payee.bank || "",
            account_number: first.payee.account_number || "",
          }
        : { name: "", bank: "", account_number: "" };

      const totalAmount = _.sumBy(
        list,
        (e) => Number(e?.net_price) || Number(e?.price) || 0
      );
      const expenses_list = list.map((expense) => ({
        expenses_id: expense._id,
        budget: {
          _id: expense.budget?._id,
          prefix: expense.budget?.prefix || "",
          budget_number: expense.budget?.budget_number || "",
        },
        project: {
          id: expense.project?._id,
          name: expense.project?.name || "",
          project_number: expense.project?.project_number || "",
        },
        price: expense.price,
        name: expense.name,
      }));

      const payload = {
        payee,
        date: data.date || new Date(),
        dateRequest: data.dateRequest || new Date(),
        datePayment: data.datePayment || new Date(),
        totalAmount,
        requester: first?.employee?._id || data.creater,
        creater: data.creater,
        create_by: data.create_by,
        expenses_list,
      };
      const payment = await this.insert(payload);
      result.push(payment);

      await Promise.all(
        list.map((expense) =>
          expensesService.update(expense._id, { status: "PREPARE" })
        )
      );
    }

    return { created: result.length, payments: result };
  },

  /**
   * จ่ายเงิน: อัปโหลดสลิป สร้าง payout ตาม expenses_list อัปเดต expense เป็น SUCCESS และ payment เป็น SUCCESS
   */
  async completePayment(id, data) {
    const payment = await Model.findById(id).lean();
    if (!payment) {
      throw ErrorNotFound("Payment not found");
    }
    if (payment.status === "SUCCESS") {
      throw ErrorBadRequest("รายการนี้จ่ายเงินแล้ว");
    }
    const list = payment.expenses_list || [];
    if (list.length === 0) {
      throw ErrorBadRequest("ไม่มีรายการเบิกใน payment");
    }

    let slipId = payment.slip || null;
    if (
      data.slipImage &&
      Array.isArray(data.slipImage) &&
      data.slipImage.length > 0
    ) {
      const imgData = data.slipImage[0];
      const uploaded = await UploadService.upload({
        image: imgData.data_url || imgData.image,
        imageType: "others",
        alt: "payment-slip",
      });
      const imageDoc = new Image(uploaded);
      await imageDoc.save();
      slipId = imageDoc._id;
    }

    const payDate = new Date();
    for (const item of list) {
      console.log("complete--------------------------------");
      const expenseDoc = await Expenses.findById(item.expenses_id)
        .select("employee")
        .lean();
      const employeeId = expenseDoc?.employee || payment.requester;
      await payoutService.insert({
        expenses: item.expenses_id,
        price: item.price,
        date: payDate,
        slip: slipId,
        budget: item.budget?._id,
        employee: employeeId,
      });
    }

    await Model.updateOne({ _id: id }, { status: "SUCCESS", slip: slipId });
    const updated = await Model.findById(id);
    return updated;
  },

  update(id, data) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const obj = await Model.findById(id);
        if (!obj) {
          reject(ErrorNotFound("Model id: not found"));
        }

        if (
          data.slipImage &&
          Array.isArray(data.slipImage) &&
          data.slipImage.length > 0
        ) {
          const imgData = data.slipImage[0];
          const uploaded = await UploadService.upload({
            image: imgData.data_url || imgData.image,
            imageType: "others",
            alt: "payment-slip",
          });
          const imageDoc = new Image(uploaded);
          await imageDoc.save();
          data.slip = imageDoc._id;
          delete data.slipImage;
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
    });
  },

  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Model.findById(id);
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }

        if (obj.expenses_list && obj.expenses_list.length > 0) {
          await Promise.all(
            obj.expenses_list.map((expense) =>
              expensesService.update(expense.expenses_id || expense._id, {
                status: "APPROVE",
              })
            )
          );
        }

        await Model.deleteOne({ _id: id });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },
};

module.exports = { ...methods };
