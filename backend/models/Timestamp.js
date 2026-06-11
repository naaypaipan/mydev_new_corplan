const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    employeekey: { type: String },
    employee_firstname: { type: String },
    employee_lastname: { type: String },
    employeeType: { type: String, default: "FULLTIME" }, // Added employeeType field
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status_checkIn: {
      type: Boolean,
      default: false,
    },
    status_checkOut: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
    },
    project_in: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    project_out: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    image_out: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    salary: {
      month: { type: Number },
      day: { type: Number },
      hr: { type: Number },
    },
    salary_extra: {
      month: { type: Number, default: 0 },
      day: { type: Number, default: 0 },
    },
    sso_cost: { type: Number, default: 0 },
    locationCheckIn: {
      currentLocation: {
        lat: { type: Number },
        lon: { type: Number },
      },
      nearestProject: {
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        distance: { type: Number },
        isNearby: { type: Boolean, default: false },
        distanceText: { type: String },
      },
    },
    note: { type: String },
    rate: { type: Number, default: 1 },
    out_of_location: { type: Boolean, default: false },
    payroll_status: {
      type: Boolean,
      default: false,
    },
    status_payroll: { type: Boolean, default: false },
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
    employee: this.employee,
    checkIn: this.checkIn,
    checkOut: this.checkOut,
    status_checkIn: this.status_checkIn,
    status_checkOut: this.status_checkOut,
    price: this.price,
    project_in: this.project_in,
    image: this.image,
    image_out: this.image_out,
    project_out: this.project_out,
    salary: this.salary,
    salary_extra: this.salary_extra,
    employee_firstname: this.employee_firstname,
    employee_lastname: this.employee_lastname,
    employeekey: this.employeekey,
    note: this.note,
    rate: this.rate,
    locationCheckIn: this.locationCheckIn,
    out_of_location: this.out_of_location,
    employeeType: this.employeeType,
    sso_cost: this.sso_cost,
    payroll_status: this.payroll_status,
    status_payroll: this.status_payroll,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Timestamp", schema);
