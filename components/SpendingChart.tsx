'use client';
import { Expense } from '@/types/expense';
import { getLast6MonthsData, formatCurrency } from '@/lib/utils';

interface Props { expenses: Expense[] }

export default function SpendingChart({ expenses }: Props) {
  const data = getLast6MonthsData(expenses);
  const max = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-6">Last 6 Months</h3>
      <div className="flex items-end gap-3 h-40">
        {data.map(d => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-500 font-medium">{d.total > 0 ? formatCurrency(d.total) : ''}</span>
            <div className="w-full relative" style={{ height: `${(d.total / max) * 120 + 4}px` }}>
              <div
                className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                style={{ height: `${(d.total / max) * 120 + 4}px` }}
              />
            </div>
            <span className="text-xs text-gray-500">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
