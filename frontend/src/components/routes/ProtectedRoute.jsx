import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Loading session...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if user session is not found
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to login/home if user role is not allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
