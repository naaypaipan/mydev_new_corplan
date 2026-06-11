const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    type_code: {
      type: String,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    employee_name: {
      type: String,
    },
    date: {
      type: Date,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      default: "PENDING",
    },
    status_approve: {
      approve: { type: Boolean, default: false },
      approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    type: {
      type: Number,
    },
    timestamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timestamp",
    },
    salary: {
      month: { type: Number, default: 0 },
      day: { type: Number, default: 0 },
      hr: { type: Number, default: 0 },
    },
    rate: {
      type: Number,
    },
    total_hours: {
      type: Number,
      default: 0,
    },
    total_price: {
      type: Number,
      default: 0,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OtRequestOrder",
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
    type_code: this.type_code,
    employee: this.employee,
    employee_name: this.employee_name,
    startTime: this.startTime,
    endTime: this.endTime,
    description: this.description,
    status: this.status,
    rate: this.rate,
    timestamp: this.timestamp,
    total_hours: this.total_hours,
    status_approve: this.status_approve,
    project: this.project,
    total_price: this.total_price,
    salary: this.salary,
    order: this.order,
    date: this.date,
    type: this.type,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("OtRequest", schema);
