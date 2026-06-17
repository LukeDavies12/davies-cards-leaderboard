import { Loader2 } from 'lucide-react';

export function LoadingSpinner({
  className = 'size-4',
  label = 'Loading',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Loader2
      className={`animate-spin text-neutral-400 ${className}`}
      aria-label={label}
    />
  );
}
