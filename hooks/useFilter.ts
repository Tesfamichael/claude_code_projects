'use client';
import { useState, useMemo } from 'react';
import { Expense, FilterState } from '@/types/expense';

const defaultFilter: FilterState = { search: '', category: 'All', dateFrom: '', dateTo: '' };

export function useFilter(expenses: Expense[]) {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (filter.category !== 'All' && e.category !== filter.category) return false;
      if (filter.search && !e.description.toLowerCase().includes(filter.search.toLowerCase())) return false;
      if (filter.dateFrom && e.date < filter.dateFrom) return false;
      if (filter.dateTo && e.date > filter.dateTo) return false;
      return true;
    });
  }, [expenses, filter]);

  const updateFilter = (updates: Partial<FilterState>) => setFilter(prev => ({ ...prev, ...updates }));
  const resetFilter = () => setFilter(defaultFilter);

  return { filter, filtered, updateFilter, resetFilter };
}
