/* eslint-disable node/no-unsupported-features/es-syntax */
const messages = {
  UNIQUE_FIELD:
    "The requested operation failed because it tried to create a {0} that already exists.",
  NOT_NULL: "{0} can not be NULL.",
  NOT_EMPTY: "{0} can not be empty.",
  MIN_VALUE: "{0} minimum {1} characters are allowed.",
  MAX_VALUE: "{0} maximum {1} characters are allowed.",
  CREATED_SUCCESS: "{0} create request successfully executes.",
  UPDATED_SUCCESS: "{0} update request successfully executes.",
  DELETE_SUCCESS: "{0} delete request successfully executes.",
};

module.exports = {
  ...messages,
};
