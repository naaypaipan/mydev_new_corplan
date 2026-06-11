const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema(
  {
    house_number: {
      type: String,
    },
    soi: {
      type: String,
    },
    village_number: {
      type: String,
    },
    road: {
      type: String,
    },
    subdistrict: {
      type: String,
    },
    district: {
      type: String,
    },
    province: {
      type: String,
    },
    postcode: {
      type: String,
    },
    country: {
      type: String,
    },
    lat: {
      type: String,
    },
    lng: {
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
    id: this._id,
    _id: this._id,
    house_number: this.house_number,
    soi: this.soi,
    village_number: this.village_number,
    road: this.road,
    subdistrict: this.subdistrict,
    district: this.district,
    province: this.province,
    postcode: this.postcode,
    country: this.country,
    LAT: this.LAT,
    LNG: this.LNG,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Custom field before save
schema.pre("save", (next) => {
  next();
});
const Address = mongoose.model("Address", schema);
module.exports = { Address, schema };
