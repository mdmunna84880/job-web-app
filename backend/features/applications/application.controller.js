import * as applicationService from './application.service.js';
import { applyJobSchema, updateStatusSchema } from './application.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const applyJob = async (req, res) => {
  req.body = validateSchema(applyJobSchema, req.body);
  const application = await applicationService.applyJob(
    req.user.id,
    req.body.jobId,
    req.body.studentRemarks
  );
  res.status(201).json({ success: true, data: application });
};

export const getAllApplications = async (req, res) => {
  const result = await applicationService.getAllApplications(req.user, req.query);
  res.status(200).json({
    success: true,
    data: result.applications,
    pagination: result.pagination,
  });
};

export const getApplicationById = async (req, res) => {
  const application = await applicationService.getApplicationById(req.user, req.params.id);
  res.status(200).json({ success: true, data: application });
};

export const updateApplicationStatus = async (req, res) => {
  req.body = validateSchema(updateStatusSchema, req.body);
  const application = await applicationService.updateApplicationStatus(
    req.params.id,
    req.body.status
  );
  res.status(200).json({ success: true, data: application });
};

export const withdrawApplication = async (req, res) => {
  const application = await applicationService.withdrawApplication(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: application });
};
