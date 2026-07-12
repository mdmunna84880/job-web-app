import Interview from './interview.model.js';
import User from '../auth/auth.model.js';
import Job from '../jobs/job.model.js';
import { AppError } from '../../utils/AppError.js';
import { USER_ROLE } from '../../shared/constants.js';

export const createInterview = async (interviewData) => {
  const candidate = await User.findById(interviewData.candidateId);
  if (!candidate || candidate.role !== USER_ROLE.CANDIDATE) {
    throw new AppError('Candidate user not found', 404);
  }

  const job = await Job.findById(interviewData.jobId);
  if (!job) {
    throw new AppError('Job opening not found', 404);
  }

  const interviewPayload = {
    candidate: interviewData.candidateId,
    job: interviewData.jobId,
    round: interviewData.round,
    date: interviewData.date,
    type: interviewData.type,
    score: interviewData.score,
    feedback: interviewData.feedback,
    result: interviewData.result,
  };

  return Interview.create(interviewPayload);
};

export const getAllInterviews = async (user, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const filter = {};

  if (user.role === USER_ROLE.CANDIDATE) {
    filter.candidate = user.id;
  }

  const skipIndex = (page - 1) * limit;
  const total = await Interview.countDocuments(filter);

  const interviews = await Interview.find(filter)
    .populate({
      path: 'job',
      select: 'title',
      populate: { path: 'company', select: 'name logo' },
    })
    .populate('candidate', 'name email phone')
    .sort({ date: 1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    interviews,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const getInterviewHistory = async (candidateId) => {
  const candidate = await User.findById(candidateId);
  if (!candidate) {
    throw new AppError('Candidate not found', 404);
  }

  return Interview.find({ candidate: candidateId })
    .populate({
      path: 'job',
      select: 'title',
      populate: { path: 'company', select: 'name logo' },
    })
    .sort({ round: 1 });
};

export const updateInterview = async (id, updateData) => {
  const updated = await Interview.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!updated) {
    throw new AppError('Interview round not found', 404);
  }

  return updated.populate([
    { path: 'job', select: 'title' },
    { path: 'candidate', select: 'name email phone' }
  ]);
};

export const deleteInterview = async (id) => {
  const deleted = await Interview.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Interview round not found', 404);
  }
  return deleted;
};
