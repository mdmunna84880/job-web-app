import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import {errorHandler} from "./middleware/errorMiddleware.js";
import { AppError } from "./utils/AppError.js";
import limiter from "./utils/RateLimiter.js";

const app = express();

// Incoming request middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter);
app.use(express.json());


// Routes

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is healthy" });
});


// Error handling middleware

// Global error handling middleware
app.use(errorHandler);
// 404 error handling middleware
app.use((req, res, next)=>{
    next(new AppError("Route not found", 404));
});

export default app;
