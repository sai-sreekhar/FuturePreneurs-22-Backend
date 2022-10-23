const express = require("express");
const nextRoundController = require("../controllers/nextRounds/nextRoundsController");
const auth = require("../middleware/authMiddleware");
const nextRoundRouter = express.Router();

nextRoundRouter.route("/:teamId").get(auth, nextRoundController.getCurrRound);
nextRoundRouter.route("/:teamId").post(auth, nextRoundController.setCurrRound);

module.exports = nextRoundRouter;
