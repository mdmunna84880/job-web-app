import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FiUsers, FiCheckCircle, FiAlertCircle, FiCalendar, FiLogOut } from 'react-icons/fi';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export default function MentorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorStats = async () => {
      try {
        const response = await api.get('/analytics/mentor');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to load mentor stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorStats();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken('');
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Preprocess application status chart data
  const statusData = (stats?.applicationsByStatus || []).map((item) => ({
    name: item.status,
    value: item.count,
  }));

  // Preprocess company-wise application data
  const companyData = (stats?.companyWiseApplications || []).map((item) => ({
    name: item.companyName || 'Unknown',
    applications: item.count,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-slate-900 text-white px-6 py-4 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">Career Tracker</h1>
          <span className="text-xs text-slate-400">Mentor Console</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right text-xs">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-slate-400">Career Coach</span>
          </div>
          <Button
            variant="glass"
            className="text-white hover:text-rose-400 border-slate-700 bg-slate-800/80 p-2 text-xs flex items-center gap-1.5"
            onClick={handleLogout}
          >
            <FiLogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800">Coach Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Review student readiness trackers, applications statuses, and weekly interview schedules.</p>
        </div>

        {/* Counters Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Candidates</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.totalCandidates || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Ready Candidates</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.readyCandidates || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
              <FiAlertCircle className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Not Ready Candidates</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.notReadyCandidates || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Interviews This Week</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.interviewsThisWeek || 0}</span>
            </div>
          </Card>
        </section>

        {/* Graphics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Breakdown (Pie) */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">
              Applications Status Distribution
            </h3>
            {statusData.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">No application records found.</p>
            ) : (
              <div className="h-64 flex flex-col justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Companywise aggregates (Bar) */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">
              Company Application Volume
            </h3>
            {companyData.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">No company hiring logs found.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={companyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="applications" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
}
