const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { errorCodes } = require("../utils/constants");

const auth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return next(
      new AppError(
        "Access Denied: No token provided",
        403,
        errorCodes.INVALID_TOKEN
      )
    );
  }

  try {
    const tokenDetails = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById({ _id: tokenDetails._id });
    if (!user) {
      return next(
        new AppError(
          "Please SignOut and SignIn Again",
          403,
          errorCodes.INVALID_TOKEN
        )
      );
    }
    req.user = tokenDetails;
    next();
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        "Please SignOut and SignIn Again",
        403,
        errorCodes.INVALID_TOKEN
      )
    );
  }
};

module.exports = auth;
