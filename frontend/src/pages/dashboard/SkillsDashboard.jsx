import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchSkillsCatalog,
  fetchCandidateSkills,
  fetchGapAnalysis,
  rateSkill,
  deleteSkillRating,
} from '../../store/slices/skillsSlice.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FiPlus, FiTrash2, FiAward, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

// Numeric mapping of proficiency levels for plotting
const PROFICIENCY_VALUES = {
  'Beginner': 1,
  'Intermediate': 2,
  'Advanced': 3,
  'Placement Ready': 4,
};

export default function SkillsDashboard() {
  const dispatch = useDispatch();
  const { catalog, candidateSkills, gapAnalysis, loading } = useSelector((state) => state.skills);
  const { profile } = useSelector((state) => state.candidate);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [proficiency, setProficiency] = useState('Beginner');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    dispatch(fetchSkillsCatalog());
    dispatch(fetchCandidateSkills());
    dispatch(fetchGapAnalysis());
  }, [dispatch]);

  const handleRateSkill = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedSkillId) {
      setErrorMsg('Please select a skill to rate.');
      return;
    }

    try {
      const resultAction = await dispatch(
        rateSkill({ skillId: selectedSkillId, proficiencyLevel: proficiency })
      );
      if (rateSkill.fulfilled.match(resultAction)) {
        setModalOpen(false);
        setSelectedSkillId('');
        setProficiency('Beginner');
      } else {
        setErrorMsg(resultAction.payload || 'Failed to submit skill rating.');
      }
    } catch (err) {
      setErrorMsg('An unexpected network error occurred.');
    }
  };

  const handleDeleteRating = (ratingId) => {
    if (window.confirm('Are you sure you want to remove this skill rating?')) {
      dispatch(deleteSkillRating(ratingId));
    }
  };

  // Convert gap details into Recharts compatible data format
  const getChartData = () => {
    if (!gapAnalysis) return [];

    const data = [];

    // Add proficient skills
    (gapAnalysis.proficientSkills || []).forEach((item) => {
      data.push({
        name: item.name,
        current: PROFICIENCY_VALUES[item.currentLevel] || 0,
        required: 4, // "Placement Ready"
      });
    });

    // Add needs improvement skills
    (gapAnalysis.needsImprovement || []).forEach((item) => {
      data.push({
        name: item.name,
        current: PROFICIENCY_VALUES[item.currentLevel] || 0,
        required: 4,
      });
    });

    // Add missing skills
    (gapAnalysis.missingSkills || []).forEach((skillName) => {
      data.push({
        name: skillName,
        current: 0,
        required: 4,
      });
    });

    return data;
  };

  const chartData = getChartData();

  // Filter out catalog options that have already been rated by the user
  const availableCatalogSkills = catalog.filter(
    (catSkill) =>
      !candidateSkills.some(
        (userSkill) => userSkill.skill?._id === catSkill._id || userSkill.skill === catSkill._id
      )
  );

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-6">
        {/* Header Summary */}
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans">Skills & Gaps Analysis</h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify your professional capabilities against the standards of your target role: <strong className="text-slate-700">{profile?.preferredRole || 'Not Set'}</strong>.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 shadow-md">
            <FiPlus className="w-4 h-4" />
            <span>Rate a Skill</span>
          </Button>
        </header>

        {/* Visual Gaps Comparison Chart (Recharts) */}
        {chartData.length > 0 && (
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 font-sans">Readiness Gaps Chart</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis
                    domain={[0, 4]}
                    ticks={[0, 1, 2, 3, 4]}
                    tickFormatter={(val) => {
                      if (val === 1) return 'Beginner';
                      if (val === 2) return 'Intermediate';
                      if (val === 3) return 'Advanced';
                      if (val === 4) return 'Ready';
                      return '';
                    }}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val, name) => {
                      const levelName = Object.keys(PROFICIENCY_VALUES).find(
                        (k) => PROFICIENCY_VALUES[k] === val
                      );
                      return [levelName || (val === 4 ? 'Placement Ready' : 'None'), name === 'current' ? 'My Level' : 'Required'];
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="current"
                    name="My Level"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="required"
                    name="Placement Standard"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Gaps Checklist Grid */}
        {gapAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Missing Skills */}
            <Card className="flex flex-col gap-4 border-l-4 border-l-rose-500">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <FiAlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Missing Skills ({gapAnalysis.missingSkills?.length || 0})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {gapAnalysis.missingSkills?.length === 0 ? (
                  <span className="text-xs text-slate-400">No missing skills! You satisfy all standard role competencies.</span>
                ) : (
                  gapAnalysis.missingSkills?.map((skillName) => (
                    <span
                      key={skillName}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 text-xs font-semibold"
                    >
                      {skillName}
                    </span>
                  ))
                )}
              </div>
            </Card>

            {/* Needs Improvement */}
            <Card className="flex flex-col gap-4 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <FiAward className="w-5 h-5 text-amber-500" />
                <span>Needs Improvement ({gapAnalysis.needsImprovement?.length || 0})</span>
              </div>
              <div className="flex flex-col gap-2">
                {gapAnalysis.needsImprovement?.length === 0 ? (
                  <span className="text-xs text-slate-400">All your role skills are advanced or ready!</span>
                ) : (
                  gapAnalysis.needsImprovement?.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {item.currentLevel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Proficient Skills */}
            <Card className="flex flex-col gap-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Proficient & Ready ({gapAnalysis.proficientSkills?.length || 0})</span>
              </div>
              <div className="flex flex-col gap-2">
                {gapAnalysis.proficientSkills?.length === 0 ? (
                  <span className="text-xs text-slate-400">Add skill logs to demonstrate your capabilities.</span>
                ) : (
                  gapAnalysis.proficientSkills?.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-750">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.currentLevel}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Rated Skills Table */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 font-sans">Skill Directory Logs</h2>
          {candidateSkills.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No skills logged yet. Use the "+ Rate a Skill" button to add your technical proficiencies.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                    <th className="py-3 px-4">Skill Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Proficiency Level</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {candidateSkills.map((rating) => (
                    <tr key={rating._id} className="hover:bg-slate-50/50 transition-smooth">
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {rating.skill?.name || 'Unknown Skill'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {rating.skill?.category || 'General'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            rating.proficiencyLevel === 'Placement Ready'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : rating.proficiencyLevel === 'Advanced'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : rating.proficiencyLevel === 'Intermediate'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {rating.proficiencyLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRating(rating._id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-smooth focus:outline-none"
                          aria-label={`Delete rating for ${rating.skill?.name}`}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Log/Rate Skill Overlay Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md relative z-10">
            <h3 className="text-xl font-bold text-slate-800 border-b border-slate-150 pb-3 mb-4 font-sans">
              Log Technical Skill
            </h3>

            {errorMsg && (
              <div className="mb-4 p-2.5 bg-rose-50 border border-rose-250 text-rose-700 text-xs font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRateSkill} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modalSkill" className="text-sm font-medium text-slate-700">
                  Select Skill Catalog Item <span className="text-rose-500">*</span>
                </label>
                <select
                  id="modalSkill"
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                >
                  <option value="">-- Choose Skill --</option>
                  {availableCatalogSkills.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="modalProficiency" className="text-sm font-medium text-slate-700">
                  Proficiency level <span className="text-rose-500">*</span>
                </label>
                <select
                  id="modalProficiency"
                  value={proficiency}
                  onChange={(e) => setProficiency(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Placement Ready">Placement Ready</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Rating</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </CandidateLayout>
  );
}
