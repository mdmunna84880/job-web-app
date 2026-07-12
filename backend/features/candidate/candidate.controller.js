import * as candidateService from './candidate.service.js';
import { upsertProfileSchema, candidateSkillSchema } from './candidate.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const upsertProfile = async (req, res, next) => {
  try {
    req.body = validateSchema(upsertProfileSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const profile = await candidateService.upsertProfile(req.user.id, req.body);
  res.status(200).json({
    success: true,
    data: profile,
  });
};

export const getProfileMe = async (req, res, next) => {
  const profile = await candidateService.getProfile(req.user.id);
  res.status(200).json({
    success: true,
    data: profile,
  });
};

export const getProfileById = async (req, res, next) => {
  const profile = await candidateService.getProfile(req.params.userId);
  res.status(200).json({
    success: true,
    data: profile,
  });
};

export const addOrUpdateSkill = async (req, res, next) => {
  try {
    req.body = validateSchema(candidateSkillSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const rating = await candidateService.addOrUpdateSkill(
    req.user.id,
    req.body.skillId,
    req.body.proficiencyLevel
  );

  res.status(200).json({
    success: true,
    data: rating,
  });
};

export const getCandidateSkillsMe = async (req, res, next) => {
  const skills = await candidateService.getCandidateSkills(req.user.id);
  res.status(200).json({
    success: true,
    data: skills,
  });
};

export const getCandidateSkillsById = async (req, res, next) => {
  const skills = await candidateService.getCandidateSkills(req.params.userId);
  res.status(200).json({
    success: true,
    data: skills,
  });
};

export const deleteCandidateSkill = async (req, res, next) => {
  await candidateService.deleteCandidateSkill(req.user.id, req.params.skillId);
  res.status(200).json({
    success: true,
    message: 'Skill rating removed successfully',
  });
};

export const getSkillGapRole = async (req, res, next) => {
  const gap = await candidateService.calculateSkillGapForRole(req.user.id);
  res.status(200).json({
    success: true,
    data: gap,
  });
};

export const getSkillGapJob = async (req, res, next) => {
  const gap = await candidateService.calculateSkillGapForJob(req.user.id, req.params.jobId);
  res.status(200).json({
    success: true,
    data: gap,
  });
};
