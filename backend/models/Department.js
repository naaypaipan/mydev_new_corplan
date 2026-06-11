/* eslint-disable no-magic-numbers */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
const _ = require("lodash");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const { schema: AccessSchema } = require("./Access");

const schema = new mongoose.Schema(
  {
    department_code: {
      type: String,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    access: AccessSchema,
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator);

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    _id: this._id,
    department_code: this.department_code,
    name: this.name,
    description: this.description,
    access: this.access,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.Department.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.department_code = `DP${_.padStart(1, 3, "0")}`;
    return next();
  }

  this.department_code = `DP${_.padStart(
    parseInt(_.trim(obj.department_code, "DP"), 10) + 1,
    3,
    "0"
  )}`;

  return next();
});

module.exports = mongoose.model("Department", schema);
