const mongoose = require("mongoose");

const set1ModelSchema = mongoose.Schema(
  {
    questionNum: {
      type: Number,
    },
    questionType: {
      type: Number,
    },
    question: {
      type: String,
    },
    answers: [String],
    correctIdxs: [Number],
    descriptiveAnswer: {
      type: String,
    },
  },
  { collection: "Set1Model" }
);

module.exports = mongoose.model("Set1Model", set1ModelSchema);
