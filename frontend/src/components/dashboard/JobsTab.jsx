import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchJobs,
  createJob,
  updateJob,
  deleteJob,
  clearJobErrors,
} from '../../store/slices/jobSlice.js';
import { fetchCompanies } from '../../store/slices/companySlice.js';
import { fetchSkillsCatalog } from '../../store/slices/skillsSlice.js';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiCalendar,
  FiLayers,
  FiX,
  FiCheckSquare,
  FiSquare,
} from 'react-icons/fi';

const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const JOB_TYPES = ['Internship', 'Full-Time', 'Contract'];
const JOB_STATUSES = ['Active', 'Closed', 'On Hold'];

export default function JobsTab() {
  const dispatch = useDispatch();
  const { jobsList, loading: jobsLoading, submitError } = useSelector((state) => state.jobs);
  const { companiesList } = useSelector((state) => state.companies);
  const { catalog: skillsCatalog } = useSelector((state) => state.skills);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form states
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

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchJobs({ search, status: '' })); // Fetch all jobs regardless of status
    dispatch(fetchCompanies({ limit: 1000 }));
    dispatch(fetchSkillsCatalog());
  }, [dispatch, search]);

  useEffect(() => {
    if (submitError?.errors) {
      setValidationErrors(submitError.errors);
    } else {
      setValidationErrors({});
    }
  }, [submitError]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      companyId: companiesList[0]?._id || '',
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
    dispatch(clearJobErrors());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      companyId: job.company?._id || '',
      location: job.location || '',
      workMode: job.workMode || 'On-site',
      jobType: job.jobType || 'Full-Time',
      requiredSkills: (job.requiredSkills || []).map((sk) => sk._id || sk),
      salaryMin: job.salary?.min !== undefined && job.salary?.min !== null ? job.salary.min : '',
      salaryMax: job.salary?.max !== undefined && job.salary?.max !== null ? job.salary.max : '',
      eligibilityCriteria: job.eligibilityCriteria || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      status: job.status || 'Active',
      description: job.description || '',
    });
    setValidationErrors({});
    dispatch(clearJobErrors());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    dispatch(clearJobErrors());
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
      
      if (validationErrors.requiredSkills) {
        setValidationErrors((errs) => ({ ...errs, requiredSkills: null }));
      }
      return { ...prev, requiredSkills: skills };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    // Parse numeric salary fields
    const parsedData = {
      ...formData,
      salaryMin: formData.salaryMin === '' ? null : Number(formData.salaryMin),
      salaryMax: formData.salaryMax === '' ? null : Number(formData.salaryMax),
      deadline: formData.deadline === '' ? null : formData.deadline,
    };

    let result;
    if (editingJob) {
      result = await dispatch(updateJob({ id: editingJob._id, jobData: parsedData }));
    } else {
      result = await dispatch(createJob(parsedData));
    }

    if (!result.error) {
      setIsModalOpen(false);
      dispatch(fetchJobs({ search, status: '' }));
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to remove the job posting for "${title}"?`)) {
      const result = await dispatch(deleteJob(id));
      if (!result.error) {
        dispatch(fetchJobs({ search, status: '' }));
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header controls inside a glass-panel layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div className="relative flex-1 max-w-md w-full">
          <FiSearch className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search job title, location, or company..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white/70 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shrink-0">
          <FiPlus className="w-4 h-4" />
          <span>Post Job Opening</span>
        </Button>
      </div>

      {/* Jobs List Table */}
      <Card className="overflow-hidden border border-slate-100 p-0 shadow-sm">
        {jobsLoading && jobsList.length === 0 ? (
          <div className="flex justify-center items-center py-20 bg-white/30">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
          </div>
        ) : jobsList.length === 0 ? (
          <div className="text-center py-16 bg-white/40">
            <FiBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Job Postings Found</h3>
            <p className="text-sm text-slate-400 mt-1">Get started by creating a new job opening.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white/20">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 text-xs font-bold uppercase bg-slate-50/50">
                  <th className="py-4 px-6">Position / Company</th>
                  <th className="py-4 px-6">Location / Type</th>
                  <th className="py-4 px-6">Salary Range</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-sm">
                {jobsList.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-smooth align-middle">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{job.title}</span>
                        <span className="text-xs text-primary-650 font-semibold mt-0.5">
                          {job.company?.name || 'Unknown Company'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <FiMapPin className="w-3 h-3 text-slate-400" />
                          {job.location} ({job.workMode})
                        </span>
                        <span className="text-xs text-slate-400">{job.jobType}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-650 font-sans font-medium">
                      <span className="flex items-center gap-0.5">
                        <FiDollarSign className="w-3.5 h-3.5 text-slate-400" />
                        {job.salary?.min !== undefined && job.salary?.max !== undefined
                          ? `₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()}`
                          : 'Not Specified'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : job.status === 'Closed'
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="glass"
                          onClick={() => handleOpenEditModal(job)}
                          className="p-2 border border-slate-200 text-slate-650 hover:bg-slate-50"
                          title="Edit Job Posting"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="glass"
                          onClick={() => handleDelete(job._id, job.title)}
                          className="p-2 border border-rose-100 text-rose-650 hover:bg-rose-50"
                          title="Delete Job Posting"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Post/Edit Job Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-6 relative shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-800">
                {editingJob ? 'Modify Job Posting' : 'Publish New Job Opening'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-smooth"
                aria-label="Close dialog"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {submitError && !submitError.errors && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-lg">
                {submitError.message}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Job Title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Frontend Developer Intern"
                  error={validationErrors.title}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="companyId" className="text-sm font-medium text-slate-700">
                    Associated Company <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="companyId"
                    value={formData.companyId}
                    onChange={handleInputChange}
                    required
                    className={`px-3 py-2.5 rounded-lg border text-sm transition-smooth outline-none bg-white/50 backdrop-blur-sm ${
                      validationErrors.companyId
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-slate-200 focus:border-primary-500'
                    }`}
                  >
                    <option value="" disabled>Select Company...</option>
                    {companiesList.map((comp) => (
                      <option key={comp._id} value={comp._id}>
                        {comp.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.companyId && (
                    <span className="text-xs text-rose-500 font-medium">{validationErrors.companyId}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Location"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Bengaluru, Remote"
                  error={validationErrors.location}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="workMode" className="text-sm font-medium text-slate-700">
                    Work Mode <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 transition-smooth"
                  >
                    {WORK_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="jobType" className="text-sm font-medium text-slate-700">
                    Job Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 transition-smooth"
                  >
                    {JOB_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Minimum Salary (Monthly / INR)"
                  id="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="e.g. 25000"
                  error={validationErrors.salaryMin}
                />

                <Input
                  label="Maximum Salary (Monthly / INR)"
                  id="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="e.g. 40000"
                  error={validationErrors.salaryMax}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Application Deadline"
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  error={validationErrors.deadline}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="status" className="text-sm font-medium text-slate-700">
                    Posting Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 transition-smooth"
                  >
                    {JOB_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Required Skills <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-200/60 max-h-40 overflow-y-auto">
                  {skillsCatalog.map((skill) => {
                    const isSelected = formData.requiredSkills.includes(skill._id);
                    return (
                      <button
                        type="button"
                        key={skill._id}
                        onClick={() => handleSkillToggle(skill._id)}
                        className={`flex items-center gap-2 p-1.5 text-xs text-left rounded-md font-semibold transition-smooth border ${
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
                        <span className="line-clamp-1">{skill.name}</span>
                      </button>
                    );
                  })}
                </div>
                {validationErrors.requiredSkills && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.requiredSkills}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="eligibilityCriteria" className="text-sm font-medium text-slate-700">
                  Eligibility Criteria
                </label>
                <textarea
                  id="eligibilityCriteria"
                  rows={2}
                  value={formData.eligibilityCriteria}
                  onChange={handleInputChange}
                  placeholder="e.g. B.Tech CS / MCA students from 2026 graduation batch with 75%+ GPA..."
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm transition-smooth outline-none bg-white/50 backdrop-blur-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                {validationErrors.eligibilityCriteria && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.eligibilityCriteria}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Summarize key responsibilities, requirements, daily tasks, etc..."
                  className={`px-3 py-2 rounded-lg border text-sm transition-smooth outline-none bg-white/50 backdrop-blur-sm ${
                    validationErrors.description
                      ? 'border-rose-300 focus:border-rose-500'
                      : 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                  }`}
                />
                {validationErrors.description && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.description}</span>
                )}
              </div>

              {/* Form Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={jobsLoading}>
                  {jobsLoading ? 'Publishing...' : editingJob ? 'Save Changes' : 'Post Job'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
