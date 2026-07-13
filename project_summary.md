# Job-Web-App
### A Full-Stack Web App by **Md Munna** | AlmaBetter AlmaX Placement Project

---

> [!IMPORTANT]
> This document is a living reference. Any time you want to recall what this project is, what problem it solves, what features it has, or how it is built — this is the file to open.

---

## 1. What Problem Does It Solve?

Placement cells and boot camps struggle to answer a simple question: **"Is this student actually ready to be placed?"**

Traditional tracking relies on spreadsheets, which:
- Have no visibility into student skill gaps
- Cannot track job applications end-to-end in one place
- Give mentors no dashboard to measure cohort readiness
- Give admins no system-wide analytics or access controls

**Job-Web-App** solves all of these by giving three types of users — **Candidates**, **Mentors**, and **Admins** — dedicated, role-based dashboards that work together as a single ecosystem.

---

## 2. The Solution in One Sentence

> A role-based, full-stack web platform where students build placement-ready profiles, track skill gaps against their target role, apply to jobs, attend interviews, and receive mentor guidance — all tracked in real time, with visual analytics for every stakeholder.

---

## 3. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **Redux Toolkit + React-Redux** | Global state management |
| **React Router DOM v7** | Client-side routing & protected routes |
| **React Hook Form + Joi** | Form handling & validation |
| **Axios** | HTTP client (with silent token refresh interceptors) |
| **Recharts** | Data visualisation (Bar, Pie, Line charts) |
| **React Icons (Feather)** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js (ES Modules)** | Runtime |
| **Express.js v5** | Web framework (async promise rejection engine) |
| **MongoDB + Mongoose v9** | Database & Object Modelling |
| **JWT (jsonwebtoken)** | Authentication (access + refresh token strategy) |
| **bcryptjs** | Password hashing |
| **Joi** | Structured field-level request validation |
| **Helmet** | Security HTTP headers |
| **CORS** | Cross-origin request control |
| **Morgan** | HTTP request logger |
| **express-rate-limit** | API abuse protection |
| **cookie-parser** | HttpOnly cookie parsing for refresh tokens |

### Deployment
| Part | Platform |
|---|---|
| Frontend | **Vercel** (`vercel.json` configured) |
| Backend | Can run on any Node.js host (Render, Railway, etc.) |

---

## 4. Architecture

### Backend — Vertical Slice (Feature-Based)
Each feature is a self-contained module with its own **routes → controller → service → model** stack. This is the **best practice** for maintainable APIs.

```
backend/
├── config/              # DB connection & validated env config
├── features/
│   ├── auth/            # Registration, Login, JWT tokens
│   ├── skills/          # Skills master catalog
│   ├── candidate/       # Candidate profiles & skill gap analysis
│   ├── companies/       # Company profiles
│   ├── jobs/            # Job postings with filters
│   ├── applications/    # Job application lifecycle tracking
│   ├── interviews/      # Interview scheduling & scoring
│   ├── mentor-notes/    # Contextual mentor notes on students
│   ├── analytics/       # Role-specific aggregated dashboards
│   └── admin/           # Platform-wide user management
├── middleware/           # Auth guards, error handler, rate limiter
├── shared/               # Enums (roles, statuses) & shared validators
└── utils/                # AppError, RateLimiter, Joi helpers
```

### Frontend — Page-Based with Shared Redux Store

```
frontend/src/
├── pages/
│   ├── auth/              # Login, Register
│   └── dashboard/
│       ├── CandidateDashboard.jsx   # Profile builder
│       ├── SkillsDashboard.jsx      # Skill gap analysis
│       ├── JobsBoard.jsx            # Job discovery & posting
│       ├── JobDetail.jsx            # Job detail + apply
│       ├── CandidateApplications.jsx # My applications tracker
│       ├── CandidateInterviews.jsx  # Interview schedule
│       ├── MentorDashboard.jsx      # Coach console
│       └── AdminDashboard.jsx       # System admin portal
├── components/
│   ├── common/            # Button, Card, Input (reusable)
│   ├── dashboard/         # CompaniesTab, JobsTab (shared across roles)
│   ├── layout/            # CandidateLayout (sidebar nav)
│   └── routes/            # ProtectedRoute (role-based guard)
├── store/slices/          # 8 Redux slices (one per domain)
├── utils/                 # Axios api.js (with auth interceptor)
└── context/               # Auth context
```

---

## 5. Authentication System

The app uses a **hybrid token strategy** — a security best practice:

1. **Access Token**: Short-lived JWT. Stored **in-memory** (not localStorage). Attached as `Authorization: Bearer <token>` on every request.
2. **Refresh Token**: Long-lived JWT. Stored as an **HttpOnly, Secure, SameSite=Lax cookie** — JavaScript cannot read it. Browser sends it automatically on `/api/auth/refresh`.
3. **Silent Refresh on startup**: When the app loads, it calls `/api/auth/refresh` to restore the session without requiring the user to log in again.
4. **Role-Based Protected Routes**: `ProtectedRoute` component checks the user's role and redirects unauthorized access back to `/login`.

---

## 6. User Roles

| Role | Access | Description |
|---|---|---|
| **Candidate** | `/dashboard/candidate/*` | Students seeking placement |
| **Mentor** | `/dashboard/mentor` | Career coaches managing cohorts |
| **Admin** | `/dashboard/admin` | Platform administrators |

---

## 7. Feature-by-Feature Breakdown

### 7.1 Auth Pages (`/login`, `/register`)
- Secure **JWT login** & registration
- Role selection during registration (`candidate`, `mentor`, `admin`)
- Form validation with Joi — field-level error messages shown inline
- Silent session restore on page refresh (no re-login needed)

---

### 7.2 Candidate — My Placement Profile (`/dashboard/candidate`)

**The core of the placement readiness system.**

| Feature | Details |
|---|---|
| **Profile Completion Score** | Calculated server-side as a % (0–100). Displayed as a coloured progress bar. |
| **Readiness Status** | Automatically computed as `"Placement Ready"` or `"Not Ready"` |
| **Readiness Checklist** | 6-step stepper: Preferred Role (+10%), Education (+20%), Projects (+20%), Resume URL (+20%), LinkedIn (+15%), GitHub (+15%) |
| **Target Role Selector** | Frontend Developer, Backend Developer, Full-Stack Developer, Data Analyst, QA Engineer |
| **Education History** | Dynamic list — add/remove university degrees with institution, degree, field, start year, end year, GPA |
| **Personal Projects** | Dynamic list — add/remove projects with title, URL, technologies (comma-separated), description |
| **Social Links** | Resume URL, LinkedIn, GitHub/Portfolio |
| **Associated Companies** | Select companies the user works at / co-founded — used to enable job posting |
| **Form Validation** | React Hook Form + Joi — field-level inline error messages |

---

### 7.3 Candidate — Skills & Gap Analysis (`/dashboard/candidate/skills`)

**The most technically impressive feature.**

| Feature | Details |
|---|---|
| **Skills Catalog** | Platform-wide skill catalog (seeded by admin) across categories |
| **Rate a Skill** | Modal to select a skill + proficiency: `Beginner → Intermediate → Advanced → Placement Ready` |
| **Skill Gap Analysis** | Server compares rated skills to the target role's required skill checklist |
| **Missing Skills** | Skills required for the role that the candidate hasn't rated at all — shown as red tags |
| **Needs Improvement** | Skills the candidate rated below "Advanced" — shown with current level badge |
| **Proficient & Ready** | Skills rated "Advanced" or "Placement Ready" — shown in green |
| **Readiness Gaps Chart** | Recharts **grouped bar chart** — "My Level" vs "Placement Standard" for every relevant skill |
| **Skill Directory Table** | Full log of all rated skills with category, proficiency badge, and delete action |

---

### 7.4 Candidate — Jobs Board (`/dashboard/candidate/jobs`)

| Feature | Details |
|---|---|
| **Paginated Job Listings** | Jobs displayed as cards (title, company, location, work mode, salary, skill tags) |
| **Search Bar** | Real-time search by job title, location, or company name |
| **Filter Sidebar** | Filter by: Work Mode (Remote/Hybrid/On-site), Job Type (Full-Time/Part-Time/Contract/Internship), Required Skill, Min/Max Salary |
| **Pagination** | Multi-page navigation for large result sets |
| **Post a Job (Modal)** | Candidates associated with a company can post job openings — full form with title, company, location, work mode, job type, description, deadline, salary range, eligibility, required skills multi-select |
| **View Details Button** | Navigate to full job detail page |

---

### 7.5 Candidate — Job Detail (`/dashboard/candidate/jobs/:jobId`)

| Feature | Details |
|---|---|
| **Full Job Description** | All job metadata: title, company, location, work mode, type, salary, deadline, eligibility |
| **Required Skills Display** | Tags for all skills the job requires |
| **Skill Gap vs Job** | Server-side comparison of the candidate's skills vs this specific job's requirements |
| **Apply Now** | One-click application with optional student remarks. Duplicate application is blocked (409 Conflict). Profile completeness is enforced. |

---

### 7.6 Candidate — My Applications (`/dashboard/candidate/applications`)

| Feature | Details |
|---|---|
| **Applications List** | All applications with status, company, job title |
| **Status History Timeline** | Every status change is timestamped and visible as a timeline (Applied → Shortlisted → Interview → Offer) |
| **Withdraw Application** | Candidate can withdraw any non-final application |
| **Status Badges** | Color-coded status indicators |

---

### 7.7 Candidate — Interviews (`/dashboard/candidate/interviews`)

| Feature | Details |
|---|---|
| **Interview Schedule** | List of all scheduled interview rounds |
| **Round Details** | Round number, type (Technical / HR / Managerial / Coding Assessment / Assignment), date/time |
| **Results Display** | Score, feedback, and result (Selected / Not Selected / Pending) |

---

### 7.8 Mentor Dashboard (`/dashboard/mentor`)

The Mentor Console has **4 tabs**:

#### Tab 1 — Overview Analytics
| Metric | Source |
|---|---|
| Total Candidates count | `/api/analytics/mentor` |
| Placement Ready Candidates count | `/api/analytics/mentor` |
| Not Ready Candidates count | `/api/analytics/mentor` |
| Interviews This Week count | `/api/analytics/mentor` |
| **Application Status Distribution** | Recharts **Donut Pie Chart** |
| **Company Application Volume** | Recharts **Bar Chart** — applications per company |

#### Tab 2 — Companies Management
- View, add, and edit registered companies (name, industry, location, website)

#### Tab 3 — Job Openings
- View all active job postings, add new jobs, manage existing ones

#### Tab 4 — My Profile
- Mentor's own profile: LinkedIn, GitHub, Resume/credentials, associated companies, education history, key projects & publications

---

### 7.9 Admin Dashboard (`/dashboard/admin`)

The System Admin Portal has **3 tabs**:

#### Tab 1 — Analytics & Users

**4 KPI Cards:**
| Metric | Description |
|---|---|
| Registered Users | Total users on the platform |
| Active Postings | Currently live job listings |
| Conversion Rate | Placement conversion % |
| Companies Linked | Total registered companies |

**2 Analytics Charts:**
| Chart | Type |
|---|---|
| Monthly Application Trends | Recharts **Line Chart** (time series) |
| User Role Distribution | Recharts **Donut Pie Chart** (candidate / mentor / admin) |

**User Management Directory Table:**
| Action | Description |
|---|---|
| Search | By name or email |
| Filter by Role | All / Candidate / Mentor / Admin |
| Role Change | Live dropdown to change any user's role |
| Block / Unblock | Toggle account `isActive` status. Deactivated users are immediately blocked. |
| Self-protection | Admin cannot deactivate their own account |
| Pagination | Multi-page user directory |

#### Tab 2 — Companies Management
- Full CRUD for company profiles

#### Tab 3 — Job Openings
- Full CRUD for job postings, mark active/closed

---

## 8. Backend API — 5 Development Phases

### Phase 1: Auth (`/api/auth/*`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create user account |
| `/api/auth/login` | POST | Login → sets refresh cookie + returns access token |
| `/api/auth/refresh` | POST | Get new access token from cookie |
| `/api/auth/logout` | POST | Clear refresh cookie |
| `/api/auth/me` | GET | Get current user profile |

### Phase 2: Candidates & Skills (`/api/candidate/*`, `/api/skills/*`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/candidate/profile` | POST | Create/update profile (auto-recalculates completion %) |
| `/api/candidate/profile/me` | GET | Get my profile |
| `/api/candidate/skills` | POST | Log a skill proficiency |
| `/api/candidate/skills/gap/role` | GET | **Gap analysis vs preferred role** |
| `/api/candidate/skills/gap/job/:jobId` | GET | **Gap analysis vs specific job** |
| `/api/skills` | GET | Full skills catalog |

### Phase 3: Companies & Jobs (`/api/companies/*`, `/api/jobs/*`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/companies` | POST | Register a company (mentor/admin) |
| `/api/companies` | GET | Paginated company list |
| `/api/jobs` | POST | Post a job (mentor/admin/candidate with company) |
| `/api/jobs` | GET | Paginated + filtered job listings |
| `/api/jobs/:id` | GET | Single job detail |

### Phase 4: Applications, Interviews & Notes (`/api/applications/*`, `/api/interviews/*`, `/api/mentor-notes/*`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/applications` | POST | Apply to a job (candidate only, blocks duplicates) |
| `/api/applications` | GET | List applications (filtered by role) |
| `/api/applications/:id` | GET | Application detail with status history |
| `/api/applications/:id/status` | PATCH | Update status + append to history (mentor/admin) |
| `/api/applications/:id/withdraw` | PATCH | Withdraw application (candidate) |
| `/api/interviews` | POST | Schedule interview round (mentor/admin) |
| `/api/interviews/:id` | PUT | Log score + feedback |
| `/api/mentor-notes` | POST | Add note (General / Application / Skill types) |

### Phase 5: Analytics & Admin (`/api/analytics/*`, `/api/admin/*`)
| Endpoint | Method | Description |
|---|---|---|
| `/api/analytics/candidate` | GET | Profile %, readiness, applications stats |
| `/api/analytics/mentor` | GET | Cohort readiness, application status breakdown, weekly interviews, company volume |
| `/api/analytics/admin` | GET | Platform totals, role distribution, monthly trends, conversion rate |
| `/api/admin/users` | GET | All users with search/role filter |
| `/api/admin/users/:id/toggle-active` | PATCH | Block/unblock user |
| `/api/admin/users/:id/role` | PATCH | Change user role |

---

## 9. Redux State Management (8 Slices)

| Slice | Manages |
|---|---|
| `authSlice` | Logged-in user, token |
| `candidateSlice` | Candidate profile, loading state |
| `skillsSlice` | Skills catalog, rated skills, gap analysis |
| `jobSlice` | Job listings, pagination, filters |
| `companySlice` | Company list, CRUD operations |
| `applicationSlice` | Applications list, status history |
| `interviewSlice` | Interview schedule list |
| `adminSlice` | Admin user list, pagination, filters |

---

## 10. Security Highlights

| Security Measure | Implementation |
|---|---|
| **Access token in-memory only** | Never stored in localStorage or cookies |
| **Refresh token in HttpOnly cookie** | JavaScript cannot access it — XSS safe |
| **Rate limiting** | `express-rate-limit` — prevents API abuse |
| **Helmet** | Sets security-hardened HTTP response headers |
| **CORS allowlist** | Only configured origins are allowed |
| **Password hashing** | bcryptjs — never stored in plaintext |
| **Self-protection** | Admin cannot deactivate/demote themselves |
| **Duplicate application block** | 409 Conflict returned for repeat submissions |
| **Profile completion gate** | Profile must be sufficiently complete to apply |

---

## 11. Key Engineering Decisions

1. **Vertical Slice Architecture** — Backend files grouped by feature (not by layer), making each module independently understandable and maintainable.

2. **Silent Session Restore** — On app load, the frontend calls `/auth/refresh` to restore the access token from the server-side HttpOnly cookie. Users never have to log in again after a page refresh.

3. **Server-side Gap Analysis** — The skill gap logic lives in the backend, not the frontend. The API computes which skills are missing, which need improvement, and which are proficient — ensuring accuracy regardless of client.

4. **Profile Completion as a % Score** — Calculated server-side by checking the presence and non-emptiness of 6 profile sections. This score drives the readiness status and acts as an application gate.

5. **Status History Array** — Every application status change is appended as a timestamped entry. This gives candidates a full lifecycle audit trail.

6. **Recharts for Analytics** — Used instead of a heavier library; supports responsive containers, donut/pie, bar, and line chart types that power all three role dashboards.

7. **React Hook Form + Joi** — The same Joi schemas defined for backend validation are mirrored on the frontend for instant field-level error messages, giving users precise feedback without a server round-trip.

---

## 12. File & Directory Reference

| Path | Description |
|---|---|
| [`frontend/src/App.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/App.jsx) | Root router, silent session init |
| [`frontend/src/pages/dashboard/CandidateDashboard.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/CandidateDashboard.jsx) | Profile builder page |
| [`frontend/src/pages/dashboard/SkillsDashboard.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/SkillsDashboard.jsx) | Skill gap analysis page |
| [`frontend/src/pages/dashboard/JobsBoard.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/JobsBoard.jsx) | Job listing + filter + post |
| [`frontend/src/pages/dashboard/JobDetail.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/JobDetail.jsx) | Job detail + apply |
| [`frontend/src/pages/dashboard/CandidateApplications.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/CandidateApplications.jsx) | Application tracker |
| [`frontend/src/pages/dashboard/CandidateInterviews.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/CandidateInterviews.jsx) | Interview schedule |
| [`frontend/src/pages/dashboard/MentorDashboard.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/MentorDashboard.jsx) | Mentor/coach console |
| [`frontend/src/pages/dashboard/AdminDashboard.jsx`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/frontend/src/pages/dashboard/AdminDashboard.jsx) | System admin portal |
| [`backend/app.js`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/backend/app.js) | Express app config, middleware, routes |
| [`backend/features/`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/backend/features) | All feature modules |
| [`backend/README.md`](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/backend/README.md) | Full backend API reference |

---

## 13. Summary Card

```
Project Name : Job-Web-App
Developer    : Md Munna
Program      : AlmaBetter AlmaX Placement Project
Stack        : React 19 + Vite + TailwindCSS + Redux | Node.js + Express 5 + MongoDB
Auth         : JWT (access token in-memory + refresh token in HttpOnly cookie)
Roles        : Candidate | Mentor | Admin
Pages        : 8 dashboard pages + 2 auth pages
API Modules  : 10 (auth, skills, candidate, companies, jobs, applications,
                   interviews, mentor-notes, analytics, admin)
API Endpoints: ~30+ across 5 development phases
Charts       : Recharts Bar, Donut Pie, Line (across all 3 role dashboards)
Key Feature  : Automated Skill Gap Analysis against target role & specific jobs
Deployment   : Frontend → Vercel | Backend → Any Node.js host
```

---

*Last updated: July 13, 2026 — by Md Munna*
