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

// Write/Admin-only endpoints
router.post('/', restrictTo(USER_ROLE.ADMIN), jobController.createJob);
router.put('/:id', restrictTo(USER_ROLE.ADMIN), jobController.updateJob);
router.delete('/:id', restrictTo(USER_ROLE.ADMIN), jobController.deleteJob);

export default router;
