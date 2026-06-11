const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { type } = require("../credentials/gcs");
const { schema: AddressSchema } = require("./Address");
const _ = require("lodash");
const schema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    firstname_th: {
      type: String,
    },
    lastname_th: {
      type: String,
    },
    team: {
      type: String,
    },
    check_key: {
      // check in/out key with qrcode
      type: String,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    uid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoleType",
    },
    type: {
      type: String, // 'employee', 'contractor', etc.
      default: "FULLTIME",
    },
    phone_number: {
      type: String,
    },
    tax_id: {
      type: String,
    },
    address: AddressSchema,
    salary: {
      month: { type: Number },
      day: { type: Number },
      hr: { type: Number },
    },
    salary_extra: {
      month: { type: Number },
      day: { type: Number },
    },
    bank_account: {
      number: { type: Number },
      account_name: { type: String },
      bank_name: { type: String },
      account_type: { type: String },
    },
    work_status: {
      type: Boolean,
      default: true,
    },
    date_start: {
      type: Date,
    },
    date_resign: {
      type: Date,
    },
    sso_tax: {
      status: { type: Boolean, default: false },
      number: { type: Number, default: 5 },
    },
    tax: {
      status: { type: Boolean, default: false },
      number: { type: Number, default: 3 },
    },
    /** รูปแบบลงเวลา: true = อ้างอิงโลเคชั่น (GPS ภายใน 1 กม.), false = เลือกโครงการเอง (แบบเก่า) */
    timestamp_use_location: {
      type: Boolean,
      default: false,
    },
    permissions: {
      admin: {
        type: Boolean,
        default: false, // Allow access to admin panel
      },
      hr_management: {
        type: Boolean,
        default: false,
      },
      hr_report: {
        type: Boolean,
        default: false, // Allow access to HR report
      },
      hr_edit: {
        type: Boolean, // Allow access to HR edit
        default: false,
      },
      finance_approve: {
        type: Boolean,
        default: false, // Allow access to finance approval
      },
    },
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
    employee_id: this.employee_id,
    firstname: this.firstname,
    lastname: this.lastname,
    firstname_th: this.firstname_th,
    lastname_th: this.lastname_th,
    department: this.department,
    role: this.role,
    phone_number: this.phone_number,
    salary: this.salary,
    check_key: this.check_key,
    image: this.image,
    team: this.team,
    type: this.type,
    salary_extra: this.salary_extra,
    uid: this.uid,
    sso_tax: this.sso_tax,
    tax: this.tax,
    permissions: this.permissions,
    bank_account: this.bank_account,
    work_status: this.work_status,
    date_start: this.date_start,
    date_resign: this.date_resign,
    address: this.address,
    tax_id: this.tax_id,
    timestamp_use_location: this.timestamp_use_location,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.Employee.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.employee_id = `HR${_.padStart(1, 6, "0")}`;
    return next();
  }

  this.employee_id = `HR${_.padStart(
    parseInt(_.trim(obj.employee_id, "HR"), 10) + 1,
    6,
    "0"
  )}`;

  return next();
});
module.exports = mongoose.model("Employee", schema);
