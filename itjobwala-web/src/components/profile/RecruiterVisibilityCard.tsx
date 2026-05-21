'use client';

import { useEffect, useState } from 'react';
import Card from '@/src/components/ui/Card';
import { getRecruiterVisibility, updateRecruiterVisibility } from '@/src/lib/api/profile';
import { ProfileValidator } from '@/src/lib/validation/profile';

const JOB_TYPE_OPTIONS = ['full-time', 'contract', 'internship'];

export default function RecruiterVisibilityCard() {
  const [visible, setVisible] = useState(true);
  const [openToJobTypes, setOpenToJobTypes] = useState<string[]>(['full-time']);
  const [profileViews, setProfileViews] = useState(0);
  const [recruiterMessages, setRecruiterMessages] = useState(0);
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
      setProfileViews(data.profile_views ?? 0);
      setRecruiterMessages(data.recruiter_messages ?? 0);
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
      setProfileViews(data.profile_views ?? 0);
      setRecruiterMessages(data.recruiter_messages ?? 0);
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
        <h3 className="text-[14px] font-extrabold text-[#0f172a] mb-4">Recruiter visibility</h3>
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
      </Card>
    );
  }

  return (
    <Card overflow>
      <h3 className="text-[14px] font-extrabold text-[#0f172a] mb-4">Recruiter visibility</h3>

      {/* Visibility toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
        <div>
          <p className="text-[13px] font-semibold text-[#0f172a]">
            {visible ? 'Visible to recruiters' : 'Hidden from recruiters'}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {visible ? 'Recruiters can find your profile' : 'Your profile is private'}
          </p>
        </div>
        <button
          onClick={toggleVisibility}
          disabled={saving}
          className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors shrink-0 ${visible ? 'bg-primary' : 'bg-gray-300'} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Toggle visibility"
        >
          <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${visible ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2.5 mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        <div>
          <p className="text-[12px] font-semibold text-green-800">Actively looking</p>
          <p className="text-[11px] text-green-600">Last active: {lastActive}</p>
        </div>
      </div>

      {/* Job type preference */}
      {visible && (
        <div className="mb-4">
          <p className="text-[12px] font-semibold text-gray-500 mb-2">Open to</p>
          <div className="flex gap-2">
            {JOB_TYPE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => toggleJobType(t)}
                disabled={saving}
                className={`flex-1 text-[11px] font-semibold rounded-lg py-2 transition-colors capitalize ${
                  openToJobTypes.includes(t)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
        <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[12px] font-semibold text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-[18px] font-extrabold text-primary">{profileViews}</p>
          <p className="text-[11px] text-gray-400">Profile views</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-[18px] font-extrabold text-[#0f172a]">{recruiterMessages}</p>
          <p className="text-[11px] text-gray-400">Recruiter msgs</p>
        </div>
      </div>
    </Card>
  );
}
