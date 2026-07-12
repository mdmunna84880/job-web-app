import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetch all users list with search, role filters, and pagination parameters
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (filters, { rejectWithValue }) => {
    try {
      const cleanParams = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
          cleanParams[key] = filters[key];
        }
      });

      const response = await api.get('/admin/users', { params: cleanParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user directory.');
    }
  }
);

// Toggle user active/deactive status
export const toggleUserActiveStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (userId, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-active`);
      // Update list locally by fetching again
      const { filters } = getState().admin;
      dispatch(fetchAdminUsers(filters));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle active status.');
    }
  }
);

// Update user role
export const updateUserRole = createAsyncThunk(
  'admin/updateRole',
  async ({ userId, role }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      const { filters } = getState().admin;
      dispatch(fetchAdminUsers(filters));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role.');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    usersList: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 1,
    },
    filters: {
      page: 1,
      limit: 10,
      search: '',
      role: '',
    },
    loading: false,
    error: null,
  },
  reducers: {
    setAdminFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setAdminPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearAdminState: (state) => {
      state.usersList = [];
      state.pagination = { total: 0, page: 1, limit: 20, pages: 1 };
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersList = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAdminFilters, setAdminPage, clearAdminState } = adminSlice.actions;

export default adminSlice.reducer;
