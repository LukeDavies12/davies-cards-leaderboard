'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type TruncatedTextProps = {
  text: string;
  className?: string;
};

export function TruncatedText({ text, className }: TruncatedTextProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      close();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, open]);

  if (!text) return null;

  const handleClick = () => {
    const el = buttonRef.current;
    if (!el) return;

    const isTruncated = el.scrollWidth > el.clientWidth;
    if (!isTruncated && !open) return;

    if (open) {
      close();
      return;
    }

    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        className={`block w-full min-w-0 truncate border-0 bg-transparent p-0 text-left font-inherit text-inherit ${className ?? ''}`}
        title={text}
        aria-expanded={open}
      >
        {text}
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={popoverRef}
              role="tooltip"
              className="fixed z-50 max-w-[min(16rem,calc(100vw-2rem))] rounded-md bg-black px-2 py-1 text-xs text-white whitespace-normal break-words shadow-lg"
              style={{ top: pos.top, left: pos.left }}
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
