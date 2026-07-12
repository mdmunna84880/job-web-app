import mongoose from "mongoose";
import dns from "dns";
import { env } from "./env.js";

// Force IPv4 DNS to avoid SRV record issues on some networks
dns.setDefaultResultOrder("ipv4first");

const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // exponential backoff
      } else {
        console.error("🚨 All MongoDB connection attempts failed. Server running without DB.");
      }
    }
  }
};

export default connectDB;