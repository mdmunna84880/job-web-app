import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Skill from '../features/skills/skill.model.js';
import { SKILL_CATEGORY } from '../shared/constants.js';

dotenv.config();

const defaultSkills = [
  { name: 'React', category: SKILL_CATEGORY.FRONTEND },
  { name: 'JavaScript', category: SKILL_CATEGORY.FRONTEND },
  { name: 'CSS', category: SKILL_CATEGORY.FRONTEND },
  { name: 'HTML', category: SKILL_CATEGORY.FRONTEND },
  { name: 'Node.js', category: SKILL_CATEGORY.BACKEND },
  { name: 'Express', category: SKILL_CATEGORY.BACKEND },
  { name: 'MongoDB', category: SKILL_CATEGORY.DATABASE },
  { name: 'SQL', category: SKILL_CATEGORY.DATABASE },
  { name: 'Python', category: SKILL_CATEGORY.BACKEND },
  { name: 'Excel', category: SKILL_CATEGORY.OTHER },
  { name: 'Docker', category: SKILL_CATEGORY.DEVOPS },
  { name: 'Communication', category: SKILL_CATEGORY.COMMUNICATION },
  { name: 'Problem Solving', category: SKILL_CATEGORY.PROBLEM_SOLVING },
  { name: 'Testing', category: SKILL_CATEGORY.OTHER },
  { name: 'Interview Readiness', category: SKILL_CATEGORY.INTERVIEW_READINESS },
];

const seedSkills = async () => {
  try {
    await connectDB();
    console.log('Seeding master skills catalog...');

    for (const skill of defaultSkills) {
      await Skill.updateOne(
        { name: skill.name },
        { $set: skill },
        { upsert: true }
      );
      console.log(`- Seeded skill: ${skill.name}`);
    }

    console.log('Master skills catalog seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedSkills();
