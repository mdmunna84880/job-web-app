# Job-Web-App — Placement Readiness & Job Application Tracker

**Job-Web-App** is a role-based, full-stack web application designed for student candidates, career mentors, and system administrators. The platform manages the end-to-end recruitment process: allowing candidates to build portfolio profiles, rate technical skills, and analyze skill gaps against target jobs using interactive charts; mentors to monitor student pipelines and log performance notes; and administrators to govern accounts and review conversion analytics.

---

## 🚀 Key Features

### 👤 Candidate Workspace
* **Interactive Profile Builder**: Modular setup form (preferred roles, education arrays, project portfolios) with a dynamic completeness progress stepper.
* **Skill Gap Analysis Board**: Logger for self-rating skills with a visual **Recharts Bar Chart** comparing current proficiencies side-by-side with target job standards.
* **Job Board Directory**: Advanced paginated search displaying job cards with side-drawer parameters (salary sliders, job types, work modes, and required skills filters).
* **Application Tracker & Timeline**: Detailed logs tracking active applications, status histories (Applied, Interviewing, Offered), and scheduled interviews.

### 💼 Mentor Workspace
* **Cohort Readiness Metrics**: Real-time aggregated statistics charting cohort performance.
* **Student Tracking Board**: View details of candidate profiles, portfolios, and active application statuses.
* **Interview Scheduler**: Tools to schedule interview rounds and log scores, results, and feedback.
* **Mentor Guidance Logs**: Contextual logging of notes linked directly to student applications or skill reviews.

### 🔑 Administrator Workspace
* **User Management Console**: Full table interface to search accounts, edit roles (Candidate, Mentor, Admin), and toggle account active/inactive statuses.
* **Access Control Blocks**: Instantly restricts API access and redirects deactivated users to the login portal.
* **Platform Analytics Dashboard**: System metrics including application conversion rates, user distributions, and monthly trends.

---

## 🛠️ Technology Stack

### Frontend
* **Core Framework**: React 19 (Functional components, custom hooks)
* **Build Tool**: Vite 8 & Oxlint (for high-performance linting and fast builds)
* **Styling**: Tailwind CSS v4 (Custom typography & smooth glassmorphic designs)
* **State Management**: Redux Toolkit & React-Redux (Centralized state flow)
* **Client-Side Routing**: React Router DOM v7 (Role-protected client guards)
* **Forms & Validation**: React Hook Form with Joi schema resolvers
* **HTTP Client**: Axios (Equipped with dynamic access headers and background token refresh interceptors)
* **Charts**: Recharts (Responsive bar and line dashboards)

### Backend
* **Runtime**: Node.js (ES Modules, `import`/`export`)
* **API Framework**: Express 5 (Native asynchronous error and promise rejection handler)
* **Database**: MongoDB & Mongoose v9 (Object modeling, unique indexes, and schema validation)
* **Authentication**: JSON Web Tokens (Access tokens stored in-memory, Refresh tokens sent via secure `HttpOnly` cookies)
* **Security & Hygiene**: Helmet HTTP policies, CORS allowances, and Express API rate limiting filters

---

## 📁 Repository Directory Structure

```
job-web-app/
├── README.md                   # Root reference guide (this file)
├── project_summary.md          # Comprehensive summary card of the platform
├── frontend/                   # Frontend Client SPA (React + Vite)
│   ├── index.html              # Core HTML structure & Google fonts configuration
│   ├── package.json            # Frontend script actions & dependencies
│   ├── vercel.json             # Vercel SPA routing configurations
│   └── src/                    # App source code (Components, Pages, Redux Slices, Utils)
└── backend/                    # Backend REST API Server (Node + Express)
    ├── app.js                  # Express app, middleware mounts, and routing configurations
    ├── index.js                # Server bootstrapper & DB connection logic
    ├── package.json            # Backend scripts & node modules
    ├── features/               # Feature Slice Modules (controllers, services, models, routes)
    ├── middleware/             # Route guards, authorization, and error controllers
    ├── utils/                  # AppError classes, RateLimiters, and validators
    ├── FRONTEND_OVERVIEW.md    # Frontend Technical Overview & Interview Prep Guide
    └── BACKEND_OVERVIEW.md     # Backend Technical Overview & Interview Prep Guide
```

---

## ⚙️ Local Installation & Running Guide

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **MongoDB** (Local instance or MongoDB Atlas Cluster connection URI)

### 1. Backend Server Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `backend/` directory based on the configuration pattern below:
   ```env
   PORT=8000
   MONGO_URI=mongodb://127.0.0.1:27017/job-web-app
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173
   ```
4. Seed the database with the initial skills catalog:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Client Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Verify or create the `.env.development` file configuration:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the frontend client dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173` to interact with the application.

---

## 📚 Technical Interview & Review References

We have included dedicated overview documents to help you review the codebase architecture, prepare for interviews, or write resume descriptors:
* For a detailed review of state management, custom Axios refresh interceptors, and frontend pages, read the **[Frontend Overview Guide](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/backend/FRONTEND_OVERVIEW.md)**.
* For a detailed review of database schemas, role authorization guards, vertical slice features, and Express 5 error structures, read the **[Backend Overview Guide](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/backend/BACKEND_OVERVIEW.md)**.
* For a high-level summary card of the platform, check the **[Project Summary](file:///d:/01.%20Technocybernetisophy/13.%20AlmaBetter/AlmaX/Placement%20Project/job-web-app/project_summary.md)**.
