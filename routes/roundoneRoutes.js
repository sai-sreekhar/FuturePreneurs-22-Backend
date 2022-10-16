const express = require("express");
const roundOneRoutes = require("../controllers/roundone/roundoneController");
const roundOneRouter = express.Router();
const auth = require("../middleware/authMiddleware");

roundOneRouter.route("/:teamId").post(auth, roundOneRoutes.submitSelection);
roundOneRouter.route("/start/:teamId").post(auth, roundOneRoutes.startRoundOne);
roundOneRouter.route("/:teamId").get(auth, roundOneRoutes.getMap);

module.exports = roundOneRouter;
