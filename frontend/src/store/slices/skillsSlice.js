import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetch all master skills catalog from /skills
export const fetchSkillsCatalog = createAsyncThunk(
  'skills/fetchCatalog',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/skills');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load skills catalog.');
    }
  }
);

// Fetch logged-in candidate's rated skills from /candidate/skills/me
export const fetchCandidateSkills = createAsyncThunk(
  'skills/fetchCandidateSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/candidate/skills/me');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load rated skills.');
    }
  }
);

// Fetch skill gap analysis from /candidate/skills/gap/role
export const fetchGapAnalysis = createAsyncThunk(
  'skills/fetchGapAnalysis',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/candidate/skills/gap/role');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load gap analysis.');
    }
  }
);

// Fetch skill gap analysis for a specific job from /candidate/skills/gap/job/:jobId
export const fetchJobGapAnalysis = createAsyncThunk(
  'skills/fetchJobGapAnalysis',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/candidate/skills/gap/job/${jobId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load job gap analysis.');
    }
  }
);

// Add or update candidate skill rating
export const rateSkill = createAsyncThunk(
  'skills/rateSkill',
  async ({ skillId, proficiencyLevel }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/candidate/skills', { skillId, proficiencyLevel });
      // Refresh current states
      dispatch(fetchCandidateSkills());
      dispatch(fetchGapAnalysis());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save skill rating.');
    }
  }
);

// Remove candidate skill rating
export const deleteSkillRating = createAsyncThunk(
  'skills/deleteSkillRating',
  async (skillId, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/candidate/skills/${skillId}`);
      // Refresh current states
      dispatch(fetchCandidateSkills());
      dispatch(fetchGapAnalysis());
      return skillId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete skill rating.');
    }
  }
);

const skillsSlice = createSlice({
  name: 'skills',
  initialState: {
    catalog: [],
    candidateSkills: [],
    gapAnalysis: null,
    jobGapAnalysis: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSkillsState: (state) => {
      state.catalog = [];
      state.candidateSkills = [];
      state.gapAnalysis = null;
      state.jobGapAnalysis = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Catalog
      .addCase(fetchSkillsCatalog.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSkillsCatalog.fulfilled, (state, action) => {
        state.catalog = action.payload;
        state.loading = false;
      })
      .addCase(fetchSkillsCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Candidate Skills
      .addCase(fetchCandidateSkills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidateSkills.fulfilled, (state, action) => {
        state.candidateSkills = action.payload;
        state.loading = false;
      })
      .addCase(fetchCandidateSkills.rejected, (state, action) => {
        state.loading = false;
      })
      // Fetch Gaps
      .addCase(fetchGapAnalysis.fulfilled, (state, action) => {
        state.gapAnalysis = action.payload;
      })
      // Fetch Job Gaps
      .addCase(fetchJobGapAnalysis.fulfilled, (state, action) => {
        state.jobGapAnalysis = action.payload;
      });
  },
});

export const { clearSkillsState } = skillsSlice.actions;

export default skillsSlice.reducer;
