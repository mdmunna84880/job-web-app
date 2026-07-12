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
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
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
