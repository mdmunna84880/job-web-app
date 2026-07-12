import mongoose from 'mongoose';
import User from '../auth/auth.model.js';
import CandidateProfile from '../candidate/candidate.model.js';
import Application from '../applications/application.model.js';
import Interview from '../interviews/interview.model.js';
import Company from '../companies/company.model.js';
import Job from '../jobs/job.model.js';

export const getCandidateDashboard = async (userId) => {
  const profile = await CandidateProfile.findOne({ user: userId });
  const totalApplied = await Application.countDocuments({ candidate: userId });
  
  const upcomingInterviews = await Interview.countDocuments({
    candidate: userId,
    date: { $gte: new Date() },
  });

  const appStatusBreakdown = await Application.aggregate([
    { $match: { candidate: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);

  return {
    profileCompletion: profile ? profile.profileCompletion : 0,
    readinessStatus: profile ? profile.readinessStatus : 'Not Ready',
    totalApplied,
    upcomingInterviews,
    applicationsByStatus: appStatusBreakdown,
  };
};

export const getMentorDashboard = async () => {
  const totalCandidates = await User.countDocuments({ role: 'candidate' });
  const readyCandidates = await CandidateProfile.countDocuments({ readinessStatus: 'Placement Ready' });
  const notReadyCandidates = totalCandidates - readyCandidates;

  const appStatusBreakdown = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);

  // Current week date bounds (Monday to Sunday)
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const interviewsThisWeek = await Interview.countDocuments({
    date: { $gte: startOfWeek, $lte: endOfWeek },
  });

  const companyWiseApplications = await Application.aggregate([
    { $lookup: { from: 'jobs', localField: 'job', foreignField: '_id', as: 'jobDetails' } },
    { $unwind: '$jobDetails' },
    { $lookup: { from: 'companies', localField: 'jobDetails.company', foreignField: '_id', as: 'companyDetails' } },
    { $unwind: '$companyDetails' },
    { $group: { _id: '$companyDetails.name', count: { $sum: 1 } } },
    { $project: { companyName: '$_id', count: 1, _id: 0 } }
  ]);

  return {
    totalCandidates,
    readyCandidates,
    notReadyCandidates,
    interviewsThisWeek,
    applicationsByStatus: appStatusBreakdown,
    companyWiseApplications,
  };
};

export const getAdminDashboard = async () => {
  const userRolesCounts = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $project: { role: '$_id', count: 1, _id: 0 } }
  ]);

  const totalCompanies = await Company.countDocuments();
  const totalJobs = await Job.countDocuments();

  const jobsByStatus = await Job.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);

  // Placement conversion rate calculations
  const uniqueApplicants = await Application.distinct('candidate');
  const uniquePlaced = await Application.distinct('candidate', { status: 'Offer Received' });
  const conversionRate = uniqueApplicants.length > 0 
    ? parseFloat(((uniquePlaced.length / uniqueApplicants.length) * 100).toFixed(2))
    : 0;

  // Monthly trends aggregated by year and month
  const monthlyTrends = await Application.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
        _id: 0
      }
    }
  ]);

  return {
    userRoles: userRolesCounts,
    totalCompanies,
    totalJobs,
    jobsByStatus,
    placementConversionRate: conversionRate,
    monthlyApplicationTrends: monthlyTrends,
  };
};
