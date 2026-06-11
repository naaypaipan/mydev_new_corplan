const mongoose = require("mongoose");
const _ = require("lodash");
const moment = require("moment");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    date: {
      type: Date,
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    paidType: {
      type: String,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    description: {
      type: String,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
    },
    bill_image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    bill_images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    status: {
      type: String,
      default: "PENDING",
    },
    invoice_number: {
      type: String,
    },
    tax_3: {
      type: Boolean,
      default: false,
    },
    withholding_tax: {
      type: Number,
      default: 0,
    },
    withholding_tax_rate: {
      type: Number,
      default: 0,
    },
    includes_vat: {
      type: Boolean,
      default: false,
    },
    vat_amount: {
      type: Number,
      default: 0,
    },
    base_amount: {
      type: Number,
      default: 0,
    },
    net_price: {
      type: Number,
      default: 0,
    },
    bill_pickup: {
      type: Boolean,
      default: false,
    },
    billing: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    expenses_type: {
      type: String,
      default: "REFUND",
    },
    payee: {
      name: { type: String }, //ชื่อผู้รับเงิน
      bank: { type: String }, //ธนาคาร
      account_number: { type: String }, //หมายเลขบัญหชี
    },
    sotus_code: {
      type: Number,
    },
    approval_logs: [
      {
        action: { type: String }, // APPROVE | REJECT | RESET | OTHER
        status: { type: String }, // resulting status
        step: { type: Number }, // 1-3 for approve steps, 0/undefined otherwise
        note: { type: String },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        actor_name: { type: String }, // snapshot for audit
        acted_at: { type: Date, default: Date.now },
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
    code: this.code,
    date: this.date,
    price: this.price,
    name: this.name,
    paidType: this.paidType,
    employee: this.employee,
    project: this.project,
    budget: this.budget,
    status: this.status,
    invoice_number: this.invoice_number,
    tax_3: this.tax_3,
    withholding_tax: this.withholding_tax,
    withholding_tax_rate: this.withholding_tax_rate,
    includes_vat: this.includes_vat,
    vat_amount: this.vat_amount,
    base_amount: this.base_amount,
    net_price: this.net_price,
    bill_pickup: this.bill_pickup,
    budget: this.budget,
    description: this.description,
    billing: this.billing,
    payee: this.payee,
    customer: this.customer,
    bill_images: this.bill_images,
    expenses_type: this.expenses_type,
    sotus_code: this.sotus_code,
    approval_logs: this.approval_logs,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const today = moment();
  const yearBE = today.year() + 543;
  const yearTwoDigits = String(yearBE).slice(-2);
  const month = String(today.month() + 1).padStart(2, "0");
  const day = String(today.date()).padStart(2, "0");
  const prefix = `EX${day}${month}${yearTwoDigits}`;

  const obj = await mongoose.models.Expenses.findOne({
    code: { $regex: `^${prefix}` },
  }).sort({
    createdAt: -1,
    code: -1,
  });

  if (!obj) {
    this.code = `${prefix}001`;
    return next();
  }

  const lastCode = obj.code;
  const runningNumberStr = lastCode.substring(prefix.length);
  const runningNumber = parseInt(runningNumberStr, 10);

  if (isNaN(runningNumber)) {
    this.code = `${prefix}001`;
    return next();
  }

  const nextRunningNumber = runningNumber + 1;
  this.code = `${prefix}${String(nextRunningNumber).padStart(3, "0")}`;

  return next();
});
module.exports = mongoose.model("Expenses", schema);
