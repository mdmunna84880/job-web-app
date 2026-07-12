import express from 'express';
import * as candidateController from './candidate.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // Ensure all candidate routes require authentication

// Profile management routes
router.post('/profile', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.upsertProfile);
router.get('/profile/me', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.getProfileMe);
router.get('/profile/:userId', candidateController.getProfileById);

// Skill ratings routes
router.post('/skills', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.addOrUpdateSkill);
router.get('/skills/me', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.getCandidateSkillsMe);
router.get('/skills/:userId', candidateController.getCandidateSkillsById);
router.delete('/skills/:skillId', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.deleteCandidateSkill);

// Skill gap analysis routes
router.get('/skills/gap/role', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.getSkillGapRole);
router.get('/skills/gap/job/:jobId', restrictTo(USER_ROLE.CANDIDATE, USER_ROLE.MENTOR), candidateController.getSkillGapJob);

export default router;
