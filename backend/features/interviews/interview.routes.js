import express from 'express';
import * as interviewController from './interview.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // Ensure all routes require authentication

// Reading endpoints
router.get('/', interviewController.getAllInterviews);
router.get('/candidate/:candidateId', interviewController.getInterviewHistory);

// Write/Mentor-Admin endpoints
router.post('/', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), interviewController.createInterview);
router.put('/:id', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), interviewController.updateInterview);
router.delete('/:id', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), interviewController.deleteInterview);

export default router;
