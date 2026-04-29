const fs = require("fs");
const csv = require("csv-parser");
const Transaction = require("../models/transaction.model");

async function ingest(filePath, source) {
  const batch = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        batch.push({
          source,
          raw: row,
          normalized: {
            transactionId: row.transaction_id,
            asset: row.asset,
            type: row.type,
            quantity: Number(row.quantity || 0),
            timestamp: new Date(row.timestamp),
            price_usd: Number(row.price_usd || 0),
            fee: Number(row.fee || 0)
          },
          status: "valid"
        });
      })
      .on("end", async () => {
        try {
          await Transaction.insertMany(batch);
          console.log(`✅ INGEST DONE ${source}`);
          resolve();
        } catch (err) {
          console.error("❌ INSERT ERROR:", err.message);
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error("❌ CSV ERROR:", err.message);
        reject(err);
      });
  });
}

module.exports = { ingest };
