import Skill from './skill.model.js';
import { AppError } from '../../utils/AppError.js';

export const createSkill = async (skillData) => {
  const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${skillData.name}$`, 'i') } });
  if (existingSkill) {
    throw new AppError('Skill already exists', 409);
  }
  return Skill.create(skillData);
};

export const getAllSkills = async (query = {}) => {
  const { category, search, page = 1, limit = 50 } = query;
  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skipIndex = (page - 1) * limit;
  const total = await Skill.countDocuments(filter);
  const skills = await Skill.find(filter)
    .sort({ name: 1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    skills,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const updateSkill = async (id, updateData) => {
  if (updateData.name) {
    const duplicate = await Skill.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
    });
    if (duplicate) {
      throw new AppError('Another skill with this name already exists', 409);
    }
  }

  const updatedSkill = await Skill.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedSkill) {
    throw new AppError('Skill not found', 404);
  }

  return updatedSkill;
};

export const deleteSkill = async (id) => {
  const deletedSkill = await Skill.findByIdAndDelete(id);
  if (!deletedSkill) {
    throw new AppError('Skill not found', 404);
  }
  return deletedSkill;
};
