import * as companyService from './company.service.js';
import { createCompanySchema, updateCompanySchema } from './company.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const createCompany = async (req, res, next) => {
  try {
    req.body = validateSchema(createCompanySchema, req.body);
  } catch (err) {
    return next(err);
  }

  const company = await companyService.createCompany({
    ...req.body,
    createdBy: req.user._id,
  });
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
  try {
    req.body = validateSchema(updateCompanySchema, req.body);
  } catch (err) {
    return next(err);
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
