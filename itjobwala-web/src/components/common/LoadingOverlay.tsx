'use client';

import { useLoading } from '@/src/contexts/LoadingContext';

export default function LoadingOverlay() {
  const { isLoading, message } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-[14px] font-semibold text-gray-700">{message}</p>
      </div>
    </div>
  );
}
