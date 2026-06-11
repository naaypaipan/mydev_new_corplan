const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const OtRequest = require("./OtRequest");

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    date: {
      type: Date,
    },
    dateStart: {
      type: Date,
    },
    dateEnd: {
      type: Date,
    },
    salaryList: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "salaryList",
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    payrollType: {
      type: String,
      default: "FULLTIME",
    },
    totalWork: { type: Number, default: 0 },
    totalSalary: { type: Number, default: 0 },
    department: { type: String },
    role: { type: String },
    name: { type: String },
    timesTampData: [{ type: mongoose.Schema.Types.ObjectId, ref: "timestamp" }],
    OtRequest: [{ type: mongoose.Schema.Types.ObjectId, ref: "OtRequest" }],
    revenue: {
      salary: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      overtime: { type: Number, default: 0 },
      allowances: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    expenses: {
      tax: { type: Number, default: 0 },
      sso: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
      timestamp: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    total: {
      type: Number,
    },
    salary_per_month: { type: Number, default: 0 },
    salary_per_day: { type: Number, default: 0 },
    note: { type: String },
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
    name: this.name,
    dateStart: this.dateStart,
    dateEnd: this.dateEnd,
    employee: this.employee,
    timesTampData: this.timesTampData,
    revenue: this.revenue,
    expenses: this.expenses,
    total: this.total,
    payrollType: this.payrollType,
    totalWork: this.totalWork,
    totalSalary: this.totalSalary,
    salaryList: this.salaryList,
    OtRequest: this.OtRequest,
    department: this.department,
    role: this.role,
    salary_per_month: this.salary_per_month,
    salary_per_day: this.salary_per_day,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Salary", schema);
