'use client';
import { Expense } from '@/types/expense';
import { getCategoryTotals, formatCurrency } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/constants';

interface Props { expenses: Expense[] }

export default function CategoryBreakdown({ expenses }: Props) {
  const totals = getCategoryTotals(expenses);
  const grand = Object.values(totals).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-4">By Category</h3>
      {sorted.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(([cat, amount]) => {
            const pct = grand > 0 ? (amount / grand) * 100 : 0;
            const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS] || '#6b7280';
            const icon = CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS] || '📦';
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{icon} {cat}</span>
                  <span className="text-gray-500">{formatCurrency(amount)} <span className="text-gray-400">({pct.toFixed(0)}%)</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
