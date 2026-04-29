const path = require("path");
const { v4: uuidv4 } = require("uuid");

const Transaction = require("../models/transaction.model");
const Run = require("../models/reconciliationRun.model");
const { ingest } = require("../services/ingestion.service");
const { matchTransactions } = require("../services/matching.service");

exports.reconcile = async (req, res) => {
  try {
    console.log("🚀 RUN STARTED");

    const runId = uuidv4(); // 🔥 UNIQUE RUN ID

    const userPath = path.join(__dirname, "../../data/user_transactions.csv");
    const exchangePath = path.join(__dirname, "../../data/exchange_transactions.csv");

    await Transaction.deleteMany({});

    await ingest(userPath, "user");
    await ingest(exchangePath, "exchange");

    const users = await Transaction.find({ source: "user" });
    const exchanges = await Transaction.find({ source: "exchange" });

    const results = matchTransactions(users, exchanges, {
      timeTolerance: 300,
      qtyTolerance: 0.01
    });

    const summary = {
      total: results.length,
      users: users.length,
      exchanges: exchanges.length,
      matched: results.filter(r => r.status === "matched").length,
      conflicting: results.filter(r => r.status === "conflicting").length,
      unmatched: results.filter(r => r.status?.includes("unmatched")).length
    };

    // 💾 SAVE RUN IN DB
    await Run.create({
      runId,
      summary,
      results
    });

    return res.status(200).json({
      message: "Reconciliation completed",
      runId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};