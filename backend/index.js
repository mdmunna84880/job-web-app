import app from "./app.js";
import connectDB from "./config/db.js";
import {env} from "./config/env.js";

// Start the server first so it is always reachable
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

// Connect to DB (retries in background, does not crash server)
connectDB();


// Handle unhandled promise rejections and uncaught exceptions
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => {
    process.exit(1);
  });
});