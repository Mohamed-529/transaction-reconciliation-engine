const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("⏳ Connecting MongoDB...");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");
    console.log("📦 DB Name:", conn.connection.name);
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;