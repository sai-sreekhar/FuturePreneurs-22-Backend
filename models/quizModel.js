const mongoose = require("mongoose");

const quizModelSchema = mongoose.Schema(
  {
    presentQuestionId: {
      type: Number,
      default: 0,
    },
    questionIds: [Number],
    cutoffScore: {
      type: Number,
    },
  },
  { collection: "QuizModel" }
);

module.exports = mongoose.model("QuizModel", quizModelSchema);
