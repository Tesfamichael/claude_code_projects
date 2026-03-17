'use client';
import { useState } from 'react';
import { Expense, ExpenseFormData } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';
import ExpenseForm from './ExpenseForm';

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: ExpenseFormData) => void;
}

export default function ExpenseList({ expenses, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-3">💸</div>
        <p className="text-gray-500 font-medium">No expenses found</p>
        <p className="text-gray-400 text-sm mt-1">Add your first expense using the form above.</p>
      </div>
    );
  }

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className="space-y-3">
      {expenses.map(expense => {
        const color = CATEGORY_COLORS[expense.category] || '#6b7280';
        const icon = CATEGORY_ICONS[expense.category] || '📦';

        if (editingId === expense.id) {
          return (
            <div key={expense.id}>
              <ExpenseForm
                mode="edit"
                initial={expense}
                onSubmit={(data) => { onUpdate(expense.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          );
        }

        return (
          <div key={expense.id}
            className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 ${deletingId === expense.id ? 'opacity-0 scale-95' : 'opacity-100'}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: color + '20' }}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-800 truncate">{expense.description}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
                  {expense.category}
                </span>
              </div>
              <span className="text-sm text-gray-400">{formatDate(expense.date)}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-gray-800 text-lg">{formatCurrency(expense.amount)}</span>
              <button onClick={() => setEditingId(expense.id)}
                className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50">
                ✏️
              </button>
              <button onClick={() => confirmDelete(expense.id)}
                className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                🗑️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
