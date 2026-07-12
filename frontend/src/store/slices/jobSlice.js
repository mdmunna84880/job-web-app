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

// Creates a new job posting on the platform
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post('/jobs', jobData);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.errors) {
        return rejectWithValue({
          message: error.response.data.message,
          errors: error.response.data.errors,
        });
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to publish job opening.',
      });
    }
  }
);

// Updates an existing job posting
export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/jobs/${id}`, jobData);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.errors) {
        return rejectWithValue({
          message: error.response.data.message,
          errors: error.response.data.errors,
        });
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update job opening.',
      });
    }
  }
);

// Deletes a job posting from the database
export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/jobs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job opening.');
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
    submitError: null,
  },
  reducers: {
    clearJobErrors: (state) => {
      state.error = null;
      state.submitError = null;
    },
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
      })
      // Create Job
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.submitError = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobsList = [action.payload, ...state.jobsList];
        state.loading = false;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.submitError = action.payload;
      })
      // Update Job
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.submitError = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.jobsList = state.jobsList.map((job) =>
          job._id === action.payload._id ? action.payload : job
        );
        state.loading = false;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.submitError = action.payload;
      })
      // Delete Job
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobsList = state.jobsList.filter((job) => job._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, setPage, resetFilters, clearJobsState, clearJobErrors } = jobSlice.actions;

export default jobSlice.reducer;
