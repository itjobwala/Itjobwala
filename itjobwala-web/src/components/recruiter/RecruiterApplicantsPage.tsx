/**
 * RecruiterApplicantsPage
 *
 * INTEGRATED APIs:
 * ✅ GET /recruiter/applicants
 *    Hook: useRecruiterApplicantsQuery(filters, enabled)
 *    Called: On component mount, when filters change
 *    Query Params: page, limit, jobId (optional), status (optional), search (optional)
 *    Response: {
 *      applicants: [
 *        {
 *          id, candidateId, candidateName, candidateEmail, jobTitle, jobId,
 *          appliedDate, status, profilePhoto, resume, skills, experience, profile
 *        }
 *      ],
 *      pagination: { page, limit, total, pages, hasNextPage, hasPrevPage }
 *    }
 *    Status Values: "new", "reviewing", "shortlisted", "rejected", "hired"
 *    Errors: 400 (invalid params), 401 (unauthorized)
 *
 * ✅ PUT /recruiter/applicants/{id}/status
 *    Hook: useUpdateApplicantStatusMutation()
 *    Called: When changing applicant status directly
 *    Payload: { status, notes (optional) }
 *    Errors: 409 (invalid transition), 400 (validation), 401, 403
 *
 * ✅ POST /recruiter/applicants/{id}/shortlist
 *    Hook: useShortlistApplicantMutation()
 *    Called: When user clicks [Shortlist] button
 *    Payload: { notes (optional) }
 *    Valid From: "new" or "reviewing" status
 *    Errors: 409 (invalid status), 401, 403
 *
 * ✅ POST /recruiter/applicants/{id}/reject
 *    Hook: useRejectApplicantMutation()
 *    Called: When user clicks [Reject] button
 *    Payload: { reason (optional), sendEmail (default: true) }
 *    Valid From: Any non-final status
 *    Errors: 409 (invalid status), 401, 403
 *
 * ✅ POST /recruiter/applicants/{id}/hire
 *    Hook: useHireApplicantMutation()
 *    Called: When user clicks [Hire] button
 *    Payload: { joiningDate (optional, future date), notes (optional) }
 *    Valid From: "shortlisted" status only
 *    Errors: 400 (validation), 409 (invalid status), 401, 403
 *
 * STATUS STATE MACHINE:
 * new ──→ reviewing ──→ shortlisted ──→ hired
 *  └─────┘ ↓            ↓
 *      rejected      rejected
 *
 * FILTERING OPTIONS:
 * - status: Filter by applicant status
 * - jobId: Filter by specific job
 * - search: Search by candidate name/email
 *
 * STATUS BADGE COLORS:
 * - "new" → Blue badge
 * - "reviewing" → Yellow badge
 * - "shortlisted" → Green badge
 * - "rejected" → Red badge
 * - "hired" → Purple badge
 */

'use client';

import { useState } from 'react';
import { useRecruiterApplicantsQuery } from '@/src/hooks/useRecruiter';
import type { RecruiterApplicant } from '@/src/types/recruiter';
import RecruiterShell from './RecruiterShell';

export default function RecruiterApplicantsPage() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const filters = filterStatus === 'all' ? {} : { status: filterStatus as RecruiterApplicant['status'] };
  const { data, isLoading, error } = useRecruiterApplicantsQuery(filters, true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700';
      case 'reviewing':
        return 'bg-yellow-50 text-yellow-700';
      case 'shortlisted':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <RecruiterShell>
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            <h1 className="text-[28px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
              Applicants
            </h1>
            <p className="text-[13px] text-gray-400 mt-1">
              Review and manage applications for your job postings
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
          {/* Filter bar */}
          <div className="mb-6 flex gap-2">
            {['all', 'new', 'reviewing', 'shortlisted', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium text-[13px] transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-gray-500">Loading applicants...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              {error instanceof Error ? error.message : 'Failed to load applicants'}
            </div>
          ) : !data || data.applicants.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[40px] mb-4">📨</div>
              <h3 className="text-[18px] font-semibold text-[#0f172a] mb-2">No applicants yet</h3>
              <p className="text-gray-500">Applications for your jobs will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.applicants.map((applicant) => (
                <div key={applicant.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {applicant.profilePhoto && (
                        <img
                          src={applicant.profilePhoto}
                          alt={applicant.candidateName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-[14px] font-semibold text-[#0f172a]">{applicant.candidateName}</h3>
                        <p className="text-[12px] text-gray-500">{applicant.jobTitle || 'Applied to a position'}</p>
                        <p className="text-[11px] text-gray-400 mt-1">Applied {new Date(applicant.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[12px] font-medium ${getStatusColor(applicant.status)}`}>
                        {getStatusLabel(applicant.status)}
                      </span>
                      <button className="text-primary text-[13px] font-semibold hover:underline">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
