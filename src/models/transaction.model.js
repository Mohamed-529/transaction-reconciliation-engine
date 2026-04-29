const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["user", "exchange"],
      required: true
    },

    raw: mongoose.Schema.Types.Mixed,
    normalized: mongoose.Schema.Types.Mixed,

    status: {
      type: String,
      default: "valid"
    },

    errorReason: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", schema);