import * as candidateService from './candidate.service.js';
import { upsertProfileSchema, candidateSkillSchema } from './candidate.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const upsertProfile = async (req, res) => {
  req.body = validateSchema(upsertProfileSchema, req.body);
  const profile = await candidateService.upsertProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: profile });
};

export const getProfileMe = async (req, res) => {
  const profile = await candidateService.getProfile(req.user.id);
  res.status(200).json({ success: true, data: profile });
};

export const getProfileById = async (req, res) => {
  const profile = await candidateService.getProfile(req.params.userId);
  res.status(200).json({ success: true, data: profile });
};

export const addOrUpdateSkill = async (req, res) => {
  req.body = validateSchema(candidateSkillSchema, req.body);
  const rating = await candidateService.addOrUpdateSkill(
    req.user.id,
    req.body.skillId,
    req.body.proficiencyLevel
  );
  res.status(200).json({ success: true, data: rating });
};

export const getCandidateSkillsMe = async (req, res) => {
  const skills = await candidateService.getCandidateSkills(req.user.id);
  res.status(200).json({ success: true, data: skills });
};

export const getCandidateSkillsById = async (req, res) => {
  const skills = await candidateService.getCandidateSkills(req.params.userId);
  res.status(200).json({ success: true, data: skills });
};

export const deleteCandidateSkill = async (req, res) => {
  await candidateService.deleteCandidateSkill(req.user.id, req.params.skillId);
  res.status(204).send();
};

export const getSkillGapRole = async (req, res) => {
  const gap = await candidateService.calculateSkillGapForRole(req.user.id);
  res.status(200).json({ success: true, data: gap });
};

export const getSkillGapJob = async (req, res) => {
  const gap = await candidateService.calculateSkillGapForJob(req.user.id, req.params.jobId);
  res.status(200).json({ success: true, data: gap });
};
