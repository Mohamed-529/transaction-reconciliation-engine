const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  runId: mongoose.Schema.Types.ObjectId,
  userTxnId: String,
  exchangeTxnId: String,
  status: String,
  confidence: Number,
  reason: String
});

module.exports = mongoose.model("ReconciliationResult", schema);