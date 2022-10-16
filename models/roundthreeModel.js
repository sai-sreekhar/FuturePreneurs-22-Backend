const mongoose = require("mongoose");

const roundThreeSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },

    mapChoice: {
      type: Number,
    },

    items: [
      {
        type: String,
      },
    ],

    balance: {
      type: Number,
    },

    roundThreeScore: {
      type: Number,
    },

    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },

  { collection: "RoundThreeModel" }
);

module.exports = mongoose.model("RoundThreeModel", roundThreeSchema);
