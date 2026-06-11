const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    PROJECT: {
      type: Boolean,
      default: false,
    },
    CUSTOMER: {
      type: Boolean,
      default: false,
    },
    DIRECTOR: {
      type: Boolean,
      default: false,
    },
    FINANCE: {
      type: Boolean,
      default: false,
    },
    MANAGEMENT: {
      type: Boolean,
      default: false,
    },
    PROFILE: {
      type: Boolean,
      default: true,
    },
    HUMEN: {
      type: Boolean,
      default: false,
    },
    SALE: {
      type: Boolean,
      default: false,
    },
    /** สิทธิ์เมนูย่อย: { MODULE: { "/path": true|false } } — ถ้าไม่กำหนดหรือ object ว่างต่อโมดูล = ไม่จำกัดเมนย่อย (พฤติกรรมเดิม) */
    subMenuAccess: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator);

// Access JSON Response
schema.methods.toJSON = function () {
  return {
    id: this._id,
    _id: this._id,
    PROJECT: this.PROJECT,
    CUSTOMER: this.CUSTOMER,
    FINANCE: this.FINANCE,
    MANAGEMENT: this.MANAGEMENT,
    DIRECTOR: this.DIRECTOR,
    PROFILE: this.PROFILE,
    HUMEN: this.HUMEN,
    SALE: this.SALE,
    subMenuAccess: this.subMenuAccess,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});

const Access = mongoose.model("Access", schema);
const AvailableModule = mongoose.model("AvailableModule", schema);

module.exports = { Access, schema, AvailableModule };
