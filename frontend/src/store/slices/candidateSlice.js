import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetches the candidate profile of the logged-in user
export const fetchProfile = createAsyncThunk(
  'candidate/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/candidate/profile/me');
      return response.data.data;
    } catch (error) {
      // If profile is missing (404), we return null to represent uncreated state
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidate profile.');
    }
  }
);

// Creates or updates the candidate profile
export const upsertProfile = createAsyncThunk(
  'candidate/upsertProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.post('/candidate/profile', profileData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.message || 'Failed to save profile.');
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCandidateState: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upsert Profile
      .addCase(upsertProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upsertProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(upsertProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCandidateState } = candidateSlice.actions;

export default candidateSlice.reducer;
