# Backend Documentation — Placement Readiness & Job Application Tracker

Welcome to the backend API documentation. This guide is designed for frontend developers and new maintainers to get up and running quickly. It details the architecture, local setup, security features, validation structures, and details endpoints across our **5 developmental phases**.

---

## 1. Technical Stack & Architecture

* **Runtime**: Node.js (ES Modules, `import`/`export`)
* **Framework**: Express.js (Express 5 async promise-rejection engine)
* **Database**: MongoDB (Mongoose Object Modeling)
* **Validation**: Joi (structured field-level validator)
* **Design Pattern**: **Vertical Slices (Feature-based Modular Structure)**

Instead of grouping files by technical layer (all routes in one folder, all controllers in another), codebase files are grouped by business concern (features) in `backend/features/`:

```
backend/
├── config/              # DB connection & validated env configuration
├── features/
│   ├── auth/            # Registration, Login, Session tokens
│   ├── skills/          # Master catalog skills
│   ├── candidate/       # Profile management & skill gap analysis
│   ├── companies/       # Company profiles
│   ├── jobs/            # Job postings & filters
│   ├── applications/    # Job application tracking & timelines
│   ├── interviews/      # Interview scheduling & scoring
│   ├── mentor-notes/    # Contextual student logging
│   ├── analytics/       # Aggregated dashboards
│   └── admin/           # Platform user controls
├── middleware/          # Security headers, rate limiters, auth guards
├── shared/              # Centralized enums & validators
└── utils/               # AppError classes & Joi format helpers
```

---

## 2. Frontend Integration & Security Guidelines

### Authentication & Cookies
The backend handles authentication using a hybrid token approach:
1. **Access Token**: Sent as a short-lived bearer token (`token` in JSON login response). The client must store this in-memory and attach it as a header: `Authorization: Bearer <token>`.
2. **Refresh Token**: Sent automatically in an `httpOnly`, `secure` (production-only), `sameSite: 'lax'` cookie. The client does not read this token; the browser forwards it automatically on refresh calls.

### Validation Handling (Joi Error Object)
When a Joi validation fails (status code `400`), the backend returns a structured key-value error payload rather than a generic string. This allows you to map specific messages directly to individual form fields.

**Example Joi Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "\"email\" must be a valid email",
    "password": "\"password\" length must be at least 8 characters long"
  }
}
```

---

## 3. Five-Phase API Reference

All requests must use `Content-Type: application/json`. Endpoints marked with 🔑 require authentication.

### Phase 1: Authentication & User Administration

#### `POST /api/auth/register`
Creates a user account on the platform.
* **Payload**:
  ```json
  {
    "name": "Alex Carter",
    "email": "alex@example.com",
    "password": "Password123!",
    "role": "candidate" // candidate, mentor, admin
  }
  ```
* **Response (201 Created)**: Returns the user object (password excluded).

#### `POST /api/auth/login`
Logs in a user and sets a secure `refreshToken` cookie.
* **Payload**:
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...", // Short-lived Access Token
    "data": { "user": { "_id": "...", "name": "Alex Carter", "role": "candidate" } }
  }
  ```

#### `POST /api/auth/refresh`
Generates a new access token using the `refreshToken` cookie.
* **Response (200 OK)**: Returns a fresh `{ token }`.

#### `POST /api/auth/logout`
Clears the `refreshToken` cookie.

---

### Phase 2: Candidate Profiles & Catalog Skills

#### `POST /api/candidate/profile` 🔑
Creates or updates the logged-in candidate's profile.
* **Payload**:
  ```json
  {
    "preferredRole": "Frontend Developer",
    "education": [{
      "institution": "Tech University",
      "degree": "B.S. Computer Science",
      "fieldOfStudy": "Software Engineering",
      "startYear": 2021
    }]
  }
  ```
* **Response (200 OK)**: Returns the profile, automatically recalculating `profileCompletion` percentage.

#### `GET /api/candidate/profile/me` 🔑
Retrieves the logged-in candidate's profile.

#### `POST /api/candidate/skills` 🔑
Log a skill proficiency or update history rating.
* **Payload**:
  ```json
  {
    "skillId": "6a538675809efb1b323933dc",
    "proficiencyLevel": "Intermediate" // Beginner, Intermediate, Advanced, Placement Ready
  }
  ```

#### `GET /api/candidate/skills/gap/role` 🔑
Analyzes candidate's rated skills against their `preferredRole` target checklist.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "targetRole": "Frontend Developer",
      "missingSkills": ["CSS", "HTML"],
      "needsImprovement": [{ "name": "React", "currentLevel": "Beginner" }],
      "proficientSkills": [{ "name": "JavaScript", "currentLevel": "Advanced" }]
    }
  }
  ```

#### `GET /api/candidate/skills/gap/job/:jobId` 🔑
Compares candidate's rated skills directly against a specific job's requirement list.

---

### Phase 3: Company & Job Directory

#### `POST /api/companies` 🔑 (Mentors & Admins only)
Registers a new company.

#### `GET /api/companies` 🔑
Retrieves a paginated list of registered companies.

#### `POST /api/jobs` 🔑 (Mentors & Admins only)
Publishes a new job posting.
* **Payload**:
  ```json
  {
    "title": "Software Engineer Intern",
    "companyId": "6a538e85bc5c1beb0d4faf34",
    "location": "Bengaluru",
    "workMode": "On-site", // On-site, Hybrid, Remote
    "jobType": "Internship", // Full-Time, Part-Time, Contract, Internship
    "requiredSkills": ["6a538675809efb1b323933dc"],
    "salary": { "min": 30000, "max": 45000 }
  }
  ```

#### `GET /api/jobs`
Lists job postings with paginated filters.
* **Query Parameters**:
  * `search`: Matches title/description/company name.
  * `requiredSkills`: Comma-separated skill IDs.
  * `minSalary` / `maxSalary`: Filter by range.
  * `workMode` / `jobType`: Filter by enums.

---

### Phase 4: Applications, Interviews & Mentor Notes

#### `POST /api/applications` 🔑 (Candidates only)
Applies for an active job.
* **Payload**: `{ "jobId": "...", "studentRemarks": "..." }`
* **Rules**: Blocks duplicate submissions (409 Conflict) and checks profile completeness.

#### `PATCH /api/applications/:id/status` 🔑 (Mentors & Admins only)
Changes application status (e.g. `Shortlisted`, `Offer Received`). Automatically appends to the `statusHistory` array.

#### `PATCH /api/applications/:id/withdraw` 🔑 (Candidates only)
Sets application status to `Withdrawn`.

#### `POST /api/interviews` 🔑 (Mentors & Admins only)
Schedules an interview round.
* **Payload**:
  ```json
  {
    "candidateId": "...",
    "jobId": "...",
    "round": 1,
    "date": "2026-07-15T10:00:00Z",
    "type": "Technical" // Technical, HR, Managerial, Coding Assessment, Assignment
  }
  ```

#### `PUT /api/interviews/:id` 🔑 (Mentors & Admins only)
Logs scores and feedback on a scheduled round.
* **Payload**: `{ "score": 9, "feedback": "Solid core coding skills", "result": "Selected" }`

#### `POST /api/mentor-notes` 🔑 (Mentors & Admins only)
Logs a mentor note for a student. Supports scoping to general, application, or skill.
* **Payload**:
  ```json
  {
    "candidateId": "...",
    "text": "Excellent logic skills.",
    "type": "Skill", // General, Application, Skill
    "skillId": "..." // Required if type is 'Skill'
  }
  ```

---

### Phase 5: Analytical Dashboards & Admin Operations

#### `GET /api/analytics/candidate` 🔑 (Candidates only)
Returns candidate dashboard data.
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "profileCompletion": 85,
      "readinessStatus": "Placement Ready",
      "totalApplied": 3,
      "upcomingInterviews": 1,
      "applicationsByStatus": [{ "status": "Applied", "count": 2 }]
    }
  }
  ```

#### `GET /api/analytics/mentor` 🔑 (Mentors & Admins only)
Returns student readiness ratios, application status counts, and weekly interviews.

#### `GET /api/analytics/admin` 🔑 (Admins only)
Returns platform-wide metrics (role distributions, conversion rates, and monthly application trends).

#### `GET /api/admin/users` 🔑 (Admins only)
Lists all users on the platform with search and role filters.

#### `PATCH /api/admin/users/:id/toggle-active` 🔑 (Admins only)
Toggles account status (`isActive: true/false`). Deactivated users are immediately blocked from making requests.

#### `PATCH /api/admin/users/:id/role` 🔑 (Admins only)
Updates a user's role. Prevents administrators from revoking their own admin permissions.

---

## 4. Local Development

1. **Clone the Repo** and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   * Create a `.env` file based on `.env.example`:
     ```env
     PORT=8000
     MONGO_URI=mongodb://127.0.0.1:27017/placement_tracker
     JWT_SECRET=your_jwt_secret_key_here
     NODE_ENV=development
     ```
4. **Seed Skill Catalog**:
   ```bash
   npm run seed
   ```
5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
6. **Run Verification Test Suite**:
   ```bash
   node scratch/verify-phase5.js
   ```
