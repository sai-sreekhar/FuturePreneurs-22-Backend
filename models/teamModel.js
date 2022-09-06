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
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    completedQuestions: [Number],
  },
  { collection: "Teams" }
);

module.exports = mongoose.model("Teams", teamSchema);
