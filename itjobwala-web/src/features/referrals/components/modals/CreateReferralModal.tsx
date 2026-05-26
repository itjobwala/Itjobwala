'use client';

import { useState, useEffect } from 'react';
import { useCreateReferralMutation } from '../../hooks';
import { useCandidateProfileQuery } from '@/features/candidate/profile/hooks/useProfile';
import EditSkillsSection from '@/features/candidate/profile/components/EditSkillsSection';
import type { CreateReferralJobPayload } from '../../types/referral.types';

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

const EMPTY: CreateReferralJobPayload = {
  company_name:  '',
  job_title:     '',
  location:      '',
  experience_required: '',
  salary_range:  '',
  description:   '',
  skills:        [],
  referral_reward: '',
  referral_strength: 70,
};

export default function CreateReferralModal({ isOpen, onClose, onSuccess }: Props) {
  const [form, setForm]   = useState<CreateReferralJobPayload>(EMPTY);
  const [skillError, setSkillError] = useState('');
  const createMutation = useCreateReferralMutation();

  const { data: profile } = useCandidateProfileQuery(isOpen);

  // Auto-fill company name from current experience when modal opens
  useEffect(() => {
    if (!isOpen || !profile) return;
    const currentExp = profile.experience?.find(e => e.is_current) ?? profile.experience?.[0];
    const company = currentExp?.company ?? '';
    setForm(f => ({ ...f, company_name: f.company_name || company }));
  }, [isOpen, profile]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) { setForm(EMPTY); setSkillError(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  function set(key: keyof CreateReferralJobPayload, val: any) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.skills || form.skills.length === 0) {
      setSkillError('Please add at least one required skill.');
      return;
    }
    setSkillError('');
    createMutation.mutate(form, { onSuccess: () => { setForm(EMPTY); onSuccess(); } });
  }

  const fieldCls = 'w-full text-[13px] border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-400';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl my-6">
        <div className="bg-gradient-to-r from-indigo-600 to-primary px-6 py-5 text-white rounded-t-3xl">
          <h2 className="text-[18px] font-extrabold">Post a Referral Opportunity</h2>
          <p className="text-[13px] text-white/80 mt-0.5">Help someone get a referral at your company</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Company *</label>
              <input required value={form.company_name} onChange={e => set('company_name', e.target.value)}
                placeholder="Infosys, TCS, Google..." className={fieldCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Role *</label>
              <input required value={form.job_title} onChange={e => set('job_title', e.target.value)}
                placeholder="Senior SDE, Product Manager..." className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Location *</label>
              <input required value={form.location ?? ''} onChange={e => set('location', e.target.value)}
                placeholder="Bangalore, Remote..." className={fieldCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Experience *</label>
              <input required value={form.experience_required ?? ''} onChange={e => set('experience_required', e.target.value)}
                placeholder="3-6 years" className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                Salary Range <span className="text-gray-400 normal-case font-normal">(optional)</span>
              </label>
              <input value={form.salary_range ?? ''} onChange={e => set('salary_range', e.target.value)}
                placeholder="15-25 LPA" className={fieldCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Referral Reward</label>
              <input value={form.referral_reward ?? ''} onChange={e => set('referral_reward', e.target.value)}
                placeholder="₹10,000 bonus" className={fieldCls} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Skills *</label>
            <EditSkillsSection
              skills={form.skills ?? []}
              onChange={skills => { set('skills', skills); setSkillError(''); }}
            />
            {skillError && (
              <p className="text-[11px] text-red-500 mt-1">{skillError}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
              Referral Strength: {form.referral_strength}%
            </label>
            <input type="range" min={0} max={100} step={5}
              value={form.referral_strength ?? 70}
              onChange={e => set('referral_strength', parseInt(e.target.value, 10))}
              className="w-full accent-primary" />
            <p className="text-[10px] text-gray-400 mt-1">How confident are you about getting this person hired?</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description *</label>
            <textarea required value={form.description ?? ''} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Describe the role, team, or what you're looking for in a candidate..."
              className={`${fieldCls} resize-none`} />
          </div>

          {createMutation.isError && (
            <p className="text-[12px] text-red-600 bg-red-50 rounded-xl px-4 py-2">
              {(createMutation.error as any)?.message ?? 'Failed to create referral.'}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending}
              className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white bg-gradient-to-r from-indigo-600 to-primary hover:opacity-90 transition-all hover:shadow-lg disabled:opacity-60">
              {createMutation.isPending ? 'Posting...' : 'Post Referral'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
