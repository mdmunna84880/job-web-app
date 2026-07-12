import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { fetchProfile, upsertProfile } from '../../store/slices/candidateSlice.js';
import { fetchCompanies } from '../../store/slices/companySlice.js';
import { profileSchema } from '../../utils/validationSchemas.js';
import CandidateLayout from '../../components/layout/CandidateLayout.jsx';
import Card from '../../components/common/Card.jsx';
import Input from '../../components/common/Input.jsx';
import Button from '../../components/common/Button.jsx';
import { FiPlus, FiTrash2, FiCheckCircle, FiAlertCircle, FiSquare } from 'react-icons/fi';

export default function CandidateDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading, error } = useSelector((state) => state.candidate);
  const { companiesList } = useSelector((state) => state.companies);
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
      preferredRole: 'Frontend Developer',
      resumeUrl: '',
      linkedinUrl: '',
      githubUrl: '',
      education: [],
      projects: [],
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

  // Load profile and companies catalog on load
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchCompanies({ limit: 1000 }));
  }, [dispatch]);

  // Sync profile details with React Hook Form and local component state
  useEffect(() => {
    if (profile) {
      const companyIds = (profile.companies || []).map((c) => c._id || c);
      setSelectedCompanies(companyIds);
      reset({
        preferredRole: profile.preferredRole || 'Frontend Developer',
        resumeUrl: profile.resumeUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        companies: companyIds,
        education: profile.education || [],
        // Convert array of technologies to comma-separated string for easy UI text entry
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

  const onSubmit = async (data) => {
    setSaveSuccess('');
    setSaveError('');

    // Preprocess: Map technologies string back to an array
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
        // Refresh the profile to get the newly calculated completion scores
        dispatch(fetchProfile());
        setTimeout(() => setSaveSuccess(''), 3000);
      } else {
        setSaveError(resultAction.payload || 'Failed to save profile. Ensure values are correct.');
      }
    } catch (err) {
      setSaveError('An unexpected network error occurred.');
    }
  };

  if (loading && !profile) {
    return (
      <CandidateLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500 mt-4">Retrieving profile...</span>
        </div>
      </CandidateLayout>
    );
  }

  // Helper lists to map readiness steps
  const score = profile?.profileCompletion || 0;
  const status = profile?.readinessStatus || 'Not Ready';

  return (
    <CandidateLayout>
      <div className="flex flex-col gap-6">
        {/* Header Summary */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-sans">My Placement Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Complete your profile details to become placement-ready.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                status === 'Placement Ready'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {status}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Profile:</span>
              <span className="text-sm font-extrabold text-indigo-600">{score}%</span>
            </div>
          </div>
        </header>

        {/* Stepper Progress Indicator */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Readiness Checklist
          </h2>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs mt-2">
            {[
              { label: 'Preferred Role (+10%)', active: !!profile?.preferredRole },
              { label: 'Education List (+20%)', active: profile?.education?.length > 0 },
              { label: 'Projects List (+20%)', active: profile?.projects?.length > 0 },
              { label: 'Resume URL (+20%)', active: !!profile?.resumeUrl },
              { label: 'LinkedIn URL (+15%)', active: !!profile?.linkedinUrl },
              { label: 'GitHub URL (+15%)', active: !!profile?.githubUrl },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2.5 rounded-xl border transition-smooth ${
                  step.active
                    ? 'bg-indigo-50/50 text-indigo-800 border-indigo-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {step.active ? (
                  <FiCheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
                <span className="font-medium leading-none">{step.label}</span>
              </div>
            ))}
          </div>
        </section>

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

        {/* Profile Upsert Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 font-sans">
              Basic Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.role === 'candidate' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="preferredRole" className="text-sm font-medium text-slate-700">
                    Target Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="preferredRole"
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                    {...register('preferredRole')}
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="QA Engineer">QA Engineer</option>
                  </select>
                  {errors.preferredRole && (
                    <span className="text-xs text-rose-500 font-medium">{errors.preferredRole.message}</span>
                  )}
                </div>
              )}

              <Input
                label="Resume URL (Google Drive / Dropbox)"
                id="resumeUrl"
                placeholder="https://drive.google.com/..."
                error={errors.resumeUrl?.message}
                {...register('resumeUrl')}
                className={user?.role !== 'candidate' ? 'md:col-span-2' : ''}
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
                            <FiCheckCircle className="w-3.5 h-3.5 text-primary-600 shrink-0" />
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

          {/* Education Block */}
          <Card className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-sans">Education History</h3>
              <Button
                variant="secondary"
                type="button"
                className="py-1 px-3 text-xs flex items-center gap-1.5"
                onClick={() =>
                  appendEdu({
                    institution: '',
                    degree: '',
                    fieldOfStudy: '',
                    startYear: new Date().getFullYear() - 4,
                    endYear: new Date().getFullYear(),
                    gpa: '',
                  })
                }
              >
                <FiPlus className="w-3.5 h-3.5" />
                Add Institution
              </Button>
            </div>

            {eduFields.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                No education history added yet. Click "Add Institution" to log degrees.
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
                      placeholder="e.g. Bachelor of Science"
                      error={errors.education?.[idx]?.degree?.message}
                      {...register(`education.${idx}.degree`)}
                    />
                    <Input
                      label="Field of Study"
                      id={`education.${idx}.fieldOfStudy`}
                      placeholder="e.g. Computer Science"
                      error={errors.education?.[idx]?.fieldOfStudy?.message}
                      {...register(`education.${idx}.fieldOfStudy`)}
                    />
                    <Input
                      label="Start Year"
                      id={`education.${idx}.startYear`}
                      type="number"
                      placeholder="e.g. 2022"
                      error={errors.education?.[idx]?.startYear?.message}
                      {...register(`education.${idx}.startYear`, { valueAsNumber: true })}
                    />
                    <Input
                      label="End Year (or Expected)"
                      id={`education.${idx}.endYear`}
                      type="number"
                      placeholder="e.g. 2026"
                      error={errors.education?.[idx]?.endYear?.message}
                      {...register(`education.${idx}.endYear`, { valueAsNumber: true })}
                    />
                    <Input
                      label="GPA (0 - 10)"
                      id={`education.${idx}.gpa`}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 8.5"
                      error={errors.education?.[idx]?.gpa?.message}
                      {...register(`education.${idx}.gpa`, { valueAsNumber: true })}
                    />
                    <div className="col-span-1 md:col-span-3 flex justify-end">
                      <Button
                        variant="glass"
                        className="text-rose-600 hover:bg-rose-50 border-none p-2 mt-1 flex items-center gap-1 text-xs"
                        onClick={() => removeEdu(idx)}
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove Entry
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Projects Block */}
          <Card className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 font-sans">Personal Projects</h3>
              <Button
                variant="secondary"
                type="button"
                className="py-1 px-3 text-xs flex items-center gap-1.5"
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
                No projects added yet. Click "Add Project" to log work.
              </p>
            ) : (
              <div className="flex flex-col gap-6 divide-y divide-slate-100">
                {projFields.map((field, idx) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 first:pt-0">
                    <Input
                      label="Project Title"
                      id={`projects.${idx}.title`}
                      placeholder="e.g. Task Board App"
                      error={errors.projects?.[idx]?.title?.message}
                      {...register(`projects.${idx}.title`)}
                    />
                    <Input
                      label="Project URL"
                      id={`projects.${idx}.link`}
                      placeholder="https://github.com/..."
                      error={errors.projects?.[idx]?.link?.message}
                      {...register(`projects.${idx}.link`)}
                    />
                    <Input
                      label="Technologies (comma-separated)"
                      id={`projects.${idx}.technologies`}
                      placeholder="e.g. React, Node.js, Express"
                      error={errors.projects?.[idx]?.technologies?.message}
                      className="col-span-1 md:col-span-2"
                      {...register(`projects.${idx}.technologies`)}
                    />
                    <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                      <label htmlFor={`projects.${idx}.description`} className="text-sm font-medium text-slate-700">
                        Description / Accomplishments
                      </label>
                      <textarea
                        id={`projects.${idx}.description`}
                        rows={2}
                        placeholder="Brief summary of the build..."
                        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                        {...register(`projects.${idx}.description`)}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                      <Button
                        variant="glass"
                        className="text-rose-600 hover:bg-rose-50 border-none p-2 mt-1 flex items-center gap-1 text-xs"
                        onClick={() => removeProj(idx)}
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Remove Project
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submit Block */}
          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 shadow-md"
            >
              {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </CandidateLayout>
  );
}
