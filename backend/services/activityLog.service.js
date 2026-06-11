const mongoose = require("mongoose");
const ActivityLog = require("../models/ActivityLog");
const config = require("../configs/app");

function pruneForLog(value, depth = 0) {
  if (depth > 8) return "[MaxDepth]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    if (value.length > 800) {
      return `${value.slice(0, 400)}…(truncated)`;
    }
    return value;
  }
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) return "[Buffer]";
  if (value._bsontype === "ObjectID" && typeof value.toString === "function") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((v) => pruneForLog(v, depth + 1));
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k === "password" || k === "__v") continue;
    try {
      out[k] = pruneForLog(v, depth + 1);
    } catch (e) {
      out[k] = "[omit]";
    }
  }
  return out;
}

/** Mongoose doc หรือ object ทั่วไป -> plain JSON ที่บันทึกใน Mixed ได้ */
function snapshotForStorage(value) {
  if (value === null || value === undefined) return undefined;
  try {
    const json = JSON.stringify(value, (k, val) => {
      if (val instanceof Date) return val.toISOString();
      if (val && val._bsontype === "ObjectID" && val.toString) {
        return val.toString();
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer(val)) {
        return "[Buffer]";
      }
      return val;
    });
    return pruneForLog(JSON.parse(json));
  } catch (e) {
    return { _snapshotError: e.message || String(e) };
  }
}

function normalizeActorUserId(raw) {
  if (raw == null || raw === "") return undefined;
  const s = String(raw);
  if (!mongoose.Types.ObjectId.isValid(s)) return undefined;
  return new mongoose.Types.ObjectId(s);
}

function actorFromReq(req) {
  if (!req || !req.user) return { actorUserId: null, actorUsername: null };
  const u = req.user;
  const userId = u.id || u._id || u.sub || null;
  const username = u.username || u.name || null;
  return {
    actorUserId: normalizeActorUserId(userId),
    actorUsername: username,
  };
}

function clientIp(req) {
  if (!req) return null;
  try {
    const xff = req.headers?.["x-forwarded-for"];
    if (typeof xff === "string" && xff.length) {
      return xff.split(",")[0].trim();
    }
    return req.socket?.remoteAddress || null;
  } catch (e) {
    return null;
  }
}

/**
 * Fire-and-forget audit row; does not throw to caller.
 */
async function record({
  req,
  module,
  resourceType,
  action,
  resourceId,
  summary,
  before,
  after,
  meta,
}) {
  const { actorUserId, actorUsername } = actorFromReq(req);
  let rid = resourceId;
  if (rid != null && rid !== "" && !(rid instanceof mongoose.Types.ObjectId)) {
    const s = String(rid);
    rid = mongoose.Types.ObjectId.isValid(s) ? new mongoose.Types.ObjectId(s) : rid;
  }
  const doc = {
    module,
    resourceType,
    action,
    resourceId: rid || undefined,
    summary: summary || `${action} ${resourceType}`,
    before: before != null ? snapshotForStorage(before) : undefined,
    after: after != null ? snapshotForStorage(after) : undefined,
    meta: meta != null ? snapshotForStorage(meta) : undefined,
    actorUserId: actorUserId || undefined,
    actorUsername: actorUsername || undefined,
    ip: clientIp(req),
    userAgent: req?.headers?.["user-agent"] || null,
  };
  await ActivityLog.create(doc);
}

function recordFireAndForget(props) {
  return record(props).catch((e) =>
    console.error(
      "[activityLog] FAILED",
      e.message,
      e.errors ? JSON.stringify(e.errors) : "",
      e.stack || ""
    )
  );
}

async function find(req) {
  const rawSize = +(req.query.size || 50);
  const limit = Math.min(Math.max(Number.isFinite(rawSize) ? rawSize : 50, 1), 500);
  const rawPage = +(req.query.page || 1);
  const page = Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1);
  const skip = limit * (page - 1);
  const query = {};
  if (req.query.module) query.module = req.query.module;
  if (req.query.resourceType) query.resourceType = req.query.resourceType;
  if (req.query.action) query.action = req.query.action;

  const [rows, count] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return { rows, count, page, size: limit };
}

module.exports = {
  record,
  recordAsync: recordFireAndForget,
  recordFireAndForget,
  find,
  pruneForLog,
};
