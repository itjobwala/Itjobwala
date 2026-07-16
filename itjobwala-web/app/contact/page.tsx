'use client';

import { useState } from 'react';
import { SmartNavbar } from '@/layout/navbar';
import { Footer } from '@/features/home';

const CONTACT_CHANNELS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    label: 'Email us',
    value: 'hello@itjobwala.com',
    sub: 'We reply within 24 hours',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Office',
    value: 'Hyderabad, India',
    sub: 'Serving IT professionals pan-India',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    label: 'Live chat',
    value: 'Chat with us',
    sub: 'Mon–Fri, 10am–6pm IST',
  },
];

const SUBJECTS = [
  'General enquiry',
  'Job posting / recruiter support',
  'Candidate support',
  'Partnership / business',
  'Report an issue',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus('sending');
    // Simulate send — wire to a real API / email service when ready
    await new Promise(r => setTimeout(r, 1200));
    setStatus('sent');
  }

  return (
    <main className="min-h-screen bg-surface">
      <SmartNavbar />

      {/* Hero */}
      <section className="pt-16 lg:pt-[72px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-bold px-4 py-1.5 mb-6 uppercase tracking-widest">
            Get in touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-heading mb-4" style={{ letterSpacing: '-1.5px', lineHeight: 1.1 }}>
            We&apos;re here to help
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re a candidate, a recruiter, or just curious — drop us a message and we&apos;ll get back to you quickly.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-10">
        <div className="grid sm:grid-cols-3 gap-4 mb-14">
          {CONTACT_CHANNELS.map(c => (
            <div key={c.label} className="bg-surface-alt border border-token rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                {c.icon}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted mb-1">{c.label}</div>
                <div className="text-sm font-semibold text-heading">{c.value}</div>
                <div className="text-xs text-muted mt-0.5">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Form + FAQ */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

          {/* Form */}
          <div className="bg-surface-alt border border-token rounded-2xl p-8">
            <h2 className="text-xl font-extrabold text-heading mb-6">Send us a message</h2>

            {status === 'sent' ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-heading mb-2">Message sent!</h3>
                <p className="text-sm text-muted">We&apos;ll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}
                  className="mt-6 text-sm font-semibold text-primary hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5" htmlFor="name">
                      Your name <span className="text-danger">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Rahul Kumar"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface border border-token rounded-xl px-4 py-3 text-sm text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5" htmlFor="email">
                      Email address <span className="text-danger">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-surface border border-token rounded-xl px-4 py-3 text-sm text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5" htmlFor="subject">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full bg-surface border border-token rounded-xl px-4 py-3 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5" htmlFor="message">
                    Message <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={handleChange}
                    required
                    className="w-full bg-surface border border-token rounded-xl px-4 py-3 text-sm text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ sidebar */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-extrabold text-heading">Common questions</h3>
            {[
              {
                q: 'Is itJobwala free for candidates?',
                a: 'Yes, completely free. You can browse jobs, apply, and chat with recruiters at no cost.',
              },
              {
                q: 'How do I post a job as a recruiter?',
                a: 'Create a recruiter account and use the "Post a Job" flow — it takes under 2 minutes.',
              },
              {
                q: 'What makes itJobwala different?',
                a: 'We only list IT roles, show salary upfront, and connect candidates directly with recruiters — no middlemen.',
              },
              {
                q: 'How long does it take to hear back?',
                a: 'We aim to respond to all enquiries within 24 hours on business days.',
              },
            ].map(item => (
              <div key={item.q} className="bg-surface-alt border border-token rounded-xl p-5">
                <div className="text-sm font-bold text-heading mb-1.5">{item.q}</div>
                <div className="text-sm text-muted leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="pb-10" />
      <Footer />
    </main>
  );
}
