'use client';
import { Expense } from '@/types/expense';
import { formatCurrency, getMonthlyTotal, getTopCategory } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/constants';

interface Props { expenses: Expense[] }

export default function SummaryCards({ expenses }: Props) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const monthly = getMonthlyTotal(expenses);
  const topCat = getTopCategory(expenses);
  const count = expenses.length;

  const cards = [
    { label: 'Total Spent', value: formatCurrency(total), icon: '💰', color: 'from-blue-500 to-blue-600' },
    { label: 'This Month', value: formatCurrency(monthly), icon: '📅', color: 'from-violet-500 to-violet-600' },
    { label: 'Top Category', value: topCat ? `${CATEGORY_ICONS[topCat as keyof typeof CATEGORY_ICONS] || ''} ${topCat}` : '—', icon: '🏆', color: 'from-orange-500 to-orange-600' },
    { label: 'Total Expenses', value: count.toString(), icon: '📊', color: 'from-emerald-500 to-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
          <div className="text-2xl mb-2">{c.icon}</div>
          <div className="text-2xl font-bold truncate">{c.value}</div>
          <div className="text-sm opacity-80 mt-1">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
