import Joi from 'joi';
import { USER_ROLE } from '../../shared/constants.js';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().allow('', null).trim(),
  role: Joi.string().valid(...Object.values(USER_ROLE)).default(USER_ROLE.CANDIDATE),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim(),
  password: Joi.string().required(),
});
