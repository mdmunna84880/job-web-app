import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import app from '../app.js';
import User from '../features/auth/auth.model.js';
import Company from '../features/companies/company.model.js';
import Job from '../features/jobs/job.model.js';
import Skill from '../features/skills/skill.model.js';

dotenv.config();

const PORT = 8002;
const BASE_URL = `http://localhost:${PORT}/api`;

const testCandidateEmail = 'test-candidate-p3@example.com';
const testAdminEmail = 'test-admin-p3@example.com';
const testPassword = 'Password123!';

const runTests = async () => {
  let server;
  try {
    await connectDB();
    console.log('Cleaning up previous test database records...');

    // Clear previous runs
    const testUsers = await User.find({ email: { $in: [testCandidateEmail, testAdminEmail] } });
    const testUserIds = testUsers.map(u => u._id);

    await User.deleteMany({ _id: { $in: testUserIds } });
    await Company.deleteMany({ name: 'Test Company Phase 3' });
    
    // Find matching test companies to remove jobs for
    const oldCompanies = await Company.find({ name: 'Test Company Phase 3' }).select('_id');
    const oldCompanyIds = oldCompanies.map(c => c._id);
    await Job.deleteMany({ company: { $in: oldCompanyIds } });

    console.log('Starting test server on port', PORT);
    server = app.listen(PORT);

    // Wait a brief moment for binding
    await new Promise(resolve => setTimeout(resolve, 500));

    let candidateToken = '';
    let adminToken = '';
    let companyId = '';
    let reactSkillId = '';
    let nodeSkillId = '';
    let cssSkillId = '';
    let job1Id = '';
    let job2Id = '';

    // ============================================
    // TEST 1: Register and Login Candidate & Admin
    // ============================================
    console.log('\n--- TEST 1: User Registration and Login ---');

    const regCandRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Candidate Phase 3',
        email: testCandidateEmail,
        password: testPassword,
        phone: '9876543210',
        role: 'candidate',
      }),
    });
    const regCandData = await regCandRes.json();
    if (regCandRes.status !== 201) throw new Error(`Candidate registration failed: ${JSON.stringify(regCandData)}`);
    console.log('Candidate registered successfully.');

    const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin Phase 3',
        email: testAdminEmail,
        password: testPassword,
        role: 'admin',
      }),
    });
    const regAdminData = await regAdminRes.json();
    if (regAdminRes.status !== 201) throw new Error(`Admin registration failed: ${JSON.stringify(regAdminData)}`);
    console.log('Admin registered successfully.');

    // Login Candidate
    const logCandRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCandidateEmail, password: testPassword }),
    });
    const logCandData = await logCandRes.json();
    candidateToken = logCandData.token;
    console.log('Candidate logged in.');

    // Login Admin
    const logAdminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testPassword }),
    });
    const logAdminData = await logAdminRes.json();
    adminToken = logAdminData.token;
    console.log('Admin logged in.');

    // ============================================
    // TEST 2: Company CRUD operations
    // ============================================
    console.log('\n--- TEST 2: Company Management ---');

    // Candidate attempts to create company (Should fail - 403)
    const failCompRes = await fetch(`${BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({
        name: 'Test Company Phase 3',
        description: 'Tech hiring test',
        industry: 'Technology',
        website: 'https://testcompany3.com',
        size: '51-200',
      }),
    });
    console.log(`Candidate create company status: ${failCompRes.status} (Expected: 403)`);
    if (failCompRes.status !== 403) throw new Error('Candidate was allowed to create a Company');

    // Admin creates company (Should succeed - 201)
    const successCompRes = await fetch(`${BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Test Company Phase 3',
        description: 'Tech hiring test',
        industry: 'Technology',
        website: 'https://testcompany3.com',
        size: '51-200',
      }),
    });
    const successCompData = await successCompRes.json();
    if (successCompRes.status !== 201) throw new Error(`Admin failed to create Company: ${JSON.stringify(successCompData)}`);
    companyId = successCompData.data._id;
    console.log(`Admin created company successfully. ID: ${companyId}`);

    // ============================================
    // TEST 3: Job Management & Skill References
    // ============================================
    console.log('\n--- TEST 3: Job Management ---');

    // Retrieve skill catalog IDs for validation mapping
    const skills = await Skill.find({ name: { $in: ['React', 'Node.js', 'CSS'] } });
    reactSkillId = skills.find(s => s.name === 'React')?._id.toString();
    nodeSkillId = skills.find(s => s.name === 'Node.js')?._id.toString();
    cssSkillId = skills.find(s => s.name === 'CSS')?._id.toString();

    console.log(`React ID: ${reactSkillId}, Node.js ID: ${nodeSkillId}, CSS ID: ${cssSkillId}`);

    // Create Job 1: Software Engineer (Remote, Full-Time, 80k-120k)
    const createJob1Res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Software Engineer',
        companyId,
        location: 'San Francisco',
        workMode: 'Remote',
        jobType: 'Full-Time',
        requiredSkills: [reactSkillId, nodeSkillId],
        salaryMin: 80000,
        salaryMax: 120000,
        eligibilityCriteria: 'B.Tech CS / Equivalent',
        description: 'Building modern backend systems and web applications.',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days out
      }),
    });
    const job1Data = await createJob1Res.json();
    if (createJob1Res.status !== 201) throw new Error(`Failed to create Job 1: ${JSON.stringify(job1Data)}`);
    job1Id = job1Data.data._id;
    console.log(`Created Job 1: Software Engineer. ID: ${job1Id}`);

    // Create Job 2: Frontend Engineer (Hybrid, Internship, 40k-60k)
    const createJob2Res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Frontend Engineer',
        companyId,
        location: 'New York',
        workMode: 'Hybrid',
        jobType: 'Internship',
        requiredSkills: [reactSkillId, cssSkillId],
        salaryMin: 40000,
        salaryMax: 60000,
        eligibilityCriteria: 'Undergrad student',
        description: 'Working with React and styling sheets.',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
    const job2Data = await createJob2Res.json();
    if (createJob2Res.status !== 201) throw new Error(`Failed to create Job 2: ${JSON.stringify(job2Data)}`);
    job2Id = job2Data.data._id;
    console.log(`Created Job 2: Frontend Engineer. ID: ${job2Id}`);

    // Candidate attempts to delete a job (Should fail - 403)
    const failDeleteJobRes = await fetch(`${BASE_URL}/jobs/${job2Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    console.log(`Candidate delete job status: ${failDeleteJobRes.status} (Expected: 403)`);
    if (failDeleteJobRes.status !== 403) throw new Error('Candidate was allowed to delete a job listing');

    // ============================================
    // TEST 4: Advanced Search and Filter
    // ============================================
    console.log('\n--- TEST 4: Job Search and Filtering ---');

    // Search: "Frontend"
    const searchRes = await fetch(`${BASE_URL}/jobs?search=Frontend`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const searchData = await searchRes.json();
    console.log(`Search for "Frontend" returned ${searchData.data.length} job(s). (Expected: 1)`);
    if (searchData.data.length !== 1 || searchData.data[0].title !== 'Frontend Engineer') {
      throw new Error('Search filtering on title failed');
    }

    // Work Mode: "Remote"
    const workModeRes = await fetch(`${BASE_URL}/jobs?workMode=Remote`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const workModeData = await workModeRes.json();
    console.log(`Filter for "Remote" returned ${workModeData.data.length} job(s). (Expected: 1)`);
    if (workModeData.data.length !== 1 || workModeData.data[0].title !== 'Software Engineer') {
      throw new Error('Filter on workMode failed');
    }

    // Salary Min: Overlap Check (e.g. salaryMin = 70000, returns Software Engineer)
    const salaryMinRes = await fetch(`${BASE_URL}/jobs?salaryMin=70000`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const salaryMinData = await salaryMinRes.json();
    console.log(`Filter for salaryMin >= 70000 returned ${salaryMinData.data.length} job(s). (Expected: 1)`);
    if (salaryMinData.data.length !== 1 || salaryMinData.data[0].title !== 'Software Engineer') {
      throw new Error('Salary range overlap filter (min) failed');
    }

    // Skills: require React (should return both jobs)
    const skillsRes = await fetch(`${BASE_URL}/jobs?skills=${reactSkillId}`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const skillsData = await skillsRes.json();
    console.log(`Filter for React skill returned ${skillsData.data.length} job(s). (Expected: 2)`);
    if (skillsData.data.length !== 2) {
      throw new Error('Filtering by skill IDs failed');
    }

    // Pagination: Limit = 1, page = 1
    const paginationRes = await fetch(`${BASE_URL}/jobs?limit=1&page=1`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const paginationData = await paginationRes.json();
    console.log(`Pagination page limit checks: returned ${paginationData.data.length} records. Total counts: ${paginationData.pagination.total}`);
    if (paginationData.data.length !== 1 || paginationData.pagination.total !== 2) {
      throw new Error('Pagination limits or total counters failed');
    }

    // ============================================
    // TEST 5: Detailed Job View & Updates
    // ============================================
    console.log('\n--- TEST 5: Detailed Job view & status updates ---');

    const detailRes = await fetch(`${BASE_URL}/jobs/${job1Id}`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const detailData = await detailRes.json();
    console.log(`Fetched Job Detail. Company name: ${detailData.data.company.name}, Required skills list length: ${detailData.data.requiredSkills.length}`);
    if (!detailData.data.company.website || detailData.data.requiredSkills[0].name === undefined) {
      throw new Error('Company populate details or required skills details failed');
    }

    // Admin updates Job Status to On Hold
    const updateRes = await fetch(`${BASE_URL}/jobs/${job1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'On Hold' }),
    });
    const updateData = await updateRes.json();
    console.log(`Job status updated by Admin to: ${updateData.data.status}`);
    if (updateData.data.status !== 'On Hold') {
      throw new Error('Failed to update job status');
    }

    // Clean up
    await Job.findByIdAndDelete(job1Id);
    await Job.findByIdAndDelete(job2Id);
    await Company.findByIdAndDelete(companyId);
    console.log('Cleaned up test Job and Company documents.');

    console.log('\n========================================');
    console.log('ALL PHASE 3 VERIFICATION TESTS PASSED!');
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
