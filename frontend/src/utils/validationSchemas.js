import Joi from 'joi';

// Schema validation for registration
export const registerSchema = Joi.object({
  name: Joi.string().min(3).required().messages({
    'string.empty': 'Full name cannot be empty.',
    'string.min': 'Full name must be at least 3 characters long.',
    'any.required': 'Full name is required.',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email address cannot be empty.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email address is required.',
  }),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$'))
    .required()
    .messages({
      'string.empty': 'Password cannot be empty.',
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
      'any.required': 'Password is required.',
    }),
  role: Joi.string().valid('candidate', 'mentor', 'admin').required().messages({
    'any.only': 'Please select a valid role.',
    'any.required': 'Role selection is required.',
  }),
});

// Schema validation for login
export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Email address cannot be empty.',
    'string.email': 'Please enter a valid email address.',
    'any.required': 'Email address is required.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password cannot be empty.',
    'any.required': 'Password is required.',
  }),
});

// Schema validation for Candidate Profile upsert
export const profileSchema = Joi.object({
  preferredRole: Joi.string()
    .valid(
      'Frontend Developer',
      'Backend Developer',
      'Full-Stack Developer',
      'Data Analyst',
      'QA Engineer'
    )
    .allow('', null)
    .messages({
      'any.only': 'Please select a valid preferred role.',
    }),
  companies: Joi.array().items(Joi.string()).default([]),
  resumeUrl: Joi.string().uri().allow('').messages({
    'string.uri': 'Please enter a valid URL (including https://).',
  }),
  linkedinUrl: Joi.string().uri().allow('').messages({
    'string.uri': 'Please enter a valid URL (including https://).',
  }),
  githubUrl: Joi.string().uri().allow('').messages({
    'string.uri': 'Please enter a valid URL (including https://).',
  }),
  education: Joi.array().items(
    Joi.object({
      institution: Joi.string().required().messages({
        'string.empty': 'School / University is required.',
      }),
      degree: Joi.string().required().messages({
        'string.empty': 'Degree is required.',
      }),
      fieldOfStudy: Joi.string().required().messages({
        'string.empty': 'Field of study is required.',
      }),
      startYear: Joi.number().integer().min(1900).required().messages({
        'number.base': 'Start year is required and must be a number.',
        'number.min': 'Start year must be at least 1900.',
      }),
      endYear: Joi.number().integer().min(Joi.ref('startYear')).allow(null, '').messages({
        'number.min': 'End year cannot be prior to start year.',
      }),
      gpa: Joi.number().min(0).max(10).allow(null, '').messages({
        'number.min': 'GPA cannot be less than 0.',
        'number.max': 'GPA cannot be greater than 10.',
      }),
    })
  ),
  projects: Joi.array().items(
    Joi.object({
      title: Joi.string().required().messages({
        'string.empty': 'Project title is required.',
      }),
      description: Joi.string().allow(''),
      technologies: Joi.string().allow('').messages({}), // We will capture comma-separated technologies and map to array on submit
      link: Joi.string().uri().allow('').messages({
        'string.uri': 'Please enter a valid project URL.',
      }),
    })
  ),
});
