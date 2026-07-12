import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import app from '../app.js';
import User from '../features/auth/auth.model.js';
import Company from '../features/companies/company.model.js';
import Job from '../features/jobs/job.model.js';
import Skill from '../features/skills/skill.model.js';
import CandidateProfile from '../features/candidate/candidate.model.js';
import Application from '../features/applications/application.model.js';
import Interview from '../features/interviews/interview.model.js';
import MentorNote from '../features/mentor-notes/mentorNote.model.js';

dotenv.config();

const PORT = 8004;
const BASE_URL = `http://localhost:${PORT}/api`;

const testCandidateEmail = 'test-candidate-p5@example.com';
const testMentorEmail = 'test-mentor-p5@example.com';
const testAdminEmail = 'test-admin-p5@example.com';
const testPassword = 'Password123!';

const runTests = async () => {
  let server;
  try {
    await connectDB();
    console.log('Cleaning up previous test database records...');

    const testUsers = await User.find({ email: { $in: [testCandidateEmail, testMentorEmail, testAdminEmail] } });
    const testUserIds = testUsers.map(u => u._id);

    await User.deleteMany({ _id: { $in: testUserIds } });
    await Company.deleteMany({ name: 'Test Company Phase 5' });

    // Cleanup jobs, profiles, applications, interviews and notes belonging to test users
    await CandidateProfile.deleteMany({ user: { $in: testUserIds } });
    await Application.deleteMany({ candidate: { $in: testUserIds } });
    await Interview.deleteMany({ candidate: { $in: testUserIds } });
    await MentorNote.deleteMany({ candidate: { $in: testUserIds } });

    console.log('Starting test server on port', PORT);
    server = app.listen(PORT);

    // Wait briefly for binding
    await new Promise(resolve => setTimeout(resolve, 500));

    let candidateToken = '';
    let mentorToken = '';
    let adminToken = '';
    
    let candidateId = '';
    let companyId = '';
    let jobId = '';
    let reactSkillId = '';
    let applicationId = '';
    let interviewId = '';

    // ============================================
    // TEST 1: Register and Login users
    // ============================================
    console.log('\n--- TEST 1: Registration and Login ---');

    // Register Candidate
    const regCandRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Candidate P5',
        email: testCandidateEmail,
        password: testPassword,
        role: 'candidate',
      }),
    });
    const regCandData = await regCandRes.json();
    candidateId = regCandData.data.user._id;

    // Register Mentor
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Mentor P5',
        email: testMentorEmail,
        password: testPassword,
        role: 'mentor',
      }),
    });

    // Register Admin
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin P5',
        email: testAdminEmail,
        password: testPassword,
        role: 'admin',
      }),
    });

    // Login Candidate
    const logCand = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCandidateEmail, password: testPassword }),
    });
    candidateToken = (await logCand.json()).token;

    // Login Mentor
    const logMentor = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testMentorEmail, password: testPassword }),
    });
    mentorToken = (await logMentor.json()).token;

    // Login Admin
    const logAdmin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testPassword }),
    });
    adminToken = (await logAdmin.json()).token;

    console.log('All test roles registered and logged in successfully.');

    // ============================================
    // PRE-REQUISITES SETUP
    // ============================================
    console.log('\n--- Setting up Prerequisites ---');

    // Create Company
    const compRes = await fetch(`${BASE_URL}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Test Company Phase 5',
        industry: 'Analytics Industry',
        website: 'https://testcompany5.com',
      }),
    });
    companyId = (await compRes.json()).data._id;

    // Get Skill
    const skillObj = await Skill.findOne({ name: 'React' });
    reactSkillId = skillObj?._id.toString();

    // Create Job
    const jobRes = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Analytics Engineer',
        companyId,
        location: 'Pune',
        workMode: 'Remote',
        jobType: 'Full-Time',
        requiredSkills: [reactSkillId],
        description: 'Analyzing MERN application trends.',
      }),
    });
    jobId = (await jobRes.json()).data._id;

    // Create Candidate Profile
    await fetch(`${BASE_URL}/candidate/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        preferredRole: 'QA Engineer',
        education: [{
          institution: 'Analytics Institute',
          degree: 'B.E.',
          fieldOfStudy: 'Information Technology',
          startYear: 2021,
        }],
      }),
    });

    // Apply to Job
    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({ jobId, studentRemarks: 'Interested in analytics' }),
    });
    applicationId = (await applyRes.json()).data._id;

    // Schedule Interview
    const scheduleRes = await fetch(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mentorToken}` },
      body: JSON.stringify({
        candidateId,
        jobId,
        round: 1,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'Technical',
      }),
    });
    interviewId = (await scheduleRes.json()).data._id;

    console.log('Prerequisites seeded successfully.');

    // ============================================
    // TEST 2: Analytics Dashboards
    // ============================================
    console.log('\n--- TEST 2: Analytics Dashboards ---');

    // Candidate Dashboard
    const candDashRes = await fetch(`${BASE_URL}/analytics/candidate`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const candDash = await candDashRes.json();
    if (candDashRes.status !== 200) throw new Error('Failed to retrieve Candidate dashboard');
    console.log(`Candidate Dashboard - Applied count: ${candDash.data.totalApplied}, Upcoming interviews: ${candDash.data.upcomingInterviews}`);
    if (candDash.data.totalApplied !== 1 || candDash.data.upcomingInterviews !== 1) {
      throw new Error('Candidate dashboard counts are incorrect');
    }

    // Mentor Dashboard
    const mentorDashRes = await fetch(`${BASE_URL}/analytics/mentor`, {
      headers: { Authorization: `Bearer ${mentorToken}` },
    });
    const mentorDash = await mentorDashRes.json();
    if (mentorDashRes.status !== 200) throw new Error('Failed to retrieve Mentor dashboard');
    console.log(`Mentor Dashboard - Total candidates: ${mentorDash.data.totalCandidates}, Interviews scheduled this week: ${mentorDash.data.interviewsThisWeek}`);
    if (mentorDash.data.totalCandidates < 1) {
      throw new Error('Mentor dashboard candidate counts are incorrect');
    }

    // Admin Dashboard
    const adminDashRes = await fetch(`${BASE_URL}/analytics/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDash = await adminDashRes.json();
    if (adminDashRes.status !== 200) throw new Error('Failed to retrieve Admin dashboard');
    console.log(`Admin Dashboard - Total jobs: ${adminDash.data.totalJobs}, Total companies: ${adminDash.data.totalCompanies}`);
    if (adminDash.data.totalJobs < 1 || adminDash.data.totalCompanies < 1) {
      throw new Error('Admin dashboard stats are incorrect');
    }

    // ============================================
    // TEST 3: Admin User Management
    // ============================================
    console.log('\n--- TEST 3: Admin User Management ---');

    // Admin lists all users with search filter
    const listRes = await fetch(`${BASE_URL}/admin/users?search=Candidate`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const listData = await listRes.json();
    if (listRes.status !== 200) throw new Error('Admin failed to list users');
    console.log(`List users search filter returned ${listData.data.length} user(s).`);
    const foundCandidate = listData.data.find(u => u._id === candidateId);
    if (!foundCandidate) throw new Error('Admin list users did not find the test candidate');

    // Admin updates user role: Candidate -> Mentor
    const roleRes = await fetch(`${BASE_URL}/admin/users/${candidateId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ role: 'mentor' }),
    });
    const roleData = await roleRes.json();
    if (roleRes.status !== 200) throw new Error('Admin failed to update user role');
    console.log(`Admin updated candidate role. New role in DB response: ${roleData.data.role}`);
    if (roleData.data.role !== 'mentor') throw new Error('Role update mismatch');

    // Admin deactivates user account
    const activeRes = await fetch(`${BASE_URL}/admin/users/${candidateId}/toggle-active`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const activeData = await activeRes.json();
    if (activeRes.status !== 200) throw new Error('Admin failed to toggle user active status');
    console.log(`Admin toggled user active status. New isActive: ${activeData.data.isActive}`);
    if (activeData.data.isActive !== false) throw new Error('User status deactivation mismatch');

    // Verify deactivated user gets blocked on endpoints (should return 403 Forbidden)
    const blockRes = await fetch(`${BASE_URL}/analytics/candidate`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    console.log(`Deactivated user request status: ${blockRes.status} (Expected: 403)`);
    if (blockRes.status !== 403) throw new Error('Deactivated user bypass authorization check');

    // Cleanup
    await Interview.findByIdAndDelete(interviewId);
    await Application.findByIdAndDelete(applicationId);
    await Job.findByIdAndDelete(jobId);
    await CandidateProfile.findOneAndDelete({ user: candidateId });
    await Company.findByIdAndDelete(companyId);
    console.log('Cleaned up test documents.');

    console.log('\n========================================');
    console.log('ALL PHASE 5 VERIFICATION TESTS PASSED!');
    console.log('========================================');

    server.close();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\nTest execution failed:', error.message);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
