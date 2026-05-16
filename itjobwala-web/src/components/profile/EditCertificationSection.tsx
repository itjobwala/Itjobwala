'use client';

import { useRef } from 'react';

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

export interface EditableCertificate {
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface EditableCertification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  certificate?: EditableCertificate;
  selectedFile?: File;
}

interface Props {
  certifications: EditableCertification[];
  onChange: (certifications: EditableCertification[]) => void;
  onDelete?: (id: string | number) => void;
}

function emptyCertification(): EditableCertification {
  return { id: `cert-${Date.now()}`, name: '', issuer: '', issue_date: '' };
}

function TextField({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-bold text-gray-500 mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition-colors focus:border-primary/50 placeholder:text-gray-400"
      />
    </label>
  );
}

export default function EditCertificationSection({ certifications, onChange, onDelete }: Props) {
  function update(id: string, patch: Partial<EditableCertification>) {
    onChange(certifications.map(item => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onChange([...certifications, emptyCertification()])}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-primary transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
          </svg>
          Add certification
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {certifications.map(cert => (
          <CertificationCard
            key={cert.id}
            cert={cert}
            onUpdate={(patch) => update(cert.id, patch)}
            onRemove={() => onDelete ? onDelete(cert.id) : onChange(certifications.filter(item => item.id !== cert.id))}
          />
        ))}
      </div>
    </div>
  );
}

function CertificationCard({
  cert,
  onUpdate,
  onRemove
}: {
  cert: EditableCertification;
  onUpdate: (patch: Partial<EditableCertification>) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ selectedFile: file });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 hover:border-primary/20 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <TextField
          label="Certification name"
          value={cert.name || ''}
          onChange={value => onUpdate({ name: value })}
          placeholder="e.g. AWS Certified Solutions Architect"
        />
        <TextField
          label="Issuing organization"
          value={cert.issuer || ''}
          onChange={value => onUpdate({ issuer: value })}
          placeholder="e.g. Amazon Web Services"
        />
        <TextField
          label="Issue date"
          value={formatDateForInput(cert.issue_date)}
          onChange={value => onUpdate({ issue_date: value })}
          type="date"
        />
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="block text-[12px] font-bold text-gray-500 mb-1.5">
            {cert.certificate?.file_name ? 'Certificate file' : 'Certificate file (optional)'}
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-white px-3.5 py-2.5 text-[13px] font-medium text-gray-600 hover:border-primary/40 hover:text-primary transition-colors"
          >
            {cert.selectedFile ? (
              <div className="flex items-center gap-2 justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {cert.selectedFile.name}
              </div>
            ) : cert.certificate?.file_name ? (
              <div className="flex items-center gap-2 justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Replace: {cert.certificate.file_name}
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload certificate
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="text-[12px] font-semibold text-red-500 hover:text-red-600 transition-colors"
        >
          Remove certification
        </button>
      </div>
    </div>
  );
}
