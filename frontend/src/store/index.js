import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import candidateReducer from './slices/candidateSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidate: candidateReducer,
  },
  devTools: import.meta.env.NODE_ENV !== 'production',
});
