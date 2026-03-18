'use client';
import { Expense } from '@/types/expense';

export type ExportTemplate = 'tax-report' | 'monthly-summary' | 'category-analysis' | 'full-backup';
export type CloudDestination = 'email' | 'google-sheets' | 'dropbox' | 'onedrive' | 'download';
export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

export interface ExportRecord {
  id: string;
  timestamp: string;
  template: ExportTemplate;
  destination: CloudDestination;
  recordCount: number;
  totalAmount: number;
  status: 'success' | 'pending' | 'failed';
  shareLink?: string;
}

export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  destination: CloudDestination;
  template: ExportTemplate;
  enabled: boolean;
  nextRun?: string;
  email?: string;
}

const HISTORY_KEY = 'export_history_v3';
const SCHEDULE_KEY = 'export_schedule_v3';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function generateShareLink(): string {
  return `https://expensetracker.app/shared/${generateId()}`;
}

export function getExportHistory(): ExportRecord[] {
  try {
    const s = localStorage.getItem(HISTORY_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export function addExportRecord(record: Omit<ExportRecord, 'id'>): ExportRecord {
  const full: ExportRecord = { ...record, id: generateId() };
  const history = [full, ...getExportHistory()].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return full;
}

export function clearExportHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function getScheduleConfig(): ScheduleConfig {
  try {
    const s = localStorage.getItem(SCHEDULE_KEY);
    return s ? JSON.parse(s) : defaultSchedule();
  } catch { return defaultSchedule(); }
}

export function saveScheduleConfig(config: ScheduleConfig) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(config));
}

function defaultSchedule(): ScheduleConfig {
  return { frequency: 'never', destination: 'email', template: 'monthly-summary', enabled: false };
}

export const TEMPLATES: Record<ExportTemplate, {
  label: string; icon: string; description: string; color: string;
  fields: string[]; dateRange: 'current-year' | 'current-month' | 'all' | 'custom';
}> = {
  'tax-report': {
    label: 'Tax Report',
    icon: '🧾',
    description: 'Annual expense summary formatted for tax preparation',
    color: 'from-emerald-500 to-teal-600',
    fields: ['Date', 'Category', 'Amount', 'Description', 'Tax Deductible'],
    dateRange: 'current-year',
  },
  'monthly-summary': {
    label: 'Monthly Summary',
    icon: '📅',
    description: 'Current month breakdown by category with totals',
    color: 'from-blue-500 to-indigo-600',
    fields: ['Date', 'Category', 'Amount', 'Description'],
    dateRange: 'current-month',
  },
  'category-analysis': {
    label: 'Category Analysis',
    icon: '📊',
    description: 'Deep dive into spending patterns per category',
    color: 'from-violet-500 to-purple-600',
    fields: ['Category', 'Total', 'Count', '% of Spend'],
    dateRange: 'all',
  },
  'full-backup': {
    label: 'Full Backup',
    icon: '☁️',
    description: 'Complete data backup with all fields and metadata',
    color: 'from-orange-500 to-red-500',
    fields: ['ID', 'Date', 'Category', 'Amount', 'Description', 'Created At'],
    dateRange: 'all',
  },
};

export const DESTINATIONS: Record<CloudDestination, {
  label: string; icon: string; color: string; connected: boolean; description: string;
}> = {
  email: { label: 'Email', icon: '📧', color: 'bg-blue-100 text-blue-700', connected: true, description: 'Send to your inbox' },
  'google-sheets': { label: 'Google Sheets', icon: '📗', color: 'bg-green-100 text-green-700', connected: false, description: 'Sync to spreadsheet' },
  dropbox: { label: 'Dropbox', icon: '📦', color: 'bg-indigo-100 text-indigo-700', connected: false, description: 'Save to cloud storage' },
  onedrive: { label: 'OneDrive', icon: '☁️', color: 'bg-sky-100 text-sky-700', connected: false, description: 'Sync with Microsoft' },
  download: { label: 'Download', icon: '⬇️', color: 'bg-gray-100 text-gray-700', connected: true, description: 'Save locally' },
};

export function filterExpensesByTemplate(expenses: Expense[], template: ExportTemplate): Expense[] {
  const now = new Date();
  if (template === 'monthly-summary') {
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(ym));
  }
  if (template === 'tax-report') {
    return expenses.filter(e => e.date.startsWith(String(now.getFullYear())));
  }
  return expenses;
}

export function buildCategoryAnalysis(expenses: Expense[]): { category: string; total: number; count: number; pct: number }[] {
  const grand = expenses.reduce((s, e) => s + e.amount, 0);
  const map: Record<string, { total: number; count: number }> = {};
  for (const e of expenses) {
    if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
    map[e.category].total += e.amount;
    map[e.category].count += 1;
  }
  return Object.entries(map)
    .map(([category, v]) => ({ category, ...v, pct: grand > 0 ? (v.total / grand) * 100 : 0 }))
    .sort((a, b) => b.total - a.total);
}

export function generateCSV(expenses: Expense[], template: ExportTemplate): string {
  if (template === 'category-analysis') {
    const rows = buildCategoryAnalysis(expenses);
    const header = 'Category,Total,Count,% of Spend\n';
    return header + rows.map(r => `${r.category},${r.total.toFixed(2)},${r.count},${r.pct.toFixed(1)}%`).join('\n');
  }
  const header = template === 'full-backup'
    ? 'ID,Date,Category,Amount,Description,Created At\n'
    : 'Date,Category,Amount,Description\n';
  const rows = expenses.map(e =>
    template === 'full-backup'
      ? `${e.id},${e.date},${e.category},${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}",${e.createdAt}`
      : `${e.date},${e.category},${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}"`
  ).join('\n');
  return header + rows;
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export async function simulateCloudExport(
  expenses: Expense[],
  template: ExportTemplate,
  destination: CloudDestination,
  email?: string
): Promise<{ shareLink: string }> {
  await new Promise(r => setTimeout(r, Math.random() * 800 + 800));
  const filtered = filterExpensesByTemplate(expenses, template);
  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const shareLink = generateShareLink();

  if (destination === 'download') {
    const csv = generateCSV(filtered, template);
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(csv, `${template}-${date}.csv`, 'text/csv');
  }

  addExportRecord({
    timestamp: new Date().toISOString(),
    template,
    destination,
    recordCount: filtered.length,
    totalAmount: total,
    status: 'success',
    shareLink,
  });

  return { shareLink };
}
