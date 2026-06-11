const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    price: { type: Number },
    date: { type: Date },
    period: { type: Number },
    month_period: { type: Date },
    salaryList: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryList" },
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.s
schema.plugin(uniqueValidator);

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    _id: this._id,
    id: this._id,
    employee: this.employee,
    price: this.price,
    date: this.date,
    period: this.period,
    month_period: this.month_period,
    salaryList: this.salaryList,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("SsoTransection", schema);
