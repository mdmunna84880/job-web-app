import mongoose from 'mongoose';
import { COMPANY_SIZE } from '../../shared/constants.js';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      enum: Object.values(COMPANY_SIZE),
    },
    logo: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Schema definition completed.

const Company = mongoose.model('Company', companySchema);

export default Company;
