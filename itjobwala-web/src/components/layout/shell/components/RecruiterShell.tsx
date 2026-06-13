'use client';

import { useState } from 'react';
import RecruiterSidebar from './RecruiterSidebar';

export default function RecruiterShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[#f8faff]" style={{ fontFamily: 'var(--font-sora)' }}>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[140] h-[68px] bg-surface border-b border-token flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex flex-col justify-center items-center gap-[5px] rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Open menu"
        >
          <span className="block w-5 h-[2px] bg-gray-700 rounded-full" />
          <span className="block w-5 h-[2px] bg-gray-700 rounded-full" />
          <span className="block w-5 h-[2px] bg-gray-700 rounded-full" />
        </button>
      </div>

      <div className="flex h-full">
        <RecruiterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:ml-[240px] min-w-0 overflow-x-hidden overflow-y-auto pt-[68px] lg:pt-0 h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
