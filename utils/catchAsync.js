const AppError = require("./appError");
const { errorCodes } = require("./constants");

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      const message = `Exception: ${err}`;
      console.log(err);

      next(new AppError(message, 500, errorCodes.EXCEPTION));
    });
  };
};
