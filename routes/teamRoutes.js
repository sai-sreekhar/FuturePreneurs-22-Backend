const express = require("express");
const teamController = require("../controllers/team/teamController");
const teamRouter = express.Router();
const auth = require("../middleware/authMiddleware");

teamRouter.route("/").get(auth, teamController.getAllTeams);
teamRouter.route("/").post(auth, teamController.createTeam);
teamRouter.route("/:teamId").get(auth, teamController.getTeamDetails);
teamRouter.route("/:teamId").patch(auth, teamController.updateTeam);
teamRouter.route("/:teamId").delete(auth, teamController.deleteTeam);
teamRouter.route("/requests/:teamId").get(auth, teamController.getTeamRequests);
teamRouter.route("/requests/:teamId").patch(auth, teamController.updateRequest);
teamRouter.route("/remove/:teamId").patch(auth, teamController.removeMember);
teamRouter.route("/token/:teamId").get(auth, teamController.getTeamToken);

teamRouter.route("/quiz/:teamId").get(auth, teamController.getQuestion);
teamRouter.route("/quiz/:teamId").post(auth, teamController.submitAnswer);
// teamRouter.route("/quiz/answers/:teamId").post(auth, teamController.getAnswers);
// teamRouter.route("/quiz/score/:teamId").post(auth, teamController.getScore);

module.exports = teamRouter;
