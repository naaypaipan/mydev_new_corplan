const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const config = require("../configs/app");

const schema = new mongoose.Schema(
  {
    username: {
      type: String,
      index: true,
      required: true,
      unique: true,
      uniqueCaseInsensitive: false,
    },
    password: { type: String, index: true },
  },
  { timestamps: true }
);

// Apply the uniqueValidator plugin to userSchema.
schema.plugin(uniqueValidator);

// Generate JWT
// eslint-disable-next-line no-unused-vars
schema.methods.generateJWT = function (obj) {
  const today = new Date();
  const exp = new Date(today);

  exp.setDate(today.getDate() + config.token_exp_days || 1);
  // exp.setMinutes(today.getMinutes() + 30)

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      // eslint-disable-next-line no-magic-numbers
      exp: parseInt(exp.getTime() / 1000, 10),
    },
    config.secret
  );
};

// Custom JSON Response
schema.methods.toJSON = function () {
  return {
    _id: this._id,
    id: this._id,
    username: this.username,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Hash Password
schema.methods.passwordHash = function (password) {
  return crypto.createHash("sha1").update(password).digest("hex");
};

// Verify Password
schema.methods.validPassword = function (password) {
  return this.passwordHash(password) === this.password;
};

// Custom field before save
schema.pre("save", function (next) {
  this.password = this.passwordHash(this.password);
  next();
});

module.exports = mongoose.model("User", schema);
