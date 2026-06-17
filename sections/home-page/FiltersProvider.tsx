'use client';

import { useEffect, useState } from 'react';
import type { PageFilters } from '@/helpers/persistedFilters';
import { EMPTY_FILTERS, loadFilters, saveFilters } from '@/helpers/persistedFilters';

export default function FiltersProvider({
  children,
}: {
  children: (
    filters: PageFilters,
    onFilterChange: (filters: PageFilters) => void,
    onClearFilters: () => void,
  ) => React.ReactNode;
}) {
  const [filters, setFilters] = useState<PageFilters>(EMPTY_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load filters from localStorage only on client side
    const loadedFilters = loadFilters();
    setFilters(loadedFilters);
    setIsLoaded(true);
  }, []);

  const handleFilterChange = (newFilters: PageFilters) => {
    setFilters(newFilters);
    saveFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    saveFilters(EMPTY_FILTERS);
  };

  // Don't render anything until filters are loaded to prevent flashing
  if (!isLoaded) {
    return null;
  }

  return children(filters, handleFilterChange, handleClearFilters);
}
