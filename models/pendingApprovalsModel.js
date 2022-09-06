const mongoose = require("mongoose");

const pendingApprovalsSchema = mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teams",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    status: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "PendingApprovals" }
);

module.exports = mongoose.model("PendingApprovals", pendingApprovalsSchema);
