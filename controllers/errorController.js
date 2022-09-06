const { errorCodes } = require("../utils/constants");

const sendErrorDevEnv = (err, res) => {
  res.status(err.statusCode).json({
    errorCode: err.errorCode,
    message: err.message,
    stack: err.exceptionTrace.stack,
  });
};

const sendErrorProdEnv = (err, res) => {
  res.status(err.statusCode).json({
    errorCode: err.errorCode,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Unknown Error";
  err.errorCode = err.errorCode || errorCodes.UNKNOWN_ERROR;

  if (process.env.NODE_ENV === "development") {
    sendErrorDevEnv(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProdEnv(error, res);
  }
};
