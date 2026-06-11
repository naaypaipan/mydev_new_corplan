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
    billing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
    },
    paidType: {
      type: String,
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
    billing: this.billing,
    budget: this.budget,
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
    this.payout_number = `PAYIN${_.padStart(1, 8, "0")}`;
    return next();
  }

  this.payout_number = `PAYIN${_.padStart(
    parseInt(_.trim(obj.code, "PAYIN"), 10) + 1,
    8,
    "0"
  )}`;

  return next();
});

module.exports = mongoose.model("Payin", schema);
