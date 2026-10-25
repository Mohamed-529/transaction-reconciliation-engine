const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.warn("[AI Studio] MONGO_URI not set — using in-memory store (ephemeral)");
    return;
  }

  try {
    console.log("⏳ Connecting MongoDB...");

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });

    console.log("✅ MongoDB Connected");
    console.log("📦 DB Name:", conn.connection.name);
  } catch (err) {
    console.warn("[AI Studio] MongoDB not connected — falling back to in-memory store:", err.message);
  }
};

module.exports = connectDB;