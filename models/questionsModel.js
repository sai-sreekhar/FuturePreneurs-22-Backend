const mongoose = require("mongoose");

const questionsSchema = mongoose.Schema(
  {
    questionId: {
      type: Number,
    },
    question: {
      type: String,
    },
    answers: [String],
    correctIndex: {
      type: Number,
    },
  },
  { collection: "Questions" }
);

module.exports = mongoose.model("Questions", questionsSchema);
