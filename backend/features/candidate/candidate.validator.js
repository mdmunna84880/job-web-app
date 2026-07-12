import Joi from 'joi';
import { PREFERRED_ROLE, SKILL_LEVEL, READINESS_STATUS } from '../../shared/constants.js';
import { objectIdSchema } from '../../shared/validators/common.js';

const educationItemSchema = Joi.object({
  institution: Joi.string().required().trim(),
  degree: Joi.string().required().trim(),
  fieldOfStudy: Joi.string().required().trim(),
  startYear: Joi.number().integer().min(1900).max(new Date().getFullYear() + 10).required(),
  endYear: Joi.number().integer().min(Joi.ref('startYear')).allow(null),
  gpa: Joi.number().min(0).max(10).allow(null),
});

const projectItemSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().allow('', null).trim(),
  technologies: Joi.array().items(Joi.string().trim()),
  link: Joi.string().uri().allow('', null).trim(),
});

export const upsertProfileSchema = Joi.object({
  education: Joi.array().items(educationItemSchema).default([]),
  projects: Joi.array().items(projectItemSchema).default([]),
  resumeUrl: Joi.string().uri().allow('', null).trim(),
  linkedinUrl: Joi.string().uri().allow('', null).trim(),
  githubUrl: Joi.string().uri().allow('', null).trim(),
  preferredRole: Joi.string().valid(...Object.values(PREFERRED_ROLE)).allow('', null),
  companies: Joi.array().items(objectIdSchema).default([]),
  readinessStatus: Joi.string().valid(...Object.values(READINESS_STATUS)).default(READINESS_STATUS.NOT_READY),
});

export const candidateSkillSchema = Joi.object({
  skillId: objectIdSchema.required(),
  proficiencyLevel: Joi.string().valid(...Object.values(SKILL_LEVEL)).required(),
});
