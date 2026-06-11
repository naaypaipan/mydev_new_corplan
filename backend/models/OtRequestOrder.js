const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    type_code: {
      type: String,
    },
    resquester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    date: {
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
    total_hours: {
      type: Number,
      default: 0,
    },
    status_claim: { type: Boolean, default: false },
    rate: {
      type: Number,
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
    resquester: this.resquester,
    startTime: this.startTime,
    endTime: this.endTime,
    description: this.description,
    status: this.status,
    type: this.type,
    total_hours: this.total_hours,
    status_approve: this.status_approve,
    project: this.project,
    date: this.date,
    rate: this.rate,
    status_claim: this.status_claim,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("OtRequestOrder", schema);
