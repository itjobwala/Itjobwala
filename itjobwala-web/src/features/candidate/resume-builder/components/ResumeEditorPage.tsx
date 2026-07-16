'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/components/ui/Button';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { useResumeQuery, useUpdateResumeMutation } from '../hooks/useResumeBuilder';
import { getTemplate, TEMPLATE_OPTIONS } from '../templates';
import { uploadResume } from '@/features/candidate/profile/services/profile.api';
import type {
  ResumeContent,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeCertification,
} from '../types/resumeBuilder.types';
import { BLANK_CONTENT } from '../types/resumeBuilder.types';

const SAVE_DELAY    = 1500;
const PREVIEW_DELAY = 500;
const INP = 'w-full border border-token rounded-xl px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface';
const LBL = 'block text-micro font-semibold text-muted mb-1 mt-3 first:mt-0';

function mkExp(): ResumeExperience {
  return { id: `exp_${Date.now()}`, company: '', role: '', location: '', start_date: '', end_date: '', is_current: false, bullets: [] };
}
function mkEdu(): ResumeEducation {
  return { id: `edu_${Date.now()}`, institution: '', degree: '', field: '', start_year: '', end_year: '', grade: '' };
}
function mkProj(): ResumeProject {
  return { id: `proj_${Date.now()}`, name: '', description: '', link: '', bullets: [] };
}
function mkCert(): ResumeCertification {
  return { id: `cert_${Date.now()}`, name: '', issuer: '', issue_date: '', credential_url: '' };
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-surface rounded-2xl border border-token">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-heading">{title}</span>
        <svg className={`w-4 h-4 text-subtle transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-4 border-t border-token pt-3">{children}</div>}
    </div>
  );
}

function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (v: string[]) => void }) {
  const [val, setVal] = useState('');

  function addSkill(s: string) {
    const t = s.trim();
    if (t && !skills.includes(t)) onChange([...skills, t]);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(val);
      setVal('');
    } else if (e.key === 'Backspace' && !val && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 border border-token rounded-xl min-h-[44px] bg-surface cursor-text">
      {skills.map((s, i) => (
        <span key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[14px] font-medium px-3 py-2 rounded-full">
          {s}
          <button type="button" onClick={() => onChange(skills.filter((_, j) => j !== i))} className="text-blue-400 hover:text-blue-700 leading-none">×</button>
        </span>
      ))}
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => { if (val.trim()) { addSkill(val); setVal(''); } }}
        placeholder={skills.length === 0 ? 'Type a skill, press Enter or comma' : 'Add more…'}
        className="flex-1 min-w-[140px] text-caption placeholder:text-muted outline-none bg-transparent"
      />
    </div>
  );
}

export function ResumeEditorPage({ id }: { id: number }) {
  const router = useRouter();
  const { data: resume, isLoading } = useResumeQuery(id);
  const updateMutation = useUpdateResumeMutation(id);

  const [title,          setTitle]          = useState('');
  const [template,       setTemplate]       = useState('modern');
  const [content,        setContent]        = useState<ResumeContent>(BLANK_CONTENT);
  const [previewContent, setPreviewContent] = useState<ResumeContent>(BLANK_CONTENT);
  const [saveStatus,     setSaveStatus]     = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [useStatus,      setUseStatus]      = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized  = useRef(false);

  useEffect(() => {
    if (resume && !initialized.current) {
      initialized.current = true;
      setTitle(resume.title);
      setTemplate(resume.template);
      const c = { ...BLANK_CONTENT, ...resume.content };
      setContent(c);
      setPreviewContent(c);
    }
  }, [resume]);

  function scheduleSave(t: string, tmpl: string, c: ResumeContent) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('unsaved');
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateMutation.mutateAsync({ title: t, template: tmpl, content: c });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, SAVE_DELAY);
  }

  function schedulePreview(c: ResumeContent) {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreviewContent(c), PREVIEW_DELAY);
  }

  function changeTitle(v: string) {
    setTitle(v);
    scheduleSave(v, template, content);
  }

  function changeTemplate(v: string) {
    setTemplate(v);
    setPreviewContent(content);
    scheduleSave(title, v, content);
  }

  function setC<K extends keyof ResumeContent>(key: K, value: ResumeContent[K]) {
    const c = { ...content, [key]: value };
    setContent(c);
    schedulePreview(c);
    scheduleSave(title, template, c);
  }

  /* contact */
  function setContact(field: keyof ResumeContent['contact'], value: string) {
    setC('contact', { ...content.contact, [field]: value });
  }

  /* experiences */
  function patchExp(i: number, patch: Partial<ResumeExperience>) {
    setC('experiences', content.experiences.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  }

  /* education */
  function patchEdu(i: number, patch: Partial<ResumeEducation>) {
    setC('education', content.education.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  }

  /* projects */
  function patchProj(i: number, patch: Partial<ResumeProject>) {
    setC('projects', content.projects.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  }

  /* certifications */
  function patchCert(i: number, patch: Partial<ResumeCertification>) {
    setC('certifications', content.certifications.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  }

  async function handleDownload() {
    const T = getTemplate(template);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(React.createElement(T, { content: previewContent }) as any).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'Resume'}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleUseAsResume() {
    setUseStatus('uploading');
    try {
      const T = getTemplate(template);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(React.createElement(T, { content: previewContent }) as any).toBlob();
      const file = new File([blob], `${title || 'Resume'}.pdf`, { type: 'application/pdf' });
      await uploadResume(file);
      setUseStatus('done');
      setTimeout(() => setUseStatus('idle'), 3000);
    } catch {
      setUseStatus('error');
      setTimeout(() => setUseStatus('idle'), 3000);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-alt">
        <div className="text-sm text-subtle animate-pulse">Loading editor…</div>
      </div>
    );
  }

  const TemplateComponent = getTemplate(template);

  const saveLabel = saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : '● Unsaved';
  const useLabel  = useStatus  === 'uploading' ? 'Uploading…' : useStatus === 'done' ? '✓ Set' : useStatus === 'error' ? 'Error' : 'Use as Resume';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-alt">

      {/* ── Left pane: form ── */}
      <div className="w-1/2 flex flex-col overflow-hidden border-r border-token">

        {/* Top bar */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-surface border-b border-token">
          <button
            type="button"
            onClick={() => router.push('/candidate/resume-builder')}
            className="text-subtle hover:text-muted text-lg leading-none shrink-0"
            title="Back to list"
          >
            ←
          </button>
          <input
            value={title}
            onChange={e => changeTitle(e.target.value)}
            className="flex-1 min-w-0 text-sm font-bold text-heading placeholder:text-muted bg-transparent outline-none border-none truncate"
            placeholder="Resume title"
          />
          <span className={`text-[10px] shrink-0 ${saveStatus === 'unsaved' ? 'text-amber-500' : 'text-subtle'}`}>
            {saveLabel}
          </span>
          <select
            value={template}
            onChange={e => changeTemplate(e.target.value)}
            className="shrink-0 text-micro border border-token rounded-lg px-2 py-1 bg-surface focus:outline-none"
          >
            {TEMPLATE_OPTIONS.map(t => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDownload}
          >
            ↓ PDF
          </Button>
          <button
            type="button"
            onClick={handleUseAsResume}
            disabled={useStatus === 'uploading'}
            className={`shrink-0 px-2.5 py-1.5 text-micro font-semibold border rounded-lg transition-colors
              ${useStatus === 'done' ? 'border-green-300 text-green-600' : useStatus === 'error' ? 'border-danger text-danger' : 'border-token text-body-secondary hover:bg-surface-alt'}
              disabled:opacity-50`}
            title="Upload this PDF as your resume"
          >
            {useLabel}
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* Contact */}
          <SectionCard title="Contact">
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ['full_name', 'Full name'],
                  ['title',     'Job title'],
                  ['email',     'Email'],
                  ['phone',     'Phone'],
                  ['location',  'Location'],
                  ['linkedin',  'LinkedIn URL'],
                  ['github',    'GitHub URL'],
                  ['website',   'Website'],
                ] as [keyof ResumeContent['contact'], string][]
              ).map(([field, label]) => (
                <div key={field} className={field === 'full_name' || field === 'title' ? 'col-span-2' : ''}>
                  <label className={LBL}>{label}</label>
                  <input
                    value={content.contact[field]}
                    onChange={e => setContact(field, e.target.value)}
                    className={INP}
                    placeholder={label}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Summary */}
          <SectionCard title="Summary">
            <textarea
              value={content.summary}
              onChange={e => setC('summary', e.target.value)}
              rows={4}
              className="w-full border border-token rounded-xl px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface resize-none"
              placeholder="A brief professional summary…"
            />
          </SectionCard>

          {/* Experience */}
          <SectionCard title="Experience">
            <div className="space-y-5">
              {content.experiences.map((exp, i) => (
                <div key={exp.id} className="relative border border-token rounded-xl p-3">
                  <button
                    type="button"
                    onClick={() => setC('experiences', content.experiences.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 text-subtle hover:text-danger text-lg leading-none"
                  >×</button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className={LBL}>Role / Title</label>
                      <input value={exp.role} onChange={e => patchExp(i, { role: e.target.value })} className={INP} placeholder="Software Engineer" />
                    </div>
                    <div className="col-span-2">
                      <label className={LBL}>Company</label>
                      <input value={exp.company} onChange={e => patchExp(i, { company: e.target.value })} className={INP} placeholder="Company name" />
                    </div>
                    <div>
                      <label className={LBL}>Location</label>
                      <input value={exp.location} onChange={e => patchExp(i, { location: e.target.value })} className={INP} placeholder="City, Country" />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={LBL}>Start date</label>
                        <input type="month" value={exp.start_date} onChange={e => patchExp(i, { start_date: e.target.value })} className={INP} />
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className={LBL}>End date</label>
                        <input type="month" value={exp.end_date} disabled={exp.is_current} onChange={e => patchExp(i, { end_date: e.target.value })} className={`${INP} disabled:opacity-40`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id={`cur_${exp.id}`}
                        checked={exp.is_current}
                        onChange={e => patchExp(i, { is_current: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor={`cur_${exp.id}`} className="text-caption text-muted">Currently working here</label>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className={LBL}>Bullet points (one per line)</label>
                    <textarea
                      value={exp.bullets.join('\n')}
                      onChange={e => patchExp(i, { bullets: e.target.value.split('\n') })}
                      rows={3}
                      className="w-full border border-token rounded-xl px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface resize-none"
                      placeholder="Describe your key contributions…"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setC('experiences', [...content.experiences, mkExp()])}
                className="w-full py-2 text-caption font-semibold text-primary border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
              >
                + Add experience
              </button>
            </div>
          </SectionCard>

          {/* Education */}
          <SectionCard title="Education">
            <div className="space-y-5">
              {content.education.map((edu, i) => (
                <div key={edu.id} className="relative border border-token rounded-xl p-3">
                  <button type="button" onClick={() => setC('education', content.education.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 text-subtle hover:text-danger text-lg leading-none">×</button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className={LBL}>Institution</label>
                      <input value={edu.institution} onChange={e => patchEdu(i, { institution: e.target.value })} className={INP} placeholder="University / College" />
                    </div>
                    <div>
                      <label className={LBL}>Degree</label>
                      <input value={edu.degree} onChange={e => patchEdu(i, { degree: e.target.value })} className={INP} placeholder="B.Tech, MBA…" />
                    </div>
                    <div>
                      <label className={LBL}>Field of study</label>
                      <input value={edu.field} onChange={e => patchEdu(i, { field: e.target.value })} className={INP} placeholder="Computer Science…" />
                    </div>
                    <div>
                      <label className={LBL}>Start year</label>
                      <input value={edu.start_year} onChange={e => patchEdu(i, { start_year: e.target.value })} className={INP} placeholder="2018" />
                    </div>
                    <div>
                      <label className={LBL}>End year</label>
                      <input value={edu.end_year} onChange={e => patchEdu(i, { end_year: e.target.value })} className={INP} placeholder="2022 or Present" />
                    </div>
                    <div>
                      <label className={LBL}>Grade / GPA</label>
                      <input value={edu.grade} onChange={e => patchEdu(i, { grade: e.target.value })} className={INP} placeholder="8.5 CGPA" />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setC('education', [...content.education, mkEdu()])}
                className="w-full py-2 text-caption font-semibold text-primary border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors">
                + Add education
              </button>
            </div>
          </SectionCard>

          {/* Skills */}
          <SectionCard title="Skills">
            <SkillsEditor skills={content.skills} onChange={v => setC('skills', v)} />
            <p className="text-micro text-subtle mt-1.5">Press Enter or comma to add a skill.</p>
          </SectionCard>

          {/* Projects */}
          <SectionCard title="Projects">
            <div className="space-y-5">
              {content.projects.map((proj, i) => (
                <div key={proj.id} className="relative border border-token rounded-xl p-3">
                  <button type="button" onClick={() => setC('projects', content.projects.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 text-subtle hover:text-danger text-lg leading-none">×</button>
                  <label className={LBL}>Project name</label>
                  <input value={proj.name} onChange={e => patchProj(i, { name: e.target.value })} className={INP} placeholder="Project name" />
                  <label className={LBL}>Short description</label>
                  <input value={proj.description} onChange={e => patchProj(i, { description: e.target.value })} className={INP} placeholder="What it does" />
                  <label className={LBL}>Link (optional)</label>
                  <input value={proj.link} onChange={e => patchProj(i, { link: e.target.value })} className={INP} placeholder="https://github.com/…" />
                  <label className={LBL}>Bullet points (one per line)</label>
                  <textarea
                    value={proj.bullets.join('\n')}
                    onChange={e => patchProj(i, { bullets: e.target.value.split('\n') })}
                    rows={3}
                    className="w-full border border-token rounded-xl px-3 py-2 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-surface resize-none mt-1"
                    placeholder="Key highlights…"
                  />
                </div>
              ))}
              <button type="button" onClick={() => setC('projects', [...content.projects, mkProj()])}
                className="w-full py-2 text-caption font-semibold text-primary border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors">
                + Add project
              </button>
            </div>
          </SectionCard>

          {/* Certifications */}
          <SectionCard title="Certifications">
            <div className="space-y-4">
              {content.certifications.map((cert, i) => (
                <div key={cert.id} className="relative border border-token rounded-xl p-3">
                  <button type="button" onClick={() => setC('certifications', content.certifications.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 text-subtle hover:text-danger text-lg leading-none">×</button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className={LBL}>Certificate name</label>
                      <input value={cert.name} onChange={e => patchCert(i, { name: e.target.value })} className={INP} placeholder="AWS Certified…" />
                    </div>
                    <div>
                      <label className={LBL}>Issuer</label>
                      <input value={cert.issuer} onChange={e => patchCert(i, { issuer: e.target.value })} className={INP} placeholder="Amazon, Coursera…" />
                    </div>
                    <div>
                      <label className={LBL}>Issue date</label>
                      <input type="month" value={cert.issue_date} onChange={e => patchCert(i, { issue_date: e.target.value })} className={INP} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setC('certifications', [...content.certifications, mkCert()])}
                className="w-full py-2 text-caption font-semibold text-primary border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors">
                + Add certification
              </button>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ── Right pane: PDF preview ── */}
      <div className="w-1/2 bg-surface-mid overflow-hidden">
        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
          <TemplateComponent content={previewContent} />
        </PDFViewer>
      </div>

    </div>
  );
}
