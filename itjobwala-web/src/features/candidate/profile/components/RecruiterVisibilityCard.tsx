'use client';

import { useEffect, useState } from 'react';
import Card from '@/src/components/ui/Card';
import { getRecruiterVisibility, updateRecruiterVisibility } from '@/features/candidate/profile/services/profile.api';
import { ProfileValidator } from '@/features/candidate/profile/schemas/profile.schema';

const JOB_TYPE_OPTIONS = ['full-time', 'contract', 'internship'];

export default function RecruiterVisibilityCard() {
  const [visible, setVisible] = useState(true);
  const [openToJobTypes, setOpenToJobTypes] = useState<string[]>(['full-time']);
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [recruiterMessages, setRecruiterMessages] = useState<number | null>(null);
  const [lastActive, setLastActive] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVisibility();
  }, []);

  const fetchVisibility = async () => {
    try {
      setLoading(true);
      const data = await getRecruiterVisibility();
      setVisible(data.recruiter_visible);
      setOpenToJobTypes(data.open_to_job_types ?? ['full-time']);
      setProfileViews(data.profile_views ?? null);
      setRecruiterMessages(data.recruiter_messages ?? null);
      setLastActive(data.last_active ?? 'Today');
      setError('');
    } catch (err) {
      console.error('Failed to load recruiter visibility:', err);
      setError('Failed to load visibility settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newVisible: boolean, newJobTypes: string[]) => {
    const validationError = ProfileValidator.validateRecruiterVisibility({
      recruiter_visible: newVisible,
      open_to_job_types: newJobTypes,
    });

    if (validationError) {
      setError(validationError.message);
      setTimeout(() => setError(''), 4000);
      return;
    }

    setSaving(true);
    try {
      const data = await updateRecruiterVisibility({
        recruiter_visible: newVisible,
        open_to_job_types: newJobTypes,
      });
      setVisible(data.recruiter_visible);
      setOpenToJobTypes(data.open_to_job_types ?? []);
      setProfileViews(data.profile_views ?? null);
      setRecruiterMessages(data.recruiter_messages ?? null);
      setLastActive(data.last_active ?? 'Today');
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save visibility settings';
      setError(message);
      console.error('Failed to update visibility:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async () => {
    const newVisible = !visible;
    const newJobTypes = newVisible ? openToJobTypes : [];
    setVisible(newVisible);
    setOpenToJobTypes(newJobTypes);
    await handleSave(newVisible, newJobTypes);
  };

  const toggleJobType = async (jobType: string) => {
    let newJobTypes: string[];
    if (openToJobTypes.includes(jobType)) {
      newJobTypes = openToJobTypes.filter(t => t !== jobType);
    } else {
      newJobTypes = [...openToJobTypes, jobType];
    }
    setOpenToJobTypes(newJobTypes);
    await handleSave(visible, newJobTypes);
  };

  if (loading) {
    return (
      <Card overflow>
        <h3 className="text-base font-extrabold text-heading mb-4">Recruiter visibility</h3>
        <div className="h-40 bg-surface-hover rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card overflow>
      <h3 className="text-base font-extrabold text-heading mb-4">Recruiter visibility</h3>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between p-3 bg-surface-alt rounded-xl mb-4">
        <div>
          <p className="text-sm font-semibold text-heading">
            {visible ? 'Visible to recruiters' : 'Hidden from recruiters'}
          </p>
          <p className="text-micro text-subtle mt-0.5">
            {visible ? 'Recruiters can find your profile' : 'Your profile is private'}
          </p>
        </div>
        <button
          onClick={toggleVisibility}
          disabled={saving}
          className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors shrink-0 ${visible ? 'bg-primary' : 'bg-surface-mid'} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Toggle visibility"
        >
          <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2.5 mb-4 p-3 bg-success-bg rounded-xl border border-success">
        <span className="w-2 h-2 rounded-full bg-success shrink-0" />
        <div>
          <p className="text-caption font-semibold text-success">Actively looking</p>
          <p className="text-micro text-success">Last active: {lastActive}</p>
        </div>
      </div>

      {/* Job type preference */}
      {visible && (
        <div className="mb-4">
          <p className="text-caption font-semibold text-muted mb-2">Open to</p>
          <div className="flex gap-2">
            {JOB_TYPE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => toggleJobType(t)}
                disabled={saving}
                className={`flex-1 text-micro font-semibold rounded-lg py-2 transition-colors capitalize ${
                  openToJobTypes.includes(t)
                    ? 'bg-primary text-white'
                    : 'bg-surface-hover text-muted hover:bg-surface-mid'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-danger-bg rounded-xl border border-danger">
          <p className="text-caption font-semibold text-danger">{error}</p>
        </div>
      )}

      {/* Stats — only rendered when the API returns a real value */}
      {(profileViews !== null || recruiterMessages !== null) && (
        <div className="grid grid-cols-2 gap-2">
          {profileViews !== null && (
            <div className="bg-surface-alt rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-primary">{profileViews}</p>
              <p className="text-micro text-subtle">Profile views</p>
            </div>
          )}
          {recruiterMessages !== null && (
            <div className="bg-surface-alt rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-heading">{recruiterMessages}</p>
              <p className="text-micro text-subtle">Recruiter msgs</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
