import mongoose from 'mongoose';
import CandidateProfile from './candidate.model.js';
import CandidateSkill from './candidateSkill.model.js';
import Skill from '../skills/skill.model.js';
import { AppError } from '../../utils/AppError.js';
import { PREFERRED_ROLE } from '../../shared/constants.js';

// Dynamically compute profile completion percentage
const calculateCompletionScore = (data) => {
  let score = 0;

  if (data.preferredRole) score += 10;
  if (data.education && data.education.length > 0) score += 20;
  if (data.projects && data.projects.length > 0) score += 20;
  if (data.resumeUrl) score += 20;
  if (data.linkedinUrl) score += 15;
  if (data.githubUrl) score += 15;

  return score;
};

// Map standard preferred roles to expected catalog skill names
const roleStandardSkills = {
  [PREFERRED_ROLE.FRONTEND_DEVELOPER]: ['React', 'JavaScript', 'CSS', 'HTML', 'Communication'],
  [PREFERRED_ROLE.BACKEND_DEVELOPER]: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'Problem Solving'],
  [PREFERRED_ROLE.FULL_STACK_DEVELOPER]: ['React', 'Node.js', 'Express', 'MongoDB', 'JavaScript', 'Problem Solving'],
  [PREFERRED_ROLE.DATA_ANALYST]: ['SQL', 'Python', 'Excel', 'Database', 'Problem Solving'],
  [PREFERRED_ROLE.QA_ENGINEER]: ['Testing', 'JavaScript', 'Communication', 'Interview Readiness'],
};

export const upsertProfile = async (userId, profileData) => {
  const completionScore = calculateCompletionScore(profileData);
  
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    {
      ...profileData,
      profileCompletion: completionScore,
      user: userId,
    },
    { returnDocument: 'after', upsert: true, runValidators: true }
  ).populate('user', 'name email phone role');

  return profile;
};

export const getProfile = async (userId) => {
  const profile = await CandidateProfile.findOne({ user: userId })
    .populate('user', 'name email phone role');

  if (!profile) {
    throw new AppError('Candidate profile not found', 404);
  }

  return profile;
};

export const addOrUpdateSkill = async (userId, skillId, proficiencyLevel) => {
  const masterSkill = await Skill.findById(skillId);
  if (!masterSkill) {
    throw new AppError('Master skill not found in catalog', 404);
  }

  const existingRating = await CandidateSkill.findOne({ user: userId, skill: skillId });

  if (existingRating) {
    if (existingRating.proficiencyLevel === proficiencyLevel) {
      return existingRating.populate('skill', 'name category');
    }

    existingRating.proficiencyLevel = proficiencyLevel;
    existingRating.history.push({ proficiencyLevel });
    await existingRating.save();
    return existingRating.populate('skill', 'name category');
  }

  const newRating = await CandidateSkill.create({
    user: userId,
    skill: skillId,
    proficiencyLevel,
    history: [{ proficiencyLevel }],
  });

  return newRating.populate('skill', 'name category');
};

export const getCandidateSkills = async (userId) => {
  return CandidateSkill.find({ user: userId })
    .populate('skill', 'name category')
    .sort({ createdAt: -1 });
};

export const deleteCandidateSkill = async (userId, skillId) => {
  const deleted = await CandidateSkill.findOneAndDelete({ user: userId, skill: skillId });
  if (!deleted) {
    throw new AppError('Skill rating not found for this candidate', 404);
  }
  return deleted;
};

export const calculateSkillGapForRole = async (userId) => {
  const profile = await CandidateProfile.findOne({ user: userId });
  if (!profile || !profile.preferredRole) {
    throw new AppError('Preferred role is required to analyze general skill gaps.', 400);
  }

  const targetSkills = roleStandardSkills[profile.preferredRole] || [];
  if (targetSkills.length === 0) {
    return { targetRole: profile.preferredRole, missingSkills: [], proficientSkills: [] };
  }

  const candidateSkills = await CandidateSkill.find({ user: userId }).populate('skill', 'name');
  
  // Normalize skills reported by candidate for easy checks
  const candidateSkillMap = new Map();
  candidateSkills.forEach((cs) => {
    if (cs.skill) {
      candidateSkillMap.set(cs.skill.name.toLowerCase().trim(), cs.proficiencyLevel);
    }
  });

  const missingSkills = [];
  const needsImprovement = [];
  const proficientSkills = [];

  for (const skillName of targetSkills) {
    const key = skillName.toLowerCase().trim();
    if (!candidateSkillMap.has(key)) {
      missingSkills.push(skillName);
    } else {
      const level = candidateSkillMap.get(key);
      if (level === 'Beginner' || level === 'Intermediate') {
        needsImprovement.push({ name: skillName, currentLevel: level });
      } else {
        proficientSkills.push({ name: skillName, currentLevel: level });
      }
    }
  }

  return {
    targetRole: profile.preferredRole,
    missingSkills,
    needsImprovement,
    proficientSkills,
  };
};

export const calculateSkillGapForJob = async (userId, jobId) => {
  const Job = mongoose.models.Job;
  if (!Job) {
    return { message: 'Jobs module is not initialized yet.' };
  }

  const job = await Job.findById(jobId).populate('requiredSkills');
  if (!job) {
    throw new AppError('Job opening not found', 404);
  }

  const candidateSkills = await CandidateSkill.find({ user: userId }).populate('skill', 'name');
  const candidateSkillMap = new Map();
  candidateSkills.forEach((cs) => {
    if (cs.skill) {
      candidateSkillMap.set(cs.skill.name.toLowerCase().trim(), cs.proficiencyLevel);
    }
  });

  const missingSkills = [];
  const needsImprovement = [];
  const proficientSkills = [];

  const requiredSkills = job.requiredSkills || [];

  for (const skillItem of requiredSkills) {
    // If skill is populated, get the name; otherwise, treat skillItem as name/string
    const skillName = typeof skillItem === 'object' && skillItem.name ? skillItem.name : String(skillItem);
    const key = skillName.toLowerCase().trim();

    if (!candidateSkillMap.has(key)) {
      missingSkills.push(skillName);
    } else {
      const level = candidateSkillMap.get(key);
      if (level === 'Beginner' || level === 'Intermediate') {
        needsImprovement.push({ name: skillName, currentLevel: level });
      } else {
        proficientSkills.push({ name: skillName, currentLevel: level });
      }
    }
  }

  return {
    jobTitle: job.title,
    company: job.companyName,
    missingSkills,
    needsImprovement,
    proficientSkills,
  };
};
