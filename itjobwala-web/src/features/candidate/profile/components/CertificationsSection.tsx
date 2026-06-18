import Link from 'next/link';
import type { Certification } from '@/features/candidate/profile/types/profile.types';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

interface Props {
  certifications: Certification[];
}

function ReadOnlyField({ label, value, url }: { label: string; value: string; url?: string }) {
  return (
    <div className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">{label}</span>
      <div className="w-full rounded-xl border border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-heading truncate">
        {value ? (
          url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              {value}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : value
        ) : (
          <span className="text-subtle">Not provided</span>
        )}
      </div>
    </div>
  );
}

export default function CertificationsSection({ certifications, onEdit, onAdd }: Props & { onEdit?: (id: string) => void; onAdd?: () => void }) {
  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>Certifications</h2>
        {certifications.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
              </svg>
            }
            onClick={onAdd}
          >
            Add certification
          </Button>
        ) : null}
      </div>

      {certifications.length === 0 ? (
        <button
          onClick={onAdd}
          className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-token rounded-xl text-subtle hover:border-primary/40 hover:text-primary transition-colors"
        >
          <span className="text-sm font-semibold">Add your certifications</span>
        </button>
      ) : (
        <div className="flex flex-col gap-4">
          {certifications.map(cert => (
            <div key={cert.id} className="rounded-2xl border border-token bg-surface-alt p-4 hover:border-primary/20 transition-colors group relative">
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  }
                  onClick={() => onEdit?.(cert.id as string)}
                  aria-label="Edit certification"
                >
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                <ReadOnlyField label="Certification name" value={cert.name} />
                <ReadOnlyField label="Issuing organization" value={cert.issuer ?? ''} />
                <ReadOnlyField label="Issue date" value={cert.issue_date} />
                {cert.certificate?.file_url && (
                  <ReadOnlyField
                    label="Certificate"
                    value={cert.certificate.file_name}
                    url={cert.certificate.file_url}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
