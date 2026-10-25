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

const TransactionModel = mongoose.model("Transaction", schema);

// MOCKED fallback — in-memory store used when MongoDB is not connected
let memoryTransactions = [];

const origDeleteMany = TransactionModel.deleteMany.bind(TransactionModel);
const origInsertMany = TransactionModel.insertMany.bind(TransactionModel);
const origFind = TransactionModel.find.bind(TransactionModel);

TransactionModel.deleteMany = async function (filter = {}) {
  if (mongoose.connection.readyState === 1) {
    return origDeleteMany(filter);
  }
  const keys = Object.keys(filter);
  if (keys.length === 0) {
    const count = memoryTransactions.length;
    memoryTransactions = [];
    return { deletedCount: count };
  }
  const before = memoryTransactions.length;
  memoryTransactions = memoryTransactions.filter(
    (doc) => !keys.every((k) => doc[k] === filter[k])
  );
  return { deletedCount: before - memoryTransactions.length };
};

TransactionModel.insertMany = async function (docs = []) {
  if (mongoose.connection.readyState === 1) {
    return origInsertMany(docs);
  }
  const now = new Date();
  const inserted = docs.map((doc) => ({
    _id: new mongoose.Types.ObjectId(),
    status: "valid",
    errorReason: null,
    ...doc,
    createdAt: now,
    updatedAt: now
  }));
  memoryTransactions.push(...inserted);
  return inserted;
};

TransactionModel.find = async function (filter = {}) {
  if (mongoose.connection.readyState === 1) {
    return origFind(filter);
  }
  const keys = Object.keys(filter);
  if (keys.length === 0) return [...memoryTransactions];
  return memoryTransactions.filter((doc) =>
    keys.every((k) => doc[k] === filter[k])
  );
};

module.exports = TransactionModel;