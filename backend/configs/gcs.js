const { Storage } = require("@google-cloud/storage");

const serviceKey = require("../credentials/gcs");

const { gcsProjectId } = require("./app");

const storage = new Storage({
  credentials: serviceKey,
  projectId: gcsProjectId,
});

module.exports = storage;
