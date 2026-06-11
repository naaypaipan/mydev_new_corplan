const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const _ = require("lodash");

const schema = new mongoose.Schema(
  {
    payment_number: { type: String },
    creater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Assuming you have an Employee model
    },
    date: {
      type: Date,
    },
    due_date: {
      type: Date,
    },
    pay_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paytype",
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    payee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer", // Assuming you have a Payee model
    },
    payee: {
      name: { type: String }, //ชื่อผู้รับเงิน
      bank: { type: String }, //ธนาคาร
      account_number: { type: String }, //หมายเลขบัญหชี
    },
    datePayment: {
      type: Date, //วันครบกำหนดชำระ
    },
    dateRequest: {
      type: Date, //วันที่ขอเบิก
    },
    name: {
      type: String,
    },
    doc_status: {
      approved: {
        type: Boolean,
        default: false,
      },
      rejected: {
        type: Boolean,
        default: false,
      },
    },
    sotus_code: {
      type: Number,
    },
    create_by: {
      type: String,
    },
    transaction_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransectionType", // Assuming you have a Payee model
    },
    totalAmount: {
      type: Number,
    },
    status: {
      type: String,
      default: "PENDING",
      enum: ["PENDING", "SUCCESS"],
    },
    slip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    expenses_list: [
      {
        expenses_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Expenses", // Assuming you have an Expense model
        },
        budget: {
          prefix: { type: String },
          budget_number: { type: String },
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Budget", // Assuming you have a Budget model
          },
        },
        project: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project", // Assuming you have a Project model
          },
          name: { type: String },
          project_number: { type: String },
        },
        price_exclude_vat: {
          type: Number,
        },
        price: {
          type: Number,
        },
        name: {
          type: String,
        },
        vat: {
          type: Number,
        },
        total: {
          type: Number,
        },
        tax: {
          type: Number,
        },
        type: {
          type: String,
          default: "INDIRECT",
        },
      },
    ],
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator);

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    _id: this._id,
    id: this._id,
    name: this.name,
    payment_number: this.payment_number,
    date: this.date,
    due_date: this.due_date,
    pay_type: this.pay_type,
    requester: this.requester,
    payee_id: this.payee_id,
    payee: this.payee,
    datePayment: this.datePayment,
    doc_status: this.doc_status,
    expenses_list: this.expenses_list,
    totalAmount: this.totalAmount,
    status: this.status,
    slip: this.slip,
    dateRequest: this.dateRequest,
    creater: this.creater,
    transaction_type: this.transaction_type,
    create_by: this.create_by,
    sotus_code: this.sotus_code,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.Payment.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.payment_number = `STN${_.padStart(1, 5, "0")}`;
    return next();
  }

  this.payment_number = `STN${_.padStart(
    parseInt(_.trim(obj.payment_number, "STN"), 10) + 1,
    5,
    "0"
  )}`;

  return next();
});

module.exports = mongoose.model("Payment", schema);
