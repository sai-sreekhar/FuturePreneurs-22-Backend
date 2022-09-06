const { errorCodes } = require("./constants");

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);

    this.statusCode = statusCode;
    this.errorCode = errorCode;

    this.exceptionTrace = {};

    if (this.errorCode === errorCodes.EXCEPTION) {
      Error.captureStackTrace(this.exceptionTrace, this.constructor);
    }
  }
}

module.exports = AppError;
