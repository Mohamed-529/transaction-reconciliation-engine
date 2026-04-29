function normalizeAsset(asset = "") {
  const map = {
    BTC: "BTC",
    BITCOIN: "BTC",
    ETH: "ETH",
    ETHEREUM: "ETH",
    SOL: "SOL",
    USDT: "USDT",
    MATIC: "MATIC",
    LINK: "LINK"
  };

  return map[asset.toUpperCase()] || asset.toUpperCase();
}

function matchTransactions(users, exchanges, config) {
  const results = [];
  const used = new Set();

  for (const user of users) {
    let bestMatch = null;
    let bestScore = Infinity;

    for (const ex of exchanges) {
      if (used.has(ex._id.toString())) continue;

      const userAsset = normalizeAsset(user.normalized.asset);
      const exAsset = normalizeAsset(ex.normalized.asset);

      if (userAsset !== exAsset) continue;

      const timeDiff =
        Math.abs(
          new Date(user.normalized.timestamp) -
          new Date(ex.normalized.timestamp)
        ) / 1000;

      const qtyDiff =
        Math.abs(user.normalized.quantity - ex.normalized.quantity) /
        user.normalized.quantity;

      const score =
        (timeDiff / config.timeTolerance) +
        (qtyDiff / config.qtyTolerance);

      if (score < bestScore) {
        bestScore = score;
        bestMatch = ex;
      }
    }

    if (!bestMatch) {
      results.push({
        userTxnId: user.normalized.transactionId,
        status: "unmatched_user",
        reason: "No match found"
      });
      continue;
    }

    used.add(bestMatch._id.toString());

    const finalStatus =
      bestScore < 1 ? "matched" : "conflicting";

    results.push({
      userTxnId: user.normalized.transactionId,
      exchangeTxnId: bestMatch.normalized.transactionId,
      status: finalStatus,
      confidence: Math.max(0, 1 - bestScore).toFixed(2)
    });
  }

  return results;
}

module.exports = { matchTransactions };