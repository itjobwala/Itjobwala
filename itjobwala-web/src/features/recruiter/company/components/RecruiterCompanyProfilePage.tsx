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
import { useRecruiterCompanyProfileQuery, useUpdateCompanyProfileMutation } from '@/features/recruiter/hooks';
import type { RecruiterCompanyProfile } from '@/features/recruiter/types';
import { uploadRecruiterCompanyLogo } from '@/features/recruiter/company/services/recruiterCompany.api';
import type { ApiError } from '@/src/lib/api/client';
import { RecruiterShell } from '@/layout/shell';
import { useToast } from '@/src/hooks/useToast';
import Toast from '@/src/components/ui/Toast';
import Button from '@/src/components/ui/Button';
import Input from '@/src/components/ui/Input';
import Textarea from '@/src/components/ui/Textarea';
import Select from '@/src/components/ui/Select';
import FormField from '@/src/components/ui/FormField';
import Card from '@/src/components/ui/Card';

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
  const [savedData, setSavedData] = useState<Partial<RecruiterCompanyProfile>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const { toast, show: showToast } = useToast();
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading, error } = useRecruiterCompanyProfileQuery(true);
  const updateMutation = useUpdateCompanyProfileMutation();

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setSavedData(profile);
      setLogoPreview(profile.logo || '');
    }
  }, [profile]);

  const isDirty = (Object.keys({ ...formData, ...savedData }) as (keyof RecruiterCompanyProfile)[]).some(
    key => (formData[key] ?? '') !== (savedData[key] ?? '')
  );

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
      showToast('Company logo updated', 'success');
    } catch {
      showToast('Failed to upload logo. Please try again.', 'error');
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
      showToast('Company profile updated successfully', 'success');
      setSavedData(formData);
      setEditing(false);
      setErrors({});
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.details && Object.keys(apiErr.details).length > 0) {
        setErrors(apiErr.details as FormErrors);
      }
      showToast(apiErr.message || 'Failed to save company profile', 'error');
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
            <h1 className="text-[28px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
              Company Profile
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">
              Manage your company information
            </p>
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
            <Card padding="xl" overflow>
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />

              {/* Logo + name header — shared by both modes */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 justify-between">
                {/* Logo */}
                {editing ? (
                  <div className="relative group shrink-0 cursor-pointer" onClick={() => !logoUploading && logoInputRef.current?.click()}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo" className="w-16 h-16 rounded-2xl object-cover border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
                        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><path d="M8 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      {logoUploading
                        ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      }
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo" className="w-16 h-16 rounded-2xl object-cover border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300">
                        <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="12.01"/><path d="M8 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>
                        </svg>
                      </div>
                    )}
                  </div>
                )}

                {/* Name / industry */}
                {editing ? (
                  <div className="flex-1 min-w-0">
                    <FormField label="Company Name" htmlFor="cp-companyName" required error={errors.companyName}>
                      <Input
                        id="cp-companyName"
                        type="text"
                        value={formData.companyName || ''}
                        onChange={(e) => setField('companyName', e.target.value)}
                        placeholder="e.g. Razorpay"
                        error={errors.companyName}
                      />
                    </FormField>
                    {logoUploading && (
                      <p className="text-[11px] text-gray-400 mt-1">Uploading logo…</p>
                    )}
                    {!logoUploading && (
                      <p className="text-[11px] text-gray-400 mt-1">Click logo to change · PNG or JPG, max 2MB</p>
                    )}
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="text-[20px] font-extrabold text-[#0f172a] leading-tight truncate" style={{ letterSpacing: '-0.3px' }}>
                      {profile?.companyName}
                    </p>
                    {profile?.industry && (
                      <p className="text-[13px] text-gray-500 mt-0.5">{profile.industry}</p>
                    )}
                  </div>
                )}

                {/* Actions — only Edit Profile button in header */}
                {!editing && (
                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-6"
                      onClick={() => setEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>

              {editing ? (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <FormField label="Industry" htmlFor="cp-industry" required error={errors.industry}>
                      <Input
                        id="cp-industry"
                        type="text"
                        value={formData.industry || ''}
                        onChange={(e) => setField('industry', e.target.value)}
                        placeholder="e.g. IT / Software"
                        error={errors.industry}
                      />
                    </FormField>

                    <FormField label="Website" htmlFor="cp-website" error={errors.website}>
                      <Input
                        id="cp-website"
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => setField('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                        error={errors.website}
                      />
                    </FormField>

                    <FormField label="Location" htmlFor="cp-location" error={errors.location}>
                      <Input
                        id="cp-location"
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setField('location', e.target.value)}
                        placeholder="e.g. Bengaluru"
                        error={errors.location}
                      />
                    </FormField>

                    <FormField label="Company Size" htmlFor="cp-companySize">
                      <Select
                        id="cp-companySize"
                        value={formData.companySize || ''}
                        onChange={(e) => setField('companySize', e.target.value)}
                      >
                        <option value="">Select size</option>
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                      </Select>
                    </FormField>

                    <FormField label="Founded Year" htmlFor="cp-foundedYear" error={errors.foundedYear}>
                      <Input
                        id="cp-foundedYear"
                        type="number"
                        value={formData.foundedYear || ''}
                        onChange={(e) => setField('foundedYear', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="e.g. 2015"
                        min={1900}
                        max={new Date().getFullYear()}
                        error={errors.foundedYear}
                      />
                    </FormField>
                  </div>

                  <FormField label="About Company" htmlFor="cp-description">
                    <Textarea
                      id="cp-description"
                      value={formData.description || ''}
                      onChange={(e) => setField('description', e.target.value)}
                      rows={5}
                      placeholder="Describe your company, culture, and what makes it a great place to work…"
                      error={errors.description}
                    />
                    <div className="flex items-center justify-between">
                      {errors.description
                        ? <p className="text-[12px] text-red-500" role="alert">{errors.description}</p>
                        : <span />}
                      <span className="text-[11px] text-gray-400">{(formData.description || '').length} / 2000</span>
                    </div>
                  </FormField>

                  {/* Form action buttons at the bottom */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button variant="secondary" size="lg" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      loading={updateMutation.isPending}
                      disabled={!isDirty}
                      className="px-6"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Industry</p>
                      <p className="text-[14px] text-[#0f172a]">{profile?.industry || 'Not specified'}</p>
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
            </Card>
          ) : (
            <div className="text-center py-12">
              <div className="text-[40px] mb-4">🏢</div>
              <h3 className="text-[18px] font-semibold text-[#0f172a] mb-2">No company profile</h3>
              <p className="text-gray-500">Set up your company profile to get started</p>
            </div>
          )}
        </div>

      <Toast message={toast.message} variant={toast.variant} visible={toast.visible} />
    </RecruiterShell>
  );
}
