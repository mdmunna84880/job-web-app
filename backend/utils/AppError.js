
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode < 500 ? "fail" : "error";// Determine if the error is a client error (4xx) or a server error (5xx)
    this.errors = errors;
    this.isOperational = true;
    // Captures the stack trace for the error, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}