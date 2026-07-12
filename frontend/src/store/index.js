import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import candidateReducer from './slices/candidateSlice.js';
import skillsReducer from './slices/skillsSlice.js';
import jobReducer from './slices/jobSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidate: candidateReducer,
    skills: skillsReducer,
    jobs: jobReducer,
  },
  devTools: import.meta.env.NODE_ENV !== 'production',
});
