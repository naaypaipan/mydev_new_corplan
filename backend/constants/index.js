/* eslint-disable node/no-unsupported-features/es-syntax */
const information = require("./information.constant");
const messages = require("./messages.constant");
const statuses = require("./statuses.constant");
const ROLE_LEVEL = require("./roleLevel.constant");
const AVAILABLE_MODULE = require("./availablemodule.constant");

module.exports = {
  ...messages,
  ...statuses,
  information,
  ROLE_LEVEL,
  AVAILABLE_MODULE,
};
