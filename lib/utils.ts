import { Expense } from '@/types/expense';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function getMonthlyTotal(expenses: Expense[]): number {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return expenses.filter(e => e.date.startsWith(yearMonth)).reduce((s, e) => s + e.amount, 0);
}

export function getCategoryTotals(expenses: Expense[]): Record<string, number> {
  return expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
}

export function getTopCategory(expenses: Expense[]): string {
  const totals = getCategoryTotals(expenses);
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : '—';
}

export function getLast6MonthsData(expenses: Expense[]): { month: string; total: number }[] {
  const months: { month: string; total: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const total = expenses.filter(e => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0);
    months.push({ month: label, total });
  }
  return months;
}
