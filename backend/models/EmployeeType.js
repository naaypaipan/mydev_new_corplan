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
    name: {
      type: String,
    },
    description: {
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
    name: this.name,
    description: this.description,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.EmployeeType.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.type_code = `EM${_.padStart(1, 3, "0")}`;
    return next();
  }

  this.type_code = `EM${_.padStart(
    parseInt(_.trim(obj.type_code, "EM"), 10) + 1,
    3,
    "0"
  )}`;

  return next();
});

module.exports = mongoose.model("EmployeeType", schema);
