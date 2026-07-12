import * as skillService from './skill.service.js';
import { createSkillSchema, updateSkillSchema } from './skill.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const createSkill = async (req, res, next) => {
  try {
    req.body = validateSchema(createSkillSchema, req.body);
  } catch (err) {
    return next(err);
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
  try {
    req.body = validateSchema(updateSkillSchema, req.body);
  } catch (err) {
    return next(err);
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
