import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetch all applications submitted by the candidate
export const fetchCandidateApplications = createAsyncThunk(
  'applications/fetchCandidateApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/applications');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications.');
    }
  }
);

// Submit a new job application
export const submitApplication = createAsyncThunk(
  'applications/submitApplication',
  async ({ jobId, studentRemarks }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/applications', { jobId, studentRemarks });
      dispatch(fetchCandidateApplications()); // Refresh listing
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit application.');
    }
  }
);

// Withdraw application
export const withdrawApplication = createAsyncThunk(
  'applications/withdrawApplication',
  async (applicationId, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(`/applications/${applicationId}/withdraw`);
      dispatch(fetchCandidateApplications()); // Refresh listing
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw application.');
    }
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    applicationsList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearApplicationsState: (state) => {
      state.applicationsList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateApplications.fulfilled, (state, action) => {
        state.applicationsList = action.payload;
        state.loading = false;
      })
      .addCase(fetchCandidateApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitApplication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitApplication.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearApplicationsState } = applicationSlice.actions;

export default applicationSlice.reducer;
