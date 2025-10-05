'use client';

import { useEffect, useRef, useState } from 'react';

type CollapsibleProps = {
  title: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
  children: React.ReactNode;
};

export function Collapsible({
  title,
  defaultOpen = false,
  disabled = false,
  disabledLabel = 'N/A',
  children,
}: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen && !disabled);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | 'auto'>(defaultOpen && !disabled ? 'auto' : 0);

  useEffect(() => {
    if (disabled) return;
    const node = contentRef.current;
    if (!node) return;

    if (open) {
      const scrollHeight = node.scrollHeight;
      setHeight(scrollHeight);
      const timeout = setTimeout(() => setHeight('auto'), 220);
      return () => clearTimeout(timeout);
    }

    if (height === 'auto') {
      const currentHeight = node.scrollHeight;
      setHeight(currentHeight);
      requestAnimationFrame(() => setHeight(0));
    } else {
      requestAnimationFrame(() => setHeight(0));
    }
  }, [open, disabled, height, children]);

  return (
    <div
      style={{
        border: '1px solid rgba(var(--color-border-strong), 0.35)',
        borderRadius: 8,
        background: 'rgba(var(--color-surface-base), 0.88)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => {
          if (disabled) return;
          setOpen(prev => !prev);
        }}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '12px 14px',
          background: 'transparent',
          border: 'none',
          color: '#cdd5ff',
          fontSize: 12,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          {disabled ? disabledLabel : open ? 'Hide' : 'Show'}
        </span>
      </button>
      {!disabled && (
        <div
          ref={contentRef}
          style={{
            height: height === 'auto' ? 'auto' : `${height}px`,
            overflow: 'hidden',
            transition: 'height 0.24s ease',
          }}
        >
          <div style={{ padding: '0 14px 14px' }}>{children}</div>
        </div>
      )}
    </div>
  );
}
