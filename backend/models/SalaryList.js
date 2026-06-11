const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const _ = require("lodash");

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    date: {
      type: String,
    },
    dateStart: {
      type: Date,
    },
    dateEnd: {
      type: Date,
    },
    role_type: {
      type: String,
    },
    date_pay: {
      type: Date,
    },
    sso_percentage: {
      type: Number,
    },
    sso: {
      type: Number,
    },
    total: {
      type: Number,
    },
    total_sso: {
      type: Number,
    },
    total_tax: {
      type: Number,
    },
    total_late: {
      type: Number,
    },
    total_late: {
      type: Number,
    },
    timestampList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Timestamp",
      },
    ],
    note: {
      type: String,
    },
    status_lock: {
      type: Boolean,
      default: false,
    },
    dashboard: [
      {
        project_id: String, // รหัสอ้างอิงโปรเจค
        project_number: String, // เลขที่โปรเจค
        project_name: String, // ชื่อโปรเจค
        total_salary: Number, // รวมค่าแรงปกติทั้งหมดในงวดนี้ของโปรเจค
        total_ot: Number, // รวมค่า OT ทั้งหมดในงวดนี้ของโปรเจค
        total_spent: Number,
        total_allowance: Number, // รวมค่าเบี้ยเลี้ยงทั้งหมดในงวดนี้ของโปรเจค
        total_bonus: Number,
        total_sso: Number, // รวมเงินสมทบ สสส. ทั้งหมดในงวดนี้ของโปรเจค
        total_tax: Number, // รวมภาษี ณ ที่จ่าย ทั้งหมดในงวดนี้ของโปรเจค
        total_late: Number, // รวมหักมาสาย ทั้งหมดในงวดนี้ของโปรเจค
        amount: Number,
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
    date_pay: this.date_pay,
    total: this.total,
    sso: this.sso,
    timestampList: this.timestampList,
    role_type: this.role_type,
    dashboard: this.dashboard,
    total_sso: this.total_sso,
    total_tax: this.total_tax,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.SalaryList.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.code = `PAY${_.padStart(1, 6, "0")}`;
    return next();
  }

  this.code = `PAY${_.padStart(
    parseInt(_.trim(obj.code, "PAY"), 10) + 1,
    6,
    "0"
  )}`;

  return next();
});
module.exports = mongoose.model("SalaryList", schema);
