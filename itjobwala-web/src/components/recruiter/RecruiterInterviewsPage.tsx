'use client';

import { useState } from 'react';
import RecruiterShell from './RecruiterShell';

const PRIMARY = '#1557FF';

type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
type InterviewMode = 'video' | 'phone' | 'in_person';

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  date: string;
  time: string;
  duration: number;
  mode: InterviewMode;
  status: InterviewStatus;
  interviewer: string;
  notes?: string;
  avatarInitials: string;
  avatarColor: string;
}

const MOCK_INTERVIEWS: Interview[] = [
  {
    id: '1',
    candidateName: 'Arjun Mehta',
    candidateEmail: 'arjun.mehta@gmail.com',
    jobTitle: 'Senior React Developer',
    date: '2026-05-17',
    time: '10:00',
    duration: 60,
    mode: 'video',
    status: 'scheduled',
    interviewer: 'Priya Sharma',
    notes: 'Focus on system design and React performance',
    avatarInitials: 'AM',
    avatarColor: '#6366f1',
  },
  {
    id: '2',
    candidateName: 'Sneha Patel',
    candidateEmail: 'sneha.patel@outlook.com',
    jobTitle: 'Node.js Backend Engineer',
    date: '2026-05-17',
    time: '14:30',
    duration: 45,
    mode: 'video',
    status: 'scheduled',
    interviewer: 'Rahul Verma',
    avatarInitials: 'SP',
    avatarColor: '#ec4899',
  },
  {
    id: '3',
    candidateName: 'Karan Singh',
    candidateEmail: 'karan.singh@yahoo.com',
    jobTitle: 'DevOps Engineer',
    date: '2026-05-16',
    time: '11:00',
    duration: 60,
    mode: 'phone',
    status: 'completed',
    interviewer: 'Priya Sharma',
    notes: 'Strong AWS experience, proceed to next round',
    avatarInitials: 'KS',
    avatarColor: '#10b981',
  },
  {
    id: '4',
    candidateName: 'Divya Nair',
    candidateEmail: 'divya.nair@gmail.com',
    jobTitle: 'UI/UX Designer',
    date: '2026-05-15',
    time: '15:00',
    duration: 30,
    mode: 'video',
    status: 'completed',
    interviewer: 'Ankit Gupta',
    avatarInitials: 'DN',
    avatarColor: '#f59e0b',
  },
  {
    id: '5',
    candidateName: 'Rohit Kumar',
    candidateEmail: 'rohit.kumar@gmail.com',
    jobTitle: 'Senior React Developer',
    date: '2026-05-14',
    time: '09:30',
    duration: 60,
    mode: 'in_person',
    status: 'no_show',
    interviewer: 'Priya Sharma',
    avatarInitials: 'RK',
    avatarColor: '#ef4444',
  },
  {
    id: '6',
    candidateName: 'Meera Joshi',
    candidateEmail: 'meera.joshi@company.com',
    jobTitle: 'Full Stack Developer',
    date: '2026-05-18',
    time: '11:30',
    duration: 90,
    mode: 'video',
    status: 'scheduled',
    interviewer: 'Rahul Verma',
    notes: 'Technical + cultural fit round',
    avatarInitials: 'MJ',
    avatarColor: '#8b5cf6',
  },
];

const STATUS_CONFIG: Record<InterviewStatus, { label: string; bg: string; text: string; dot: string }> = {
  scheduled:  { label: 'Scheduled',  bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  completed:  { label: 'Completed',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  },
  cancelled:  { label: 'Cancelled',  bg: 'bg-gray-100',  text: 'text-gray-500',   dot: 'bg-gray-400'   },
  no_show:    { label: 'No Show',    bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500'    },
};

const MODE_CONFIG: Record<InterviewMode, { label: string; icon: React.ReactNode }> = {
  video:     {
    label: 'Video Call',
    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  },
  phone:     {
    label: 'Phone Call',
    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>,
  },
  in_person: {
    label: 'In Person',
    icon: <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
}

type FilterTab = 'all' | InterviewStatus;

export default function RecruiterInterviewsPage() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_INTERVIEWS.filter(i => {
    const matchesFilter = filter === 'all' || i.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      i.candidateName.toLowerCase().includes(q) ||
      i.jobTitle.toLowerCase().includes(q) ||
      i.interviewer.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: MOCK_INTERVIEWS.length,
    scheduled: MOCK_INTERVIEWS.filter(i => i.status === 'scheduled').length,
    completed: MOCK_INTERVIEWS.filter(i => i.status === 'completed').length,
    cancelled: MOCK_INTERVIEWS.filter(i => i.status === 'cancelled').length,
    no_show: MOCK_INTERVIEWS.filter(i => i.status === 'no_show').length,
  };

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',       label: `All (${counts.all})` },
    { key: 'scheduled', label: `Scheduled (${counts.scheduled})` },
    { key: 'completed', label: `Completed (${counts.completed})` },
    { key: 'no_show',   label: `No Show (${counts.no_show})` },
  ];

  return (
    <RecruiterShell>
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-extrabold text-[#0f172a]" style={{ letterSpacing: '-0.5px' }}>
                Interviews
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {counts.scheduled} upcoming · {counts.completed} completed
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all"
              style={{ background: PRIMARY, boxShadow: `0 4px 14px ${PRIMARY}33` }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Schedule Interview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 space-y-5">

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',     value: counts.all,       color: 'text-[#0f172a]',  bg: 'bg-white' },
            { label: 'Upcoming',  value: counts.scheduled, color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Completed', value: counts.completed, color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'No Show',   value: counts.no_show,   color: 'text-red-500',    bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl border border-gray-100 px-4 py-3.5`}>
              <div className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={filter === tab.key ? { background: PRIMARY } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative sm:ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search candidate or job..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-xl outline-none focus:border-primary w-full sm:w-[240px] transition-colors"
            />
          </div>
        </div>

        {/* Interview list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-[15px] font-bold text-[#0f172a]">No interviews found</p>
            <p className="text-[13px] text-gray-400 mt-1">Try adjusting your filters or schedule a new interview.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(interview => {
              const status = STATUS_CONFIG[interview.status];
              const mode = MODE_CONFIG[interview.mode];
              return (
                <div
                  key={interview.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[13px] font-extrabold shrink-0"
                      style={{ background: interview.avatarColor }}
                    >
                      {interview.avatarInitials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-extrabold text-[#0f172a] truncate">
                              {interview.candidateName}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${status.bg} ${status.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>
                          </div>
                          <p className="text-[13px] text-gray-500 mt-0.5 truncate">{interview.jobTitle}</p>
                          <p className="text-[12px] text-gray-400 truncate">{interview.candidateEmail}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 shrink-0">
                          {interview.status === 'scheduled' && (
                            <>
                              <button className="px-3 py-1.5 text-[12px] font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                Reschedule
                              </button>
                              <button
                                className="px-3 py-1.5 text-[12px] font-bold rounded-lg text-white transition-colors"
                                style={{ background: PRIMARY }}
                              >
                                Join
                              </button>
                            </>
                          )}
                          {interview.status === 'completed' && (
                            <button className="px-3 py-1.5 text-[12px] font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                              View Feedback
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {/* Date & time */}
                        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                          </svg>
                          <span className="font-semibold">{formatDate(interview.date)}</span>
                          <span>·</span>
                          <span>{formatTime(interview.time)}</span>
                          <span>·</span>
                          <span>{interview.duration} min</span>
                        </div>

                        {/* Mode */}
                        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                          {mode.icon}
                          <span>{mode.label}</span>
                        </div>

                        {/* Interviewer */}
                        <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          <span>{interview.interviewer}</span>
                        </div>
                      </div>

                      {/* Notes */}
                      {interview.notes && (
                        <div className="mt-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
                          <p className="text-[12px] text-amber-700 font-medium">{interview.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
