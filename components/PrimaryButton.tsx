'use client';

import type { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function PrimaryButton({
  className,
  type = 'submit',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-sm cursor-pointer bg-neutral-50 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 active:bg-neutral-100 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed ${className ?? ''}`}
      {...props}
    />
  );
}
