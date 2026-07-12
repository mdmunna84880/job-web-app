import Company from './company.model.js';
import { AppError } from '../../utils/AppError.js';

export const createCompany = async (companyData) => {
  const existingCompany = await Company.findOne({
    name: { $regex: new RegExp(`^${companyData.name}$`, 'i') },
  });
  if (existingCompany) {
    throw new AppError('A company with this name already exists', 409);
  }
  return Company.create(companyData);
};

export const getAllCompanies = async (query = {}) => {
  const { search, industry, page = 1, limit = 50 } = query;
  const filter = {};

  if (industry) {
    filter.industry = { $regex: industry, $options: 'i' };
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const skipIndex = (page - 1) * limit;
  const total = await Company.countDocuments(filter);
  const companies = await Company.find(filter)
    .sort({ name: 1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    companies,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const getCompanyById = async (id) => {
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError('Company not found', 404);
  }
  return company;
};

export const updateCompany = async (id, updateData) => {
  if (updateData.name) {
    const duplicate = await Company.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
    });
    if (duplicate) {
      throw new AppError('Another company with this name already exists', 409);
    }
  }

  const updatedCompany = await Company.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true,
  });

  if (!updatedCompany) {
    throw new AppError('Company not found', 404);
  }

  return updatedCompany;
};

export const deleteCompany = async (id) => {
  const deletedCompany = await Company.findByIdAndDelete(id);
  if (!deletedCompany) {
    throw new AppError('Company not found', 404);
  }
  return deletedCompany;
};
