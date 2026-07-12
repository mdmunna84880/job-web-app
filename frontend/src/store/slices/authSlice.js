import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: '',
    loading: true,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      if (user !== undefined) state.user = user;
      if (token !== undefined) state.token = token;
      state.loading = false;
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = '';
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;
