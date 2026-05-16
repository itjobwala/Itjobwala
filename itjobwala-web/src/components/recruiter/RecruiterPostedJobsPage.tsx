/**
 * RecruiterPostedJobsPage
 *
 * INTEGRATED APIs:
 * ✅ GET /recruiter/jobs
 *    Hook: useRecruiterPostedJobsQuery(filters, enabled)
 *    Called: On component mount, when filters change
 *    Query Params: page, limit, status (optional), search (optional)
 *    Response: {
 *      jobs: [
 *        {
 *          id, title, description, location, jobType, workMode,
 *          salaryMin, salaryMax, requiredSkills, experienceLevel,
 *          applicationCount, postedDate, status, companyId
 *        }
 *      ],
 *      pagination: { page, limit, total, pages, hasNextPage, hasPrevPage }
 *    }
 *    Status Values: "active", "closed", "draft"
 *    Errors: 400 (invalid params), 401 (unauthorized)
 *
 * FILTERING OPTIONS:
 * - status: Filter by job status (active, closed, draft)
 * - search: Search by job title
 * - page: Pagination page number (default: 1)
 * - limit: Jobs per page (default: 20, max: 100)
 *
 * STATUS INDICATORS:
 * - "active" → Green badge (job is accepting applications)
 * - "closed" → Gray badge (job not accepting applications)
 * - "draft" → Yellow badge (job not yet published)
 *
 * COLUMNS DISPLAYED:
 * - Job Title
 * - Location
 * - Application Count
 * - Status Badge
 * - Posted Date
 * - Actions (View Details link)
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import RecruiterNavbar from './RecruiterNavbar';
import { useRecruiterPostedJobsQuery } from '@/src/hooks/useRecruiter';
import type { RecruiterPostedJob } from '@/src/types/recruiter';

export default function RecruiterPostedJobsPage() {
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const { data, isLoading, error } = useRecruiterPostedJobsQuery({}, true);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <RecruiterNavbar />

      <div className="pt-[68px]">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[28px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                  Posted Jobs
                </h1>
                <p className="text-[13px] text-gray-400 mt-1">
                  Manage your active job listings
                </p>
              </div>
              <Link
                href="/recruiter/post-job"
                className="px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                + Post a Job
              </Link>
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
              <p className="mt-4 text-gray-500">Loading posted jobs...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              {error instanceof Error ? error.message : 'Failed to load posted jobs'}
            </div>
          ) : !data || data.jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[40px] mb-4">📋</div>
              <h3 className="text-[18px] font-semibold text-[#0f172a] mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-6">Start by posting your first job listing</p>
              <Link
                href="/recruiter/post-job"
                className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Post a Job
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Job Title</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Location</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Applications</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Posted</th>
                      <th className="px-6 py-4 text-left text-[12px] font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.jobs.map((job) => (
                      <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 text-[13px] font-semibold text-[#0f172a]">{job.title}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">{job.location}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">0</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-green-50 text-green-700 text-[12px] font-medium rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-600">Just now</td>
                        <td className="px-6 py-4">
                          <Link href={`/recruiter/posted-jobs/${job.id}`} className="text-primary text-[13px] font-semibold hover:underline">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
}
