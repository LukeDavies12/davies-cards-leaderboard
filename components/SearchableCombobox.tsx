'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useClickOutside } from '@/helpers/useClickOutside';

export default function SearchableCombobox({
  label,
  labelClass = 'text-xs text-neutral-500',
  options,
  value,
  onChange,
  placeholder,
  required,
}: {
  label?: string;
  labelClass?: string;
  options: { id: number; name: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useClickOutside(containerRef, () => setOpen(false), open);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter((option) => option.name.toLowerCase().includes(normalized));
  }, [options, query]);

  const showCreateOption =
    query.trim().length > 0 &&
    !options.some((option) => option.name.toLowerCase() === query.trim().toLowerCase());

  const handleSelect = (nextValue: string) => {
    setQuery(nextValue);
    onChange(nextValue);
    setOpen(false);
  };

  const field = (
    <div ref={containerRef} className="relative">
      <input
        className="block w-full min-w-0 rounded-sm bg-neutral-50 px-2 py-1 text-sm text-neutral-700 placeholder-neutral-500 transition-colors hover:bg-neutral-100 focus:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 active:bg-neutral-100 disabled:bg-neutral-200 disabled:text-neutral-400"
        value={query}
        placeholder={placeholder}
        required={required}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          onChange(event.target.value);
          setOpen(true);
        }}
      />
      {open && (filteredOptions.length > 0 || showCreateOption) && (
        <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-sm border border-neutral-200 bg-white py-1 shadow-md">
          {filteredOptions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="block w-full cursor-pointer px-2 py-1 text-left text-sm text-neutral-700 hover:bg-neutral-100"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option.name)}
              >
                {option.name}
              </button>
            </li>
          ))}
          {showCreateOption && (
            <li>
              <button
                type="button"
                className="block w-full cursor-pointer px-2 py-1 text-left text-sm text-red-700 hover:bg-neutral-100"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(query.trim())}
              >
                Create &ldquo;{query.trim()}&rdquo;
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );

  if (!label) return field;

  return (
    <label className="flex flex-col gap-1">
      <span className={labelClass}>{label}</span>
      {field}
    </label>
  );
}
