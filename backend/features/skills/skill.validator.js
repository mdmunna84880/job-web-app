import Joi from 'joi';
import { SKILL_CATEGORY } from '../../shared/constants.js';

export const createSkillSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim(),
  category: Joi.string().valid(...Object.values(SKILL_CATEGORY)).required(),
});

export const updateSkillSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  category: Joi.string().valid(...Object.values(SKILL_CATEGORY)),
}).min(1);
