import { AppError } from './AppError.js';

export const validateSchema = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const validationErrors = {};
    error.details.forEach((detail) => {
      // Extract key and map to error message
      const key = detail.path.join('.');
      validationErrors[key] = detail.message;
    });
    throw new AppError('Validation failed', 400, validationErrors);
  }
  return value;
};
