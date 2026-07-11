import * as authService from './auth.service.js';
import { registerSchema, loginSchema } from './auth.validator.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';

// Cookie settings for secure httpOnly tokens
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Register a new Candidate/User
export const registerUser = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const validationErrors = {};
    error.details.forEach((detail) => {
      validationErrors[detail.path[0]] = detail.message;
    });
    return next(new AppError('Validation failed', 400, validationErrors));
  }

  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  });
}

// Login a user
export const loginUser = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const validationErrors = {};
    error.details.forEach((detail) => {
      validationErrors[detail.path[0]] = detail.message;
    });
    return next(new AppError('Validation failed', 400, validationErrors));
  }

  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(email, password);

  // Set httpOnly cookie for the refresh token
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: accessToken,
    data: { user },
  });
};

// Refresh access token using the httpOnly cookie refresh token
export const refreshAccessToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return next(new AppError('Refresh token is missing. Please log in again.', 401));
  }

  const newAccessToken = await authService.refresh(refreshToken);

  res.status(200).json({
    success: true,
    token: newAccessToken,
  });
};

// Logout user by clearing the refresh token cookie
export const logoutUser = async (req, res, next) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}

// Get current authenticated user details
export const getMe = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
}
