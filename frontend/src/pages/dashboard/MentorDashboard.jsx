import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../../store/slices/authSlice.js';
import api, { setAccessToken } from '../../utils/api.js';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { profileSchema } from '../../utils/validationSchemas.js';
import { fetchProfile, upsertProfile } from '../../store/slices/candidateSlice.js';
import { fetchCompanies } from '../../store/slices/companySlice.js';
import Input from '../../components/common/Input.jsx';
import CompaniesTab from '../../components/dashboard/CompaniesTab.jsx';
import JobsTab from '../../components/dashboard/JobsTab.jsx';
import { FiPlus, FiTrash2, FiSquare, FiCheckCircle, FiUsers, FiAlertCircle, FiCalendar, FiLogOut } from 'react-icons/fi';
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

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export default function MentorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.candidate);
  const { companiesList } = useSelector((state) => state.companies);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: joiResolver(profileSchema),
    defaultValues: {
      preferredRole: '',
      resumeUrl: '',
      linkedinUrl: '',
      githubUrl: '',
      education: [],
      projects: [],
      companies: [],
    },
  });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({
    control,
    name: 'education',
  });

  const {
    fields: projFields,
    append: appendProj,
    remove: removeProj,
  } = useFieldArray({
    control,
    name: 'projects',
  });

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
    dispatch(fetchProfile());
    dispatch(fetchCompanies({ limit: 1000 }));
  }, [dispatch]);

  // Sync profile details with React Hook Form and local component state
  useEffect(() => {
    if (profile) {
      const companyIds = (profile.companies || []).map((c) => c._id || c);
      setSelectedCompanies(companyIds);
      reset({
        preferredRole: profile.preferredRole || '',
        resumeUrl: profile.resumeUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        companies: companyIds,
        education: profile.education || [],
        projects: (profile.projects || []).map((p) => ({
          ...p,
          technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies || '',
        })),
      });
    }
  }, [profile, reset]);

  const handleCompanyToggle = (companyId) => {
    setSelectedCompanies((prev) => {
      const updated = prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId];
      setValue('companies', updated);
      return updated;
    });
  };

  const handleProfileSubmit = async (data) => {
    setSaveSuccess('');
    setSaveError('');

    const formattedData = {
      ...data,
      projects: data.projects.map((proj) => ({
        ...proj,
        technologies: typeof proj.technologies === 'string'
          ? proj.technologies.split(',').map((t) => t.trim()).filter(Boolean)
          : proj.technologies || [],
      })),
    };

    try {
      const resultAction = await dispatch(upsertProfile(formattedData));
      if (upsertProfile.fulfilled.match(resultAction)) {
        setSaveSuccess('Profile saved successfully!');
        dispatch(fetchProfile());
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        setSaveError(resultAction.payload || 'Failed to save profile. Ensure values are correct.');
      }
    } catch (err) {
      setSaveError('An unexpected network error occurred.');
    }
  };

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
          <h1 className="text-xl font-bold text-indigo-400">Job-Web-App</h1>
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
          <h2 className="text-2xl font-bold text-slate-800 font-sans">Coach Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Review student readiness trackers, applications statuses, and weekly interview schedules.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200/80 gap-6 mt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Overview Analytics
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'companies'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Companies Management
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'jobs'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            Job Openings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3.5 text-sm font-bold border-b-2 transition-smooth focus:outline-none cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-650 text-indigo-700'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            My Profile
          </button>
        </div>

        {activeTab === 'overview' && (
          <>

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
          </>
        )}

        {activeTab === 'companies' && <CompaniesTab />}
        {activeTab === 'jobs' && <JobsTab />}

        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-fade-in">
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-lg">
                {saveSuccess}
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-lg">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit(handleProfileSubmit)} className="flex flex-col gap-6">
              <Card className="flex flex-col gap-6">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 font-sans">
                  Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Resume URL / Coach Credentials Portfolio"
                    id="resumeUrl"
                    placeholder="https://drive.google.com/..."
                    error={errors.resumeUrl?.message}
                    {...register('resumeUrl')}
                    className="md:col-span-2"
                  />

                  <Input
                    label="LinkedIn Profile"
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/in/..."
                    error={errors.linkedinUrl?.message}
                    {...register('linkedinUrl')}
                  />

                  <Input
                    label="GitHub / Portfolio link"
                    id="githubUrl"
                    placeholder="https://github.com/..."
                    error={errors.githubUrl?.message}
                    {...register('githubUrl')}
                  />

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">
                      Associated Companies (Where you currently work or have founded)
                    </label>
                    {companiesList.length === 0 ? (
                      <p className="text-xs text-slate-400">No companies are registered on the platform yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 max-h-40 overflow-y-auto">
                        {companiesList.map((comp) => {
                          const isSelected = selectedCompanies.includes(comp._id);
                          return (
                            <button
                              type="button"
                              key={comp._id}
                              onClick={() => handleCompanyToggle(comp._id)}
                              className={`flex items-center gap-2 p-1.5 text-xs text-left rounded-md font-semibold transition-smooth border cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                  : 'bg-white border-slate-200/80 text-slate-550 hover:bg-slate-50'
                              }`}
                            >
                              {isSelected ? (
                                <FiCheckCircle className="w-3.5 h-3.5 text-primary-650 shrink-0" />
                              ) : (
                                <FiSquare className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                              )}
                              <span className="line-clamp-1">{comp.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Education details for Coach */}
              <Card className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-800 font-sans">
                    Education & Credentials
                  </h3>
                  <Button
                    variant="secondary"
                    className="py-1 px-3 text-xs flex items-center gap-1"
                    onClick={() =>
                      appendEdu({
                        institution: '',
                        degree: '',
                        fieldOfStudy: '',
                        startYear: new Date().getFullYear(),
                        endYear: '',
                        gpa: '',
                      })
                    }
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    Add Education
                  </Button>
                </div>

                {eduFields.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    No education details added yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-6 divide-y divide-slate-100">
                    {eduFields.map((field, idx) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 first:pt-0 relative">
                        <Input
                          label="School / University"
                          id={`education.${idx}.institution`}
                          placeholder="e.g. Stanford"
                          error={errors.education?.[idx]?.institution?.message}
                          {...register(`education.${idx}.institution`)}
                        />
                        <Input
                          label="Degree"
                          id={`education.${idx}.degree`}
                          placeholder="e.g. PhD Computer Science"
                          error={errors.education?.[idx]?.degree?.message}
                          {...register(`education.${idx}.degree`)}
                        />
                        <Input
                          label="Field of Study"
                          id={`education.${idx}.fieldOfStudy`}
                          placeholder="e.g. Machine Learning"
                          error={errors.education?.[idx]?.fieldOfStudy?.message}
                          {...register(`education.${idx}.fieldOfStudy`)}
                        />
                        <Input
                          label="Start Year"
                          id={`education.${idx}.startYear`}
                          type="number"
                          placeholder="YYYY"
                          error={errors.education?.[idx]?.startYear?.message}
                          {...register(`education.${idx}.startYear`, { valueAsNumber: true })}
                        />
                        <Input
                          label="End Year (Optional)"
                          id={`education.${idx}.endYear`}
                          type="number"
                          placeholder="YYYY (Leave blank if ongoing)"
                          error={errors.education?.[idx]?.endYear?.message}
                          {...register(`education.${idx}.endYear`, {
                            setValueAs: (v) => (v === '' ? null : Number(v)),
                          })}
                        />
                        <Input
                          label="GPA / Score (Optional)"
                          id={`education.${idx}.gpa`}
                          type="number"
                          step="0.01"
                          placeholder="Scale of 10 or 4"
                          error={errors.education?.[idx]?.gpa?.message}
                          {...register(`education.${idx}.gpa`, {
                            setValueAs: (v) => (v === '' ? null : Number(v)),
                          })}
                        />
                        <Button
                          variant="danger"
                          className="absolute right-3 top-3 p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
                          onClick={() => removeEdu(idx)}
                          title="Remove Institution"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Projects details for Coach */}
              <Card className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-800 font-sans">
                    Key Projects & Publications
                  </h3>
                  <Button
                    variant="secondary"
                    className="py-1 px-3 text-xs flex items-center gap-1"
                    onClick={() =>
                      appendProj({
                        title: '',
                        description: '',
                        technologies: '',
                        link: '',
                      })
                    }
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    Add Project
                  </Button>
                </div>

                {projFields.length === 0 ? (
                  <p className="text-sm text-slate-400 py-4 text-center">
                    No projects or case studies added yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-6 divide-y divide-slate-100">
                    {projFields.map((field, idx) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 first:pt-0 relative">
                        <Input
                          label="Project Title"
                          id={`projects.${idx}.title`}
                          placeholder="e.g. Enterprise Platform Coaching System"
                          error={errors.projects?.[idx]?.title?.message}
                          {...register(`projects.${idx}.title`)}
                        />
                        <Input
                          label="Project URL (Optional)"
                          id={`projects.${idx}.link`}
                          type="url"
                          placeholder="https://..."
                          error={errors.projects?.[idx]?.link?.message}
                          {...register(`projects.${idx}.link`)}
                        />
                        <Input
                          label="Core Tech Stack (Comma separated)"
                          id={`projects.${idx}.technologies`}
                          placeholder="e.g. React, Node.js, AWS"
                          error={errors.projects?.[idx]?.technologies?.message}
                          {...register(`projects.${idx}.technologies`)}
                          className="md:col-span-2"
                        />
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                          <label htmlFor={`projects.${idx}.description`} className="text-sm font-medium text-slate-700">
                            Short Summary
                          </label>
                          <textarea
                            id={`projects.${idx}.description`}
                            rows={3}
                            placeholder="Detail your architecture role, achievements, or coaching output..."
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm transition-smooth outline-none bg-white/50 backdrop-blur-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                            {...register(`projects.${idx}.description`)}
                          />
                        </div>
                        <Button
                          variant="danger"
                          className="absolute right-3 top-3 p-1.5 rounded-lg border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
                          onClick={() => removeProj(idx)}
                          title="Remove Project"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <Button type="submit" disabled={isSubmitting} className="px-6 py-3 font-semibold">
                  {isSubmitting ? 'Saving changes...' : 'Save Profile Details'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
