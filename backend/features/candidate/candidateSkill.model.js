import mongoose from 'mongoose';
import { SKILL_LEVEL } from '../../shared/constants.js';

const historySchema = new mongoose.Schema({
  proficiencyLevel: {
    type: String,
    enum: Object.values(SKILL_LEVEL),
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const candidateSkillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    proficiencyLevel: {
      type: String,
      enum: Object.values(SKILL_LEVEL),
      required: true,
    },
    history: [historySchema],
  },
  { timestamps: true }
);

// Enforce unique candidate-skill pairings to prevent duplicate ratings
candidateSkillSchema.index({ user: 1, skill: 1 }, { unique: true });

const CandidateSkill = mongoose.model('CandidateSkill', candidateSkillSchema);

export default CandidateSkill;
