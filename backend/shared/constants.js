export const USER_ROLE = Object.freeze({
  CANDIDATE: 'candidate',
  MENTOR: 'mentor',
  ADMIN: 'admin',
});

export const APPLICATION_STATUS = Object.freeze({
  APPLIED: 'Applied',
  SHORTLISTED: 'Shortlisted',
  ASSESSMENT_SCHEDULED: 'Assessment Scheduled',
  ASSESSMENT_COMPLETED: 'Assessment Completed',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_COMPLETED: 'Interview Completed',
  OFFER_RECEIVED: 'Offer Received',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
});

export const INTERVIEW_TYPE = Object.freeze({
  TECHNICAL: 'Technical',
  HR: 'HR',
  MANAGERIAL: 'Managerial',
  CODING_ASSESSMENT: 'Coding Assessment',
  ASSIGNMENT: 'Assignment',
});

export const INTERVIEW_RESULT = Object.freeze({
  PENDING: 'Pending',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
});

export const JOB_STATUS = Object.freeze({
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  ON_HOLD: 'On Hold',
});

export const WORK_MODE = Object.freeze({
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ON_SITE: 'On-site',
});

export const JOB_TYPE = Object.freeze({
  INTERNSHIP: 'Internship',
  FULL_TIME: 'Full-Time',
  CONTRACT: 'Contract',
});

export const SKILL_LEVEL = Object.freeze({
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
  PLACEMENT_READY: 'Placement Ready',
});

export const SKILL_CATEGORY = Object.freeze({
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  PROBLEM_SOLVING: 'Problem Solving',
  COMMUNICATION: 'Communication',
  RESUME_READINESS: 'Resume Readiness',
  INTERVIEW_READINESS: 'Interview Readiness',
  OTHER: 'Other',
});

export const COMPANY_SIZE = Object.freeze({
  SIZE_1_10: '1-10',
  SIZE_11_50: '11-50',
  SIZE_51_200: '51-200',
  SIZE_201_500: '201-500',
  SIZE_501_1000: '501-1000',
  SIZE_1000_PLUS: '1000+',
});

export const PREFERRED_ROLE = Object.freeze({
  FRONTEND_DEVELOPER: 'Frontend Developer',
  BACKEND_DEVELOPER: 'Backend Developer',
  FULL_STACK_DEVELOPER: 'Full-Stack Developer',
  DATA_ANALYST: 'Data Analyst',
  QA_ENGINEER: 'QA Engineer',
});
