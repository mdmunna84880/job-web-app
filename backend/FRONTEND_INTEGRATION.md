# Frontend Integration Guide — Job-Web-App

This guide details how to integrate your frontend client (React, Vite, or any other framework) with the backend API. By reading this guide, you will know exactly how to handle session state, configure Axios, handle validation errors, and call every API endpoint with their precise payload structures.

---

## 1. Authentication & Session Management Flow

The backend utilizes a hybrid JWT strategy to maximize security and usability:
* **Access Token**: Short-lived (expires in 15 mins). Returned in the login response body. Store this in your frontend state (e.g. Redux, Context, or Pinia). Do NOT store this in `localStorage` to avoid XSS vulnerability.
* **Refresh Token**: Long-lived (expires in 7 days). Sent via an `httpOnly`, `secure` cookie. The browser automatically handles saving and forwarding this cookie.

### Setting up Axios Client
Configure Axios with `withCredentials: true` so the browser attaches/sends cookie headers on every request.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for httpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the Access Token if present in frontend memory
let accessToken = ''; 

export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

### Auto-Token Refresh Interceptor
Use this interceptor to handle `401 Unauthorized` token expiry errors automatically. It requests a new token from the refresh endpoint and retries the original request.

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newToken = res.data.token;
        setAccessToken(newToken);
        
        // Retry original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid -> log user out
        setAccessToken('');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### Role-Based Routing & Session Initialization
On page load, execute the refresh call `/api/auth/refresh` immediately inside an app-level `useEffect` or router guard.
* If it succeeds, save the access token and fetch the profile.
* Redirect users to specific dashboards based on their role:
  * `candidate` -> `/dashboard/candidate`
  * `mentor` -> `/dashboard/mentor`
  * `admin` -> `/dashboard/admin`

---

## 2. API Error Handling

The backend returns standard JSON error responses.

### 400 Bad Request (Validation Errors)
When Joi validation fails, the backend returns an `errors` object listing specific field names and messages. Match this to your UI fields (e.g. using React Hook Form's `setError`):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "email must be a valid email",
    "password": "password length must be at least 8 characters long"
  }
}
```

**Axios React Integration Example:**
```javascript
try {
  await api.post('/auth/register', formData);
} catch (err) {
  if (err.response?.status === 400 && err.response.data.errors) {
    const backendErrors = err.response.data.errors;
    Object.keys(backendErrors).forEach((field) => {
      // Map to your UI form error state handler
      setError(field, { type: 'manual', message: backendErrors[field] });
    });
  }
}
```

### 409 Conflict (Duplicate Safeguards)
Returned if a user tries to perform a duplicate action (e.g. applying to the same job opening twice):
```json
{
  "success": false,
  "message": "You have already submitted an application for this job."
}
```

### 403 Forbidden (Blocked/Deactivated Accounts)
Returned if an account status is set to deactivated:
```json
{
  "success": false,
  "message": "This user account has been deactivated."
}
```

---

## 3. Comprehensive Payload Registry

### Phase 1: Authentication & Session

#### 1. Register Account
* **Endpoint**: `POST /api/auth/register`
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",                     // string, required, min 3 chars
    "email": "jane@example.com",             // string, required, valid email
    "password": "SecurePassword123!",       // string, required, min 8 chars (1 uppercase, 1 lowercase, 1 number, 1 special char)
    "role": "candidate"                      // string, required, enum: ["candidate", "mentor", "admin"]
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "6a538e85bc5c1beb0d4faf34",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "candidate",
        "isActive": true,
        "createdAt": "2026-07-12T12:00:00.000Z"
      }
    }
  }
  ```

#### 2. Login Account
* **Endpoint**: `POST /api/auth/login`
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...", // Send as Bearer Token header
    "data": {
      "user": {
        "_id": "6a538e85bc5c1beb0d4faf34",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "candidate"
      }
    }
  }
  ```

---

### Phase 2: Candidate Profiles & Catalog Skills

#### 1. Create/Update Profile (Candidates Only)
* **Endpoint**: `POST /api/candidate/profile`
* **Request Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "preferredRole": "Frontend Developer", // string, required, enum: ["Frontend Developer", "Backend Developer", "Full-Stack Developer", "Data Analyst", "QA Engineer"]
    "education": [                         // array, optional
      {
        "institution": "Stanford University", // string, required
        "degree": "Bachelor of Science",      // string, required
        "fieldOfStudy": "Computer Science",   // string, required
        "startYear": 2022,                    // integer, required, min 1900
        "endYear": 2026,                      // integer, optional, min startYear
        "gpa": 3.8                            // number, optional, min 0, max 10
      }
    ],
    "projects": [                          // array, optional
      {
        "title": "Job Portal App",            // string, required
        "description": "Full-stack application", // string, optional
        "technologies": ["React", "Express"], // array of strings, optional
        "link": "https://github.com/..."       // string, optional, valid URI
      }
    ],
    "resumeUrl": "https://drive.google.com/...", // string, optional, valid URI
    "linkedinUrl": "https://linkedin.com/in/...", // string, optional, valid URI
    "githubUrl": "https://github.com/..."         // string, optional, valid URI
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a538e85bc5c1beb0d4faf40",
      "user": {
        "_id": "6a538e85bc5c1beb0d4faf34",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "preferredRole": "Frontend Developer",
      "education": [...],
      "projects": [...],
      "profileCompletion": 85,                  // Calculated score
      "readinessStatus": "Placement Ready"     // "Not Ready" or "Placement Ready"
    }
  }
  ```

#### 2. Get Profile (Candidates Only)
* **Endpoint**: `GET /api/candidate/profile/me`
* **Success Response (200 OK)**: Returns the candidate profile structure shown above.

#### 3. Log/Rate a Skill
* **Endpoint**: `POST /api/candidate/skills`
* **Request Body**:
  ```json
  {
    "skillId": "6a538675809efb1b323933dc",   // string, required, valid MongoDB ObjectId
    "proficiencyLevel": "Advanced"           // string, required, enum: ["Beginner", "Intermediate", "Advanced", "Placement Ready"]
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a538e85bc5c1beb0d4faf50",
      "user": "6a538e85bc5c1beb0d4faf34",
      "skill": {
        "_id": "6a538675809efb1b323933dc",
        "name": "React",
        "category": "Frontend"
      },
      "proficiencyLevel": "Advanced",
      "history": [                           // logs history of modifications
        { "proficiencyLevel": "Beginner", "updatedAt": "..." },
        { "proficiencyLevel": "Advanced", "updatedAt": "..." }
      ]
    }
  }
  ```

#### 4. Get Skill Gap for Preferred Role
* **Endpoint**: `GET /api/candidate/skills/gap/role`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "targetRole": "Frontend Developer",
      "missingSkills": ["CSS", "HTML"],
      "needsImprovement": [
        { "name": "Communication", "currentLevel": "Beginner" }
      ],
      "proficientSkills": [
        { "name": "React", "currentLevel": "Advanced" },
        { "name": "JavaScript", "currentLevel": "Placement Ready" }
      ]
    }
  }
  ```

#### 5. Get Skill Gap for Specific Job Opening
* **Endpoint**: `GET /api/candidate/skills/gap/job/:jobId`
* **Success Response (200 OK)**: Similar format to the preferred role response, mapping target requirements from the specified job ID.

---

### Phase 3: Company & Job Directory

#### 1. Create Job Opening (Mentors/Admins Only)
* **Endpoint**: `POST /api/jobs`
* **Request Body**:
  ```json
  {
    "title": "Junior Full Stack Engineer",
    "companyId": "6a538e85bc5c1beb0d4faf80",       // string, required, valid MongoDB ObjectId
    "location": "Remote",                         // string, required
    "workMode": "Remote",                         // string, required, enum: ["On-site", "Hybrid", "Remote"]
    "jobType": "Full-Time",                       // string, required, enum: ["Full-Time", "Part-Time", "Contract", "Internship"]
    "requiredSkills": [                           // array of skill ObjectIds, required
      "6a538675809efb1b323933dc"
    ],
    "description": "Building client applications", // string, required
    "salary": {                                   // object, optional
      "min": 40000,                               // number, optional
      "max": 60000                                // number, must be >= min, optional
    }
  }
  ```
* **Success Response (201 Created)**: Returns the saved job object with default status set to `"Active"`.

#### 2. Get All Jobs (Paginated with Filters)
* **Endpoint**: `GET /api/jobs`
* **Query Parameters (All Optional)**:
  * `page`: integer (default: 1)
  * `limit`: integer (default: 10)
  * `search`: string (checks title, location, company name)
  * `workMode`: "On-site" | "Hybrid" | "Remote"
  * `jobType`: "Full-Time" | "Part-Time" | "Contract" | "Internship"
  * `requiredSkills`: string (comma-separated list of skill MongoDB ObjectIds)
  * `minSalary` / `maxSalary`: number
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "6a538e85bc5c1beb0d4faf99",
        "title": "Junior Full Stack Engineer",
        "company": {
          "_id": "6a538e85bc5c1beb0d4faf80",
          "name": "Google",
          "logo": "https://..."
        },
        "location": "Remote",
        "workMode": "Remote",
        "jobType": "Full-Time",
        "requiredSkills": [{ "_id": "...", "name": "React" }],
        "salary": { "min": 40000, "max": 60000 },
        "status": "Active"
      }
    ],
    "pagination": {
      "total": 12,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
  ```

---

### Phase 4: Applications, Interviews & Mentor Notes

#### 1. Apply to a Job Opening (Candidates Only)
* **Endpoint**: `POST /api/applications`
* **Request Body**:
  ```json
  {
    "jobId": "6a538e85bc5c1beb0d4faf99",     // string, required
    "studentRemarks": "I am a skilled QA."    // string, optional
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a538e85bc5c1beb0d4fa111",
      "candidate": "6a538e85bc5c1beb0d4faf34",
      "job": "6a538e85bc5c1beb0d4faf99",
      "status": "Applied",
      "studentRemarks": "I am a skilled QA.",
      "statusHistory": [
        { "status": "Applied", "updatedAt": "2026-07-12T12:30:00.000Z" }
      ]
    }
  }
  ```

#### 2. Get Detailed Application (Timeline progress)
* **Endpoint**: `GET /api/applications/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a538e85bc5c1beb0d4fa111",
      "candidate": { "_id": "...", "name": "Jane Doe", "email": "..." },
      "job": {
        "_id": "...",
        "title": "Junior Full Stack Engineer",
        "company": { "name": "Google", "website": "..." }
      },
      "status": "Shortlisted",
      "statusHistory": [
        { "status": "Applied", "updatedAt": "2026-07-12T12:30:00.000Z" },
        { "status": "Shortlisted", "updatedAt": "2026-07-12T13:45:00.000Z" }
      ]
    }
  }
  ```

#### 3. Update Application Status (Mentors/Admins Only)
* **Endpoint**: `PATCH /api/applications/:id/status`
* **Request Body**:
  ```json
  {
    "status": "Shortlisted" // string, required, enum: ["Applied", "Shortlisted", "Assessment Scheduled", "Assessment Completed", "Interview Scheduled", "Interview Completed", "Offer Received", "Rejected", "Withdrawn"]
  }
  ```
* **Success Response (200 OK)**: Returns the updated application with the new status pushed to the `statusHistory` array.

#### 4. Schedule Interview Round (Mentors/Admins Only)
* **Endpoint**: `POST /api/interviews`
* **Request Body**:
  ```json
  {
    "candidateId": "6a538e85bc5c1beb0d4faf34",      // string, required
    "jobId": "6a538e85bc5c1beb0d4faf99",            // string, required
    "round": 1,                                     // integer, required, min 1
    "date": "2026-07-15T14:30:00.000Z",             // ISO date string, required
    "type": "Technical"                             // string, required, enum: ["Technical", "HR", "Managerial", "Coding Assessment", "Assignment"]
  }
  ```
* **Success Response (201 Created)**: Returns the interview round object with default result set to `"Pending"`.

#### 5. Log Ratings & Score for Interview (Mentors/Admins Only)
* **Endpoint**: `PUT /api/interviews/:id`
* **Request Body**:
  ```json
  {
    "score": 8.5,                                   // number, optional, min 0, max 10
    "feedback": "Great architecture answers.",      // string, optional
    "result": "Selected"                            // string, optional, enum: ["Pending", "Selected", "Rejected", "On Hold"]
  }
  ```
* **Success Response (200 OK)**: Returns the interview round detail with ratings and feedback saved.

#### 6. Create Mentor Note (Mentors/Admins Only)
* **Endpoint**: `POST /api/mentor-notes`
* **Request Body**:
  ```json
  {
    "candidateId": "6a538e85bc5c1beb0d4faf34",      // string, required
    "text": "Requires more React coding tests.",    // string, required, min 5 chars
    "type": "Skill",                                // string, required, enum: ["General", "Application", "Skill"]
    "skillId": "6a538675809efb1b323933dc"           // string, required only if type is "Skill"
  }
  ```
* **Success Response (201 Created)**: Returns the saved mentor note object.

---

### Phase 5: Analytical Dashboards & Admin Operations

#### 1. Candidate Dashboard
* **Endpoint**: `GET /api/analytics/candidate`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "profileCompletion": 85,
      "readinessStatus": "Placement Ready",
      "totalApplied": 1,
      "upcomingInterviews": 1,
      "applicationsByStatus": [
        { "status": "Applied", "count": 1 }
      ]
    }
  }
  ```

#### 2. Mentor Dashboard
* **Endpoint**: `GET /api/analytics/mentor`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalCandidates": 12,
      "readyCandidates": 8,
      "notReadyCandidates": 4,
      "interviewsThisWeek": 2,
      "applicationsByStatus": [
        { "status": "Applied", "count": 10 },
        { "status": "Offer Received", "count": 2 }
      ],
      "companyWiseApplications": [
        { "companyName": "Google", "count": 8 },
        { "companyName": "Microsoft", "count": 4 }
      ]
    }
  }
  ```

#### 3. Admin Dashboard
* **Endpoint**: `GET /api/analytics/admin`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "userRoles": [
        { "role": "candidate", "count": 12 },
        { "role": "mentor", "count": 3 },
        { "role": "admin", "count": 1 }
      ],
      "totalCompanies": 4,
      "totalJobs": 6,
      "jobsByStatus": [
        { "status": "Active", "count": 5 },
        { "status": "Closed", "count": 1 }
      ],
      "placementConversionRate": 16.67, // (Offers Received / Total unique applicants)
      "monthlyApplicationTrends": [
        { "year": 2026, "month": 7, "count": 12 }
      ]
    }
  }
  ```

#### 4. List All Users (Admin Only)
* **Endpoint**: `GET /api/admin/users`
* **Query Parameters (All Optional)**:
  * `page`, `limit` (default: 1 and 20)
  * `search` (searches user name or email)
  * `role` ("candidate" | "mentor" | "admin")
* **Success Response (200 OK)**: Returns list of user objects with pagination values.

#### 5. Toggle User Status (Admin Only)
* **Endpoint**: `PATCH /api/admin/users/:id/toggle-active`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "6a538e85bc5c1beb0d4faf34",
      "name": "Jane Doe",
      "isActive": false // Immediately logs out/blocks user access
    }
  }
  ```
