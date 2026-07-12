import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCandidateInterviews } from '../../store/slices/interviewSlice.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import { FiCalendar, FiClock, FiStar, FiFileText } from 'react-icons/fi';

export default function CandidateInterviews() {
  const dispatch = useDispatch();
  const { interviewsList, loading } = useSelector((state) => state.interviews);

  useEffect(() => {
    dispatch(fetchCandidateInterviews());
  }, [dispatch]);

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-6">
        {/* Header Summary */}
        <header className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Scheduled Interviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review interview rounds dates, types, recruiter scores, and mentor feedbacks.
          </p>
        </header>

        {loading && interviewsList.length === 0 ? (
          <div className="flex justify-center items-center py-20 bg-white/40 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-655 rounded-full animate-spin"></div>
          </div>
        ) : interviewsList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <FiCalendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Interviews Scheduled</h3>
            <p className="text-sm text-slate-400 mt-1">Recruiters haven't scheduled any interview rounds for you yet.</p>
          </div>
        ) : (
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 font-sans">Interview Rounds Tracker</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                    <th className="py-3 px-4">Job / Company</th>
                    <th className="py-3 px-4">Round</th>
                    <th className="py-3 px-4">Schedule Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-4">Interviewer Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {interviewsList.map((int) => (
                    <tr key={int._id} className="hover:bg-slate-50/50 transition-smooth align-top">
                      <td className="py-4 px-4 font-semibold text-slate-805">
                        <div className="flex flex-col">
                          <span>{int.job?.title || 'Job Opening'}</span>
                          <span className="text-xs text-indigo-600 font-semibold mt-0.5">
                            {int.job?.company?.name || 'Private Employer'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">Round {int.round}</td>
                      <td className="py-4 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5 text-xs">
                          <FiClock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{new Date(int.date).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-medium">{int.type}</td>
                      <td className="py-4 px-4 text-slate-700 font-bold">
                        {int.score !== undefined ? (
                          <div className="flex items-center gap-1">
                            <FiStar className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{int.score}/10</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal italic">--</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            int.result === 'Selected'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : int.result === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : int.result === 'On Hold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-slate-100 text-slate-505 border border-slate-200'
                          }`}
                        >
                          {int.result || 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-xs leading-relaxed text-xs">
                        {int.feedback ? (
                          <div className="flex items-start gap-1">
                            <FiFileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>{int.feedback}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No feedback submitted yet.</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </CandidateLayout>
  );
}
