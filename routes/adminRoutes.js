const express = require("express");
const adminController = require("../controllers/admin/adminController");
const auth = require("../middleware/authMiddleware");
const adminRouter = express.Router();

// adminRouter.route("/participants").get(auth, adminController.getTeamsScores);
// adminRouter.route("/answers/:teamId").get(auth, adminController.getTeamAnswers);
// adminRouter.route("/endTime/:teamId").patch(auth, adminController.setEndTime);

// adminRouter.route("/questions").get(auth, adminController.getQuestions);
// adminRouter
//   .route("/question/:questionId")
//   .get(auth, adminController.getQuestion);
adminRouter.route("/question").post(auth, adminController.setQuestion);
// adminRouter
//   .route("/question/:questionId")
//   .patch(auth, adminController.modifyQuestion);
// adminRouter
//   .route("/question/:questionId")
//   .delete(auth, adminController.deleteQuestion);
adminRouter.route("/reset/:teamId").get(adminController.resetQuiz);
adminRouter.route("/user").get(adminController.getUsersCount);
adminRouter.route("/team").get(adminController.getTeamsCount);
adminRouter.route("/email").get(adminController.sendEmails);

adminRouter.route("/merge").get(adminController.merge);

adminRouter.route("/roundThree").post(adminController.roundThree);
adminRouter.route("/:teamId").get(adminController.removeRoundsData);
module.exports = adminRouter;
