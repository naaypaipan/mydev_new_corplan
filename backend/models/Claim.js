/* eslint-disable no-magic-numbers */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
const _ = require("lodash");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    type_code: {
      type: String,
    },
    topic: {
      type: String,
    },
    description: {
      type: String,
    },
    date_in: {
      type: Date,
    },
    date_out: {
      type: Date,
    },
    status_doc: {
      type: String,
      default: "PENDING",
    },
    status_approve: {
      type: Boolean,
      default: false,
    },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    approve_description: {
      type: String,
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
    type_code: this.type_code,
    topic: this.name,
    description: this.description,
    date_in: this.date_in,
    date_out: this.date_out,
    status_doc: this.status_doc,
    status_approve: this.status_approve,
    approver: this.approver,
    approve_description: this.approve_description,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.Claim.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.type_code = `CL${_.padStart(1, 6, "0")}`;
    return next();
  }

  this.type_code = `CL${_.padStart(
    parseInt(_.trim(obj.type_code, "CL"), 10) + 1,
    6,
    "0"
  )}`;

  return next();
});

module.exports = mongoose.model("Claim", schema);
