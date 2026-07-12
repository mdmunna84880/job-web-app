import express from 'express';
import * as jobController from './job.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // Ensure all endpoints require authentication

// Reading endpoints
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Write/Admin, Mentor & Candidate endpoints
router.post('/', restrictTo(USER_ROLE.ADMIN, USER_ROLE.MENTOR, USER_ROLE.CANDIDATE), jobController.createJob);
router.put('/:id', restrictTo(USER_ROLE.ADMIN, USER_ROLE.MENTOR, USER_ROLE.CANDIDATE), jobController.updateJob);
router.delete('/:id', restrictTo(USER_ROLE.ADMIN, USER_ROLE.MENTOR, USER_ROLE.CANDIDATE), jobController.deleteJob);

export default router;
