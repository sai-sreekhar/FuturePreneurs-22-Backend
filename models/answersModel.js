const mongoose = require("mongoose");

const answersSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionsModel",
    },
    setNum: {
      type: Number,
    },
    questionNum: {
      type: Number,
    },
    answerIdxs: [Number],
    descriptiveAnswer: {
      type: String,
    },
  },
  { collection: "Answers" }
);

module.exports = mongoose.model("Answers", answersSchema);
