import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import candidateReducer from './slices/candidateSlice.js';
import skillsReducer from './slices/skillsSlice.js';
import jobReducer from './slices/jobSlice.js';
import companyReducer from './slices/companySlice.js';
import applicationReducer from './slices/applicationSlice.js';
import interviewReducer from './slices/interviewSlice.js';
import adminReducer from './slices/adminSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidate: candidateReducer,
    skills: skillsReducer,
    jobs: jobReducer,
    companies: companyReducer,
    applications: applicationReducer,
    interviews: interviewReducer,
    admin: adminReducer,
  },
  devTools: import.meta.env.NODE_ENV !== 'production',
});
