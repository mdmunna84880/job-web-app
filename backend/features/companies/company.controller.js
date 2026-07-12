import * as companyService from './company.service.js';
import { createCompanySchema, updateCompanySchema } from './company.validator.js';
import { AppError } from '../../utils/AppError.js';

export const createCompany = async (req, res, next) => {
  const { error } = createCompanySchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const company = await companyService.createCompany(req.body);
  res.status(201).json({
    success: true,
    data: company,
  });
};

export const getAllCompanies = async (req, res, next) => {
  const result = await companyService.getAllCompanies(req.query);
  res.status(200).json({
    success: true,
    data: result.companies,
    pagination: result.pagination,
  });
};

export const getCompanyById = async (req, res, next) => {
  const company = await companyService.getCompanyById(req.params.id);
  res.status(200).json({
    success: true,
    data: company,
  });
};

export const updateCompany = async (req, res, next) => {
  const { error } = updateCompanySchema.validate(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const company = await companyService.updateCompany(req.params.id, req.body);
  res.status(200).json({
    success: true,
    data: company,
  });
};

export const deleteCompany = async (req, res, next) => {
  await companyService.deleteCompany(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Company deleted successfully',
  });
};
