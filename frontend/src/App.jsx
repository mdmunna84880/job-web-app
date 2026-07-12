import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, clearCredentials } from './store/slices/authSlice.js';
import api, { setAccessToken } from './utils/api.js';
import ProtectedRoute from './components/routes/ProtectedRoute.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import CandidateDashboard from './pages/dashboard/CandidateDashboard.jsx';
import MentorDashboard from './pages/dashboard/MentorDashboard.jsx';
import AdminDashboard from './pages/dashboard/AdminDashboard.jsx';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Run silent refresh to load session token on startup
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;
        setAccessToken(token);

        // Fetch user profile info
        const userResponse = await api.get('/auth/me');
        dispatch(setCredentials({ user: userResponse.data.data.user, token }));
      } catch (err) {
        dispatch(clearCredentials());
      }
    };

    initializeSession();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-guarded Candidate Route */}
        <Route
          path="/dashboard/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />

        {/* Role-guarded Mentor Route */}
        <Route
          path="/dashboard/mentor"
          element={
            <ProtectedRoute allowedRoles={['mentor']}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Role-guarded Admin Route */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback redirects */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
