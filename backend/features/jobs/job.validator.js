import Joi from 'joi';
import { WORK_MODE, JOB_TYPE, JOB_STATUS } from '../../shared/constants.js';
import { objectIdSchema } from '../../shared/validators/common.js';

export const createJobSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().trim(),
  companyId: objectIdSchema.required(),
  location: Joi.string().required().trim(),
  workMode: Joi.string().valid(...Object.values(WORK_MODE)).required(),
  jobType: Joi.string().valid(...Object.values(JOB_TYPE)).required(),
  requiredSkills: Joi.array().items(objectIdSchema).min(1).required(),
  salaryMin: Joi.number().min(0).allow(null),
  salaryMax: Joi.number().min(Joi.ref('salaryMin')).allow(null),
  eligibilityCriteria: Joi.string().allow('', null).trim(),
  deadline: Joi.date().greater('now').allow(null),
  status: Joi.string().valid(...Object.values(JOB_STATUS)).default(JOB_STATUS.ACTIVE),
  description: Joi.string().required().trim(),
});

export const updateJobSchema = Joi.object({
  title: Joi.string().min(2).max(100).trim(),
  companyId: objectIdSchema,
  location: Joi.string().trim(),
  workMode: Joi.string().valid(...Object.values(WORK_MODE)),
  jobType: Joi.string().valid(...Object.values(JOB_TYPE)),
  requiredSkills: Joi.array().items(objectIdSchema).min(1),
  salaryMin: Joi.number().min(0).allow(null),
  salaryMax: Joi.number().min(0).allow(null), // Handled validation in service if both provided
  eligibilityCriteria: Joi.string().allow('', null).trim(),
  deadline: Joi.date().allow(null),
  status: Joi.string().valid(...Object.values(JOB_STATUS)),
  description: Joi.string().trim(),
}).min(1);
