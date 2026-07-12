import express from 'express';
import * as mentorNoteController from './mentorNote.controller.js';
import { protect } from '../../middleware/authMiddleware.js';
import { restrictTo } from '../../middleware/roleGuard.js';
import { USER_ROLE } from '../../shared/constants.js';

const router = express.Router();

router.use(protect); // Ensure all notes endpoints require authentication

// Reading endpoints (open to all authenticated users like candidates viewing notes about themselves, mentors, admins)
router.get('/candidate/:candidateId', mentorNoteController.getCandidateNotes);

// Write/Mentor-Admin endpoints
router.post('/', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), mentorNoteController.createNote);
router.put('/:id', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), mentorNoteController.updateNote);
router.delete('/:id', restrictTo(USER_ROLE.MENTOR, USER_ROLE.ADMIN), mentorNoteController.deleteNote);

export default router;
