import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import app from '../app.js';
import User from '../features/auth/auth.model.js';
import CandidateProfile from '../features/candidate/candidate.model.js';
import CandidateSkill from '../features/candidate/candidateSkill.model.js';
import Skill from '../features/skills/skill.model.js';

dotenv.config();

const PORT = 8001;
const BASE_URL = `http://localhost:${PORT}/api`;

const testCandidateEmail = 'test-candidate-p2@example.com';
const testAdminEmail = 'test-admin-p2@example.com';
const testPassword = 'Password123!';

const runTests = async () => {
  let server;
  try {
    await connectDB();
    console.log('Cleaning up previous test database records...');
    
    // Clear out test users, profiles, and skills from previous runs
    const testUsers = await User.find({ email: { $in: [testCandidateEmail, testAdminEmail] } });
    const testUserIds = testUsers.map(u => u._id);
    
    await User.deleteMany({ _id: { $in: testUserIds } });
    await CandidateProfile.deleteMany({ user: { $in: testUserIds } });
    await CandidateSkill.deleteMany({ user: { $in: testUserIds } });
    await Skill.deleteMany({ name: 'GraphQL' });

    console.log('Starting test server on port', PORT);
    server = app.listen(PORT);

    // Wait a brief moment for the server to bind
    await new Promise(resolve => setTimeout(resolve, 500));

    let candidateToken = '';
    let adminToken = '';
    let candidateUserId = '';
    let reactSkillId = '';
    let nodeSkillId = '';

    // ============================================
    // TEST 1: Register and Login Candidate & Admin
    // ============================================
    console.log('\n--- TEST 1: User Registration and Login ---');

    const regCandRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Candidate Phase 2',
        email: testCandidateEmail,
        password: testPassword,
        phone: '1234567890',
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
        name: 'Test Admin Phase 2',
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
    candidateUserId = logCandData.data.user._id;
    console.log('Candidate logged in. Token acquired.');

    // Login Admin
    const logAdminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testAdminEmail, password: testPassword }),
    });
    const logAdminData = await logAdminRes.json();
    adminToken = logAdminData.token;
    console.log('Admin logged in. Token acquired.');

    // ============================================
    // TEST 2: Master Skills Catalog API
    // ============================================
    console.log('\n--- TEST 2: Master Skills Catalog API ---');

    // Retrieve skills pre-seeded catalog
    const skillsRes = await fetch(`${BASE_URL}/skills`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const skillsData = await skillsRes.json();
    if (skillsRes.status !== 200) throw new Error('Could not fetch skills catalog');
    console.log(`Fetched ${skillsData.data.length} skills from catalog.`);

    // Find React and Node.js skills
    const reactSkill = skillsData.data.find(s => s.name === 'React');
    const nodeSkill = skillsData.data.find(s => s.name === 'Node.js');
    reactSkillId = reactSkill?._id;
    nodeSkillId = nodeSkill?._id;

    console.log(`React Skill ID: ${reactSkillId}, Node.js Skill ID: ${nodeSkillId}`);

    // Candidate attempts to create a skill (Should be blocked - 403)
    const blockRes = await fetch(`${BASE_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ name: 'GraphQL', category: 'Backend' }),
    });
    console.log(`Candidate create skill status: ${blockRes.status} (Expected: 403)`);
    if (blockRes.status !== 403) throw new Error('Candidate was allowed to create a master skill');

    // Admin creates a skill (Should succeed - 201)
    const createSkillRes = await fetch(`${BASE_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ name: 'GraphQL', category: 'Backend' }),
    });
    console.log(`Admin create skill status: ${createSkillRes.status} (Expected: 201)`);
    if (createSkillRes.status !== 201) throw new Error('Admin failed to create a master skill');

    // ============================================
    // TEST 3: Candidate Profile API
    // ============================================
    console.log('\n--- TEST 3: Candidate Profile API ---');

    const profilePayload = {
      preferredRole: 'Backend Developer',
      education: [{
        institution: 'Test University',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science',
        startYear: 2022,
        endYear: 2026,
        gpa: 8.5,
      }],
      projects: [{
        title: 'E-commerce platform',
        description: 'A NodeJS backend application',
        technologies: ['Node.js', 'Express', 'MongoDB'],
        link: 'https://github.com/test/e-commerce',
      }],
      resumeUrl: 'https://drive.google.com/test-resume',
      linkedinUrl: 'https://linkedin.com/in/test-profile',
      githubUrl: 'https://github.com/test-profile',
    };

    const upsertRes = await fetch(`${BASE_URL}/candidate/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify(profilePayload),
    });
    const upsertData = await upsertRes.json();
    if (upsertRes.status !== 200) throw new Error(`Profile upsert failed: ${JSON.stringify(upsertData)}`);
    console.log(`Candidate profile upserted successfully. Completion score: ${upsertData.data.profileCompletion}%`);

    if (upsertData.data.profileCompletion !== 100) {
      throw new Error(`Profile completion calculation error. Expected 100, got ${upsertData.data.profileCompletion}`);
    }

    // Get candidate profile
    const getMeRes = await fetch(`${BASE_URL}/candidate/profile/me`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const getMeData = await getMeRes.json();
    if (getMeRes.status !== 200) throw new Error('Failed to get candidate profile details');
    console.log(`Fetched candidate profile. User name: ${getMeData.data.user.name}`);

    // ============================================
    // TEST 4: Candidate Skills & Level History
    // ============================================
    console.log('\n--- TEST 4: Candidate Skills API & Rating History ---');

    // Self-report React Skill as Intermediate
    const addSkill1 = await fetch(`${BASE_URL}/candidate/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ skillId: reactSkillId, proficiencyLevel: 'Intermediate' }),
    });
    const addSkill1Data = await addSkill1.json();
    if (addSkill1.status !== 200) throw new Error(`Failed to rate React skill: ${JSON.stringify(addSkill1Data)}`);
    console.log('Rated React skill: Intermediate.');

    // Update React Skill to Advanced (History tracking check)
    const addSkill2 = await fetch(`${BASE_URL}/candidate/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${candidateToken}`,
      },
      body: JSON.stringify({ skillId: reactSkillId, proficiencyLevel: 'Advanced' }),
    });
    const addSkill2Data = await addSkill2.json();
    if (addSkill2.status !== 200) throw new Error(`Failed to update React skill rating: ${JSON.stringify(addSkill2Data)}`);
    console.log('Updated React skill to Advanced.');
    
    // Check level history length
    if (addSkill2Data.data.history.length !== 2) {
      throw new Error(`History tracking failed. Expected history length 2, got ${addSkill2Data.data.history.length}`);
    }
    console.log('Skill rating history tracks correctly.');

    // ============================================
    // TEST 5: Skill Gap Logic (General Role)
    // ============================================
    console.log('\n--- TEST 5: General Skill Gap Logic ---');

    // Preferred role was set to Backend Developer (Standard skills: Node.js, Express, MongoDB, JavaScript, Problem Solving)
    // React is rated (not required for Backend Developer, so it won't impact Backend gaps directly, but test candidate skills have it)
    const gapRes = await fetch(`${BASE_URL}/candidate/skills/gap/role`, {
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    const gapData = await gapRes.json();
    if (gapRes.status !== 200) throw new Error(`Gap analysis call failed: ${JSON.stringify(gapData)}`);

    console.log(`General target role: ${gapData.data.targetRole}`);
    console.log(`Missing skills: ${JSON.stringify(gapData.data.missingSkills)}`);
    console.log(`Needs improvement skills: ${JSON.stringify(gapData.data.needsImprovement)}`);
    console.log(`Proficient skills: ${JSON.stringify(gapData.data.proficientSkills)}`);

    if (!gapData.data.missingSkills.includes('Node.js')) {
      throw new Error('Node.js should be marked as missing for Backend Developer preferred role');
    }
    console.log('Skill gap calculations are accurate.');

    // Cleanup added rating for react
    const deleteSkillRes = await fetch(`${BASE_URL}/candidate/skills/${reactSkillId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${candidateToken}` },
    });
    if (deleteSkillRes.status !== 200) throw new Error('Failed to delete skill rating');
    console.log('Cleaned up React skill rating.');

    console.log('\n========================================');
    console.log('ALL PHASE 2 VERIFICATION TESTS PASSED!');
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
