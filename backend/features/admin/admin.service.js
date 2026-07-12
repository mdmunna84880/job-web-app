import User from '../auth/auth.model.js';
import { AppError } from '../../utils/AppError.js';

export const listAllUsers = async (query = {}) => {
  const { search, role, page = 1, limit = 20 } = query;
  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skipIndex = (page - 1) * limit;
  const total = await User.countDocuments(filter);

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skipIndex)
    .limit(limit);

  return {
    users,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
};

export const toggleUserStatus = async (id, adminId) => {
  if (id === adminId) {
    throw new AppError('You cannot deactivate your own administrator account.', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};

export const updateUserRole = async (id, adminId, role) => {
  if (id === adminId && role !== 'admin') {
    throw new AppError('You cannot revoke your own administrator permissions.', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.role = role;
  await user.save();

  return user;
};
