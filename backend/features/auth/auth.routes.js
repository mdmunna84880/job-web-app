import express from 'express';
import * as authController from './auth.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/refresh', authController.refreshAccessToken);
router.post('/logout', authController.logoutUser);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
