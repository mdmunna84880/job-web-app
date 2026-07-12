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
import skillRouter from "./features/skills/skill.routes.js";
import candidateRouter from "./features/candidate/candidate.routes.js";
import companyRouter from "./features/companies/company.routes.js";
import jobRouter from "./features/jobs/job.routes.js";

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
app.use("/api/skills", skillRouter);
app.use("/api/candidate", candidateRouter);
app.use("/api/companies", companyRouter);
app.use("/api/jobs", jobRouter);

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});

// 404 error handling middleware
app.use((req, res, next) => {
  next(new AppError("Route not found", 404));
});

// Global error handling middleware
app.use(errorHandler);

export default app;

