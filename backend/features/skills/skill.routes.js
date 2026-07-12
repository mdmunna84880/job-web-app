import express from 'express';
import * as skillController from './skill.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

// Allow any authenticated user to view the skills catalog
router.get('/', protect, skillController.getAllSkills);

// Admin-only endpoints to manage catalog items
router.post('/', protect, restrictTo(USER_ROLE.ADMIN), skillController.createSkill);
router.put('/:id', protect, restrictTo(USER_ROLE.ADMIN), skillController.updateSkill);
router.delete('/:id', protect, restrictTo(USER_ROLE.ADMIN), skillController.deleteSkill);

export default router;
