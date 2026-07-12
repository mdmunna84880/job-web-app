import express from 'express';
import * as adminController from './admin.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo(USER_ROLE.ADMIN)); // Ensure all routes in this slice are admin-only

router.get('/users', adminController.listAllUsers);
router.patch('/users/:id/toggle-active', adminController.toggleUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;
