'use client';

import { useRef, useState, useEffect } from 'react';
import Button from '@/src/components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, onProgress?: (pct: number) => void) => Promise<void>;
  isUploading: boolean;
  currentResume?: { file_name: string; url: string };
}

const ACCEPTED_TYPES = ['.pdf', '.doc', '.docx'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ResumeUploadModal({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  currentResume,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): string | null => {
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(fileExt)) {
      return `Invalid file type. Accepted formats: ${ACCEPTED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size exceeds ${MAX_SIZE_MB}MB limit`;
    }
    return null;
  };

  const handleFileSelect = (file: File | null) => {
    setError('');
    setUploadProgress(0);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files?.[0] || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile, (pct) => setUploadProgress(pct));
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Upload failed. Please try again.');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isUploading) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isUploading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-upload-title"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
    >
      <div className="bg-surface rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-token">
          <h2 id="resume-upload-title" className="text-lg font-extrabold text-heading">Upload Resume</h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            aria-label="Close"
            className="text-subtle hover:text-muted disabled:opacity-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {currentResume && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-caption text-blue-900 font-medium">
                Current resume: <span className="font-bold">{currentResume.file_name}</span>
              </p>
            </div>
          )}

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              selectedFile
                ? 'border-primary bg-primary/5'
                : 'border-token hover:border-token-mid'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleInputChange}
              disabled={isUploading}
              className="hidden"
            />

            {!selectedFile ? (
              <>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto text-subtle mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-sm font-semibold text-body-secondary">
                  Drag your resume here
                </p>
                <p className="text-caption text-subtle mt-1">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-caption font-bold text-primary hover:text-primary/80 disabled:opacity-50 mt-1 transition-colors"
                >
                  Browse files
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-12 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-caption font-bold text-body truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-micro text-muted">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => handleFileSelect(null)}
                    className="text-subtle hover:text-muted transition-colors shrink-0"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && uploadProgress > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-caption font-medium text-body-secondary">Uploading...</p>
                <p className="text-caption font-bold text-body">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-danger-bg border border-danger rounded-lg p-3">
              <p className="text-caption font-medium text-danger">{error}</p>
            </div>
          )}

          {/* Info */}
          <p className="text-caption text-muted text-center">
            Accepted formats: PDF, DOC, DOCX • Max 5 MB
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-token">
          <Button
            variant="secondary"
            size="lg"
            disabled={isUploading}
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            loading={isUploading}
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="flex-1"
          >
            Upload Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
