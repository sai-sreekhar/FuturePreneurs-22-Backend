const express = require("express");
const roundThreeRoutes = require("../controllers/roundthree/roundthreeController");
const roundThreeRouter = express.Router();
const auth = require("../middleware/authMiddleware");

roundThreeRouter
  .route("/start/:teamId")
  .post(auth, roundThreeRoutes.startRoundThree);
roundThreeRouter
  .route("/:teamId")
  .post(auth, roundThreeRoutes.addOrDeleteItems);
roundThreeRouter
  .route("/submit/:teamId")
  .post(auth, roundThreeRoutes.submitRound);

module.exports = roundThreeRouter;
