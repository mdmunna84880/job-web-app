import * as mentorNoteService from './mentorNote.service.js';
import { createNoteSchema, updateNoteSchema } from './mentorNote.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const createNote = async (req, res, next) => {
  try {
    req.body = validateSchema(createNoteSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const note = await mentorNoteService.createNote(req.user.id, req.body);
  res.status(201).json({
    success: true,
    data: note,
  });
};

export const getCandidateNotes = async (req, res, next) => {
  const result = await mentorNoteService.getCandidateNotes(req.params.candidateId, req.query);
  res.status(200).json({
    success: true,
    data: result.notes,
    pagination: result.pagination,
  });
};

export const updateNote = async (req, res, next) => {
  try {
    req.body = validateSchema(updateNoteSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const note = await mentorNoteService.updateNote(req.params.id, req.user.id, req.body.text);
  res.status(200).json({
    success: true,
    data: note,
  });
};

export const deleteNote = async (req, res, next) => {
  await mentorNoteService.deleteNote(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Mentor note deleted successfully',
  });
};
