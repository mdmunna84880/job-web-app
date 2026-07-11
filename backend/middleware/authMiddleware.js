import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../features/auth/auth.model.js';
import { AppError } from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  let token;

  // Extract token from Authorization header (case-insensitive, whitespace-safe)
  const match = req.headers.authorization?.match(/^Bearer\s+(\S+)$/i);
  if (match) {
    token = match[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.type !== "access") {
      return next(new AppError('Invalid token type', 401));
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    return next(new AppError('Invalid token', 401));
  }

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('This user account has been deactivated.', 403));
  }

  // Grant access and attach user object to request
  req.user = currentUser;
  next();
}

export default protect;
