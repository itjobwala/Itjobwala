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

import { useState, useEffect } from 'react';
import { useRecruiterCompanyProfileQuery, useUpdateCompanyProfileMutation } from '@/src/hooks/useRecruiter';
import type { RecruiterCompanyProfile } from '@/src/types/recruiter';
import RecruiterShell from './RecruiterShell';

export default function RecruiterCompanyProfilePage() {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<RecruiterCompanyProfile>>({});
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const { data: profile, isLoading, error } = useRecruiterCompanyProfileQuery(true);
  const updateMutation = useUpdateCompanyProfileMutation();

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      setSuccessToast('Company profile updated successfully');
      setTimeout(() => setSuccessToast(''), 4000);
      setEditing(false);
    } catch (err) {
      const message = (err as Error).message || 'Failed to save company profile';
      setErrorToast(message);
      setTimeout(() => setErrorToast(''), 4000);
    }
  };

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
              <button
                onClick={() => {
                  if (editing) {
                    handleSave();
                  } else {
                    setEditing(true);
                  }
                }}
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : editing ? 'Save Changes' : 'Edit Profile'}
              </button>
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
              {editing ? (
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={formData.industry || ''}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website || ''}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-primary"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {profile?.logo && (
                    <div className="mb-6">
                      <img src={profile.logo} alt={profile.companyName} className="h-16 w-16 rounded-lg" />
                    </div>
                  )}
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
                  </div>
                  {profile?.description && (
                    <div>
                      <p className="text-[12px] text-gray-500 mb-1">Description</p>
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
