const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    project_number: {
      type: String,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    engineer: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    date_start: { type: Date },
    date_end: { type: Date },
    po_status: { type: Boolean, default: false },
    boq_status: { type: Boolean, default: false },
    acc_status: {
      status: { type: Boolean, default: false },
      date: { type: Date },
      due: { type: Date },
    },
    payment_status: {
      status: { type: Boolean, default: false },
      date: { type: Date },
    },
    deliver_status: {
      status: { type: Boolean, default: false },
      date: { type: Date },
    },
    operation_status: { type: String, default: "PENDING" },
    customer: {
      type: String,
    },
    location: {
      type: String,
    },
    cost: {
      type: Number,
      default: 0,
    },
    vat: { type: Number, default: 0 },
    labur_cost: {
      type: Number,
      default: 0,
    },
    place: {
      type: String,
    },
    include_vat: { type: Boolean, default: false },
    time_tracking_enabled: {
      type: Boolean,
      default: false,
    },
    /** ลงเวลาผ่านลิงก์ /manpower/timestamp/... (แยกจากการลงผ่านหน้า Profile) */
    time_tracking_link_enabled: {
      type: Boolean,
      default: true,
    },
    gps: {
      lat: { type: Number },
      lon: { type: Number },
    },
    /** ไซต์เพิ่มเติม (จุดหลักยังใช้ gps ตามเดิม — รวมกันตอนคำนวณระยะ) */
    gps_sites: [
      {
        name: { type: String, default: "" },
        lat: { type: Number },
        lon: { type: Number },
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
    project_number: this.project_number,
    name: this.name,
    engineer: this.engineer,
    description: this.description,
    cost: this.cost,
    date_start: this.date_start,
    deliver_status: this.deliver_status,
    date_end: this.date_end,
    po_status: this.po_status,
    boq_status: this.boq_status,
    operation_status: this.operation_status,
    payment_status: this.payment_status,
    customer: this.customer,
    acc_status: this.acc_status,
    location: this.location,
    place: this.place,
    labur_cost: this.labur_cost,
    acc_status: this.acc_status,
    vat: this.vat,
    time_tracking_enabled: this.time_tracking_enabled,
    time_tracking_link_enabled: this.time_tracking_link_enabled,
    gps: this.gps,
    gps_sites: this.gps_sites,
    include_vat: this.include_vat,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Project", schema);
