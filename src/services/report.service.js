const fs = require("fs");

function generateReport(results) {
  const headers = "userTxnId,exchangeTxnId,status,score,reason\n";

  const rows = results.map(r => {
    return [
      r.userTxnId || "",
      r.exchangeTxnId || "",
      r.status,
      r.score || "",
      r.reason || ""
    ].join(",");
  });

  const csv = headers + rows.join("\n");

  const filePath = "./reconciliation_report.csv";

  fs.writeFileSync(filePath, csv);

  console.log("📁 CSV REPORT GENERATED:", filePath);

  return filePath;
}

module.exports = { generateReport };