'use client';
import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useFilter } from '@/hooks/useFilter';
import SummaryCards from '@/components/SummaryCards';
import SpendingChart from '@/components/SpendingChart';
import CategoryBreakdown from '@/components/CategoryBreakdown';
import ExpenseForm from '@/components/ExpenseForm';
import FilterBar from '@/components/FilterBar';
import ExpenseList from '@/components/ExpenseList';
import CloudExportHub from '@/components/CloudExportHub';

export default function Home() {
  const { expenses, loaded, addExpense, updateExpense, deleteExpense, exportCSV } = useExpenses();
  const { filter, filtered, updateFilter, resetFilter } = useFilter(expenses);
  const [showExportHub, setShowExportHub] = useState(false);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💰 Expense Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track &amp; manage your spending</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} total
            </span>
            <button
              onClick={() => setShowExportHub(true)}
              disabled={expenses.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-600 hover:from-slate-900 hover:to-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md"
            >
              ☁️ Cloud Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <SummaryCards expenses={expenses} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart expenses={expenses} />
          <CategoryBreakdown expenses={expenses} />
        </div>
        <ExpenseForm onSubmit={addExpense} />
        <FilterBar filter={filter} onChange={updateFilter} onReset={resetFilter} onExport={exportCSV} />
        <ExpenseList expenses={filtered} onDelete={deleteExpense} onUpdate={updateExpense} />
      </main>

      {showExportHub && (
        <CloudExportHub expenses={expenses} onClose={() => setShowExportHub(false)} />
      )}
    </div>
  );
}
