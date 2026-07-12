import Joi from 'joi';
import { objectIdSchema } from '../../shared/validators/common.js';

export const createNoteSchema = Joi.object({
  candidateId: objectIdSchema.required(),
  text: Joi.string().min(5).required().trim(),
  type: Joi.string().valid('General', 'Application', 'Skill').default('General'),
  applicationId: objectIdSchema.when('type', {
    is: 'Application',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  skillId: objectIdSchema.when('type', {
    is: 'Skill',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const updateNoteSchema = Joi.object({
  text: Joi.string().min(5).required().trim(),
});
