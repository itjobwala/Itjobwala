import Link from 'next/link';
import Card from '@/src/components/ui/Card';

interface Props {
  completion: number;
  saving: boolean;
  lastUpdated: string;
  onSave: () => void;
}

export default function ProfileEditSidebar({ completion, saving, lastUpdated, onSave }: Props) {
  return (
    <>
      <Card overflow>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-extrabold text-[#0f172a] tracking-[-0.3px]">Profile completion</h2>
          <span className="text-[13px] font-extrabold text-primary">{completion}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-primary rounded-full transition-all duration-500 w-[82%]" />
        </div>
        <div className="space-y-2.5">
          {['Basic details', 'Resume uploaded', 'Skills added', 'Experience added'].map(item => (
            <div key={item} className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-600">
              <span className="w-4 h-4 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card overflow>
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 text-[14px] font-bold text-white bg-primary rounded-xl px-4 py-3 hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
          >
            {saving && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {saving ? 'Saving changes' : 'Save changes'}
          </button>
          <Link
            href="/profile"
            className="w-full text-center text-[14px] font-bold text-gray-600 border border-gray-200 rounded-xl px-4 py-3 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Cancel
          </Link>
          <Link
            href="/profile"
            className="w-full text-center text-[13px] font-semibold text-primary bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5 hover:bg-primary/10 transition-colors"
          >
            Profile preview
          </Link>
        </div>
      </Card>

      <Card overflow>
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[1.2px] mb-1.5">Last updated</p>
        <p className="text-[13px] font-semibold text-gray-600">{lastUpdated}</p>
        <p className="text-[12px] text-gray-400 leading-[1.6] mt-3">
          Changes are saved as a draft in this mock edit view.
        </p>
      </Card>
    </>
  );
}
