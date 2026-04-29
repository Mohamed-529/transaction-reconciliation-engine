const fs = require("fs");
const csv = require("csv-parser");

function parseCSV(filePath, onRow) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", onRow)
      .on("end", resolve)
      .on("error", reject);
  });
}

module.exports = { parseCSV };