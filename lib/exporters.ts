'use client';
import { Expense } from '@/types/expense';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  expenses: Expense[];
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsCSV({ filename, expenses }: Omit<ExportOptions, 'format'>) {
  const header = 'Date,Category,Amount,Description\n';
  const rows = expenses
    .map(e => `${e.date},${e.category},${e.amount.toFixed(2)},"${e.description.replace(/"/g, '""')}"`)
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportAsJSON({ filename, expenses }: Omit<ExportOptions, 'format'>) {
  const data = expenses.map(e => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportAsPDF({ filename, expenses }: Omit<ExportOptions, 'format'>) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const rows = expenses
    .map(e => `
      <tr>
        <td>${e.date}</td>
        <td>${e.category}</td>
        <td style="text-align:right">${formatAmount(e.amount)}</td>
        <td>${e.description}</td>
      </tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 32px; color: #1a1a1a; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f3f4f6; text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; }
    tr:hover td { background: #fafafa; }
    .total { margin-top: 20px; text-align: right; font-weight: 700; font-size: 15px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; background: #e0e7ff; color: #3730a3; }
  </style>
</head>
<body>
  <h1>💰 Expense Report</h1>
  <p class="meta">Generated ${new Date().toLocaleString()} · ${expenses.length} record${expenses.length !== 1 ? 's' : ''}</p>
  <table>
    <thead>
      <tr><th>Date</th><th>Category</th><th style="text-align:right">Amount</th><th>Description</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="total">Total: ${formatAmount(total)}</p>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${filename}.html`);
}

export async function runExport(options: ExportOptions): Promise<void> {
  await new Promise(r => setTimeout(r, 600)); // simulate processing
  const { format, ...rest } = options;
  if (format === 'csv') exportAsCSV(rest);
  else if (format === 'json') exportAsJSON(rest);
  else if (format === 'pdf') exportAsPDF(rest);
}
