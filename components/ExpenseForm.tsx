'use client';
import { useState, useEffect } from 'react';
import { Expense, ExpenseFormData } from '@/types/expense';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';

interface Props {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  initial?: Expense;
  mode?: 'add' | 'edit';
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ onSubmit, onCancel, initial, mode = 'add' }: Props) {
  const [form, setForm] = useState<ExpenseFormData>({
    date: initial?.date || today(),
    amount: initial ? initial.amount.toString() : '',
    category: initial?.category || 'Food',
    description: initial?.description || '',
  });
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({ date: initial.date, amount: initial.amount.toString(), category: initial.category, description: initial.description });
    }
  }, [initial]);

  const validate = (): boolean => {
    const errs: Partial<ExpenseFormData> = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    if (mode === 'add') {
      setForm({ date: today(), amount: '', category: 'Food', description: '' });
      setErrors({});
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  const field = (key: keyof ExpenseFormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-5 text-lg">{mode === 'edit' ? 'Edit Expense' : 'Add Expense'}</h3>

      {submitted && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          ✓ Expense added successfully!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
          <input type="date" {...field('date')} max={today()}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Amount ($)</label>
          <input type="number" step="0.01" min="0" placeholder="0.00" {...field('amount')}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
          <select {...field('category')} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
          <input type="text" placeholder="What did you spend on?" {...field('description')}
            className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-5">
        <button type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
          {mode === 'edit' ? 'Save Changes' : 'Add Expense'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
