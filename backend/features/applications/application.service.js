import Application from './application.model.js';
import CandidateProfile from '../candidate/candidate.model.js';
import Job from '../jobs/job.model.js';
import { AppError } from '../../utils/AppError.js';
import { APPLICATION_STATUS, USER_ROLE } from '../../shared/constants.js';

export const applyJob = async (userId, jobId, remarks) => {
  const profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError('Please build your candidate profile before applying to jobs.', 400);
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job opening not found', 404);
  }

  if (job.status !== 'Active') {
    throw new AppError('This job posting is no longer active.', 400);
  }

  const existingApplication = await Application.findOne({ candidate: userId, job: jobId });
  if (existingApplication) {
    throw new AppError('You have already submitted an application for this job.', 409);
  }

  return Application.create({
    candidate: userId,
    job: jobId,
    studentRemarks: remarks,
    statusHistory: [{ status: APPLICATION_STATUS.APPLIED }],
  });
};

export const getAllApplications = async (user, query = {}) => {
  const { status, jobId, candidateId, page = 1, limit = 10 } = query;
  const filter = {};

  // Enforce candidate ownership boundaries
  if (user.role === USER_ROLE.CANDIDATE) {
    filter.candidate = user.id;
  } else {
    if (candidateId) {
      filter.candidate = candidateId;
    }
  }

  if (status) {
    filter.status = status;
  }

  if (jobId) {
    filter.job = jobId;
  }

  const skipIndex = (page - 1) * limit;
  const total = await Application.countDocuments(filter);

  const applications = await Application.find(filter)
    .populate({
      path: 'job',
      select: 'title location workMode jobType salary',
      populate: { path: 'company', select: 'name logo' },
    })
    .populate('candidate', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    applications,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const getApplicationById = async (user, id) => {
  const application = await Application.findById(id)
    .populate({
      path: 'job',
      populate: { path: 'company' },
    })
    .populate('candidate', 'name email phone');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  // Ensure candidate can only view their own submissions
  if (user.role === USER_ROLE.CANDIDATE && application.candidate._id.toString() !== user.id) {
    throw new AppError('Access denied. You can only view your own applications.', 403);
  }

  return application;
};

export const updateApplicationStatus = async (id, status) => {
  const application = await Application.findById(id);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (application.status === status) {
    return application;
  }

  application.status = status;
  application.statusHistory.push({ status });
  await application.save();

  return application;
};

export const withdrawApplication = async (userId, id) => {
  const application = await Application.findById(id);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (application.candidate.toString() !== userId) {
    throw new AppError('You can only withdraw your own applications.', 403);
  }

  if (application.status === APPLICATION_STATUS.WITHDRAWN) {
    return application;
  }

  application.status = APPLICATION_STATUS.WITHDRAWN;
  application.statusHistory.push({ status: APPLICATION_STATUS.WITHDRAWN });
  await application.save();

  return application;
};
