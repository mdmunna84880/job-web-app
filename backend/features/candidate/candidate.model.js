import mongoose from 'mongoose';
import { PREFERRED_ROLE, READINESS_STATUS } from '../../shared/constants.js';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, required: true, trim: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number },
  gpa: { type: Number },
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  link: { type: String, trim: true },
});

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    education: [educationSchema],
    projects: [projectSchema],
    resumeUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    preferredRole: {
      type: String,
      enum: Object.values(PREFERRED_ROLE),
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    readinessStatus: {
      type: String,
      enum: Object.values(READINESS_STATUS),
      default: READINESS_STATUS.NOT_READY,
    },
  },
  { timestamps: true }
);

candidateProfileSchema.index({ readinessStatus: 1 });

const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);

export default CandidateProfile;
