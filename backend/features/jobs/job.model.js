import mongoose from 'mongoose';
import { WORK_MODE, JOB_TYPE, JOB_STATUS } from '../../shared/constants.js';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    workMode: {
      type: String,
      enum: Object.values(WORK_MODE),
      required: true,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPE),
      required: true,
    },
    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        required: true,
      },
    ],
    salary: {
      min: { type: Number },
      max: { type: Number },
    },
    eligibilityCriteria: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.ACTIVE,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ jobType: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
