import * as skillService from './skill.service.js';
import { createSkillSchema, updateSkillSchema } from './skill.validator.js';
import { AppError } from '../../utils/AppError.js';

export const createSkill = async (req, res, next) => {
  const { error } = createSkillSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const skill = await skillService.createSkill(req.body);
  res.status(201).json({
    success: true,
    data: skill,
  });
};

export const getAllSkills = async (req, res, next) => {
  const result = await skillService.getAllSkills(req.query);
  res.status(200).json({
    success: true,
    data: result.skills,
    pagination: result.pagination,
  });
};

export const updateSkill = async (req, res, next) => {
  const { error } = updateSkillSchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const skill = await skillService.updateSkill(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: skill,
  });
};

export const deleteSkill = async (req, res, next) => {
  await skillService.deleteSkill(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully',
  });
};
