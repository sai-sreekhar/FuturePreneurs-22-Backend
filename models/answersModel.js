const mongoose = require("mongoose");

const answersSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Questions",
    },
    answerIdx: {
      type: Number,
    },
  },
  { collection: "Answers" }
);

module.exports = mongoose.model("Answers", answersSchema);
