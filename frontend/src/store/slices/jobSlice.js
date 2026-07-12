import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetches job openings with optional search, filters, and pagination parameters
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (filters, { rejectWithValue }) => {
    try {
      // Filter out empty params
      const cleanParams = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanParams[key] = filters[key];
        }
      });

      const response = await api.get('/jobs', { params: cleanParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retrieve job openings.');
    }
  }
);

// Fetches details of a single job opening
export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retrieve job details.');
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobsList: [],
    selectedJob: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1,
    },
    currentFilters: {
      page: 1,
      limit: 6,
      search: '',
      workMode: '',
      jobType: '',
      requiredSkills: '',
      minSalary: '',
      maxSalary: '',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.currentFilters = { ...state.currentFilters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.currentFilters.page = action.payload;
    },
    resetFilters: (state) => {
      state.currentFilters = {
        page: 1,
        limit: 6,
        search: '',
        workMode: '',
        jobType: '',
        requiredSkills: '',
        minSalary: '',
        maxSalary: '',
      };
    },
    clearJobsState: (state) => {
      state.jobsList = [];
      state.selectedJob = null;
      state.pagination = { total: 0, page: 1, limit: 10, pages: 1 };
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobsList = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Job By Id
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
        state.loading = false;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, setPage, resetFilters, clearJobsState } = jobSlice.actions;

export default jobSlice.reducer;
