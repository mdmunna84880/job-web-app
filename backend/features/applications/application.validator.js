import Joi from 'joi';
import { APPLICATION_STATUS } from '../../shared/constants.js';
import { objectIdSchema } from '../../shared/validators/common.js';

export const applyJobSchema = Joi.object({
  jobId: objectIdSchema.required(),
  studentRemarks: Joi.string().allow('', null).trim(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(APPLICATION_STATUS)).required(),
});
