import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs, setFilters, setPage, resetFilters, createJob } from '../../store/slices/jobSlice.js';
import { fetchSkillsCatalog } from '../../store/slices/skillsSlice.js';
import { fetchProfile } from '../../store/slices/candidateSlice.js';
import { fetchCompanies } from '../../store/slices/companySlice.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import {
  FiSearch,
  FiSliders,
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiAward,
  FiPlus,
  FiX,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function JobsBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { jobsList, pagination, currentFilters, loading } = useSelector((state) => state.jobs);
  const { catalog: skillsCatalog } = useSelector((state) => state.skills);
  const { profile } = useSelector((state) => state.candidate);
  const { companiesList } = useSelector((state) => state.companies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    companyId: '',
    location: '',
    workMode: 'On-site',
    jobType: 'Full-Time',
    requiredSkills: [],
    salaryMin: '',
    salaryMax: '',
    eligibilityCriteria: '',
    deadline: '',
    status: 'Active',
    description: '',
  });

  // Fetch jobs list on filters change
  useEffect(() => {
    dispatch(fetchJobs(currentFilters));
  }, [dispatch, currentFilters]);

  // Load available skills, companies, and candidate profile
  useEffect(() => {
    dispatch(fetchSkillsCatalog());
    dispatch(fetchProfile());
    dispatch(fetchCompanies({ limit: 1000 }));
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleOpenPostJobModal = () => {
    // Check if they are associated with any companies in their profile first
    const candidateCompanies = (profile?.companies || []).map((c) => c._id || c);
    if (candidateCompanies.length === 0) {
      alert("You must register a company or add associated companies to your profile before you can post a job opening.");
      return;
    }

    // Candidates are expected to be job seekers. Confirm their intent first.
    if (window.confirm("As a candidate seeking a job, are you sure you want to post a new job opening? Candidates are expected to seek jobs rather than post them.")) {
      setFormData({
        title: '',
        companyId: candidateCompanies[0] || '',
        location: '',
        workMode: 'On-site',
        jobType: 'Full-Time',
        requiredSkills: [],
        salaryMin: '',
        salaryMax: '',
        eligibilityCriteria: '',
        deadline: '',
        status: 'Active',
        description: '',
      });
      setValidationErrors({});
      setIsModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (validationErrors[id]) {
      setValidationErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleSkillToggle = (skillId) => {
    setFormData((prev) => {
      const skills = prev.requiredSkills.includes(skillId)
        ? prev.requiredSkills.filter((id) => id !== skillId)
        : [...prev.requiredSkills, skillId];
      return { ...prev, requiredSkills: skills };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const parsedData = {
      ...formData,
      salaryMin: formData.salaryMin === '' ? null : Number(formData.salaryMin),
      salaryMax: formData.salaryMax === '' ? null : Number(formData.salaryMax),
      deadline: formData.deadline === '' ? null : formData.deadline,
    };

    const result = await dispatch(createJob(parsedData));
    if (!result.error) {
      setIsModalOpen(false);
      dispatch(fetchJobs(currentFilters));
      alert('Job posted successfully!');
    } else {
      if (result.payload?.errors) {
        setValidationErrors(result.payload.errors);
      } else {
        alert(result.payload?.message || result.error?.message || 'Failed to post job.');
      }
    }
  };

  const candidateCompanies = (profile?.companies || []).map((c) => c._id || c);
  const allowedCompanies = companiesList.filter((comp) => candidateCompanies.includes(comp._id));

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
          <Button
            variant="primary"
            onClick={handleOpenPostJobModal}
            className="flex items-center gap-2 font-semibold px-4 py-2 text-sm shrink-0 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Post a Job</span>
          </Button>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 flex flex-col max-h-[90vh] my-8 animate-scale-up">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-sans">Post a New Job Opening</h3>
                <p className="text-xs text-slate-400 mt-0.5">Post a job for a company you own or work at</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-smooth cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  id="title"
                  placeholder="e.g. Senior React Developer"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={validationErrors.title}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyId" className="text-sm font-semibold text-slate-700">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                    required
                  >
                    {allowedCompanies.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.companyId && (
                    <span className="text-xs text-rose-500 font-medium">{validationErrors.companyId}</span>
                  )}
                </div>

                <Input
                  label="Job Location"
                  id="location"
                  placeholder="e.g. Bangalore, India"
                  value={formData.location}
                  onChange={handleInputChange}
                  error={validationErrors.location}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="workMode" className="text-sm font-semibold text-slate-700">
                    Work Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="jobType" className="text-sm font-semibold text-slate-700">
                    Job Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <Input
                  label="Deadline"
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  error={validationErrors.deadline}
                />

                <Input
                  label="Min Salary (Annual / INR)"
                  id="salaryMin"
                  type="number"
                  placeholder="e.g. 600000"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  error={validationErrors.salaryMin}
                />

                <Input
                  label="Max Salary (Annual / INR)"
                  id="salaryMax"
                  type="number"
                  placeholder="e.g. 1200000"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  error={validationErrors.salaryMax}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="eligibilityCriteria" className="text-sm font-semibold text-slate-700">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  id="eligibilityCriteria"
                  placeholder="e.g. B.Tech / MCA with 2+ years of experience"
                  value={formData.eligibilityCriteria}
                  onChange={handleInputChange}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                />
                {validationErrors.eligibilityCriteria && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.eligibilityCriteria}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Detailed responsibilities, expectations, etc..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm transition-smooth outline-none bg-white/50 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  required
                />
                {validationErrors.description && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.description}</span>
                )}
              </div>

              {/* Skills Multi-Select Checklist */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Required Skills <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 max-h-40 overflow-y-auto">
                  {skillsCatalog.map((sk) => {
                    const isSelected = formData.requiredSkills.includes(sk._id);
                    return (
                      <button
                        type="button"
                        key={sk._id}
                        onClick={() => handleSkillToggle(sk._id)}
                        className={`flex items-center gap-2 p-1.5 text-xs text-left rounded-md font-semibold transition-smooth border cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-white border-slate-200/80 text-slate-550 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? (
                          <FiCheckSquare className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                        ) : (
                          <FiSquare className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                        )}
                        <span className="line-clamp-1">{sk.name}</span>
                      </button>
                    );
                  })}
                </div>
                {validationErrors.requiredSkills && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.requiredSkills}</span>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold"
                >
                  Cancel
                </Button>
                <Button type="submit" className="px-5 py-2 text-sm font-semibold">
                  Post Job Opening
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CandidateLayout>
  );
}
