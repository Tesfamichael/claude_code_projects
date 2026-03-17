'use client';
import { FilterState } from '@/types/expense';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';

interface Props {
  filter: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  onExport: () => void;
}

export default function FilterBar({ filter, onChange, onReset, onExport }: Props) {
  const hasFilter = filter.search || filter.category !== 'All' || filter.dateFrom || filter.dateTo;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search expenses..."
        value={filter.search}
        onChange={e => onChange({ search: e.target.value })}
        className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={filter.category}
        onChange={e => onChange({ category: e.target.value as FilterState['category'] })}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="All">All Categories</option>
        {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
      </select>
      <input type="date" value={filter.dateFrom} onChange={e => onChange({ dateFrom: e.target.value })}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input type="date" value={filter.dateTo} onChange={e => onChange({ dateTo: e.target.value })}
        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {hasFilter && (
        <button onClick={onReset} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
          Clear
        </button>
      )}
      <button onClick={onExport}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2">
        ↓ Export CSV
      </button>
    </div>
  );
}
