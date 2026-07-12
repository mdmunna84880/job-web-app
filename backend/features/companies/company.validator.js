import Joi from 'joi';
import { COMPANY_SIZE } from '../../shared/constants.js';

export const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().allow('', null).trim(),
  industry: Joi.string().allow('', null).trim(),
  website: Joi.string().uri().allow('', null).trim(),
  size: Joi.string().valid(...Object.values(COMPANY_SIZE)).allow('', null),
  logo: Joi.string().uri().allow('', null).trim(),
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  description: Joi.string().allow('', null).trim(),
  industry: Joi.string().allow('', null).trim(),
  website: Joi.string().uri().allow('', null).trim(),
  size: Joi.string().valid(...Object.values(COMPANY_SIZE)).allow('', null),
  logo: Joi.string().uri().allow('', null).trim(),
}).min(1);
