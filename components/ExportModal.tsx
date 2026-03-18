'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Expense } from '@/types/expense';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/constants';
import { ExportFormat, runExport } from '@/lib/exporters';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: string; desc: string }[] = [
  { value: 'csv',  label: 'CSV',  icon: '📊', desc: 'Spreadsheet compatible' },
  { value: 'json', label: 'JSON', icon: '📋', desc: 'Developer friendly' },
  { value: 'pdf',  label: 'PDF',  icon: '📄', desc: 'Print ready report' },
];

export default function ExportModal({ expenses, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(CATEGORIES));
  const [filename, setFilename] = useState(`expenses-${today}`);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (!selectedCats.has(e.category)) return false;
      return true;
    });
  }, [expenses, dateFrom, dateTo, selectedCats]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const toggleCategory = (cat: string) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const toggleAllCats = () => {
    setSelectedCats(prev =>
      prev.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES)
    );
  };

  const handleExport = async () => {
    if (filtered.length === 0) return;
    setLoading(true);
    await runExport({ format, filename: filename || `expenses-${today}`, expenses: filtered });
    setLoading(false);
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export Expenses</h2>
            <p className="text-sm text-gray-400 mt-0.5">Configure and download your data</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1 rounded-lg hover:bg-gray-100 transition-colors">×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Format */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all ${
                    format === f.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className={`font-bold text-sm ${format === f.value ? 'text-blue-700' : 'text-gray-700'}`}>{f.label}</span>
                  <span className="text-xs text-gray-400">{f.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Date range */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <input type="date" value={dateFrom} max={dateTo || today}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <input type="date" value={dateTo} min={dateFrom} max={today}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </section>

          {/* Categories */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">Categories</label>
              <button onClick={toggleAllCats} className="text-xs text-blue-600 hover:underline">
                {selectedCats.size === CATEGORIES.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const active = selectedCats.has(cat);
                return (
                  <button key={cat} onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                      active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}>
                    <span>{CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Filename */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filename</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="expenses-export"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-400 flex-shrink-0">.{format === 'pdf' ? 'html' : format}</span>
            </div>
          </section>

          {/* Summary */}
          <section className={`rounded-xl p-4 border transition-colors ${filtered.length === 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-1 ${filtered.length === 0 ? 'text-red-700' : 'text-gray-700'}`}>
              {filtered.length === 0
                ? '⚠️ No records match your filters'
                : `✓ ${filtered.length} record${filtered.length !== 1 ? 's' : ''} will be exported`}
            </p>
            {filtered.length > 0 && (
              <p className="text-sm text-gray-500">Total amount: <span className="font-semibold text-gray-700">{formatCurrency(total)}</span></p>
            )}
          </section>

          {/* Preview */}
          {filtered.length > 0 && (
            <section>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preview <span className="text-gray-400 font-normal">(first 5 rows)</span>
              </label>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="text-left px-3 py-2.5 font-semibold">Date</th>
                      <th className="text-left px-3 py-2.5 font-semibold">Category</th>
                      <th className="text-right px-3 py-2.5 font-semibold">Amount</th>
                      <th className="text-left px-3 py-2.5 font-semibold hidden sm:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 5).map((e, i) => (
                      <tr key={e.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-3 py-2.5 text-gray-600">{formatDate(e.date)}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center gap-1 text-gray-700">
                            {CATEGORY_ICONS[e.category as keyof typeof CATEGORY_ICONS]} {e.category}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{formatCurrency(e.amount)}</td>
                        <td className="px-3 py-2.5 text-gray-500 hidden sm:table-cell truncate max-w-[160px]">{e.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length > 5 && (
                  <p className="text-center text-xs text-gray-400 py-2 border-t border-gray-100">
                    + {filtered.length - 5} more record{filtered.length - 5 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={loading || filtered.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              done
                ? 'bg-emerald-500 text-white'
                : loading
                ? 'bg-blue-400 text-white cursor-wait'
                : filtered.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {done ? (
              <><span>✓</span> Exported!</>
            ) : loading ? (
              <><span className="animate-spin inline-block">⟳</span> Exporting…</>
            ) : (
              <><span>↓</span> Export {filtered.length > 0 ? `${filtered.length} Record${filtered.length !== 1 ? 's' : ''}` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
