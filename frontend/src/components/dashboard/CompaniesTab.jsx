import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  clearCompanyErrors,
} from '../../store/slices/companySlice.js';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';
import Input from '../common/Input.jsx';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiGlobe, FiLayers, FiX } from 'react-icons/fi';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

export default function CompaniesTab() {
  const dispatch = useDispatch();
  const { companiesList, loading, submitError } = useSelector((state) => state.companies);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    size: '11-50',
    logo: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCompanies({ search }));
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
    setEditingCompany(null);
    setFormData({
      name: '',
      description: '',
      industry: '',
      website: '',
      size: '11-50',
      logo: '',
    });
    setValidationErrors({});
    dispatch(clearCompanyErrors());
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      website: company.website || '',
      size: company.size || '11-50',
      logo: company.logo || '',
    });
    setValidationErrors({});
    dispatch(clearCompanyErrors());
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
    dispatch(clearCompanyErrors());
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear field-level error as user types
    if (validationErrors[id]) {
      setValidationErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    let result;
    if (editingCompany) {
      result = await dispatch(updateCompany({ id: editingCompany._id, companyData: formData }));
    } else {
      result = await dispatch(createCompany(formData));
    }

    if (!result.error) {
      setIsModalOpen(false);
      dispatch(fetchCompanies({ search }));
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      const result = await dispatch(deleteCompany(id));
      if (!result.error) {
        dispatch(fetchCompanies({ search }));
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
            placeholder="Search companies by name..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white/70 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
          />
        </div>
        <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 shrink-0">
          <FiPlus className="w-4 h-4" />
          <span>Register Company</span>
        </Button>
      </div>

      {/* Companies List Table */}
      <Card className="overflow-hidden border border-slate-100 p-0 shadow-sm">
        {loading && companiesList.length === 0 ? (
          <div className="flex justify-center items-center py-20 bg-white/30">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-650 rounded-full animate-spin"></div>
          </div>
        ) : companiesList.length === 0 ? (
          <div className="text-center py-16 bg-white/40">
            <FiLayers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Companies Registered</h3>
            <p className="text-sm text-slate-400 mt-1">Get started by registering a new company.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-white/20">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 text-xs font-bold uppercase bg-slate-50/50">
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Industry</th>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6">Website</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 text-sm">
                {companiesList.map((company) => (
                  <tr key={company._id} className="hover:bg-slate-50/50 transition-smooth align-middle">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={`${company.name} Logo`}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200/50"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/40x40?text=C';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center font-bold text-base">
                            {company.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{company.name}</span>
                          <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">{company.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">{company.industry || '—'}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-50/60 text-indigo-700 border border-indigo-100/40">
                        {company.size || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-sans">
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          <FiGlobe className="w-3.5 h-3.5" />
                          <span>Link</span>
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="glass"
                          onClick={() => handleOpenEditModal(company)}
                          className="p-2 border border-slate-200 text-slate-650 hover:bg-slate-50"
                          title="Edit Company"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="glass"
                          onClick={() => handleDelete(company._id, company.name)}
                          className="p-2 border border-rose-100 text-rose-650 hover:bg-rose-50"
                          title="Delete Company"
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

      {/* Register/Edit Company Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-6 relative shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCompany ? 'Update Company Profile' : 'Register New Company'}
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
              <Input
                label="Company Name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Acme Corporation"
                error={validationErrors.name}
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Company Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell us about the company size, mission, history..."
                  className={`px-3 py-2 rounded-lg border text-sm transition-smooth outline-none bg-white/50 backdrop-blur-sm ${
                    validationErrors.description
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : 'border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                  }`}
                />
                {validationErrors.description && (
                  <span className="text-xs text-rose-500 font-medium">{validationErrors.description}</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Industry"
                  id="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="e.g. Software, Finance"
                  error={validationErrors.industry}
                />

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="size" className="text-sm font-medium text-slate-700">
                    Company Size
                  </label>
                  <select
                    id="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white/50 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-smooth"
                  >
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} Employees
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="Website URL"
                id="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                error={validationErrors.website}
              />

              <Input
                label="Logo Image URL"
                id="logo"
                type="url"
                value={formData.logo}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                error={validationErrors.logo}
              />

              {/* Form Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingCompany ? 'Save Changes' : 'Register'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
