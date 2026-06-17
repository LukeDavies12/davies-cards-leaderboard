'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useClickOutside } from '@/helpers/useClickOutside';

export default function Modal({
  open,
  onClose,
  children,
  className,
  variant = 'dark',
  size = 'default',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'default' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef, onClose, open);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={`relative rounded-md p-4 ${
          size === 'lg'
            ? 'min-w-[min(32rem,calc(100vw-2rem))] max-w-[min(42rem,calc(100vw-2rem))]'
            : 'min-w-52 max-w-[min(20rem,calc(100vw-2rem))]'
        } ${
          variant === 'light'
            ? 'border border-neutral-200 bg-white text-neutral-900 shadow-lg'
            : 'bg-black text-white'
        } ${className ?? ''}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
