const express = require("express");
const roundthreeRoutes = require("../controllers/roundthree/roundthreeController");
const roundthreeRouter = express.Router();
const auth = require("../middleware/authMiddleware");

roundthreeRouter.route("/getdetails/:teamId").get(auth, roundthreeRoutes.getDetails);
roundthreeRouter.route("/verify/:teamId").post(auth, roundthreeRoutes.verifyOption);
roundthreeRouter.route("/submit/:teamId").post(auth, roundthreeRoutes.submitRound);


module.exports = roundthreeRouter;
