import * as jobService from './job.service.js';
import { createJobSchema, updateJobSchema } from './job.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const createJob = async (req, res, next) => {
  try {
    req.body = validateSchema(createJobSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const job = await jobService.createJob(req.body);
  res.status(201).json({
    success: true,
    data: job,
  });
};

export const getAllJobs = async (req, res, next) => {
  const result = await jobService.getAllJobs(req.query);
  res.status(200).json({
    success: true,
    data: result.jobs,
    pagination: result.pagination,
  });
};

export const getJobById = async (req, res, next) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json({
    success: true,
    data: job,
  });
};

export const updateJob = async (req, res, next) => {
  try {
    req.body = validateSchema(updateJobSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const job = await jobService.updateJob(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: job,
  });
};

export const deleteJob = async (req, res, next) => {
  await jobService.deleteJob(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Job opening deleted successfully',
  });
};
