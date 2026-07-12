import * as authService from './auth.service.js';
import { registerSchema, loginSchema } from './auth.validator.js';
import { env } from '../../config/env.js';
import { validateSchema } from '../../utils/validatorHelper.js';
import { AppError } from '../../utils/AppError.js';

// sameSite 'none' is required when the frontend and backend run on different origins.
// 'lax' blocks cross-site cookies, which breaks the refresh flow on Render.
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerUser = async (req, res) => {
  req.body = validateSchema(registerSchema, req.body);
  const user = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user },
  });
};

export const loginUser = async (req, res) => {
  req.body = validateSchema(loginSchema, req.body);
  const { user, accessToken, refreshToken } = await authService.login(req.body.email, req.body.password);

  // Refresh token goes in a cookie so client JS can't read it
  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token: accessToken },
  });
};

export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new AppError('No refresh token. Please log in again.', 401);

  const token = await authService.refresh(refreshToken);
  res.status(200).json({ success: true, data: { token } });
};

export const logoutUser = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};
