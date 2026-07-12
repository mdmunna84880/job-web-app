import * as interviewService from './interview.service.js';
import { createInterviewSchema, updateInterviewSchema } from './interview.validator.js';
import { AppError } from '../../utils/AppError.js';

export const createInterview = async (req, res, next) => {
  const { error } = createInterviewSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const interview = await interviewService.createInterview(req.body);
  res.status(201).json({
    success: true,
    data: interview,
  });
};

export const getAllInterviews = async (req, res, next) => {
  const result = await interviewService.getAllInterviews(req.user, req.query);
  res.status(200).json({
    success: true,
    data: result.interviews,
    pagination: result.pagination,
  });
};

export const getInterviewHistory = async (req, res, next) => {
  const history = await interviewService.getInterviewHistory(req.params.candidateId);
  res.status(200).json({
    success: true,
    data: history,
  });
};

export const updateInterview = async (req, res, next) => {
  const { error } = updateInterviewSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const interview = await interviewService.updateInterview(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: interview,
  });
};

export const deleteInterview = async (req, res, next) => {
  await interviewService.deleteInterview(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Interview round deleted successfully',
  });
};
