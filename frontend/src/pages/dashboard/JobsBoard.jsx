import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs, setFilters, setPage, resetFilters } from '../../store/slices/jobSlice.js';
import { fetchSkillsCatalog } from '../../store/slices/skillsSlice.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { FiSearch, FiSliders, FiBriefcase, FiMapPin, FiDollarSign, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function JobsBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { jobsList, pagination, currentFilters, loading } = useSelector((state) => state.jobs);
  const { catalog } = useSelector((state) => state.skills);

  // Fetch jobs list on filters change
  useEffect(() => {
    dispatch(fetchJobs(currentFilters));
  }, [dispatch, currentFilters]);

  // Load available skills catalog for dropdown filters
  useEffect(() => {
    dispatch(fetchSkillsCatalog());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-6">
        {/* Header Summary */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans">Explore Opportunities</h1>
            <p className="text-sm text-slate-500 mt-1">
              Search and filter through active job listings matching your skillset.
            </p>
          </div>
        </header>

        {/* Search & Filter Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Filters Sidebar */}
          <Card className="flex flex-col gap-5 lg:col-span-1">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-indigo-650" />
                <span>Filters</span>
              </h2>
              <button
                onClick={() => dispatch(resetFilters())}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-smooth focus:outline-none"
              >
                Reset All
              </button>
            </div>

            {/* Work Mode */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filterWorkMode" className="text-xs font-bold text-slate-500 uppercase">
                Work Mode
              </label>
              <select
                id="filterWorkMode"
                value={currentFilters.workMode}
                onChange={(e) => handleFilterChange('workMode', e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
              >
                <option value="">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Job Type */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filterJobType" className="text-xs font-bold text-slate-500 uppercase">
                Job Type
              </label>
              <select
                id="filterJobType"
                value={currentFilters.jobType}
                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
              >
                <option value="">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Required Skill */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="filterSkill" className="text-xs font-bold text-slate-500 uppercase">
                Required Competency
              </label>
              <select
                id="filterSkill"
                value={currentFilters.requiredSkills}
                onChange={(e) => handleFilterChange('requiredSkills', e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
              >
                <option value="">All Skills</option>
                {catalog.map((skill) => (
                  <option key={skill._id} value={skill._id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary Range */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Est. Stipend / Salary</span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Min"
                  id="minSalary"
                  type="number"
                  placeholder="Min ($)"
                  value={currentFilters.minSalary}
                  onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                  className="text-xs"
                />
                <Input
                  label="Max"
                  id="maxSalary"
                  type="number"
                  placeholder="Max ($)"
                  value={currentFilters.maxSalary}
                  onChange={(e) => handleFilterChange('maxSalary', e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Job listings list and search box */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by job title, location, or company name..."
                  value={currentFilters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth text-sm"
                />
              </div>
            </form>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/40 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-slate-400 mt-3">Fetching openings...</span>
              </div>
            ) : jobsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 text-center px-6">
                <FiBriefcase className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Job Openings Found</h3>
                <p className="text-sm text-slate-400 max-w-sm mt-1">
                  We couldn't find any job postings matching your filter combinations. Try resetting filters or search criteria.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobsList.map((job) => (
                    <Card key={job._id} className="flex flex-col justify-between gap-4 p-5 hover:shadow-md transition-smooth">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 text-base leading-tight font-sans">
                            {job.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              job.jobType === 'Full-Time'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
                                : job.jobType === 'Internship'
                                ? 'bg-sky-50 text-sky-700 border border-sky-150'
                                : 'bg-slate-100 text-slate-750 border border-slate-200'
                            }`}
                          >
                            {job.jobType}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-indigo-600">
                          {job.company?.name || 'Private Hiring'}
                        </span>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-1">
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-3.5 h-3.5" />
                            {job.location} ({job.workMode})
                          </span>
                          {job.salary?.min !== undefined && (
                            <span className="flex items-center gap-0.5 font-medium text-slate-600">
                              <FiDollarSign className="w-3.5 h-3.5" />
                              {job.salary.min.toLocaleString()} - {job.salary.max?.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Skill Tags */}
                        {job.requiredSkills?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <FiAward className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            {job.requiredSkills.map((skill) => (
                              <span
                                key={skill._id}
                                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100 text-[10px] font-medium"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-50 pt-3 mt-1 flex justify-end">
                        <Button
                          variant="secondary"
                          className="py-1.5 px-4 text-xs font-semibold"
                          onClick={() => navigate(`/dashboard/candidate/jobs/${job._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <nav className="flex justify-center items-center gap-1 mt-6" aria-label="Pagination Navigation">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => dispatch(setPage(pageNum))}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-smooth focus:outline-none ${
                          pagination.page === pageNum
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={pagination.page === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </nav>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </CandidateLayout>
  );
}
