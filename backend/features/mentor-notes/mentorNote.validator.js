import Joi from 'joi';
import { objectIdSchema } from '../../shared/validators/common.js';
import { MENTOR_NOTE_TYPE } from '../../shared/constants.js';

export const createNoteSchema = Joi.object({
  candidateId: objectIdSchema.required(),
  text: Joi.string().min(5).required().trim(),
  type: Joi.string().valid(...Object.values(MENTOR_NOTE_TYPE)).default(MENTOR_NOTE_TYPE.GENERAL),
  applicationId: objectIdSchema.when('type', {
    is: MENTOR_NOTE_TYPE.APPLICATION,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  skillId: objectIdSchema.when('type', {
    is: MENTOR_NOTE_TYPE.SKILL,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const updateNoteSchema = Joi.object({
  text: Joi.string().min(5).required().trim(),
});
