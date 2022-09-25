const mongoose = require("mongoose");

const answersSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },
    setNum: {
      type: Number,
    },
    questionNum: {
      // type: mongoose.Schema.Types.ObjectId,//think of populating
      // refPath: "",
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
