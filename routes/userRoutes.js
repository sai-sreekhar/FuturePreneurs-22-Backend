const express = require("express");
const userController = require("../controllers/user/userController");
const userRouter = express.Router();
const auth = require("../middleware/authMiddleware");
const quizController = require("../controllers/quiz/quizController");

userRouter.route("/").put(auth, userController.fillUserDetails);
userRouter.route("/").patch(userController.hasFilledDetails);
// userRouter.route("/").patch(auth, userController.updateUser);

userRouter.route("/requests").get(auth, userController.getRequest);
userRouter.route("/requests/:teamId").post(auth, userController.sendRequest);
userRouter.route("/requests/:teamId").patch(auth, userController.removeRequest);

userRouter.route("/leave/:teamId").patch(auth, userController.leaveTeam);

userRouter.route("/token").patch(auth, userController.joinTeamViaToken);
userRouter.route("/team").get(auth, userController.getTeam);

userRouter.route("/quiz").get(auth, quizController.hasStartedQuiz);

module.exports = userRouter;
