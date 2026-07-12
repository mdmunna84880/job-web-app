import express from 'express';
import * as applicationController from './application.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // Ensure all routes require authentication

router.post('/', restrictTo(USER_ROLE.CANDIDATE), applicationController.applyJob);
router.get('/', applicationController.getAllApplications);
router.get('/:id', applicationController.getApplicationById);
router.patch('/:id/status', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), applicationController.updateApplicationStatus);
router.patch('/:id/withdraw', restrictTo(USER_ROLE.CANDIDATE), applicationController.withdrawApplication);

export default router;
