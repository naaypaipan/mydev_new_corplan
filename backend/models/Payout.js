const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const _ = require("lodash");
const schema = new mongoose.Schema(
  {
    payout_number: {
      type: String,
    },
    date: {
      type: Date,
    },
    price: {
      type: Number,
    },
    slip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    expenses: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expenses",
    },
    paidType: {
      type: String,
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
    },
    remark: {
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
    id: this._id,
    payout_number: this.payout_number,
    price: this.price,
    date: this.date,
    slip: this.slip,
    employee: this.employee,
    paidType: this.paidType,
    expenses: this.expenses,
    budget: this.budget,
    remark: this.remark,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", async function (next) {
  const obj = await mongoose.models.Payout.findOne().sort({
    createdAt: -1,
  });

  if (!obj) {
    this.payout_number = `PAY${_.padStart(1, 8, "0")}`;
    return next();
  }

  this.payout_number = `PAY${_.padStart(
    parseInt(_.trim(obj.code, "PAY"), 10) + 1,
    8,
    "0"
  )}`;

  return next();
});

module.exports = mongoose.model("Payout", schema);
