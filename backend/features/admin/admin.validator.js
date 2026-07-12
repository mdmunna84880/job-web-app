import Joi from 'joi';
import { USER_ROLE } from '../../shared/constants.js';

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid(...Object.values(USER_ROLE)).required(),
});
