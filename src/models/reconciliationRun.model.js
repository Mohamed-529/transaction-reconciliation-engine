const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true },

  summary: {
    total: Number,
    users: Number,
    exchanges: Number,
    matched: Number,
    conflicting: Number,
    unmatched: Number
  },

  results: Array
}, { timestamps: true });

module.exports = mongoose.model("ReconciliationRun", schema);