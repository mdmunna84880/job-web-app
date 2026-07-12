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

const PORT = 8003;
const BASE_URL = `http://localhost:${PORT}/api`;

const testCandidateEmail = 'test-candidate-p4@example.com';
const testMentorEmail = 'test-mentor-p4@example.com';
const testAdminEmail = 'test-admin-p4@example.com';
const testPassword = 'Password123!';

const runTests = async () => {
  let server;
  try {
    await connectDB();
    console.log('Cleaning up previous test database records...');

    const testUsers = await User.find({ email: { $in: [testCandidateEmail, testMentorEmail, testAdminEmail] } });
    const testUserIds = testUsers.map(u => u._id);

    await User.deleteMany({ _id: { $in: testUserIds } });
    await Company.deleteMany({ name: 'Test Company Phase 4' });

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
    let mentorId = '';
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
        name: 'Test Candidate P4',
        email: testCandidateEmail,
        password: testPassword,
        role: 'candidate',
      }),
    });
    const regCandData = await regCandRes.json();
    candidateId = regCandData.data.user._id;

    // Register Mentor
    const regMentorRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Mentor P4',
        email: testMentorEmail,
        password: testPassword,
        role: 'mentor',
      }),
    });
    const regMentorData = await regMentorRes.json();
    mentorId = regMentorData.data.user._id;

    // Register Admin
    await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin P4',
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
        name: 'Test Company Phase 4',
        industry: 'Testing Services',
        website: 'https://testcompany4.com',
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
        title: 'Automation QA Engineer',
        companyId,
        location: 'Bengaluru',
        workMode: 'On-site',
        jobType: 'Full-Time',
        requiredSkills: [reactSkillId],
        description: 'Quality assurance testing using automation scripts.',
      }),
    });
    jobId = (await jobRes.json()).data._id;

    // Create Candidate Profile (Required before applying to any job)
    await fetch(`${BASE_URL}/candidate/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({
        preferredRole: 'QA Engineer',
        education: [{
          institution: 'State Engineering College',
          degree: 'B.E.',
          fieldOfStudy: 'Electrical Engineering',
          startYear: 2021,
        }],
      }),
    });

    console.log(`Setup complete. Company: ${companyId}, Job: ${jobId}, React Skill: ${reactSkillId}`);

    // ============================================
    // TEST 2: Job Applications
    // ============================================
    console.log('\n--- TEST 2: Job Application & Duplicate Safeguards ---');

    // Candidate applies to Job
    const applyRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({ jobId, studentRemarks: 'Interested in automation testing' }),
    });
    const applyData = await applyRes.json();
    if (applyRes.status !== 201) throw new Error(`Application failed: ${JSON.stringify(applyData)}`);
    applicationId = applyData.data._id;
    console.log(`Candidate applied to job. Application ID: ${applicationId}`);

    // Verify duplicate checks block secondary application
    const dupRes = await fetch(`${BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${candidateToken}` },
      body: JSON.stringify({ jobId, studentRemarks: 'Duplicate attempt' }),
    });
    console.log(`Duplicate application status: ${dupRes.status} (Expected: 409)`);
    if (dupRes.status !== 409) throw new Error('Duplicate application bypass safeguard error');

    // ============================================
    // TEST 3: Interview Tracker
    // ============================================
    console.log('\n--- TEST 3: Scheduling & Scoring Interview Rounds ---');

    // Mentor schedules Interview round
    const scheduleRes = await fetch(`${BASE_URL}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mentorToken}` },
      body: JSON.stringify({
        candidateId,
        jobId,
        round: 1,
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        type: 'Technical',
      }),
    });
    const scheduleData = await scheduleRes.json();
    if (scheduleRes.status !== 201) throw new Error(`Scheduling failed: ${JSON.stringify(scheduleData)}`);
    interviewId = scheduleData.data._id;
    console.log(`Scheduled interview round. ID: ${interviewId}`);

    // Mentor score submission
    const scoreRes = await fetch(`${BASE_URL}/interviews/${interviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mentorToken}` },
      body: JSON.stringify({
        score: 9,
        feedback: 'Excellent Javascript knowledge and code cleanliness.',
        result: 'Selected',
      }),
    });
    const scoreData = await scoreRes.json();
    if (scoreRes.status !== 200) throw new Error('Failed to log interview score');
    console.log(`Interview scoring updated: ${scoreData.data.result} with score ${scoreData.data.score}/10`);

    // ============================================
    // TEST 4: Mentor Notes
    // ============================================
    console.log('\n--- TEST 4: Logging Mentor Notes ---');

    // General note
    const noteGenRes = await fetch(`${BASE_URL}/mentor-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mentorToken}` },
      body: JSON.stringify({
        candidateId,
        text: 'Student has high code quality interest.',
        type: 'General',
      }),
    });
    if (noteGenRes.status !== 201) throw new Error('Failed to create general mentor note');

    // Skill-scoped note
    const noteSkillRes = await fetch(`${BASE_URL}/mentor-notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mentorToken}` },
      body: JSON.stringify({
        candidateId,
        text: 'Weak in Redux, needs more practice.',
        type: 'Skill',
        skillId: reactSkillId,
      }),
    });
    if (noteSkillRes.status !== 201) throw new Error('Failed to create skill-scoped mentor note');
    console.log('Mentor notes logged successfully.');

    // ============================================
    // TEST 5: Detailed Timeline progress & withdraws
    // ============================================
    console.log('\n--- TEST 5: Application Timeline History & Withdrawal ---');

    // Candidate reads application detail
    const getAppDetail = await fetch(`${BASE_URL}/applications/${applicationId}`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const appDetailData = await getAppDetail.json();
    console.log(`Application status: ${appDetailData.data.status}. History logs length: ${appDetailData.data.statusHistory.length}`);
    if (appDetailData.data.statusHistory.length !== 1) throw new Error('Invalid statusHistory count');

    // Mentor updates application status to Shortlisted
    const statusUpdateRes = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mentorToken}` },
      body: JSON.stringify({ status: 'Shortlisted' }),
    });
    const statusUpdateData = await statusUpdateRes.json();
    console.log(`Application updated by mentor to: ${statusUpdateData.data.status}. Timeline log count: ${statusUpdateData.data.statusHistory.length}`);
    if (statusUpdateData.data.statusHistory.length !== 2) throw new Error('Status history timeline failure');

    // Candidate withdraws application
    const withdrawRes = await fetch(`${BASE_URL}/applications/${applicationId}/withdraw`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const withdrawData = await withdrawRes.json();
    console.log(`Application status after candidate withdrawal: ${withdrawData.data.status}. Final timeline logs: ${withdrawData.data.statusHistory.length}`);
    if (withdrawData.data.status !== 'Withdrawn' || withdrawData.data.statusHistory.length !== 3) {
      throw new Error('Candidate application withdrawal failed');
    }

    // Cleanup
    await Interview.findByIdAndDelete(interviewId);
    await MentorNote.deleteMany({ candidate: candidateId });
    await Application.findByIdAndDelete(applicationId);
    await Job.findByIdAndDelete(jobId);
    await CandidateProfile.findOneAndDelete({ user: candidateId });
    await Company.findByIdAndDelete(companyId);
    console.log('Cleaned up test documents.');

    console.log('\n========================================');
    console.log('ALL PHASE 4 VERIFICATION TESTS PASSED!');
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
