const assetMap = {
  BTC: "BTC",
  BITCOIN: "BTC",
  ETH: "ETH",
  ETHEREUM: "ETH",
  SOL: "SOL",
  USDT: "USDT",
  MATIC: "MATIC",
  LINK: "LINK"
};

function normalize(row) {
  const errors = [];

  const transactionId = row.transaction_id?.trim();
  if (!transactionId) errors.push("Missing transaction_id");

  const rawAsset = row.asset?.trim().toUpperCase();
  const asset = assetMap[rawAsset];

  if (!asset) {
    errors.push(`Unknown asset: ${row.asset}`);
  }

  const quantity = Number(row.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.push(`Invalid quantity: ${row.quantity}`);
  }

  const price =
    row.price_usd !== "" && row.price_usd != null
      ? Number(row.price_usd)
      : null;

  if (price !== null && !Number.isFinite(price)) {
    errors.push(`Invalid price_usd: ${row.price_usd}`);
  }

  const fee =
    row.fee !== "" && row.fee != null ? Number(row.fee) : null;

  if (fee !== null && !Number.isFinite(fee)) {
    errors.push(`Invalid fee: ${row.fee}`);
  }

  const timestamp = new Date(row.timestamp);
  if (isNaN(timestamp.getTime())) {
    errors.push(`Invalid timestamp: ${row.timestamp}`);
  }

  const type = row.type?.trim();

  if (!type) errors.push("Missing type");

  const data = {
    transactionId,
    asset,
    type,
    quantity,
    timestamp,
    price_usd: price,
    fee
  };

  // 🔥 IMPORTANT: block bad data completely
  return {
    valid: errors.length === 0,
    error: errors.length ? errors.join(" | ") : null,
    data: errors.length === 0 ? data : null
  };
}

module.exports = { normalize };