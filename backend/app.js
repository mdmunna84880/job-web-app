import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/errorMiddleware.js";
import { AppError } from "./utils/AppError.js";
import limiter from "./utils/RateLimiter.js";

// Feature Routers
import authRouter from "./features/auth/auth.routes.js";

const app = express();

// Incoming request middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

// 404 error handling middleware (must come before the global error handler!)
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// Global error handling middleware
app.use(errorHandler);

export default app;

