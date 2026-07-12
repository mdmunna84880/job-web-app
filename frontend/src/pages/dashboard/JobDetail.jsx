import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchJobById } from '../../store/slices/jobSlice.js';
import { fetchJobGapAnalysis } from '../../store/slices/skillsSlice.js';
import { fetchProfile } from '../../store/slices/candidateSlice.js';
import { submitApplication, fetchCandidateApplications } from '../../store/slices/applicationSlice.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import {
  FiArrowLeft,
  FiMapPin,
  FiBriefcase,
  FiDollarSign,
  FiAward,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';

export default function JobDetail() {
  const { jobId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedJob, loading: jobLoading } = useSelector((state) => state.jobs);
  const { jobGapAnalysis } = useSelector((state) => state.skills);
  const { profile, loading: profileLoading } = useSelector((state) => state.candidate);
  const { applicationsList, loading: appLoading } = useSelector((state) => state.applications);

  const [remarks, setRemarks] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    dispatch(fetchJobById(jobId));
    dispatch(fetchJobGapAnalysis(jobId));
    dispatch(fetchProfile());
    dispatch(fetchCandidateApplications());
  }, [dispatch, jobId]);

  // Check if candidate already submitted an application for this job
  const existingApplication = applicationsList.find(
    (app) => app.job?._id === jobId || app.job === jobId
  );

  const handleApply = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const resultAction = await dispatch(submitApplication({ jobId, studentRemarks: remarks }));
      if (submitApplication.fulfilled.match(resultAction)) {
        setSuccessMsg('Your application was submitted successfully!');
        setRemarks('');
        dispatch(fetchCandidateApplications());
      } else {
        setErrorMsg(resultAction.payload || 'Failed to submit application.');
      }
    } catch (err) {
      setErrorMsg('An unexpected network error occurred.');
    }
  };

  const loading = jobLoading || profileLoading || appLoading;

  if (loading && !selectedJob) {
    return (
      <CandidateLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-indigo-150 border-t-indigo-650 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500 mt-4">Loading job details...</span>
        </div>
      </CandidateLayout>
    );
  }

  if (!selectedJob) {
    return (
      <CandidateLayout>
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <FiBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">Opening Not Found</h3>
          <p className="text-sm text-slate-400 mt-1">This job opening might have been closed or removed.</p>
          <Link to="/dashboard/candidate/jobs" className="text-primary-600 hover:text-primary-700 text-sm font-bold mt-4 inline-flex items-center gap-1">
            <FiArrowLeft className="w-4 h-4" /> Back to Job Board
          </Link>
        </div>
      </CandidateLayout>
    );
  }

  const profileScore = profile?.profileCompletion || 0;
  const isProfileEligible = profileScore >= 50;

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <Link
          to="/dashboard/candidate/jobs"
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-smooth inline-flex items-center gap-1.5 self-start uppercase tracking-wider"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>

        {/* Job Title & Header Card */}
        <header className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-slate-800 font-sans">{selectedJob.title}</h1>
            <span className="text-sm font-bold text-indigo-600">
              {selectedJob.company?.name || 'Private Hiring'}
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-1">
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <FiMapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedJob.location} ({selectedJob.workMode})
              </span>
              <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                <FiBriefcase className="w-3.5 h-3.5 text-slate-400" />
                {selectedJob.jobType}
              </span>
              {selectedJob.salary?.min !== undefined && (
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-semibold text-slate-650">
                  <FiDollarSign className="w-3.5 h-3.5 text-slate-400" />
                  {selectedJob.salary.min.toLocaleString()} - {selectedJob.salary.max?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                selectedJob.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-705 border border-emerald-150'
                  : 'bg-amber-50 text-amber-705 border border-amber-150'
              }`}
            >
              {selectedJob.status}
            </span>
          </div>
        </header>

        {/* Content Splitting Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Descriptions */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-55 pb-2 font-sans">
                Job Description
              </h2>
              <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                {selectedJob.description}
              </div>
            </Card>
          </div>

          {/* Right Column: Skills gap & Application panel */}
          <div className="flex flex-col gap-6">
            {/* Skills Gap Analysis for this specific job */}
            {jobGapAnalysis && (
              <Card className="flex flex-col gap-4 border-t-4 border-t-indigo-600">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FiAward className="w-4 h-4 text-indigo-600" />
                  <span>Skills Compatibility</span>
                </h3>

                <div className="flex flex-col gap-3">
                  {/* Missing Skills */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Missing Competencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobGapAnalysis.missingSkills?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None! You satisfy all skills.</span>
                      ) : (
                        jobGapAnalysis.missingSkills?.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-semibold"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Needs Improvement */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Needs Rating Boost:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobGapAnalysis.needsImprovement?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None! All matching skills are ready.</span>
                      ) : (
                        jobGapAnalysis.needsImprovement?.map((item) => (
                          <span
                            key={item.name}
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-semibold"
                          >
                            {item.name} ({item.currentLevel})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Proficient */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-500">Verified Proficiencies:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {jobGapAnalysis.proficientSkills?.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">None logged yet.</span>
                      ) : (
                        jobGapAnalysis.proficientSkills?.map((item) => (
                          <span
                            key={item.name}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold"
                          >
                            {item.name} ({item.currentLevel})
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Application Form */}
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-450 border-b border-slate-50 pb-2">
                Application Panel
              </h3>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs font-semibold rounded-lg">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-250 text-rose-700 text-xs font-semibold rounded-lg">
                  {errorMsg}
                </div>
              )}

              {existingApplication ? (
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex items-center gap-2 text-emerald-705 font-bold text-sm">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Application Submitted</span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col gap-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-semibold uppercase">Status:</span>
                      <span className="font-bold text-slate-700">{existingApplication.status}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-400 font-semibold uppercase">Date:</span>
                      <span className="text-slate-650">
                        {new Date(existingApplication.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full text-xs font-semibold"
                    onClick={() => navigate('/dashboard/candidate/applications')}
                  >
                    Go to Applications List
                  </Button>
                </div>
              ) : !isProfileEligible ? (
                <div className="flex flex-col gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                  <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="flex flex-col gap-1 leading-normal">
                    <span className="font-bold">Profile Incomplete</span>
                    <span>
                      You must complete at least 50% of your career profile before applying. Your current completion score is{' '}
                      <strong>{profileScore}%</strong>.
                    </span>
                    <Link
                      to="/dashboard/candidate"
                      className="font-bold text-indigo-650 hover:underline mt-2 inline-block"
                    >
                      Go to Profile Details &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleApply} className="flex flex-col gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <FiInfo className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Your profile score is {profileScore}%. You are eligible to apply.</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="studentRemarks" className="text-xs font-bold text-slate-500 uppercase">
                      Cover Note / Remarks
                    </label>
                    <textarea
                      id="studentRemarks"
                      rows={4}
                      placeholder="Introduce yourself to the recruiter..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                    />
                  </div>

                  <Button type="submit" className="w-full shadow-md mt-1">
                    Apply Now
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}
