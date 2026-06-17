'use client';

import type { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { }

export default function PrimaryButton({
  className,
  type = 'submit',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-sm cursor-pointer bg-red-600 px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 active:bg-red-800 disabled:bg-red-300 disabled:text-red-50 disabled:cursor-not-allowed ${className ?? ''}`}
      {...props}
    />
  );
}
