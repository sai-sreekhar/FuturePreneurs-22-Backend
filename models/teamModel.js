const mongoose = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    teamName: {
      type: String,
    },
    teamLeaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    noOfTimesTeamNameChanged: {
      type: Number,
      default: 0,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    isTeamQualified: {
      type: Boolean,
    },
    hasRoundOneStarted: {
      type: Boolean,
    },
    hasRoundOneEnd: {
      type: Boolean,
    },
    hasRoundTwoStarted: {
      type: Boolean,
    },
    hasRoundTwoEnd: {
      type: Boolean,
    },
    hasRoundThreeStarted: {
      type: Boolean,
    },
    hasRoundThreeEnd: {
      type: Boolean,
    },
  },
  { collection: "Teams" }
);

module.exports = mongoose.model("Teams", teamSchema);
