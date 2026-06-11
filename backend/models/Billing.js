const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    date: {
      type: Date,
    },
    date_due: {
      type: Date,
    },
    date_confirm: {
      type: Date,
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    paidType: {
      type: String,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    description: {
      type: String,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    status: {
      type: String,
      default: "PENDING",
    },
    track_number: {
      type: String,
    },
    invoice_number: {
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
    code: this.code,
    date: this.date,
    date_due: this.date_due,
    date_confirm: this.date_confirm,
    price: this.price,
    name: this.name,
    paidType: this.paidType,
    employee: this.employee,
    project_id: this.project_id,
    status: this.status,
    track_number: this.track_number,
    customer: this.customer,
    description: this.description,
    invoice_number: this.invoice_number,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

module.exports = mongoose.model("Billing", schema);
