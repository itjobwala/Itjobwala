'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  text: string;
  size?: 'sm' | 'md';
}

export default function InfoButton({ text, size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const dim = size === 'md' ? 20 : 16;
  const fs  = size === 'md' ? 10 : 9;

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="More information"
        style={{
          width: dim, height: dim, borderRadius: '50%',
          border: '1px solid #5b87d6', color: '#9fbdf0', background: '#1c2940',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs, fontWeight: 700, lineHeight: 1,
          cursor: 'pointer', flexShrink: 0,
          opacity: open ? 1 : 0.75,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = open ? '1' : '0.75'; }}
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
            zIndex: 50, width: 224,
            background: '#202324', border: '1px solid #2a2e30',
            borderRadius: 14, padding: '12px 14px',
            fontSize: 11.5, lineHeight: 1.6, color: '#9aa0a6',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {text}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              display: 'block', marginTop: 8,
              fontSize: 10, color: '#6c7378',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              textDecoration: 'underline',
            }}
          >
            dismiss
          </button>
        </span>
      )}
    </span>
  );
}
