import express from 'express';
import * as analyticsController from './analytics.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/candidate', restrictTo(USER_ROLE.CANDIDATE), analyticsController.getCandidateDashboard);
router.get('/mentor', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), analyticsController.getMentorDashboard);
router.get('/admin', restrictTo(USER_ROLE.ADMIN), analyticsController.getAdminDashboard);

export default router;
