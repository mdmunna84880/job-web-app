import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api.js';

// Fetches a paginated list of companies, optionally filtered by a search string
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const cleanParams = {};
      // Filter out any blank or undefined filter fields to keep request query params clean
      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          cleanParams[key] = params[key];
        }
      });

      const response = await api.get('/companies', { params: cleanParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to retrieve companies list.');
    }
  }
);

// Creates a new company profile on the platform
export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/companies', companyData);
      return response.data.data;
    } catch (error) {
      // Pass backend's Joi validation error messages to form fields if status code is 400
      if (error.response?.status === 400 && error.response.data.errors) {
        return rejectWithValue({
          message: error.response.data.message,
          errors: error.response.data.errors,
        });
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create company profile.',
      });
    }
  }
);

// Updates an existing company profile details
export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, companyData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/companies/${id}`, companyData);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.errors) {
        return rejectWithValue({
          message: error.response.data.message,
          errors: error.response.data.errors,
        });
      }
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update company profile.',
      });
    }
  }
);

// Deletes a company profile from the platform database
export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/companies/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete company profile.');
    }
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState: {
    companiesList: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1,
    },
    loading: false,
    error: null,
    submitError: null, // Separated to prevent global loader error flashing on form validations
  },
  reducers: {
    clearCompanyErrors: (state) => {
      state.error = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch list
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesList = action.payload.data;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.submitError = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companiesList = [action.payload, ...state.companiesList];
        state.loading = false;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.submitError = action.payload;
      })
      // Update
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.submitError = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.companiesList = state.companiesList.map((company) =>
          company._id === action.payload._id ? action.payload : company
        );
        state.loading = false;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.submitError = action.payload;
      })
      // Delete
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companiesList = state.companiesList.filter(
          (company) => company._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCompanyErrors } = companySlice.actions;
export default companySlice.reducer;
