const express = require("express");
const roundTwoRoutes = require("../controllers/roundtwo/roundtwoController");
const roundTwoRouter = express.Router();
const auth = require("../middleware/authMiddleware");

roundTwoRouter.route("/start/:teamId").post(auth, roundTwoRoutes.startRoundTwo);
roundTwoRouter.route("/:teamId").post(auth, roundTwoRoutes.submitSelection);
// roundTwoRouter.route("/:teamId").get(auth, roundTwoRoutes.getMap);

module.exports = roundTwoRouter;
