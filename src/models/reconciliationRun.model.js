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

const ReconciliationRunModel = mongoose.model("ReconciliationRun", schema);

// MOCKED fallback — in-memory store used when MongoDB is not connected
const memoryRuns = new Map();

const origCreate = ReconciliationRunModel.create.bind(ReconciliationRunModel);
const origFindOne = ReconciliationRunModel.findOne.bind(ReconciliationRunModel);

ReconciliationRunModel.create = async function (doc) {
  if (mongoose.connection.readyState === 1) {
    return origCreate(doc);
  }
  const now = new Date();
  const saved = {
    _id: new mongoose.Types.ObjectId(),
    ...doc,
    createdAt: now,
    updatedAt: now
  };
  memoryRuns.set(doc.runId, saved);
  return saved;
};

ReconciliationRunModel.findOne = async function (filter = {}) {
  if (mongoose.connection.readyState === 1) {
    return origFindOne(filter);
  }
  if (filter.runId) {
    return memoryRuns.get(filter.runId) || null;
  }
  for (const run of memoryRuns.values()) {
    const matches = Object.keys(filter).every((k) => run[k] === filter[k]);
    if (matches) return run;
  }
  return null;
};

module.exports = ReconciliationRunModel;