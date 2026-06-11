const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const _ = require("lodash");
const schema = new mongoose.Schema(
  {
    budget_number: {
      type: String,
      unique: true,
    },
    prefix: {
      type: String,
    },
    name: {
      type: String,
    },
    date: {
      type: Date,
    },
    description: {
      type: String,
    },
    cost: {
      type: Number,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    expenses_status: {
      type: Boolean,
      default: false,
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
    budget_number: this.budget_number,
    prefix: this.prefix,
    name: this.name,
    description: this.description,
    cost: this.cost,
    date: this.date,
    expenses_status: this.expenses_status,
    project_id: this.project_id,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
// schema.pre("save", async function (next) {
//   const obj = await mongoose.models.Budget.findOne().sort({
//     createdAt: -1,
//   });

//   if (!obj) {
//     this.budget_number = _.padStart(1, 3, "0");
//     return next();
//   }

//   this.budget_number = _.padStart(parseInt(obj.budget_number, 10) + 1, 3, "0");
//   next();
// });
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Budget", schema);
