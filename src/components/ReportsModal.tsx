import React, { useRef, useState } from 'react';
import { MobileExpense, PhoneLine, UserBudgetSettings } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportDataAsJson, exportToCsv, resetToDemoData } from '../utils/storage';
import {
  Printer,
  Download,
  Upload,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Check,
  AlertCircle,
  Briefcase,
  X,
} from 'lucide-react';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: MobileExpense[];
  lines: PhoneLine[];
  budget: UserBudgetSettings;
  onRestoreData: (data: { expenses: MobileExpense[]; lines: PhoneLine[]; budget: UserBudgetSettings }) => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  expenses,
  lines,
  budget,
  onRestoreData,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter expenses by selected month
  const reportExpenses = selectedMonth === 'all'
    ? expenses
    : expenses.filter((e) => e.date.startsWith(selectedMonth));

  const totalSpent = reportExpenses.reduce((acc, e) => acc + e.amount, 0);
  const taxDeductibleSpent = reportExpenses
    .filter((e) => e.isTaxDeductible)
    .reduce((acc, e) => acc + e.amount, 0);

  const months = Array.from(new Set(expenses.map((e) => e.date.substring(0, 7))))
    .sort()
    .reverse();

  const handlePrint = () => {
    window.print();
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.expenses) && Array.isArray(parsed.lines)) {
            onRestoreData({
              expenses: parsed.expenses,
              lines: parsed.lines,
              budget: parsed.budget || budget,
            });
            setImportStatus('Backup restored successfully!');
            setTimeout(() => setImportStatus(null), 3000);
          } else {
            setImportStatus('Invalid JSON backup file structure.');
          }
        } catch (err) {
          setImportStatus('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all mobile expenses and phone lines to default demo data?')) {
      const demo = resetToDemoData();
      onRestoreData(demo);
      setImportStatus('Demo data restored!');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  const lineMap = new Map(lines.map((l) => [l.id, l]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Header (hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Mobile Expense Reports & Data Backup</span>
            </h2>
            <p className="text-xs text-slate-400">
              Generate tax deduction receipts, export CSV, or backup your records
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0">
          {importStatus && (
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-2 text-cyan-300 text-xs print:hidden">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Quick Action Toolbar (hidden when printing) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:hidden">
            <button
              onClick={handlePrint}
              className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-slate-200 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">Print Statement</span>
            </button>

            <button
              onClick={() => exportToCsv(expenses, lines)}
              className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-slate-200 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">Export CSV</span>
            </button>

            <button
              onClick={() => exportDataAsJson(expenses, lines, budget)}
              className="p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-slate-200 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold">JSON Backup</span>
            </button>

            <label className="cursor-pointer p-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-xs text-slate-200 hover:text-white transition-colors">
              <Upload className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Restore Backup</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Month Selector for the Report */}
          <div className="flex items-center justify-between gap-4 print:hidden">
            <div className="text-xs text-slate-300 font-semibold">Report Period:</div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            >
              <option value="all">All-Time Cumulative</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Printable Report Document Card */}
          <div className="bg-slate-950/60 print:bg-white border border-slate-800 print:border-gray-300 rounded-3xl p-6 space-y-5 text-slate-300 print:text-black">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-slate-800 print:border-gray-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-white print:text-black tracking-tight">
                  MobiSpend Statement
                </h3>
                <p className="text-xs text-slate-400 print:text-gray-500">
                  Mobile & Cellular Telecom Expense Report
                </p>
              </div>
              <div className="text-right text-xs">
                <div className="font-semibold text-white print:text-black">
                  Period: {selectedMonth === 'all' ? 'All Records' : selectedMonth}
                </div>
                <div className="text-slate-400 print:text-gray-500 text-[11px]">
                  Generated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl">
                <span className="text-slate-400 print:text-gray-600 block text-[11px]">Total Telecom Spend</span>
                <span className="text-lg font-bold font-mono text-cyan-400 print:text-blue-600">
                  {formatCurrency(totalSpent, budget.currencySymbol, budget.currency)}
                </span>
              </div>

              <div className="p-3 bg-slate-900 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl">
                <span className="text-slate-400 print:text-gray-600 block text-[11px]">Tax-Deductible Spend</span>
                <span className="text-lg font-bold font-mono text-emerald-400 print:text-emerald-700">
                  {formatCurrency(taxDeductibleSpent, budget.currencySymbol, budget.currency)}
                </span>
              </div>

              <div className="p-3 bg-slate-900 print:bg-gray-50 border border-slate-800 print:border-gray-200 rounded-xl">
                <span className="text-slate-400 print:text-gray-600 block text-[11px]">Active Lines Tracked</span>
                <span className="text-lg font-bold font-mono text-white print:text-black">
                  {lines.length} Lines
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 print:border-gray-300 text-slate-400 print:text-gray-600">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2">Carrier / Line</th>
                    <th className="py-2 px-2">Tax Claim</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-200 font-mono">
                  {reportExpenses.map((e) => {
                    const line = lineMap.get(e.phoneLineId);
                    return (
                      <tr key={e.id} className="hover:bg-slate-900/30 print:hover:bg-transparent">
                        <td className="py-2 px-2 whitespace-nowrap text-slate-400 print:text-gray-600 text-[11px]">
                          {e.date}
                        </td>
                        <td className="py-2 px-2 font-sans font-medium text-white print:text-black">
                          {e.title}
                        </td>
                        <td className="py-2 px-2 font-sans text-slate-300 print:text-gray-700 text-[11px]">
                          {e.carrier} {line ? `(${line.name})` : ''}
                        </td>
                        <td className="py-2 px-2 text-[11px]">
                          {e.isTaxDeductible ? (
                            <span className="text-emerald-400 print:text-emerald-700 font-sans font-semibold">
                              Yes (Deductible)
                            </span>
                          ) : (
                            <span className="text-slate-500 print:text-gray-400 font-sans">No</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-white print:text-black">
                          {formatCurrency(e.amount, budget.currencySymbol, budget.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reset button (subtle) */}
          <div className="pt-2 flex items-center justify-between print:hidden">
            <button
              onClick={handleResetDemo}
              className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Demo Data</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
