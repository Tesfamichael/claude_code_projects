'use client';
import { useState, useEffect, useRef } from 'react';
import { Expense } from '@/types/expense';
import {
  ExportTemplate, CloudDestination, ScheduleFrequency, ExportRecord,
  TEMPLATES, DESTINATIONS, filterExpensesByTemplate,
  getExportHistory, getScheduleConfig, saveScheduleConfig, clearExportHistory,
  simulateCloudExport, buildCategoryAnalysis,
} from '@/lib/cloudExport';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORY_ICONS } from '@/lib/constants';

type Tab = 'templates' | 'destinations' | 'schedule' | 'history';

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

export default function CloudExportHub({ expenses, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>('monthly-summary');
  const [selectedDest, setSelectedDest] = useState<CloudDestination>('download');
  const [email, setEmail] = useState('tesfamichael@gmail.com');
  const [exporting, setExporting] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [schedule, setSchedule] = useState(getScheduleConfig());
  const [scheduleSaved, setScheduleSaved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHistory(getExportHistory()); }, [tab]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const previewExpenses = filterExpensesByTemplate(expenses, selectedTemplate);
  const previewTotal = previewExpenses.reduce((s, e) => s + e.amount, 0);
  const templateInfo = TEMPLATES[selectedTemplate];
  const destInfo = DESTINATIONS[selectedDest];

  const handleExport = async () => {
    setExporting(true);
    setShareLink('');
    try {
      const result = await simulateCloudExport(expenses, selectedTemplate, selectedDest, email);
      setShareLink(result.shareLink);
      setHistory(getExportHistory());
    } finally {
      setExporting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const saveSchedule = () => {
    saveScheduleConfig(schedule);
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 2000);
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'destinations', label: 'Destinations', icon: '🌐' },
    { id: 'schedule', label: 'Schedule', icon: '⏰' },
    { id: 'history', label: 'History', icon: '🕒' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden"
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">☁️</span>
                <h2 className="text-lg font-bold">Cloud Export Hub</h2>
                <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full font-medium">BETA</span>
              </div>
              <p className="text-sm text-slate-300">Export, share, and sync your expense data</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none p-1 rounded-lg hover:bg-white/10 transition-colors">×</button>
          </div>

          {/* Sync status bar */}
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {expenses.length} expenses synced
            </span>
            <span>·</span>
            <span>{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))} total</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <span>🔒</span> Encrypted
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <span className="text-base">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── TEMPLATES TAB ── */}
          {tab === 'templates' && (
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500">Choose a report template. Each template is pre-configured for a specific use case.</p>

              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(TEMPLATES) as [ExportTemplate, typeof TEMPLATES[ExportTemplate]][]).map(([key, t]) => (
                  <button key={key} onClick={() => setSelectedTemplate(key)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedTemplate === key ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} text-white text-xl mb-3`}>
                      {t.icon}
                    </div>
                    <div className="font-semibold text-sm text-gray-800">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                  </button>
                ))}
              </div>

              {/* Template preview */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {templateInfo.icon} {templateInfo.label} Preview
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${previewExpenses.length === 0 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                    {previewExpenses.length} records · {formatCurrency(previewTotal)}
                  </span>
                </div>

                {/* Fields */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {templateInfo.fields.map(f => (
                    <span key={f} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-mono">{f}</span>
                  ))}
                </div>

                {selectedTemplate === 'category-analysis' ? (
                  <div className="space-y-2">
                    {buildCategoryAnalysis(previewExpenses).slice(0, 4).map(r => (
                      <div key={r.category} className="flex items-center gap-2 text-xs">
                        <span>{CATEGORY_ICONS[r.category as keyof typeof CATEGORY_ICONS]}</span>
                        <span className="text-gray-700 w-28 truncate">{r.category}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-gray-500 w-12 text-right">{formatCurrency(r.total)}</span>
                      </div>
                    ))}
                    {previewExpenses.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No data</p>}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {previewExpenses.slice(0, 3).map(e => (
                      <div key={e.id} className="flex justify-between text-xs text-gray-600 bg-white rounded-lg px-3 py-2">
                        <span>{formatDate(e.date)}</span>
                        <span>{CATEGORY_ICONS[e.category as keyof typeof CATEGORY_ICONS]} {e.category}</span>
                        <span className="font-semibold">{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                    {previewExpenses.length > 3 && (
                      <p className="text-xs text-center text-gray-400 pt-1">+ {previewExpenses.length - 3} more</p>
                    )}
                    {previewExpenses.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No data for this template range</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DESTINATIONS TAB ── */}
          {tab === 'destinations' && (
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-500">Choose where to send your export. Connect cloud services for automatic syncing.</p>

              <div className="space-y-2">
                {(Object.entries(DESTINATIONS) as [CloudDestination, typeof DESTINATIONS[CloudDestination]][]).map(([key, d]) => (
                  <button key={key} onClick={() => setSelectedDest(key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedDest === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    <span className="text-2xl">{d.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">{d.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {d.connected ? '● Connected' : '○ Not connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                    </div>
                    {!d.connected && (
                      <button className="text-xs text-blue-600 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                        onClick={e => { e.stopPropagation(); }}>
                        Connect →
                      </button>
                    )}
                    {selectedDest === key && d.connected && (
                      <span className="text-blue-500 text-lg flex-shrink-0">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Email input if email selected */}
              {selectedDest === 'email' && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-800 mb-2">📧 Send to email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="you@example.com" />
                  <p className="text-xs text-blue-600 mt-2">You&apos;ll receive a download link in your inbox (simulated)</p>
                </div>
              )}

              {/* Not-connected warning */}
              {!DESTINATIONS[selectedDest].connected && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 font-semibold mb-1">⚠️ Integration not connected</p>
                  <p className="text-xs text-amber-700">Click &quot;Connect →&quot; next to {DESTINATIONS[selectedDest].label} to authorize access. Export will still work as a local download.</p>
                </div>
              )}

              {/* Export action */}
              <div className="pt-2">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                  <span className="text-2xl">{templateInfo.icon}</span>
                  <div className="flex-1 text-sm">
                    <span className="font-semibold text-gray-800">{templateInfo.label}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="text-gray-600">{destInfo.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">{previewExpenses.length} records</span>
                </div>

                <button onClick={handleExport} disabled={exporting || previewExpenses.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    exporting ? 'bg-blue-400 text-white cursor-wait'
                    : previewExpenses.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                  }`}>
                  {exporting ? <><span className="animate-spin">⟳</span> Exporting to {destInfo.label}…</> : <>🚀 Export Now</>}
                </button>

                {/* Share link result */}
                {shareLink && !exporting && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 font-semibold text-sm">✓ Export complete!</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Shareable link generated:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate">
                        {shareLink}
                      </div>
                      <button onClick={copyLink}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${copied ? 'bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                        {copied ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SCHEDULE TAB ── */}
          {tab === 'schedule' && (
            <div className="p-5 space-y-5">
              <p className="text-sm text-gray-500">Set up automatic recurring exports so your data is always backed up.</p>

              {/* Enable toggle */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Automatic Exports</p>
                  <p className="text-xs text-gray-500 mt-0.5">Run exports on a schedule automatically</p>
                </div>
                <button onClick={() => setSchedule(s => ({ ...s, enabled: !s.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${schedule.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${schedule.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className={`space-y-4 ${!schedule.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['daily', 'weekly', 'monthly', 'never'] as ScheduleFrequency[]).map(f => (
                      <button key={f} onClick={() => setSchedule(s => ({ ...s, frequency: f }))}
                        className={`py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                          schedule.frequency === f ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Report Template</label>
                  <select value={schedule.template} onChange={e => setSchedule(s => ({ ...s, template: e.target.value as ExportTemplate }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {(Object.entries(TEMPLATES) as [ExportTemplate, typeof TEMPLATES[ExportTemplate]][]).map(([k, t]) => (
                      <option key={k} value={k}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Send To</label>
                  <div className="space-y-2">
                    {(Object.entries(DESTINATIONS) as [CloudDestination, typeof DESTINATIONS[CloudDestination]][]).map(([k, d]) => (
                      <label key={k} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${schedule.destination === k ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="dest" value={k} checked={schedule.destination === k}
                          onChange={() => setSchedule(s => ({ ...s, destination: k }))} className="text-blue-600" />
                        <span>{d.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{d.label}</span>
                        {!d.connected && <span className="ml-auto text-xs text-gray-400">Requires connection</span>}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Email for schedule */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notification Email</label>
                  <input type="email" value={schedule.email || email}
                    onChange={e => setSchedule(s => ({ ...s, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="you@example.com" />
                </div>

                {/* Next run preview */}
                {schedule.frequency !== 'never' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800">📅 Next scheduled run</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {schedule.frequency === 'daily' && 'Tomorrow at 9:00 AM'}
                      {schedule.frequency === 'weekly' && 'Next Monday at 9:00 AM'}
                      {schedule.frequency === 'monthly' && 'April 1, 2026 at 9:00 AM'}
                    </p>
                  </div>
                )}
              </div>

              <button onClick={saveSchedule}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  scheduleSaved ? 'bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}>
                {scheduleSaved ? '✓ Schedule Saved!' : 'Save Schedule'}
              </button>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === 'history' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{history.length} export{history.length !== 1 ? 's' : ''} recorded</p>
                {history.length > 0 && (
                  <button onClick={() => { clearExportHistory(); setHistory([]); }}
                    className="text-xs text-red-500 hover:text-red-700 hover:underline">Clear history</button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-gray-500 font-medium text-sm">No exports yet</p>
                  <p className="text-gray-400 text-xs mt-1">Your export history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(record => {
                    const t = TEMPLATES[record.template];
                    const d = DESTINATIONS[record.destination];
                    return (
                      <div key={record.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} text-white text-base flex-shrink-0`}>
                            {t.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-gray-800">{t.label}</span>
                              <span className="text-gray-400">→</span>
                              <span className="text-sm text-gray-600">{d.icon} {d.label}</span>
                              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                                record.status === 'success' ? 'bg-emerald-100 text-emerald-700'
                                : record.status === 'pending' ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                                {record.status === 'success' ? '✓ Success' : record.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{new Date(record.timestamp).toLocaleString()}</span>
                              <span>·</span>
                              <span>{record.recordCount} records</span>
                              <span>·</span>
                              <span>{formatCurrency(record.totalAmount)}</span>
                            </div>
                            {record.shareLink && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-gray-400 font-mono truncate flex-1">{record.shareLink}</span>
                                <button onClick={() => navigator.clipboard.writeText(record.shareLink!)}
                                  className="text-xs text-blue-600 hover:underline flex-shrink-0">Copy</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
