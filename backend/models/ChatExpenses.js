/* eslint-disable no-magic-numbers */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
const _ = require("lodash");
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    message: {
      type: String,
    },
    expenses_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expenses",
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
    sender: this.sender,
    message: this.message,
    expenses_id: this.expenses_id,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("ChatExpenses", schema);
