'use client';

import type { InputHTMLAttributes } from 'react';

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClass?: string;
}

const inputClassName =
  'block w-full min-w-0 max-w-full rounded-sm bg-neutral-50 px-2 py-1 text-sm text-neutral-700 placeholder-neutral-500 transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 active:bg-neutral-100 focus:bg-neutral-100 disabled:bg-neutral-200 disabled:text-neutral-400';

export default function BaseInput({
  label,
  labelClass = 'text-xs text-neutral-500',
  className,
  ...props
}: BaseInputProps) {
  const classes = className ? `${inputClassName} ${className}` : inputClassName;

  return label ? (
    <label className="flex min-w-0 max-w-full flex-col gap-1">
      <span className={labelClass}>{label}</span>
      <input className={classes} {...props} />
    </label>
  ) : (
    <input className={classes} {...props} />
  );
}