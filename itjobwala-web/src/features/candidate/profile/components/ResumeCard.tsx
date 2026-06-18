import { useState } from 'react';
import Card from '@/src/components/ui/Card';
import Button from '@/src/components/ui/Button';

interface Props {
  fileName: string;
  uploadDate: string;
  fileUrl: string;
}

export default function ResumeCard({ fileName, uploadDate, fileUrl, onEdit }: Props & { onEdit?: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleView = () => {
    window.open(fileUrl, '_blank');
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card padding="none" className="p-6 sm:p-8" overflow>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-extrabold text-heading" style={{ letterSpacing: '-0.3px' }}>Resume</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          leftIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          }
        >
          Update resume
        </Button>
      </div>

      <div className="flex items-start gap-4 p-4 bg-surface-alt rounded-2xl border border-token hover:border-primary/20 transition-colors">
        {/* PDF icon — intentional red for PDF file type */}
        <div className="w-12 h-14 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center justify-center shrink-0 relative">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span className="text-[8px] font-extrabold text-red-500 mt-0.5">PDF</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-heading truncate">{fileName}</p>
          <p className="text-caption text-subtle mt-0.5">{uploadDate}</p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              rounded="lg"
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              onClick={handleView}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              rounded="lg"
              disabled={isDownloading}
              onClick={handleDownload}
              leftIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-caption text-muted mt-3 text-center">
        Accepted formats: PDF, DOC, DOCX &middot; Max 5 MB
      </p>
    </Card>
  );
}
