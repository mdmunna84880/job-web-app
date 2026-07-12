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
import applicationRouter from "./features/applications/application.routes.js";
import interviewRouter from "./features/interviews/interview.routes.js";
import mentorNoteRouter from "./features/mentor-notes/mentorNote.routes.js";
import analyticsRouter from "./features/analytics/analytics.routes.js";
import adminRouter from "./features/admin/admin.routes.js";

const app = express();

// ─── CORS ────────────────────────────────────────────────────────────────────
// Must be FIRST — before helmet, before any other middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server / Postman requests (no Origin header)
    if (!origin) return callback(null, true);
    // If no allowlist configured, allow all (open during development)
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight OPTIONS for all routes
app.options('*', cors());

// ─── Other middleware ─────────────────────────────────────────────────────────
// Configure helmet so it doesn't override CORS headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
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
app.use("/api/applications", applicationRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/mentor-notes", mentorNoteRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admin", adminRouter);

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

