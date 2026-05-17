/**
 * RecruiterCompanyProfilePage
 *
 * INTEGRATED APIs:
 * ✅ GET /recruiter/company
 *    Hook: useRecruiterCompanyProfileQuery(enabled)
 *    Called: On component mount to fetch company profile
 *    Response: { id, companyName, industry, website, description, logo, companySize, location, foundedYear }
 *
 * ✅ PUT /recruiter/company
 *    Hook: useUpdateCompanyProfileMutation()
 *    Called: When user clicks "Save Changes" button
 *    Payload: { companyName?, industry?, website?, description?, companySize?, location?, foundedYear? }
 *    Response: Updated company profile object
 *    Errors: 400 (validation), 409 (duplicate name), 401 (unauthorized)
 *
 * VALIDATION RULES (enforced by backend):
 * - companyName: 2-100 chars, alphanumeric + spaces/hyphens, unique
 * - industry: 2-50 chars, from predefined list
 * - website: Valid URL format (http/https)
 * - description: 10-2000 chars
 * - companySize: One of: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+
 * - location: 2-100 chars
 * - foundedYear: Between 1900 and current year
 *
 * UI STATES:
 * - Loading: While fetching profile
 * - Error: If API returns 404, 401, or 500
 * - Edit Mode: When user clicks "Edit Profile"
 * - Saving: While updating profile
 * - Success: Toast notification on successful update
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRecruiterCompanyProfileQuery, useUpdateCompanyProfileMutation } from '@/src/hooks/useRecruiter';
import type { RecruiterCompanyProfile } from '@/src/types/recruiter';
import { uploadRecruiterCompanyLogo } from '@/src/lib/api/recruiter';
import type { ApiError } from '@/src/lib/api/client';
import RecruiterShell from './RecruiterShell';

type FormErrors = Partial<Record<'companyName' | 'industry' | 'website' | 'location' | 'description' | 'companySize' | 'foundedYear', string>>;

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

function validate(data: Partial<RecruiterCompanyProfile>): FormErrors {
  const e: FormErrors = {};
  if (!data.companyName?.trim()) {
    e.companyName = 'Company name is required';
  } else if (data.companyName.trim().length < 2 || data.companyName.trim().length > 100) {
    e.companyName = 'Company name must be 2–100 characters';
  }
  if (!data.industry?.trim()) {
    e.industry = 'Industry is required';
  } else if (data.industry.trim().length < 2 || data.industry.trim().length > 50) {
    e.industry = 'Industry must be 2–50 characters';
  }
  if (data.website && data.website.trim() && !/^https?:\/\/.+/.test(data.website.trim())) {
    e.website = 'Must start with http:// or https://';
  }
  if (data.description && data.description.trim() && data.description.trim().length < 10) {
    e.description = 'Description must be at least 10 characters';
  }
  if (data.foundedYear != null) {
    const yr = Number(data.foundedYear);
    if (isNaN(yr) || yr < 1900 || yr > new Date().getFullYear()) {
      e.foundedYear = `Must be between 1900 and ${new Date().getFullYear()}`;
    }
  }
  return e;
}

export default function RecruiterCompanyProfilePage() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<RecruiterCompanyProfile>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading, error } = useRecruiterCompanyProfileQuery(true);
  const updateMutation = useUpdateCompanyProfileMutation();

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setLogoPreview(profile.logo || '');
    }
  }, [profile]);

  function setField<K extends keyof RecruiterCompanyProfile>(key: K, value: RecruiterCompanyProfile[K]) {
    setFormData(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadRecruiterCompanyLogo(file);
      setLogoPreview(url);
      setFormData(f => ({ ...f, logo: url }));
      setSuccessToast('Company logo updated');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch {
      setErrorToast('Failed to upload logo. Please try again.');
      setTimeout(() => setErrorToast(''), 4000);
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  }

  const handleSave = async () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await updateMutation.mutateAsync({
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        description: formData.description,
        companySize: formData.companySize,
        location: formData.location,
        foundedYear: formData.foundedYear,
      });
      setSuccessToast('Company profile updated successfully');
      setTimeout(() => setSuccessToast(''), 4000);
      setEditing(false);
      setErrors({});
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.details && Object.keys(apiErr.details).length > 0) {
        setErrors(apiErr.details as FormErrors);
      }
      setErrorToast(apiErr.message || 'Failed to save company profile');
      setTimeout(() => setErrorToast(''), 4000);
    }
  };

  function handleCancel() {
    if (profile) { setFormData(profile); setLogoPreview(profile.logo || ''); }
    setErrors({});
    setEditing(false);
  }

  return (
    <RecruiterShell>
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[28px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                  Company Profile
                </h1>
                <p className="text-[13px] text-gray-400 mt-1">
                  Manage your company information
                </p>
              </div>
              <div className="flex items-center gap-3">
                {editing && (
                  <button onClick={handleCancel} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={updateMutation.isPending}
                  className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-gray-500">Loading company profile...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              {error instanceof Error ? error.message : 'Failed to load company profile'}
            </div>
          ) : profile ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8">
              {/* Logo upload — always visible */}
              <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
                <div className="relative group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Company logo" className="w-20 h-20 rounded-2xl object-cover border border-gray-200" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                  >
                    {logoUploading
                      ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    }
                  </button>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#0f172a]">Company Logo</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">Shown on job listings. PNG or JPG, max 2MB.</p>
                  <button type="button" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                    className="mt-2 text-[12px] font-semibold text-primary hover:underline disabled:opacity-50">
                    {logoUploading ? 'Uploading…' : logoPreview ? 'Change logo' : 'Upload logo'}
                  </button>
                </div>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
              </div>

              {editing ? (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Company Name */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.companyName || ''}
                        onChange={(e) => setField('companyName', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-[13px] focus:outline-none focus:border-primary transition-colors ${errors.companyName ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="e.g. Razorpay"
                      />
                      {errors.companyName && <p className="text-[12px] text-red-500 mt-1">{errors.companyName}</p>}
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.industry || ''}
                        onChange={(e) => setField('industry', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-[13px] focus:outline-none focus:border-primary transition-colors ${errors.industry ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="e.g. IT / Software"
                      />
                      {errors.industry && <p className="text-[12px] text-red-500 mt-1">{errors.industry}</p>}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Website</label>
                      <input
                        type="text"
                        value={formData.website || ''}
                        onChange={(e) => setField('website', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-[13px] focus:outline-none focus:border-primary transition-colors ${errors.website ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="https://yourcompany.com"
                      />
                      {errors.website && <p className="text-[12px] text-red-500 mt-1">{errors.website}</p>}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setField('location', e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-[13px] focus:outline-none focus:border-primary transition-colors ${errors.location ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="e.g. Bengaluru"
                      />
                      {errors.location && <p className="text-[12px] text-red-500 mt-1">{errors.location}</p>}
                    </div>

                    {/* Company Size */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Company Size</label>
                      <select
                        value={formData.companySize || ''}
                        onChange={(e) => setField('companySize', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] bg-white focus:outline-none focus:border-primary"
                      >
                        <option value="">Select size</option>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                      </select>
                    </div>

                    {/* Founded Year */}
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Founded Year</label>
                      <input
                        type="number"
                        value={formData.foundedYear || ''}
                        onChange={(e) => setField('foundedYear', e.target.value ? Number(e.target.value) : undefined)}
                        className={`w-full px-4 py-2.5 border rounded-xl text-[13px] focus:outline-none focus:border-primary transition-colors ${errors.foundedYear ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        placeholder="e.g. 2015"
                        min={1900}
                        max={new Date().getFullYear()}
                      />
                      {errors.foundedYear && <p className="text-[12px] text-red-500 mt-1">{errors.foundedYear}</p>}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">About Company</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setField('description', e.target.value)}
                      rows={5}
                      className={`w-full px-4 py-2.5 border rounded-xl text-[13px] focus:outline-none focus:border-primary transition-colors resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      placeholder="Describe your company, culture, and what makes it a great place to work…"
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.description ? <p className="text-[12px] text-red-500">{errors.description}</p> : <span />}
                      <span className="text-[11px] text-gray-400">{(formData.description || '').length} / 2000</span>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-[12px] text-gray-500 mb-1">Company Name</p>
                    <p className="text-[16px] font-semibold text-[#0f172a]">{profile?.companyName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Industry</p>
                      <p className="text-[14px] text-[#0f172a]">{profile?.industry}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Location</p>
                      <p className="text-[14px] text-[#0f172a]">{profile?.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Website</p>
                      <p className="text-[14px] text-[#0f172a]">
                        {profile?.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {profile.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Company Size</p>
                      <p className="text-[14px] text-[#0f172a]">{profile?.companySize || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Founded Year</p>
                      <p className="text-[14px] text-[#0f172a]">{profile?.foundedYear || 'Not specified'}</p>
                    </div>
                  </div>
                  {profile?.description && (
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">About Company</p>
                      <p className="text-[14px] text-gray-600 leading-relaxed">{profile.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-[40px] mb-4">🏢</div>
              <h3 className="text-[18px] font-semibold text-[#0f172a] mb-2">No company profile</h3>
              <p className="text-gray-500">Set up your company profile to get started</p>
            </div>
          )}
        </div>

      {/* Success toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          successToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-green-600 text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M2 6l3 3 5-5" />
            </svg>
          </span>
          {successToast}
        </div>
      </div>

      {/* Error toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] transition-all duration-300 ${
          errorToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-red-600 text-white text-[13px] font-semibold rounded-2xl px-5 py-3.5 shadow-2xl">
          <span className="w-5 h-5 rounded-full bg-red-700 flex items-center justify-center shrink-0">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </span>
          {errorToast}
        </div>
      </div>
    </RecruiterShell>
  );
}
