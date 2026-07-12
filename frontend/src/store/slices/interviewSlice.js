import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetch all interviews assigned to the candidate
export const fetchCandidateInterviews = createAsyncThunk(
  'interviews/fetchCandidateInterviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/interviews');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load interviews.');
    }
  }
);

const interviewSlice = createSlice({
  name: 'interviews',
  initialState: {
    interviewsList: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearInterviewsState: (state) => {
      state.interviewsList = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateInterviews.fulfilled, (state, action) => {
        state.interviewsList = action.payload;
        state.loading = false;
      })
      .addCase(fetchCandidateInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInterviewsState } = interviewSlice.actions;

export default interviewSlice.reducer;
