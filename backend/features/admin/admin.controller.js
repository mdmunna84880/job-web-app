import * as adminService from './admin.service.js';
import { updateUserRoleSchema } from './admin.validator.js';
import { validateSchema } from '../../utils/validatorHelper.js';

export const listAllUsers = async (req, res, next) => {
  const result = await adminService.listAllUsers(req.query);
  res.status(200).json({
    success: true,
    data: result.users,
    pagination: result.pagination,
  });
};

export const toggleUserStatus = async (req, res, next) => {
  const user = await adminService.toggleUserStatus(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
};

export const updateUserRole = async (req, res, next) => {
  try {
    req.body = validateSchema(updateUserRoleSchema, req.body);
  } catch (err) {
    return next(err);
  }

  const user = await adminService.updateUserRole(req.params.id, req.user.id, req.body.role);
  res.status(200).json({
    success: true,
    data: user,
  });
};
