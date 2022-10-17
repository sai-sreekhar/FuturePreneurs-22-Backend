const mongoose = require("mongoose");

const roundThreeDataSchema = mongoose.Schema(
  {
    item: {
      type: String,
    },

    price: {
      type: Number,
    },

    mapChoice: {
      type: Number,
    },

    score: {
      type: Number,
    },

    isLeft: {
      type: Boolean,
    },
  },

  { collection: "RoundThreeDataModel" }
);

module.exports = mongoose.model("RoundThreeDataModel", roundThreeDataSchema);
