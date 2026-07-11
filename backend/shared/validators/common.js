import Joi from 'joi';

// Validate MongoDB ObjectIds
export const objectIdSchema = Joi.string()
  .hex()
  .length(24)
  .message('Invalid unique identifier format');

// Validate pagination query parameters
export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(true);
