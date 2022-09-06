const express = require("express");
const authController = require("../controllers/auth/authController");
const authRouter = express.Router();

authRouter.route("/googleAuth").post(authController.googleAuth);
authRouter.route("/signUp").post(authController.basicAuthSignUp);
authRouter.route("/logIn").post(authController.basicAuthLogIn);
authRouter.route("/logout").delete(authController.logout);
authRouter.route("/refreshToken").post(authController.getNewAccessToken);

module.exports = authRouter;
