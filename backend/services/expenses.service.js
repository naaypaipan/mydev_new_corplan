const mongoose = require("mongoose");

const config = require("../configs/app");

const { ErrorBadRequest, ErrorNotFound } = require("../configs/errorMethods");
const Expenses = require("../models/Expenses");
const Image = require("../models/Image");
const NotifyService = require("./notify.service");

const UploadService = require("./upload.service");
const informationService = require("./information.service");
const ActivityLogService = require("./activityLog.service");
const dayjs = require("dayjs");
const { getIO } = require("../configs/socket");
const axios = require('axios');

const FCM_NEW_EXPENSE_URL = process.env.FCM_NEW_EXPENSE_URL;   // URL ของ notifyNewExpenseHttp
const FCM_STATUS_URL = process.env.FCM_STATUS_URL;             // URL ของ notifyOnStatusChangeHttp
const FCM_API_KEY = process.env.FCM_API_KEY;

function fireAndForget(url, payload) {
  if (!url || !FCM_API_KEY) return;
  axios.post(url, payload, { headers: { 'x-api-key': FCM_API_KEY } })
    .catch(err => console.error('[FCM]', err.response?.data || err.message));
}

const methods = {
  createPipeline(req) {
    const pipeline = [];

    if (req.query.me) {
      pipeline.push({
        $match: { employee: new mongoose.Types.ObjectId(req.query.me) },
      });
    }
    if (req.query.dateStart) {
      const startOfDay = dayjs(req.query.dateStart).startOf('day').toDate();
      pipeline.push({
        $match: { date: { $gte: startOfDay } },
      });
    }
    if (req.query.dateEnd) {
      const endOfDay = dayjs(req.query.dateEnd).endOf('day').toDate();
      pipeline.push({
        $match: {
          date: { $lte: endOfDay },
        },
      });
    }

    if (req?.params?.id) {
      pipeline.push({
        $match: { _id: new mongoose.Types.ObjectId(req?.params?.id) },
      });
    }
    if (req?.query?.findProject) {
      pipeline.push({
        $match: {
          project: new mongoose.Types.ObjectId(req?.query?.findProject),
        },
      });
    }
    if (req?.query?.status) {
      pipeline.push({ $match: { status: req.query.status } });
    }
    if (req?.query?.search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { code: { $regex: req.query.search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
      },
    });

    pipeline.push({
      $set: { project: { $arrayElemAt: ["$project", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employee",
      },
    });

    pipeline.push({
      $set: { employee: { $arrayElemAt: ["$employee", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "budgets",
        localField: "budget",
        foreignField: "_id",
        as: "budget",
      },
    });

    pipeline.push({
      $set: { budget: { $arrayElemAt: ["$budget", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customer",
      },
    });

    pipeline.push({
      $set: { customer: { $arrayElemAt: ["$customer", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "images",
        localField: "bill_image",
        foreignField: "_id",
        as: "bill_image",
      },
    });

    pipeline.push({
      $set: { bill_image: { $arrayElemAt: ["$bill_image", 0] } },
    });

    pipeline.push({
      $lookup: {
        from: "images",
        localField: "bill_images",
        foreignField: "_id",
        as: "bill_images",
      },
    });

    if (req.query.name) {
      pipeline.push({
        $match: { name: { $regex: req.query.name } },
      });
    }

    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $set: { id: "$_id" } });

    pipeline.push({
      $facet: {
        count: [{ $count: "total" }],
        data: [
          {
            $skip: +(
              (req.query.size || config.pageLimit) *
              ((req.query.page || 1) - 1)
            ),
          },
          {
            $limit: parseInt(req.query.size, 10) || config.pageLimit,
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
        Promise.all([Expenses.aggregate(this.createPipeline(req).pipeline)])
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
        const result = await Expenses.aggregate(
          this.createPipeline(id).pipeline
        );

        const obj = result[0].data[0];
        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        resolve(obj);
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  async findDaily(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Build query filter
        const filter = {};
        console.log(req.query);

        // Filter by specific date
        // if (req.query.date) {
        //   const startOfDay = dayjs(req.query.date).startOf("day").toDate();

        //   const endOfDay = dayjs(req.query.date).endOf("day").toDate();
        //   filter.date = {
        //     $lte: endOfDay,
        //     $gte: startOfDay,
        //   };
        // }

        // Filter by status (only approved or successful)
        filter.status = { $in: ["APPROVE", "SUCCESS"] };

        // Filter by date range
        if (req.query.dateStart || req.query.dateEnd) {
          filter.date = filter.date || {};
          if (req.query.dateStart) {
            filter.date.$gte = dayjs(req.query.dateStart).toDate();
          }
          if (req.query.dateEnd) {
            filter.date.$lte = dayjs(req.query.dateEnd).toDate();
          }
        }

        // Fetch expenses with populated fields
        const expenses = await Expenses.find(filter)
          .populate("employee")
          .populate("project")
          .populate("budget")
          .populate("customer")
          .populate("bill_image")
          .sort({ date: -1 })
          .lean();

        // Group by payee
        const groupedByPayee = {};

        expenses.forEach((expense) => {
          // Create unique key for payee
          const payeeKey = `${expense.payee?.name || "ไม่ระบุ"}_${expense.payee?.bank || ""
            }_${expense.payee?.account_number || ""}`;

          if (!groupedByPayee[payeeKey]) {
            groupedByPayee[payeeKey] = {
              payee: expense.payee || { name: "ไม่ระบุ" },
              employee: expense.employee,
              type: expense.expenses_type,
              paidType: expense.paidType,
              date: expense.date,
              dateCreated: expense.createdAt,
              totalAmount: 0,
              count: 0,
              expenses: [],
            };
          }

          groupedByPayee[payeeKey].totalAmount += expense.price || 0;
          groupedByPayee[payeeKey].count += 1;
          groupedByPayee[payeeKey].expenses.push({
            _id: expense._id,
            code: expense.code,
            date: expense.date,
            name: expense.name,
            price: expense.price,
            paidType: expense.paidType,
            employee: expense.employee,
            project: expense.project,
            budget: expense.budget,
            customer: expense.customer,
            status: expense.status,
            invoice_number: expense.invoice_number,
            tax_3: expense.tax_3,
            bill_pickup: expense.bill_pickup,
            billing: expense.billing,
            bill_image: expense.bill_image,
            description: expense.description,
            expenses_type: expense.expenses_type,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
          });
        });

        // Convert to array and sort by total amount
        const result = Object.values(groupedByPayee).sort(
          (a, b) => b.totalAmount - a.totalAmount
        );

        resolve({
          total: result.length,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  async findDailyDashboard(req) {
    return new Promise(async (resolve, reject) => {
      try {
        // Build query filter
        const filter = {};

        // Filter by specific date
        if (req.query.date) {
          const startOfDay = new Date(req.query.date);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(req.query.date);
          endOfDay.setHours(23, 59, 59, 999);

          filter.date = {
            $lte: endOfDay,
            $gte: startOfDay,
          };
        }

        // Filter by status (only approved or successful)
        filter.status = { $in: ["APPROVE", "SUCCESS"] };

        // Filter by date range
        if (req.query.dateStart || req.query.dateEnd) {
          filter.date = filter.date || {};
          if (req.query.dateStart) {
            filter.date.$gte = new Date(req.query.dateStart);
          }
          if (req.query.dateEnd) {
            filter.date.$lte = new Date(req.query.dateEnd);
          }
        }

        // Fetch expenses with populated fields
        const expenses = await Expenses.find(filter)
          .populate("employee")
          .populate("project")
          .populate("budget")
          .populate("customer")
          .populate("bill_image")
          .sort({ date: -1 })
          .lean();

        // Group by payee
        const groupedByPayee = {};

        expenses.forEach((expense) => {
          // Create unique key for payee
          const payeeKey = `${expense.payee?.name || "ไม่ระบุ"}_${expense.payee?.bank || ""
            }_${expense.payee?.account_number || ""}`;

          if (!groupedByPayee[payeeKey]) {
            groupedByPayee[payeeKey] = {
              payee: expense.payee || { name: "ไม่ระบุ" },
              employee: expense.employee,
              type: expense.expenses_type,
              paidType: expense.paidType,
              date: expense.date,
              dateCreated: expense.createdAt,
              totalAmount: 0,
              count: 0,
              expenses: [],
            };
          }

          groupedByPayee[payeeKey].totalAmount += expense.price || 0;
          groupedByPayee[payeeKey].count += 1;
          groupedByPayee[payeeKey].expenses.push({
            _id: expense._id,
            code: expense.code,
            date: expense.date,
            name: expense.name,
            price: expense.price,
            paidType: expense.paidType,
            employee: expense.employee,
            project: expense.project,
            budget: expense.budget,
            customer: expense.customer,
            status: expense.status,
            invoice_number: expense.invoice_number,
            tax_3: expense.tax_3,
            bill_pickup: expense.bill_pickup,
            billing: expense.billing,
            bill_image: expense.bill_image,
            description: expense.description,
            expenses_type: expense.expenses_type,
            createdAt: expense.createdAt,
            updatedAt: expense.updatedAt,
          });
        });

        // Convert to array and sort by total amount
        const result = Object.values(groupedByPayee).sort(
          (a, b) => b.totalAmount - a.totalAmount
        );

        resolve({
          total: result.length,
          rows: result,
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  findByUid(uid) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Expenses.findOne({ uid }).populate("project");

        if (!obj) {
          reject(ErrorNotFound("id: not found"));
        }
        resolve(obj.toJSON());
      } catch (error) {
        reject(ErrorNotFound("id: not found"));
      }
    });
  },

  insert(data, req = null) {
    return (
      new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const { image } = data;
          if (image) {
            try {
              const uploadedImage = await UploadService.upload(image);
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.bill_image = databasedImage.id;
            } catch (error) {
              console.error("Upload Image have a problem", error);
            }
          }

          // Handle multiple images
          const { images } = data;
          if (images && Array.isArray(images) && images.length > 0) {
            const uploadedIds = await Promise.all(
              images.map(async (img) => {
                try {
                  const uploadedImage = await UploadService.upload({
                    image: img.data_url || img.image,
                    imageType: "others",
                    alt: "",
                  });
                  const databasedImage = new Image(uploadedImage);
                  await databasedImage.save();
                  return databasedImage.id;
                } catch (error) {
                  console.error("Upload Image have a problem", error);
                  return null;
                }
              }),
            );
            data.bill_images = uploadedIds.filter(Boolean);
            delete data.images;
          }
          const info = await informationService.find();

          const obj = new Expenses(data);
          const inserted = await obj.save();

          await session.commitTransaction();
          ActivityLogService.recordAsync({
            req,
            module: "FINANCE",
            resourceType: "expenses",
            action: "CREATE",
            resourceId: inserted._id,
            summary:
              `สร้างค่าใช้จ่าย ${inserted.code || ""} ${inserted.name || ""}`.trim() ||
              "สร้างรายการเบิกเงิน",
            after: inserted.toObject ? inserted.toObject() : inserted,
          });
          setImmediate(() => {
            NotifyService.newNotifyExpenses({
              message: [
                {
                  type: "flex",
                  altText: "รายการเบิกเงิน",
                  contents: {
                    type: "bubble",
                    header: {
                      type: "box",
                      layout: "vertical",
                      backgroundColor: "#FF1E00FF",
                      contents: [
                        {
                          type: "text",
                          text: "รายการเบิก",
                          size: "xl",
                          color: "#ffffff",
                          weight: "bold",
                        },
                        {
                          type: "text",
                          text: inserted.code || "-",
                          color: "#ffffff",
                          size: "md",
                        },
                        {
                          type: "text",
                          text: new Date().toLocaleDateString("th-TH"),
                          color: "#ffffff",
                          size: "sm",
                        },
                        {
                          type: "text",
                          text: `ผู้เบิก : ${data?.employee_data?.firstname} ${data?.employee_data?.lastname}`,
                          color: "#ffffff",
                          size: "sm",
                        },
                      ],
                    },
                    body: {
                      type: "box",
                      layout: "vertical",
                      contents: [
                        {
                          type: "box",
                          layout: "vertical",
                          contents: [
                            {
                              type: "text",
                              text: "โครงการ",
                              weight: "bold",
                              size: "lg",
                            },
                            {
                              type: "text",
                              text: data?.projectSelect?.project_number || "-",
                              size: "md",
                              weight: "bold",
                              wrap: true,
                            },
                            {
                              type: "text",
                              text: data?.projectSelect?.name || "-",
                              size: "md",
                              wrap: true,
                            },
                          ],
                        },
                        {
                          type: "box",
                          layout: "vertical",
                          contents: [
                            {
                              type: "text",
                              text: "งบประมาณ",
                              weight: "bold",
                            },
                            {
                              type: "text",
                              text: data?.budgetSelect?.name || "-",
                              size: "md",
                            },
                          ],
                        },
                        {
                          type: "box",
                          layout: "vertical",
                          contents: [
                            {
                              type: "text",
                              text: "คงเหลือ",
                              weight: "bold",
                            },
                            {
                              type: "text",
                              text:
                                data?.budgetSelect?.remain
                                  ?.toFixed(2)
                                  ?.replace(/\d(?=(\d{3})+\.)/g, "$&,") || "-",
                              size: "md",
                            },
                          ],
                        },
                        {
                          type: "separator",
                          margin: "xl",
                        },
                        {
                          type: "box",
                          layout: "vertical",
                          margin: "xl",
                          contents: [
                            {
                              type: "text",
                              text: "รายการ",
                              weight: "bold",
                              size: "lg",
                            },
                            {
                              type: "box",
                              layout: "horizontal",
                              margin: "sm",
                              contents: [
                                {
                                  type: "text",
                                  text: data?.name || "-",
                                  size: "md",
                                  wrap: true,
                                  color: "#555555",
                                  flex: 4,
                                },
                                {
                                  type: "text",
                                  text: `${parseFloat(
                                    data?.price || 0
                                  ).toLocaleString("th-TH")} บาท`,
                                  size: "md",
                                  color: "#111111",
                                  align: "end",
                                  flex: 2,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: "separator",
                          margin: "xl",
                        },
                        {
                          type: "box",
                          layout: "vertical",
                          margin: "xl",
                          contents: [
                            {
                              type: "text",
                              text: "จ่ายให้",
                              weight: "bold",
                              size: "lg",
                            },
                            {
                              type: "text",
                              text: data?.payee?.name || "-",
                              size: "md",
                            },
                            {
                              type: "text",
                              text: data?.payee?.account_number || "-",
                              size: "sm",
                            },
                            {
                              type: "text",
                              text: data?.payee?.bank || "-",
                              size: "sm",
                            },
                          ],
                        },
                      ],
                    },
                    footer: {
                      type: "box",
                      layout: "vertical",
                      contents: [
                        {
                          type: "button",
                          action: {
                            type: "uri",
                            label: "ดูรายละเอียด",
                            uri: `${info?.url}/finance/expenses/detail/${inserted?._id}`,
                          },
                          color: "#FF1E00FF",
                          style: "primary",
                        },
                      ],
                    },
                  },
                  styles: {
                    header: {
                      backgroundColor: "#1DB446",
                    },
                  },
                },
              ],
            }).catch((err) =>
              console.error("LINE notify expenses", err?.message || err)
            );
          });
          resolve(inserted);
          // Fire-and-forget FCM notification
          try {
            const approverId = info?.expense_approver_1?._id?.toString() || info?.expense_approver_1?.toString();
            if (approverId) {
              let empName = `${data?.employee_data?.firstname || ''} ${data?.employee_data?.lastname || ''}`.trim() || 'พนักงาน';
              fireAndForget(FCM_NEW_EXPENSE_URL, {
                expenseName: inserted.code || inserted.name || 'รายการเบิกเงิน',
                amount: inserted.net_price || inserted.price || 0,
                createdBy: empName,
                approverIds: [approverId],
              });
            }
          } catch (e) { /* ไม่ block main flow */ }

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
          if (io) io.emit("expenses:created", { id: result?._id });
          return result;
        })
    );
  },

  insertWithoutNotify(data, req = null) {
    return new Promise(async (resolve, reject) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const { image } = data;
        if (image) {
          try {
            const uploadedImage = await UploadService.upload(image);
            const databasedImage = new Image(uploadedImage);
            await databasedImage.save();
            data.image = databasedImage.id;
          } catch (error) {
            console.error("Upload Image have a problem", error);
          }
        }
        const obj = new Expenses(data);
        const inserted = await obj.save();
        await session.commitTransaction();
        ActivityLogService.recordAsync({
          req,
          module: "FINANCE",
          resourceType: "expenses",
          action: "CREATE",
          resourceId: inserted._id,
          summary:
            `สร้างค่าใช้จ่าย (ไม่แจ้งเตือน) ${inserted.code || ""} ${inserted.name || ""}`.trim() ||
            "สร้างรายการเบิกเงิน",
          after: inserted.toObject ? inserted.toObject() : inserted,
        });
        resolve(inserted);
        try {
          const info = await informationService.find();
          const approverId = info?.expense_approver_1?._id?.toString() || info?.expense_approver_1?.toString();
          if (approverId) {
            let empName = `${data?.employee_data?.firstname || ''} ${data?.employee_data?.lastname || ''}`.trim() || 'พนักงาน';
            fireAndForget(FCM_NEW_EXPENSE_URL, {
              expenseName: inserted.code || inserted.name || 'รายการเบิกเงิน',
              amount: inserted.net_price || inserted.price || 0,
              createdBy: empName,
              approverIds: [approverId],
            });
          }
        } catch (e) { /* ไม่ block main flow */ }

      } catch (error) {
        await session.abortTransaction();
        reject(ErrorBadRequest(error.message));
      } finally {
        session.endSession();
      }
    });
  },

  update(id, data, req = null) {
    return (
      new Promise(async (resolve, reject) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const obj = await Expenses.findById(id);
          if (!obj) {
            return reject(ErrorNotFound("Expenses id: not found"));
          }
          const beforeSnap = obj.toObject();

          const statusBefore = obj?.status;

          // Handle single image (backward compatibility)
          const { image } = data;
          if (image && !image?.src) {
            try {
              const uploadedImage = await UploadService.upload(image);
              const databasedImage = new Image(uploadedImage);
              await databasedImage.save();
              data.bill_image = databasedImage.id;
              // Also push to bill_images array
              await Expenses.updateOne(
                { _id: id },
                { $push: { bill_images: databasedImage.id } }
              );
            } catch (error) {
              console.error("Upload Image have a problem", error);
            }
          }

          // Handle multiple images
          const { images } = data;
          if (images && Array.isArray(images) && images.length > 0) {
            const uploadedIds = [];
            for (const img of images) {
              try {
                const uploadedImage = await UploadService.upload({
                  image: img.data_url || img.image,
                  imageType: "others",
                  alt: "",
                });
                const databasedImage = new Image(uploadedImage);
                await databasedImage.save();
                uploadedIds.push(databasedImage.id);
              } catch (error) {
                console.error("Upload Image have a problem", error);
              }
            }
            if (uploadedIds.length > 0) {
              await Expenses.updateOne(
                { _id: id },
                { $push: { bill_images: { $each: uploadedIds } } }
              );
            }
            // Remove images from data to avoid saving raw data
            delete data.images;
          }

          // =========================================================
          //  Approval flow mode (ONE_STEP vs THREE_STEP)
          // =========================================================
          let approvalMode = "THREE_STEP";
          let info = null;
          try {
            info = await informationService.find();
            if (info?.expense_approval_mode) {
              approvalMode = info.expense_approval_mode;
            }

            // Normalize statuses when using ONE_STEP mode
            if (approvalMode === "ONE_STEP" && data.status) {
              if (["APPROVE_1", "APPROVE_2"].includes(data.status)) {
                data.status = "APPROVE";
              }
              if (["REJECT_2", "REJECT_3"].includes(data.status)) {
                data.status = "REJECT";
              }
            }

            const expName = obj.code || "(ไม่มีรหัส)";
            let targetUserId, title, body;
            // =========================================================
            //  Approval Chain Notify
            // =========================================================
            if (approvalMode === "THREE_STEP") {
              if (data.status === "APPROVE_1") {
                // Notify Approver 2 that step 1 is approved
                const a2 = info?.expense_approver_2;
                if (a2) {
                  NotifyService.directNotify({
                    message: ` **✅ อนุมัติขั้นที่ 1 สำเร็จ\nรายการเบิกเงิน: ${expName}\nกรุณาดำเนินการอนุมัติขั้นที่ 2 ต่อไป`,
                  });
                }
                else if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              } else if (data.status === "APPROVE_2") {
                // Notify Approver 3 that step 2 is approved
                const a3 = info?.expense_approver_3;
                if (a3) {
                  NotifyService.directNotify({
                    message: ` **✅ อนุมัติขั้นที่ 2 สำเร็จ\nรายการเบิกเงิน: ${expName}\nกรุณาดำเนินการอนุมัติขั้นที่ 3 (ขั้นสุดท้าย) ต่อไป`,
                  });
                }
                else if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              } else if (data.status === "APPROVE") {
                // All 3 steps approved — notify finance team
                if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              } else if (data.status === "REJECT") {
                // Rejected at step 1 — notify the expense creator
                data.status = "REJECT";
                if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              } else if (data.status === "REJECT_2") {
                // Rejected at step 2 — reset to PENDING and notify
                data.status = "REJECT_2";
                if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              } else if (data.status === "REJECT_3") {
                // Rejected at step 3 — reset to PENDING and notify
                data.status = "REJECT_3";
                if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              }
            } else if (approvalMode === "ONE_STEP") {
              // Simple one-step notifications
              if (data.status === "APPROVE") {
                NotifyService.directNotify({
                  message: ` **✅ อนุมัติรายการเบิกเงิน (1 ขั้นตอน)\nรายการเบิกเงิน: ${expName}\nรอการโอนเงิน`,
                });
                if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              } else if (data.status === "REJECT") {
                NotifyService.directNotify({
                  message: ` **❌ ปฏิเสธรายการเบิกเงิน (1 ขั้นตอน)\nรายการเบิกเงิน: ${expName}\nกรุณาตรวจสอบและแก้ไข`,
                });
                if (targetUserId && title) {
                  fireAndForget(FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
                }
              }
            }
            // =========================================================
          } catch (notifyError) {
            console.error("Approval chain notify error:", notifyError);
          }

          // =========================================================
          //  Approval audit log (who/when/which step)
          // =========================================================
          const isStatusChanged =
            typeof data?.status === "string" &&
            data.status.length > 0 &&
            data.status !== statusBefore;

          const approvalStatuses = new Set([
            "PREAPPROVE",
            "APPROVE_1",
            "APPROVE_2",
            "APPROVE",
            "REJECT",
            "REJECT_2",
            "REJECT_3",
            "PENDING",
          ]);

          let logEntry = null;
          if (isStatusChanged && approvalStatuses.has(data.status)) {
            const step =
              data.status === "APPROVE_1"
                ? 1
                : data.status === "APPROVE_2"
                  ? 2
                  : data.status === "APPROVE"
                    ? 3
                    : 0;

            const action =
              data.status.startsWith("APPROVE")
                ? "APPROVE"
                : data.status.startsWith("REJECT")
                  ? "REJECT"
                  : data.status === "PENDING"
                    ? "RESET"
                    : "OTHER";


            let targetUserId, title, body;

            if (data.status === 'APPROVE_1') {
              targetUserId = info?.expense_approver_2?._id?.toString();
              title = 'มีรายการเบิกเงินรออนุมัติ (ขั้นที่ 2)';
              body = `"${obj.name}" ผ่านการอนุมัติขั้นที่ 1 แล้ว`;
            } else if (data.status === 'APPROVE_2') {
              targetUserId = info?.expense_approver_3?._id?.toString();
              title = 'มีรายการเบิกเงินรออนุมัติ (ขั้นที่ 3)';
              body = `"${obj.name}" ผ่านการอนุมัติขั้นที่ 2 แล้ว`;
            } else if (data.status === 'APPROVE') {
              targetUserId = obj?.employee?._id?.toString() ?? obj?.employee?.toString();
              title = 'รายการเบิกเงินได้รับการอนุมัติแล้ว';
              body = `"${obj.name}" อนุมัติเรียบร้อย`;
            } else if (data.status?.startsWith('REJECT')) {
              targetUserId = obj?.employee?._id?.toString() ?? obj?.employee?.toString();
              title = 'รายการเบิกเงินไม่ผ่านการอนุมัติ';
              body = `"${obj.name}" ไม่ผ่านการอนุมัติ`;
            }

            if (targetUserId) {
              fireAndForget(process.env.FCM_STATUS_URL, { targetUserId, title, body, route: '/finance/expenses' });
            }


            // Frontend should pass these for accurate audit
            const actor = data?.approval_actor || data?.actor || null;
            const actorName =
              data?.approval_actor_name || data?.actor_name || null;

            logEntry = {
              action,
              status: data.status,
              step,
              note: data?.approval_note || data?.note || "",
              actor,
              actor_name: actorName,
              acted_at: new Date(),
            };
          }

          // Do not persist helper fields in the main document
          delete data.approval_actor;
          delete data.approval_actor_name;
          delete data.approval_note;
          delete data.actor;
          delete data.actor_name;

          const updateDoc = logEntry
            ? { $set: data, $push: { approval_logs: logEntry } }
            : { $set: data };

          await Expenses.updateOne({ _id: id }, updateDoc);
          const afterSnap = await Expenses.findById(id).lean();
          ActivityLogService.recordAsync({
            req,
            module: "FINANCE",
            resourceType: "expenses",
            action: "UPDATE",
            resourceId: id,
            summary:
              `แก้ไขค่าใช้จ่าย ${beforeSnap.code || ""} ${beforeSnap.name || ""}`.trim() ||
              "อัปเดตรายการเบิกเงิน",
            before: beforeSnap,
            after: afterSnap,
          });
          if (data?.note) {
            NotifyService.directNotify({
              message: ` **แก้ไข\nรายการเบิกเงิน: ${data?.code}\nผู้เบิก : ${data?.applie?.firstname
                } ${data?.applie?.lastname}\nงาน: ${data?.projectSelect?.name
                } \nงบประมาณ: ${data?.budgetSelect?.name
                }\nคงเหลือ ${data?.budgetSelect?.remain
                  ?.toFixed(2)
                  ?.replace(
                    /\d(?=(\d{3})+\.)/g,
                    "$&,"
                  )} ใช้ไป ${data?.budgetSelect?.percentage?.toFixed(
                    2
                  )} % \n--------------- \nรายการ: ${data?.name
                }\nจำนวน: ${parseFloat(data?.price)
                  ?.toFixed(2)
                  ?.replace(
                    /\d(?=(\d{3})+\.)/g,
                    "$&,"
                  )} บาท\n--------------- \n จ่ายให้\nชื่อ: ${data?.payee?.name || "-"
                }\nเลขบัญชี: ${data?.payee?.account_number || "-"}\nธนาคาร: ${data?.payee?.bank || "-"
                }`,
            });
          }
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
          if (io) io.emit("expenses:updated", { id: result?._id || id });
          return result;
        })
    );
  },

  removeImage(expensesId, imageId, req = null) {
    return new Promise(async (resolve, reject) => {
      try {
        const obj = await Expenses.findById(expensesId);
        if (!obj) {
          return reject(ErrorNotFound("Expenses id: not found"));
        }
        await Expenses.updateOne(
          { _id: expensesId },
          { $pull: { bill_images: new mongoose.Types.ObjectId(imageId) } }
        );
        ActivityLogService.recordAsync({
          req,
          module: "FINANCE",
          resourceType: "expenses",
          action: "UPDATE",
          resourceId: expensesId,
          summary: `ลบรูปจากรายการค่าใช้จ่าย ${obj.code || ""}`,
          meta: { removedImageId: imageId },
        });
        resolve({ message: "Image removed successfully" });
      } catch (error) {
        reject(error);
      }
    });
  },

  delete(id, req = null) {
    return (
      new Promise(async (resolve, reject) => {
        try {
          const obj = await Expenses.findById(id);
          if (!obj) {
            return reject(ErrorNotFound("id: not found"));
          }
          const beforeSnap = obj.toObject();
          await Expenses.deleteOne({ _id: id });
          ActivityLogService.recordAsync({
            req,
            module: "FINANCE",
            resourceType: "expenses",
            action: "DELETE",
            resourceId: id,
            summary:
              `ลบค่าใช้จ่าย ${beforeSnap.code || ""} ${beforeSnap.name || ""}`.trim() ||
              "ลบรายการเบิกเงิน",
            before: beforeSnap,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      })
        // Emit socket event after resolve (non-blocking)
        .then(() => {
          const io = getIO();
          if (io) io.emit("expenses:deleted", { id });
        })
    );
  },
};

module.exports = { ...methods };
