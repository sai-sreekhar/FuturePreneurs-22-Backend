const mongoose = require("mongoose");

const questionsModelSchema = mongoose.Schema(
  {
    setNum: {
      type: Number,
    },
    questionNum: {
      type: Number,
    },
    questionType: {
      type: Number,
    },
    imageSrc: {
      type: String,
    },
    caseStudy: {
      type: String,
    },
    question: [String],
    options: [String],
    correctIdxs: [Number],
  },
  { collection: "QuestionsModel" }
);

module.exports = mongoose.model("QuestionsModel", questionsModelSchema);
