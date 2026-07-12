import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice.js';
import { fetchAdminUsers, toggleUserActiveStatus, updateUserRole, setAdminFilters, setAdminPage } from '../../store/slices/adminSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import { useNavigate } from 'react-router-dom';
import CompaniesTab from '../../components/dashboard/CompaniesTab.jsx';
import JobsTab from '../../components/dashboard/JobsTab.jsx';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FiUsers,
  FiBriefcase,
  FiPercent,
  FiLayers,
  FiLogOut,
  FiSearch,
  FiShield,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { usersList, pagination, filters, loading: usersLoading } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch stats and users list on load/filters change
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.get('/analytics/admin');
        setStats(response.data.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  useEffect(() => {
    dispatch(fetchAdminUsers(filters));
  }, [dispatch, filters]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken('');
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const handleFilterChange = (key, value) => {
    dispatch(setAdminFilters({ [key]: value }));
  };

  const handleToggleActive = (userId, currentStatus, userName) => {
    const actionWord = currentStatus ? 'DEACTIVATE' : 'ACTIVATE';
    if (window.confirm(`Are you sure you want to ${actionWord} the account of ${userName}?`)) {
      dispatch(toggleUserActiveStatus(userId));
    }
  };

  const handleRoleChange = (userId, newRole) => {
    dispatch(updateUserRole({ userId, role: newRole }));
  };

  const loading = statsLoading || usersLoading;

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Preprocess role distribution pie chart data
  const roleData = (stats?.userRoles || []).map((item) => ({
    name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
    value: item.count,
  }));

  // Preprocess monthly trends line chart data
  const trendData = (stats?.monthlyApplicationTrends || []).map((item) => ({
    name: `${item.month}/${item.year}`,
    applications: item.count,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* Top Navbar */}
      <header className="flex justify-between items-center bg-slate-900 text-white px-6 py-4 shadow-md">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">Career Tracker</h1>
          <span className="text-xs text-slate-400">System Admin Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right text-xs">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-slate-400">Administrator</span>
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
          <h2 className="text-2xl font-bold text-slate-800 font-sans">System Analytics & Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Manage global user credentials, adjust system roles, and evaluate aggregate performance trends.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/80 gap-6 mt-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'users'
                ? 'border-indigo-650 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Analytics & Users
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'companies'
                ? 'border-indigo-650 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Companies Management
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'jobs'
                ? 'border-indigo-650 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Job Openings
          </button>
        </div>

        {activeTab === 'users' && (
          <>

        {/* Counter Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-indigo-50 text-indigo-650 rounded-xl">
              <FiUsers className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Registered Users</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.totalUsers || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-emerald-50 text-emerald-650 rounded-xl">
              <FiBriefcase className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Postings</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.activeJobs || 0}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-sky-50 text-sky-655 rounded-xl">
              <FiPercent className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Conversion Rate</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.placementConversionRate || 0}%</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="p-3.5 bg-amber-50 text-amber-650 rounded-xl">
              <FiLayers className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase">Companies Linked</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats?.totalCompanies || 0}</span>
            </div>
          </Card>
        </section>

        {/* Recharts Analytics Graphic Block */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends line chart (2 cols) */}
          <Card className="flex flex-col gap-4 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">
              Monthly Application Trends
            </h3>
            {trendData.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">No trend details logged.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* User roles distribution pie chart (1 col) */}
          <Card className="flex flex-col gap-4 lg:col-span-1">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-50 pb-2">
              User Role Distribution
            </h3>
            {roleData.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center">No role statistics found.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {roleData.map((entry, idx) => (
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
        </section>

        {/* User Account Controls Directory */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 font-sans">User Management Directory</h2>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Search box */}
              <div className="relative flex-1 sm:w-64">
                <FiSearch className="absolute left-3 top-3 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                />
              </div>

              {/* Role filter */}
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-xs focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
              >
                <option value="">All Roles</option>
                <option value="candidate">Candidate</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {usersLoading && usersList.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
            </div>
          ) : usersList.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No user accounts found matching your query criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Settings</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {usersList.map((userObj) => (
                    <tr key={userObj._id} className="hover:bg-slate-50/50 transition-smooth align-middle">
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{userObj.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{userObj.email}</td>
                      <td className="py-3.5 px-4">
                        <select
                          value={userObj.role}
                          onChange={(e) => handleRoleChange(userObj._id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary-500"
                        >
                          <option value="candidate">Candidate</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            userObj.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}
                        >
                          {userObj.isActive ? 'Active' : 'Blocked / Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="glass"
                          disabled={userObj._id === user?._id} // Prevent self deactivation
                          className={`py-1 px-3 text-xs flex items-center gap-1 ml-auto border ${
                            userObj.isActive
                              ? 'text-rose-650 hover:bg-rose-50 border-rose-100'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-100'
                          }`}
                          onClick={() => handleToggleActive(userObj._id, userObj.isActive, userObj.name)}
                        >
                          {userObj.isActive ? (
                            <>
                              <FiXCircle className="w-3.5 h-3.5" />
                              <span>Block</span>
                            </>
                          ) : (
                            <>
                              <FiCheckCircle className="w-3.5 h-3.5" />
                              <span>Unblock</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              {pagination.pages > 1 && (
                <nav className="flex justify-center items-center gap-1 mt-6" aria-label="Pagination Navigation">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => dispatch(setAdminPage(pageNum))}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-smooth focus:outline-none ${
                        pagination.page === pageNum
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white hover:bg-slate-100 text-slate-650 border border-slate-200'
                      }`}
                      aria-label={`Go to page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </nav>
              )}
            </div>
          )}
        </section>
          </>
        )}

        {activeTab === 'companies' && <CompaniesTab />}
        {activeTab === 'jobs' && <JobsTab />}
      </main>
    </div>
  );
}
