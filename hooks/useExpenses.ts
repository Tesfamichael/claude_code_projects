'use client';
import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFormData, FilterState } from '@/types/expense';
import { STORAGE_KEY } from '@/lib/constants';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setExpenses(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, loaded]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const expense: Expense = {
      id: generateId(),
      date: data.date,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description.trim(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    setExpenses(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, date: data.date, amount: parseFloat(data.amount), category: data.category, description: data.description.trim() }
          : e
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const exportCSV = useCallback(() => {
    const header = 'Date,Amount,Category,Description\n';
    const rows = expenses
      .map(e => `${e.date},${e.amount.toFixed(2)},${e.category},"${e.description.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [expenses]);

  return { expenses, loaded, addExpense, updateExpense, deleteExpense, exportCSV };
}
