/* eslint-disable node/no-unsupported-features/es-syntax */
const httpStatuses = {
  OKStatus: 200,
  CreatedStatus: 201,
  NoContentStatus: 204,
  ErrorNotModifiedStatus: 304,
  ErrorBadRequestStatus: 400,
  ErrorUnauthorizedStatus: 401,
  ErrorPaymentRequiredStatus: 402,
  ErrorForbiddenStatus: 403,
  ErrorNotFoundStatus: 404,
  ErrorMethodNotAllowedStatus: 405,
  ErrorUnprocessableEntityStatus: 422,
  ErrorInternalServerStatus: 500,
};

module.exports = {
  ...httpStatuses,
};
