'use client';

import { useRef, useState } from 'react';
import { formatDateForInput } from '../utils/profileDate';

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

/* ── Constraints ──────────────────────────────────────────────── */
const MAX = { name: 150, issuer: 100 } as const;

function validateCertField(key: string, value: string, cert?: EditableCertification): string {
  switch (key) {
    case 'name': {
      const v = value?.trim() ?? '';
      if (!v) return 'Certification name is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Name must contain letters (e.g. AWS Certified Solutions Architect).';
      if (v.length > MAX.name) return `Max ${MAX.name} characters.`;
      return '';
    }
    case 'issuer': {
      const v = value?.trim() ?? '';
      if (!v) return 'Issuing organization is required.';
      if (!/[a-zA-Z]/.test(v)) return 'Must contain letters (e.g. Amazon Web Services).';
      if (v.length > MAX.issuer) return `Max ${MAX.issuer} characters.`;
      return '';
    }
    case 'issue_date': {
      if (!value) return 'Issue date is required.';
      if (new Date(value) > new Date()) return 'Issue date cannot be in the future.';
      return '';
    }
    default:
      return '';
  }
}

function emptyCertification(): EditableCertification {
  return { id: `cert-${Date.now()}`, name: '', issuer: '', issue_date: '' };
}

function TextField({ label, value, onChange, onBlur, type = 'text', placeholder = '', required, error, maxLength, max }: {
  label: string; value: string; onChange: (value: string) => void; onBlur?: () => void;
  type?: string; placeholder?: string; required?: boolean; error?: string; maxLength?: number; max?: string;
}) {
  return (
    <label className="block">
      <span className="block text-caption font-bold text-muted mb-1.5">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        max={max}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm font-medium text-heading outline-none transition-colors focus:border-primary/50 placeholder:text-subtle ${error ? 'border-danger focus:border-danger' : 'border-token'}`}
      />
      {error && <p className="mt-1 text-micro font-semibold text-danger">{error}</p>}
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
          className="flex items-center gap-1.5 text-caption font-semibold text-subtle hover:text-primary transition-colors"
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
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  function handleChange(key: keyof EditableCertification, value: string) {
    onUpdate({ [key]: value });
    if (touched.has(key)) {
      const msg = validateCertField(key, value, { ...cert, [key]: value });
      setErrors(prev => msg ? { ...prev, [key]: msg } : (({ [key]: _, ...rest }) => rest)(prev));
    } else if (errors[key]) {
      setErrors(prev => (({ [key]: _, ...rest }) => rest)(prev));
    }
  }

  function handleBlur(key: string) {
    setTouched(prev => new Set(prev).add(key));
    const msg = validateCertField(key, String((cert as any)[key] ?? ''), cert);
    setErrors(prev => msg ? { ...prev, [key]: msg } : (({ [key]: _, ...rest }) => rest)(prev));
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdate({ selectedFile: file });
    }
  };

  return (
    <div className="rounded-2xl border border-token bg-surface-alt p-4 hover:border-primary/20 transition-colors">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <TextField
          label="Certification name"
          value={cert.name || ''}
          onChange={value => handleChange('name', value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g. AWS Certified Solutions Architect"
          maxLength={MAX.name}
          required
          error={errors.name}
        />
        <TextField
          label="Issuing organization"
          value={cert.issuer || ''}
          onChange={value => handleChange('issuer', value)}
          onBlur={() => handleBlur('issuer')}
          placeholder="e.g. Amazon Web Services"
          maxLength={MAX.issuer}
          required
          error={errors.issuer}
        />
        <div>
          <TextField
            label="Issue date"
            value={formatDateForInput(cert.issue_date)}
            onChange={value => handleChange('issue_date', value)}
            onBlur={() => handleBlur('issue_date')}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            required
            error={errors.issue_date}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block">
          <span className="block text-caption font-bold text-muted mb-1.5">
            Certificate file <span className="text-danger">*</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-token bg-surface px-3.5 py-2.5 text-sm font-medium text-body-secondary hover:border-primary/40 hover:text-primary transition-colors"
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
          className="text-caption font-semibold text-danger hover:text-danger transition-colors"
        >
          Remove certification
        </button>
      </div>
    </div>
  );
}
