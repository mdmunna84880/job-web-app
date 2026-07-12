import mongoose from 'mongoose';
import { MENTOR_NOTE_TYPE } from '../../shared/constants.js';

const mentorNoteSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(MENTOR_NOTE_TYPE),
      default: MENTOR_NOTE_TYPE.GENERAL,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    },
  },
  { timestamps: true }
);

mentorNoteSchema.index({ candidate: 1 });
mentorNoteSchema.index({ type: 1 });

const MentorNote = mongoose.model('MentorNote', mentorNoteSchema);

export default MentorNote;
