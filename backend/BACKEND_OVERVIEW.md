# Backend Technical Overview & Interview Guide — Job-Web-App

This guide is a comprehensive reference documenting the backend architecture, database schemas, security middleware, validation layers, and testing/seeding structures of **Job-Web-App**. It is designed to help you explain the backend implementations for interviews, resume building, self-introductions, and database architecture reviews.

---

## 1. Project Pitch & Self-Introduction Script

### 30-Second Elevator Pitch
> *"I built the backend of **Job-Web-App**, a role-based career readiness and recruitment tracker using Node.js, Express 5, and MongoDB. The backend uses a vertical slice (feature-based) modular architecture to encapsulate routes, controllers, validation schemas, and database models. It features a hybrid JWT authentication system with httpOnly refresh cookies, automated candidate profile completion calculators, custom role-based access controllers, and comprehensive Joi validation layers."*

### 2-Minute Interview Overview
> *"For the backend of **Job-Web-App**, I developed a robust RESTful API using Node.js (ES Modules), Express 5, and MongoDB with Mongoose. I selected a **Vertical Slice Architecture** to modularize the system by business concern (e.g., auth, candidate profiles, jobs, interviews, analytics) rather than technical layers. This guarantees encapsulation, fast onboarding, and high testability.
> 
> Security was a primary focus. I engineered a hybrid access/refresh JWT authentication scheme. When a user logs in, the API issues a short-lived access token in-memory and a secure, HttpOnly, SameSite refresh token cookie. To lock down the endpoints, I implemented custom Express middleware: a `protect` middleware that validates token types and checks whether user accounts are active, and a `restrictTo` role-guard factory to enforce authorization rules for Candidates, Mentors, and Administrators.
> 
> On the database layer, I designed eight interconnected MongoDB models. I used compound indexes on the Applications collection to prevent duplicate candidate submissions per job posting, and implemented status history tracking using subdocument arrays. I also built calculated schemas, such as candidate profiles that automatically recalculate profile completion metrics on write, and analytical controllers that query aggregate database pipelines to feed statistics charts. This backend is structured to handle real-world scale, load rates, and strict validation requirements."*

---

## 2. Vertical Slice Architecture

Instead of grouping files by technical layers (e.g., placing all controllers in a giant controllers folder), codebase files are grouped by **business features** in `backend/features/`. Each feature encapsulates its own router, controller, service, schema validation, and model:

```
backend/
├── config/              # Database connection & validated environment configurations
├── features/
│   ├── auth/            # Registration, Login, Token refreshes, Session validation
│   ├── skills/          # Catalog of master database skills
│   ├── candidate/       # Profile details, stepper states, and gap analysis
│   ├── companies/       # Hiring company registries
│   ├── jobs/            # Job posts and paginated search filters
│   ├── applications/    # Job applications & status timelines
│   ├── interviews/      # Interview scheduling, results, and scoring logs
│   ├── mentor-notes/    # Contextual guidance logs on students
│   ├── analytics/       # Pipeline calculations for role dashboards
│   └── admin/           # Users list, role updates, and toggle deactivations
├── middleware/          # JWT protect guards, role restriction filters, error controllers
├── shared/              # Centralized constants, enums, and schema validators
└── utils/               # AppError class, rate limiter config, validation helpers
```

---

## 3. Database Schema Models & Indexing

The system models relationships using **Mongoose / MongoDB** schemas:

| Collection | Schema Details | Key Fields & Types | Indexes & Associations |
| :--- | :--- | :--- | :--- |
| **`User`** | Stores credentials and active account status. | `name` (String), `email` (String, unique), `password` (String, hashed), `role` (Enum), `isActive` (Boolean). | Indexed on `email`. |
| **`Skill`** | Master catalog of industry skill topics. | `name` (String, unique), `category` (String). | Indexed on `name`. |
| **`CandidateProfile`** | Profile info, education history, and projects. | `preferredRole` (Enum), `education` (Subdocuments), `projects` (Subdocuments), `readinessStatus` (Enum). | Associated with `User` (`ref: 'User'`). |
| **`CandidateSkill`** | Rated skill scores logged by students. | `candidate` (`ref: 'User'`), `skill` (`ref: 'Skill'`), `proficiencyLevel` (Enum). | Compound unique index: `{ candidate: 1, skill: 1 }`. |
| **`Company`** | Hiring firm entries. | `name` (String), `description` (String), `website` (String). | Associated with creator. |
| **`Job`** | Active job postings catalog. | `title` (String), `company` (`ref: 'Company'`), `requiredSkills` (Array of `ref: 'Skill'`), `salary` (Min/Max). | Indexed on `salary` and `requiredSkills`. |
| **`Application`** | Candidate job application lifecycle. | `candidate` (`ref: 'User'`), `job` (`ref: 'Job'`), `status` (Enum), `statusHistory` (Array of subdocuments). | Compound unique index: `{ candidate: 1, job: 1 }` (Prevents duplicate applications). |
| **`Interview`** | Upcoming/completed interview records. | `candidate` (`ref: 'User'`), `job` (`ref: 'Job'`), `round` (Number), `date` (Date), `score` (Number), `result` (Enum). | Associated with `User` and `Job`. |
| **`MentorNote`** | Logs logged by coach mentors on students. | `candidate` (`ref: 'User'`), `mentor` (`ref: 'User'`), `text` (String), `type` (Enum), `skillId` (`ref: 'Skill'`). | Associated with Candidate and Mentor. |

---

## 4. Key Express Middlewares & Security

### A. JWT Authentication Middleware (`middleware/authMiddleware.js`)
The `protect` middleware secures routes by performing these validation steps:
1. Extracts the Bearer token from the `Authorization` request header.
2. Verifies the token signature using the secret and checks if the token type is `"access"`.
3. Checks if the user still exists in the database.
4. Validates that the user's account is active (`isActive: true`). If a user has been deactivated by an admin, the request is blocked with a `403 Forbidden` error.

### B. Role Restriction Middleware (`middleware/roleGuard.js`)
The `restrictTo(...roles)` middleware factory enforces role-based access control (RBAC):
* Synthesizes authorization locks (e.g., `restrictTo('admin')` or `restrictTo('mentor', 'admin')`).
* Intercepts unauthorized requests and rejects them with a `403 Forbidden` error before executing business logic.

### C. Global Error Handler (`middleware/errorMiddleware.js`)
The backend uses Express 5's native async rejection handling combined with a centralized error handler:
* **Operational Errors**: Errors created via the custom `AppError` class are sent as structured JSON payloads.
* **Database Errors**: Catch and translate Mongoose database errors:
  * **CastError**: Formats path errors (e.g., invalid ObjectId queries).
  * **Duplicate Key Error (11000)**: Formats database violations (e.g., email conflicts) into clean validation responses.
  * **Joi Validation Errors**: Translates Joi payload check errors into key-value pairs mapping exactly to input fields.

---

## 5. Resume Bullet Points (Copy & Adapt)

* *Designed and built a secure RESTful API using **Node.js**, **Express 5**, and **MongoDB/Mongoose**, leveraging a **Vertical Slice Architecture** to encapsulate code features and maintain a modular database layer.*
* *Implemented a secure hybrid JWT authorization flow, utilizing **HttpOnly cookies** for refresh tokens and transient in-memory access tokens, completely shielding sessions from XSS/CSRF security vectors.*
* *Designed complex MongoDB **Aggregation Pipelines** on Mongoose models, enabling real-time computation of profile completion percentages, skill gap metrics, and platform-wide analytics.*
* *Optimized database performance by implementing **compound database indexes** (e.g., unique constraints on Candidate Job Applications), preventing duplicate states and reducing lookup queries.*
* *Secured high-traffic API routes using **Helmet** security headers, **CORS** origin allowances, and **express-rate-limit** rate restriction filters to mitigate DDoS and request abuse.*

---

## 6. Common Interview Q&As

#### Q1: What are the benefits of Vertical Slice Architecture compared to traditional 3-Tier Layered Architecture?
> *"In a traditional 3-tier structure, code is grouped by technology (controllers, models, routes). Adding a feature requires editing files across the entire directory, increasing cognitive load and merge conflicts. Vertical Slice Architecture groups files by business feature (e.g., auth, jobs). Each folder is self-contained. This makes features modular, increases cohesion, makes files easier to locate, and lets us modify features without affecting other sections of the system."*

#### Q2: How do you handle database validations and API inputs safely?
> *"I use **Joi** schemas within each feature directory (e.g., `job.validator.js`). Joi schemas validate all incoming requests (`req.body`, `req.params`, `req.query`) before hitting the controllers. If validation fails, a utility parses the errors and passes them to our global error middleware, returning a structured JSON response to the client. On the database layer, Mongoose schemas enforce types, required attributes, and compound unique indexes to guarantee database consistency."*

#### Q3: How did you implement user deactivation, and how does it propagate?
> *"We have an `isActive` boolean flag on the User model. Administrators can toggle this flag via a protected endpoint. To propagate this change immediately, the `protect` authentication middleware checks this value on every API request. If `isActive` is false, it rejects the request with a `403 Forbidden` error. This locks out deactivated users without requiring token expirations."*

#### Q4: Why did you choose Express 5 instead of Express 4?
> *"Express 5 has built-in support for handling rejected promises from async route handlers. In Express 4, if an async handler threw an error or rejected a promise, we had to wrap the code in try-catch blocks and manually call `next(error)`. Express 5 automatically catches these errors and passes them to our global error handling middleware, making route handlers cleaner and less error-prone."*
