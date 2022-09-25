const mongoose = require("mongoose");

const quizModelSchema = mongoose.Schema(
  {
    noOfTeams: {
      type: Number,
    },
    cutoffScore: {
      type: Number,
    },
  },
  { collection: "QuizModel" }
);

module.exports = mongoose.model("QuizModel", quizModelSchema);
