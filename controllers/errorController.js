const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  //400 for a bad request with invalid db field value
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  let value = "";
  Object.keys(err.keyValue).forEach((key) => {
    value = err.keyValue[key];
  });
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    return el.message;
  });
  const message = `Invalid input data. ${errors.join(". ")}`;

  return new AppError(message, 400);
};

const sendErrorDevEnv = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProdEnv = (err, res) => {
  //sending users only operational errors i.e. errors caused by their inputs back
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //sending a generic response incase of errors due to coding problems
  else {
    //logging it for my reference
    console.error("ERROR 💥", err);

    //sending generic response
    res.status(500).json({
      status: "error",
      message: "Something went wrong from our side!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";

  if (process.env.NODE_ENV === "development") {
    sendErrorDevEnv(err, res);
  } else if (process.env.NODE_ENV === "production") {
    //handling invalid mongodb field errors by changing them to operational errors
    let error = { ...err };
    if (error.name === "CastError") error = handleCastErrorDB(error);

    //handling duplicate fields in mongodb by changing them to operational errors
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    //handling mongoose validation errors
    if (err.name === "ValidationError") error = handleValidationError(err);

    sendErrorProdEnv(error, res);
  }
};
