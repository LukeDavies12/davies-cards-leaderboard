'use client';

import { useEffect } from 'react';

export function useClickOutside(
  ref: { current: HTMLElement | null },
  onClose: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    function handleEvent(e: PointerEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') onClose();
        return;
      }
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('pointerdown', handleEvent as EventListener);
    document.addEventListener('keydown', handleEvent as EventListener);
    return () => {
      document.removeEventListener('pointerdown', handleEvent as EventListener);
      document.removeEventListener('keydown', handleEvent as EventListener);
    };
  }, [onClose, enabled, ref]);
}
