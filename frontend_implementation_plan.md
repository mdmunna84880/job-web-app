# Frontend Implementation Plan — Placement Readiness & Job Application Tracker

This plan details the design, structure, and execution phases for building the frontend client application. The frontend will be built using **React (Vite)**, **Tailwind CSS**, **React Router**, and **Axios**.

---

## Technical Architecture & Foundation

* **Build Tool**: Vite (React + Javascript)
* **CSS Framework**: Tailwind CSS (plus custom theme styling tokens)
* **Routing**: React Router DOM (Declarative routing with role-guarded routes)
* **State Management**: React Context (for auth session) + Local/Component state
* **HTTP Client**: Axios (configured with `withCredentials` and automatic refresh interceptors)

---

## Code Standards & Humanistic Guidelines

All frontend code in this project will adhere to the following principles:

### 1. Naming & Structure (No Arrow Components)
* **Functional Components Only**: Class components are strictly prohibited.
* **Named Function Declarations**: Write components as function declarations (e.g., `function LoginCard() {}`), never as anonymous arrow assignments to variables (`const LoginCard = () => {}`).
* **Prop Destructuring**: Always destructure component props directly in the function signature.
* **Component-File Cohesion**: One component per file, file name matches the component name (`PascalCase.jsx`).

### 2. Humanistic Comments
* Write comments that explain **why** something was done, not **what** the code does. 
* Do not write redundant syntax descriptions (e.g. avoid comments like `// Set state of loading to true` or `// useEffect hooks running on mount`).
* Let the code speak for itself by using descriptive function and variable names (e.g. prefer `calculateProfileCompletion` over a short name with a descriptive comment).

### 3. Accessibility & Layout
* **Semantic HTML**: Utilize appropriate semantic elements (`<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`).
* **Interactive Elements**: Real interactive components must use real `<button>` or `<a>` elements rather than `<div>` blocks with click handlers.
* **Labels**: All form elements must be properly linked to `<label>` tags. Icon-only elements must feature `aria-label` labels.

---

## 5-Phase Implementation Roadmap

### Phase 1: Client Foundation & Session Management

#### 1. Setup & Styling Tokens
* Initialize Vite project inside the workspace.
* Set up Tailwind configuration with theme variables:
  * Primary: `indigo` / `violet` accents.
  * Neutral: Rich dark slate backgrounds.
* Configure custom google fonts (Outfit / Inter) in index.html.

#### 2. Axios Client & Token Interceptors
* Build the `api.js` Axios utility containing:
  * In-memory access token storage.
  * Bearer token request header attachment.
  * Response interceptor to catch `401` errors, execute token refresh, and retry requests.

#### 3. Authentication Forms & Guarded Routes
* **Registration Page**: Form capturing name, email, password, and role selector. Maps Joi validation keys back to inputs.
* **Login Page**: Captures email and password, initializes access token, and parses roles.
* **ProtectedRoute Component**: Restricts access based on authenticated status and specific roles (`candidate`, `mentor`, `admin`).

---

### Phase 2: Candidate Profiles & Skill Logger

#### 1. Profile Builder
* **Candidate Profile Page**: Forms allowing candidates to edit:
  * Preferred role (Frontend, Backend, etc.).
  * Education listings (Stanford, CSE, start/end years, GPA).
  * Projects directory (Title, details, link).
  * URL fields (Resume, Github, LinkedIn).
* **Readiness Stepper**: Progress bar illustrating the `profileCompletion` score.

#### 2. Skill Logger & Gap Analysis Dashboard
* **My Skills Component**: Table listing rated skills, current ratings, and change history. Modal to log/rate skills with dropdown selection and proficiency enums.
* **Skill Gap Analysis Visualizer**:
  * Visual representations (like comparative bar charts) highlighting candidate skills against preferred role standards.
  * Lists of "Missing Skills" and "Needs Improvement" (Beginner/Intermediate ratings) to guide candidates.

---

### Phase 3: Job Listings Board & Application Panel

#### 1. Job Board
* **Jobs Directory View**: Search inputs matching job title/company, and sidebar filtering controls (Work mode, Job Type, Salary min/max slider, and required skills dropdown selection).
* **Job Card component**: Summarizes title, company name, logo, location tag, stipend tags, and skill pills.

#### 2. Job Detail & Eligibility Inspector
* **Job Detail Side-drawer/Page**: Details responsibilities, full description, and lists skill gaps (missing skills) for this specific job.
* **"Apply" Interactive Button**:
  * Performs verification checks: warns user if their profile is incomplete.
  * Disables buttons and displays "Applied" once submitted, showing appropriate error notifications if blocked by duplication guards (409).

---

### Phase 4: Application Timelines, Interviews & Notes

#### 1. Application Tracker (Candidate View)
* **Applications List Page**: Lists candidate's active submissions, statuses, and apply dates.
* **Timeline Progression Stepper**: Visual stepper tracking application status history log timeline (e.g. Applied → Shortlisted → Interview Scheduled → Offer Received).
* **Withdraw Button**: Candidate-only action to set application status to Withdrawn.

#### 2. Interview Schedules & Logs
* **My Interviews View**: Dashboard listing scheduled interview rounds, dates, and types (Technical, HR, etc.).
* **Result Panel**: Displays rating score (1-10) and text feedback once logged by the mentor.

#### 3. Mentor Notes Drawer
* Displays General, Job-scoped, and Skill-scoped mentor logs.

---

### Phase 5: Dashboards & User Administration

#### 1. Dashboard Portals
* **Candidate Dashboard**: Summary widgets displaying profile completion score, upcoming interview calendar count, and applications status grid.
* **Mentor Dashboard**: Student readiness ratios, global applications status counts, scheduled interviews this week, and top missing skills across candidate database.
* **Admin Dashboard**: Total users, total companies, placement conversion rates, active job listings, and monthly trends charts.

#### 2. Admin User Directory
* **User Management Page**: Paginated user table supporting search (name/email), role filter (Candidate, Mentor, Admin), role update settings, and toggle status button (Deactivate/Activate) with confirm dialog warnings.

---

## Verification Plan

### Manual Layout Audits
* Verify mobile layouts for all dashboard modules.
* Audit JWT cookie preservation on browser reload.
* Test deactivation blocks: deactivated candidate gets blocked and redirected to Login screen.
