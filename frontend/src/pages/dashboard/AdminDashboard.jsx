import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Button from '../../components/common/Button.jsx';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken('');
      dispatch(clearCredentials());
    }
  };

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>Log Out</Button>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-600">Admin portal content will be added in Phase 10.</p>
        </section>
      </div>
    </main>
  );
}
