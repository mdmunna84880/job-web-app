import { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifies user session on page load
  const initializeSession = async () => {
    try {
      const refreshResponse = await api.post('/auth/refresh');
      const { token } = refreshResponse.data;
      setAccessToken(token);

      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data.data.user);
    } catch (err) {
      setUser(null);
      setAccessToken('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeSession();
  }, []);

  const register = async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, data } = response.data;
    setAccessToken(token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken('');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
