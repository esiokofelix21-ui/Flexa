import { MobileExpense, PhoneLine, UserBudgetSettings } from '../types';
import { INITIAL_EXPENSES, INITIAL_PHONE_LINES, INITIAL_BUDGET } from '../data/initialData';

const EXPENSES_KEY = 'mobispend_expenses_v1';
const LINES_KEY = 'mobispend_lines_v1';
const BUDGET_KEY = 'mobispend_budget_v1';

export function getStoredExpenses(): MobileExpense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) {
      saveExpenses(INITIAL_EXPENSES);
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading expenses from localStorage', err);
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: MobileExpense[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed saving expenses', err);
  }
}

export function getStoredLines(): PhoneLine[] {
  try {
    const raw = localStorage.getItem(LINES_KEY);
    if (!raw) {
      saveLines(INITIAL_PHONE_LINES);
      return INITIAL_PHONE_LINES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading phone lines from localStorage', err);
    return INITIAL_PHONE_LINES;
  }
}

export function saveLines(lines: PhoneLine[]): void {
  try {
    localStorage.setItem(LINES_KEY, JSON.stringify(lines));
  } catch (err) {
    console.error('Failed saving phone lines', err);
  }
}

export function getStoredBudget(): UserBudgetSettings {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) {
      saveBudget(INITIAL_BUDGET);
      return INITIAL_BUDGET;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading budget from localStorage', err);
    return INITIAL_BUDGET;
  }
}

export function saveBudget(budget: UserBudgetSettings): void {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  } catch (err) {
    console.error('Failed saving budget', err);
  }
}

export function resetToDemoData(): { expenses: MobileExpense[]; lines: PhoneLine[]; budget: UserBudgetSettings } {
  saveExpenses(INITIAL_EXPENSES);
  saveLines(INITIAL_PHONE_LINES);
  saveBudget(INITIAL_BUDGET);
  return {
    expenses: INITIAL_EXPENSES,
    lines: INITIAL_PHONE_LINES,
    budget: INITIAL_BUDGET,
  };
}

export function exportDataAsJson(expenses: MobileExpense[], lines: PhoneLine[], budget: UserBudgetSettings) {
  const data = {
    appName: 'MobiSpend',
    exportDate: new Date().toISOString(),
    version: '1.0',
    budget,
    lines,
    expenses,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mobispend-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(expenses: MobileExpense[], lines: PhoneLine[]) {
  const lineMap = new Map(lines.map((l) => [l.id, l.name]));
  const headers = ['ID', 'Date', 'Title', 'Category', 'Carrier', 'Phone Line', 'Amount', 'Currency', 'Cycle', 'Payment Method', 'Status', 'Tax Deductible', 'Notes'];
  
  const rows = expenses.map((e) => [
    e.id,
    e.date,
    `"${e.title.replace(/"/g, '""')}"`,
    e.category,
    `"${e.carrier}"`,
    `"${lineMap.get(e.phoneLineId) || 'Unknown Line'}"`,
    e.amount.toFixed(2),
    e.currency,
    e.billingCycle,
    `"${e.paymentMethod}"`,
    e.status,
    e.isTaxDeductible ? 'YES' : 'NO',
    `"${(e.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mobispend-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
