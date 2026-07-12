import Joi from 'joi';
import { INTERVIEW_TYPE, INTERVIEW_RESULT } from '../../shared/constants.js';
import { objectIdSchema } from '../../shared/validators/common.js';

export const createInterviewSchema = Joi.object({
  candidateId: objectIdSchema.required(),
  jobId: objectIdSchema.required(),
  round: Joi.number().integer().min(1).required(),
  date: Joi.date().required(),
  type: Joi.string().valid(...Object.values(INTERVIEW_TYPE)).required(),
  score: Joi.number().min(0).max(10).allow(null),
  feedback: Joi.string().allow('', null).trim(),
  result: Joi.string().valid(...Object.values(INTERVIEW_RESULT)).default(INTERVIEW_RESULT.PENDING),
});

export const updateInterviewSchema = Joi.object({
  round: Joi.number().integer().min(1),
  date: Joi.date(),
  type: Joi.string().valid(...Object.values(INTERVIEW_TYPE)),
  score: Joi.number().min(0).max(10).allow(null),
  feedback: Joi.string().allow('', null).trim(),
  result: Joi.string().valid(...Object.values(INTERVIEW_RESULT)),
}).min(1);
