import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../../shared/constants.js';

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const applicationSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.APPLIED,
    },
    studentRemarks: {
      type: String,
      trim: true,
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

// Compound index to guarantee a candidate can only submit one application per job posting
applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
applicationSchema.index({ status: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
