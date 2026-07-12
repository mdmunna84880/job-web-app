import mongoose from 'mongoose';
import { SKILL_CATEGORY } from '../../shared/constants.js';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(SKILL_CATEGORY),
      required: true,
    },
  },
  { timestamps: true }
);

skillSchema.index({ category: 1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
