'use client';

import { useRef, useState } from 'react';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-[16px] font-extrabold text-[#0f172a]">Upload Resume</h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
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
              <p className="text-[12px] text-blue-900 font-medium">
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
                : 'border-gray-200 hover:border-gray-300'
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
                  className="mx-auto text-gray-400 mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-[13px] font-semibold text-gray-600">
                  Drag your resume here
                </p>
                <p className="text-[12px] text-gray-400 mt-1">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-[12px] font-bold text-primary hover:text-primary/80 disabled:opacity-50 mt-1 transition-colors"
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
                  <p className="text-[12px] font-bold text-gray-700 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => handleFileSelect(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
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
                <p className="text-[12px] font-medium text-gray-600">Uploading...</p>
                <p className="text-[12px] font-bold text-gray-700">{uploadProgress}%</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-[12px] font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Info */}
          <p className="text-[12px] text-gray-500 text-center">
            Accepted formats: PDF, DOC, DOCX • Max 5 MB
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 text-center text-[13px] font-bold text-gray-600 bg-gray-100 rounded-lg py-2.5 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 text-center text-[13px] font-bold text-white bg-primary rounded-lg py-2.5 hover:brightness-110 disabled:opacity-50 disabled:brightness-100 transition-all"
          >
            {isUploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
