import * as jobService from './job.service.js';
import { createJobSchema, updateJobSchema } from './job.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const createJob = async (req, res) => {
  req.body = validateSchema(createJobSchema, req.body);
  const job = await jobService.createJob({ ...req.body, createdBy: req.user._id }, req.user);
  res.status(201).json({ success: true, data: job });
};

export const getAllJobs = async (req, res) => {
  const result = await jobService.getAllJobs(req.query);
  res.status(200).json({
    success: true,
    data: result.jobs,
    pagination: result.pagination,
  });
};

export const getJobById = async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  res.status(200).json({ success: true, data: job });
};

export const updateJob = async (req, res) => {
  req.body = validateSchema(updateJobSchema, req.body);
  const job = await jobService.updateJob(req.params.id, req.body, req.user);
  res.status(200).json({ success: true, data: job });
};

export const deleteJob = async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user);
  // 204 means success with no body to return
  res.status(204).send();
};
