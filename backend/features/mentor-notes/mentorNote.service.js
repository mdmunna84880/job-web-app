import MentorNote from './mentorNote.model.js';
import User from '../auth/auth.model.js';
import Application from '../applications/application.model.js';
import Skill from '../skills/skill.model.js';
import { AppError } from '../../utils/AppError.js';
import { USER_ROLE } from '../../shared/constants.js';

export const createNote = async (mentorId, noteData) => {
  const candidate = await User.findById(noteData.candidateId);
  if (!candidate || candidate.role !== USER_ROLE.CANDIDATE) {
    throw new AppError('Candidate student not found', 404);
  }

  const notePayload = {
    mentor: mentorId,
    candidate: noteData.candidateId,
    text: noteData.text,
    type: noteData.type,
  };

  if (noteData.type === 'Application') {
    const application = await Application.findById(noteData.applicationId);
    if (!application) {
      throw new AppError('Associated application not found', 404);
    }
    notePayload.application = noteData.applicationId;
  }

  if (noteData.type === 'Skill') {
    const skill = await Skill.findById(noteData.skillId);
    if (!skill) {
      throw new AppError('Associated master skill not found', 404);
    }
    notePayload.skill = noteData.skillId;
  }

  return MentorNote.create(notePayload);
};

export const getCandidateNotes = async (candidateId, query = {}) => {
  const { type, page = 1, limit = 20 } = query;
  const filter = { candidate: candidateId };

  if (type) {
    filter.type = type;
  }

  const skipIndex = (page - 1) * limit;
  const total = await MentorNote.countDocuments(filter);

  const notes = await MentorNote.find(filter)
    .populate('mentor', 'name email')
    .populate('application')
    .populate('skill', 'name category')
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    notes,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateNote = async (id, mentorId, text) => {
  const note = await MentorNote.findById(id);
  if (!note) {
    throw new AppError('Mentor note not found', 404);
  }

  if (note.mentor.toString() !== mentorId) {
    throw new AppError('You are only authorized to edit your own notes.', 403);
  }

  note.text = text;
  await note.save();

  return note.populate('mentor', 'name email');
};

export const deleteNote = async (id, mentorId) => {
  const note = await MentorNote.findById(id);
  if (!note) {
    throw new AppError('Mentor note not found', 404);
  }

  if (note.mentor.toString() !== mentorId) {
    throw new AppError('You are only authorized to delete your own notes.', 403);
  }

  await note.deleteOne();
  return note;
};
