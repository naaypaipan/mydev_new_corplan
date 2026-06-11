const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      enum: ["HR", "FINANCE"],
      index: true,
    },
    resourceType: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["CREATE", "UPDATE", "DELETE"],
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    summary: { type: String },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    meta: { type: mongoose.Schema.Types.Mixed },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorUsername: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

schema.index({ createdAt: -1 });

module.exports = mongoose.model("ActivityLog", schema);
