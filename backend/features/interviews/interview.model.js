import mongoose from 'mongoose';
import { INTERVIEW_TYPE, INTERVIEW_RESULT } from '../../shared/constants.js';

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPE),
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: String,
      trim: true,
    },
    result: {
      type: String,
      enum: Object.values(INTERVIEW_RESULT),
      default: INTERVIEW_RESULT.PENDING,
    },
  },
  { timestamps: true }
);

interviewSchema.index({ candidate: 1 });
interviewSchema.index({ job: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
