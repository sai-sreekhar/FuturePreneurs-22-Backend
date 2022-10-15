const mongoose = require("mongoose");

const roundTwoSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },

    mapChoice: {
      type: Number,
    },

    boxChoice: {
      type: Number,
    },

    roundTwoScore: {
      type: Number,
    },

    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },

  { collection: "RoundTwoModel" }
);

module.exports = mongoose.model("RoundTwoModel", roundTwoSchema);
