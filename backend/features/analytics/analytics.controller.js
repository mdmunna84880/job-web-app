import * as analyticsService from './analytics.service.js';

export const getCandidateDashboard = async (req, res, next) => {
  const stats = await analyticsService.getCandidateDashboard(req.user.id);
  res.status(200).json({
    success: true,
    data: stats,
  });
};

export const getMentorDashboard = async (req, res, next) => {
  const stats = await analyticsService.getMentorDashboard();
  res.status(200).json({
    success: true,
    data: stats,
  });
};

export const getAdminDashboard = async (req, res, next) => {
  const stats = await analyticsService.getAdminDashboard();
  res.status(200).json({
    success: true,
    data: stats,
  });
};
