function normalizeAsset(asset = "") {
  return asset.toUpperCase().replace("BITCOIN", "BTC").replace("ETHEREUM", "ETH");
}

function normalizeType(type = "") {
  const map = {
    TRANSFER_IN: "TRANSFER",
    TRANSFER_OUT: "TRANSFER"
  };
  return map[type] || type;
}

function percentageDiff(a, b) {
  if (a === 0) return b === 0 ? 0 : 1;
  return Math.abs(a - b) / a;
}

function matchTransactions(users, exchanges, config) {
  const used = new Set();
  const results = [];

  for (const u of users) {
    const uAsset = normalizeAsset(u.normalized.asset);
    const uType = normalizeType(u.normalized.type);
    const uTime = new Date(u.normalized.timestamp).getTime();
    const uQty = Number(u.normalized.quantity);

    let best = null;
    let bestScore = Infinity;

    for (const e of exchanges) {
      if (used.has(e._id.toString())) continue;

      const eAsset = normalizeAsset(e.normalized.asset);
      const eType = normalizeType(e.normalized.type);
      const eTime = new Date(e.normalized.timestamp).getTime();
      const eQty = Number(e.normalized.quantity);

      // 1. asset must match
      if (uAsset !== eAsset) continue;

      // 2. type must match (after normalization)
      if (uType !== eType) continue;

      // 3. time diff
      const timeDiff = Math.abs(uTime - eTime) / 1000;
      if (timeDiff > config.timeTolerance * 5) continue;

      // 4. qty diff
      const qtyDiff = percentageDiff(uQty, eQty);

      const score =
        (timeDiff / config.timeTolerance) * 0.6 +
        (qtyDiff / config.qtyTolerance) * 0.4;

      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }

    // ❌ no match found
    if (!best) {
      results.push({
        userTxnId: u.normalized.transactionId,
        status: "unmatched_user",
        reason: "No matching exchange transaction found",
        confidence: 0
      });
      continue;
    }

    used.add(best._id.toString());

    const finalTimeDiff =
      Math.abs(uTime - new Date(best.normalized.timestamp).getTime()) / 1000;

    const finalQtyDiff = percentageDiff(
      uQty,
      Number(best.normalized.quantity)
    );

    // ⚖️ classification
    let status = "matched";
    let reason = "Matched within tolerance";

    if (
      finalTimeDiff > config.timeTolerance ||
      finalQtyDiff > config.qtyTolerance
    ) {
      status = "conflicting";

      reason =
        finalQtyDiff > config.qtyTolerance
          ? `Quantity mismatch ${(finalQtyDiff * 100).toFixed(2)}%`
          : `Timestamp mismatch ${finalTimeDiff}s`;
    }

    results.push({
      userTxnId: u.normalized.transactionId,
      exchangeTxnId: best.normalized.transactionId,
      status,
      confidence: Number((1 - bestScore).toFixed(2)),
      reason
    });
  }

  // 🧾 unmatched exchange
  for (const e of exchanges) {
    if (!used.has(e._id.toString())) {
      results.push({
        exchangeTxnId: e.normalized.transactionId,
        status: "unmatched_exchange",
        reason: "No matching user transaction found",
        confidence: 0
      });
    }
  }

  return results;
}

module.exports = { matchTransactions };