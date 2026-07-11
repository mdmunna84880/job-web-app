import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import User from './auth.model.js';
import { AppError } from '../../utils/AppError.js';

// Sign a JWT access token (15m expiry)
export const signAccessToken = (userId) => {
  return jwt.sign({ id: userId, type: "access" }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

// Sign a JWT refresh token (7d expiry)
export const signRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: "refresh" }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Register a new user
export const register = async (userData) => {
  const { name, email, password, phone, role } = userData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('A user with this email address already exists.', 409);
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
    phone,
    role,
  });

  // Exclude password from the returned object
  const userObj = newUser.toObject();
  delete userObj.password;

  return userObj;
};

// Login an existing user
export const login = async (email, password) => {
  // Find user and explicitly select password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('This user account is deactivated. Please contact support.', 403);
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  const userObj = user.toObject();
  delete userObj.password;

  return {
    user: userObj,
    accessToken,
    refreshToken,
  };
};

// Refresh access token using a valid refresh token
export const refresh = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', 401);
  }

  let decoded = jwt.verify(refreshToken, env.JWT_SECRET);

  if (decoded.type !== "refresh") {
    throw new AppError("Invalid token type", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('The user belonging to this token no longer exists.', 401);
  }

  if (!user.isActive) {
    throw new AppError('This user account has been deactivated.', 403);
  }

  // Generate new access token
  const newAccessToken = signAccessToken(user._id);
  return newAccessToken;
};
