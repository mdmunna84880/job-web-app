import { env } from "../config/env.js";

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";

  if (env.NODE_ENV === "development") {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      stack: err.stack,
      errors: error.errors ?? null,
    });
  }

  // Mongo Invalid ObjectId
  if (err.name === "CastError") {
    error.message = "Invalid resource ID";
    error.statusCode = 400;
  }

  // Duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    error.message = `${field} already exists`;
    error.statusCode = 409;
  }

  // Validation
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");

    error.statusCode = 400;
  }

  // JWT
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    message:
      error.statusCode >= 500
        ? "Something went wrong."
        : error.message,
    errors: error.errors ?? null,
  });
};