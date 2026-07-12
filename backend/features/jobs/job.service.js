import mongoose from 'mongoose';
import Job from './job.model.js';
import Company from '../companies/company.model.js';
import Skill from '../skills/skill.model.js';
import CandidateProfile from '../candidate/candidate.model.js';
import { AppError } from '../../utils/AppError.js';
import { JOB_STATUS } from '../../shared/constants.js';

export const createJob = async (jobData, user) => {
  const company = await Company.findById(jobData.companyId);
  if (!company) {
    throw new AppError('Associated company not found', 404);
  }

  // Enforce company association check for Candidates and Mentors
  if (user && user.role !== 'admin') {
    const profile = await CandidateProfile.findOne({ user: user._id });
    const isLinked = profile && profile.companies && profile.companies.some(
      (cId) => String(cId) === String(jobData.companyId)
    );
    if (!isLinked) {
      throw new AppError('Candidates and Mentors can only post job openings for companies they are currently associated with in their profiles.', 403);
    }
  }

  const uniqueSkills = [...new Set(jobData.requiredSkills)];
  const skillsCount = await Skill.countDocuments({ _id: { $in: uniqueSkills } });
  if (skillsCount !== uniqueSkills.length) {
    throw new AppError('One or more required skills not found in catalog', 404);
  }

  const jobPayload = {
    title: jobData.title,
    company: jobData.companyId,
    location: jobData.location,
    workMode: jobData.workMode,
    jobType: jobData.jobType,
    requiredSkills: uniqueSkills,
    salary: {
      min: jobData.salaryMin,
      max: jobData.salaryMax,
    },
    eligibilityCriteria: jobData.eligibilityCriteria,
    deadline: jobData.deadline,
    status: jobData.status,
    description: jobData.description,
    createdBy: jobData.createdBy,
  };

  const job = await Job.create(jobPayload);
  return job.populate([
    { path: 'company', select: 'name industry logo' },
    { path: 'requiredSkills', select: 'name category' }
  ]);
};

export const getAllJobs = async (query = {}) => {
  const {
    search,
    workMode,
    jobType,
    skills,
    salaryMin,
    salaryMax,
    status = JOB_STATUS.ACTIVE,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (workMode) {
    filter.workMode = workMode;
  }

  if (jobType) {
    filter.jobType = jobType;
  }

  if (skills) {
    // skills query param can be a comma-separated list or a single string
    const skillIds = Array.isArray(skills) ? skills : String(skills).split(',');
    const validSkillIds = skillIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validSkillIds.length > 0) {
      filter.requiredSkills = { $in: validSkillIds };
    }
  }

  if (salaryMin) {
    filter['salary.max'] = { $gte: Number(salaryMin) };
  }

  if (salaryMax) {
    filter['salary.min'] = { $lte: Number(salaryMax) };
  }

  if (search) {
    const matchingCompanies = await Company.find({
      name: { $regex: search, $options: 'i' },
    }).select('_id');
    const companyIds = matchingCompanies.map(c => c._id);

    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { company: { $in: companyIds } },
    ];
  }

  const skipIndex = (page - 1) * limit;
  const total = await Job.countDocuments(filter);
  
  const jobs = await Job.find(filter)
    .populate('company', 'name industry logo location')
    .populate('requiredSkills', 'name category')
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    jobs,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const getJobById = async (id) => {
  const job = await Job.findById(id)
    .populate('company', 'name industry website size logo description')
    .populate('requiredSkills', 'name category');

  if (!job) {
    throw new AppError('Job not found', 404);
  }
  return job;
};

export const updateJob = async (id, updateData, user) => {
  const job = await Job.findById(id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Enforce candidate and mentor update ownership checks
  if (user && user.role !== 'admin' && String(job.createdBy) !== String(user._id)) {
    throw new AppError('You do not have permission to modify this job posting.', 403);
  }

  if (updateData.companyId) {
    const company = await Company.findById(updateData.companyId);
    if (!company) {
      throw new AppError('Associated company not found', 404);
    }

    // Enforce company association check for Candidates and Mentors on updates
    if (user && user.role !== 'admin') {
      const profile = await CandidateProfile.findOne({ user: user._id });
      const isLinked = profile && profile.companies && profile.companies.some(
        (cId) => String(cId) === String(updateData.companyId)
      );
      if (!isLinked) {
        throw new AppError('Candidates and Mentors can only post job openings for companies they are currently associated with in their profiles.', 403);
      }
    }
    job.company = updateData.companyId;
  }

  if (updateData.requiredSkills) {
    const uniqueSkills = [...new Set(updateData.requiredSkills)];
    const skillsCount = await Skill.countDocuments({ _id: { $in: uniqueSkills } });
    if (skillsCount !== uniqueSkills.length) {
      throw new AppError('One or more required skills not found in catalog', 404);
    }
    job.requiredSkills = uniqueSkills;
  }

  // Map remaining flat fields
  const directFields = ['title', 'location', 'workMode', 'jobType', 'eligibilityCriteria', 'deadline', 'status', 'description'];
  directFields.forEach(field => {
    if (updateData[field] !== undefined) {
      job[field] = updateData[field];
    }
  });

  if (updateData.salaryMin !== undefined) {
    job.salary.min = updateData.salaryMin;
  }
  if (updateData.salaryMax !== undefined) {
    job.salary.max = updateData.salaryMax;
  }

  if (job.salary.min && job.salary.max && job.salary.min > job.salary.max) {
    throw new AppError('Minimum salary cannot exceed maximum salary', 400);
  }

  await job.save();
  return job.populate([
    { path: 'company', select: 'name industry logo' },
    { path: 'requiredSkills', select: 'name category' }
  ]);
};

export const deleteJob = async (id, user) => {
  const job = await Job.findById(id);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Enforce candidate and mentor delete ownership checks
  if (user && user.role !== 'admin' && String(job.createdBy) !== String(user._id)) {
    throw new AppError('You do not have permission to delete this job posting.', 403);
  }

  const deletedJob = await Job.findByIdAndDelete(id);
  return deletedJob;
};
