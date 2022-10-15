const express = require("express");
const roundoneRoutes = require("../controllers/roundone/roundoneController");
const roundoneRouter = express.Router();
const auth = require("../middleware/authMiddleware");

// roundoneRouter.route("/:teamId").get(auth, roundoneRoutes.getDetails);
// roundoneRouter.route("/option/:teamId").post(auth, roundoneRoutes.submitOption)'
roundoneRouter.route("/:teamId").post(auth, roundoneRoutes.submitSelection);
roundoneRouter.route("/start/:teamId").post(auth, roundoneRoutes.startRoundOne);
// teamRouter.route("/quiz/answers/:teamId").post(auth, teamController.getAnswers);
// teamRouter.route("/quiz/score/:teamId").post(auth, teamController.getScore);

module.exports = roundoneRouter;
