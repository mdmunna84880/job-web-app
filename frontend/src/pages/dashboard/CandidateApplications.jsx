import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCandidateApplications, withdrawApplication } from '../../store/slices/applicationSlice.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { FiFileText, FiClock, FiXCircle, FiCheck, FiChevronRight } from 'react-icons/fi';

// Ordered statuses to represent tracking progress
const STATUS_ORDER = [
  'Applied',
  'Shortlisted',
  'Assessment Scheduled',
  'Assessment Completed',
  'Interview Scheduled',
  'Interview Completed',
  'Offer Received',
];

export default function CandidateApplications() {
  const dispatch = useDispatch();
  const { applicationsList, loading } = useSelector((state) => state.applications);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    dispatch(fetchCandidateApplications());
  }, [dispatch]);

  const handleWithdraw = (appId) => {
    if (window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
      dispatch(withdrawApplication(appId)).then(() => {
        // Refresh selected details panel if opened
        if (selectedApp?._id === appId) {
          setSelectedApp(null);
        }
      });
    }
  };

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-6">
        {/* Header Summary */}
        <header className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Track My Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor recruitment progress and status updates for your submitted applications.
          </p>
        </header>

        {/* Content Splitting */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Applications list (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {loading && applicationsList.length === 0 ? (
              <div className="flex justify-center items-center py-20 bg-white/40 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
              </div>
            ) : applicationsList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                <FiFileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">No Applications Submitted</h3>
                <p className="text-sm text-slate-400 mt-1">You haven't submitted any job applications yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {applicationsList.map((app) => (
                  <div
                    key={app._id}
                    className={`p-5 rounded-2xl border transition-smooth cursor-pointer bg-white ${
                      selectedApp?._id === app._id
                        ? 'border-indigo-500 ring-2 ring-indigo-50 shadow-md'
                        : 'border-slate-100 shadow-sm hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base leading-tight font-sans">
                            {app.job?.title || 'Job Opening'}
                          </h3>
                          <span className="text-xs font-semibold text-indigo-600">
                            {app.job?.company?.name || 'Private Employer'}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'Offer Received'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : app.status === 'Withdrawn'
                              ? 'bg-slate-100 text-slate-500 border border-slate-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          Applied on {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                          View details <FiChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar / Drawer */}
          <div className="lg:col-span-1">
            {selectedApp ? (
              <Card className="flex flex-col gap-5 border-t-4 border-t-indigo-600">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-base font-sans">
                    {selectedApp.job?.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Application ID: ...{selectedApp._id.slice(-8)}
                  </span>
                </div>

                {/* Status Timeline Progress Stepper */}
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Progress Steps
                  </span>

                  {selectedApp.status === 'Rejected' ? (
                    <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs">
                      <FiXCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Application Rejected</span>
                        <span>Recruiter ended the matching workflow. Don't worry, keep exploring!</span>
                      </div>
                    </div>
                  ) : selectedApp.status === 'Withdrawn' ? (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-xs">
                      <FiXCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-bold">Application Withdrawn</span>
                        <span>You cancelled your application submission.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3.5 pl-3 relative border-l border-slate-200 ml-1.5 py-1">
                      {STATUS_ORDER.map((stepName) => {
                        const currentIdx = STATUS_ORDER.indexOf(selectedApp.status);
                        const stepIdx = STATUS_ORDER.indexOf(stepName);
                        const isCompleted = stepIdx <= currentIdx;
                        const isActive = stepIdx === currentIdx;

                        return (
                          <div key={stepName} className="flex items-center gap-3 relative -left-[18px]">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                isActive
                                  ? 'bg-indigo-600 border-indigo-600 shadow'
                                  : isCompleted
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-slate-300'
                              }`}
                            >
                              {isCompleted && !isActive && <FiCheck className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span
                              className={`text-xs ${
                                isActive
                                  ? 'font-bold text-indigo-700'
                                  : isCompleted
                                  ? 'font-medium text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Remarks */}
                {selectedApp.studentRemarks && (
                  <div className="flex flex-col gap-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <span className="font-bold text-slate-550 uppercase">My Cover Note</span>
                    <p className="text-slate-600 italic whitespace-pre-wrap">
                      "{selectedApp.studentRemarks}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedApp.status !== 'Withdrawn' && selectedApp.status !== 'Rejected' && (
                  <div className="border-t border-slate-100 pt-4 flex">
                    <Button
                      variant="glass"
                      className="w-full text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 flex items-center gap-1.5"
                      onClick={() => handleWithdraw(selectedApp._id)}
                    >
                      <FiXCircle className="w-4 h-4" />
                      <span>Withdraw Application</span>
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              <div className="hidden lg:block p-6 text-center bg-slate-100/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                Select an application to view timeline progress.
              </div>
            )}
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}
