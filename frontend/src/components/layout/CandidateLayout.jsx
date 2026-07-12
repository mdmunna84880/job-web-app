import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Button from '../common/Button.jsx';
import {
  FiUser,
  FiAward,
  FiBriefcase,
  FiFileText,
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

export default function CandidateLayout({ children }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken('');
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'Profile Details', path: '/dashboard/candidate', icon: FiUser },
    { name: 'Skills & Gaps', path: '/dashboard/candidate/skills', icon: FiAward },
    { name: 'Job Openings', path: '/dashboard/candidate/jobs', icon: FiBriefcase },
    { name: 'My Applications', path: '/dashboard/candidate/applications', icon: FiFileText },
    { name: 'Interviews', path: '/dashboard/candidate/interviews', icon: FiCalendar },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-extrabold tracking-tight text-indigo-400 font-sans">
            Career Tracker
          </h2>
          <span className="text-xs text-slate-400">Candidate Workspace</span>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              end
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400">Candidate</span>
            </div>
          </div>
          <Button
            variant="glass"
            className="w-full text-white bg-slate-800 hover:bg-slate-700 hover:text-rose-400 border-none justify-start gap-3 mt-2"
            onClick={handleLogout}
          >
            <FiLogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="flex md:hidden items-center justify-between bg-slate-900 text-white p-4 shadow-md">
        <h2 className="text-lg font-bold text-indigo-400 font-sans">Career Tracker</h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:text-indigo-400 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden flex flex-col bg-slate-900 border-t border-slate-800 p-4 gap-2 text-white">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              end
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-slate-800 transition-smooth text-left"
          >
            <FiLogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
