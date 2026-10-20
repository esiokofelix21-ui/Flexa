import React, { useState } from 'react';
import { MobileExpense, PhoneLine, UserBudgetSettings, ExpenseCategory } from '../types';
import { CATEGORY_CONFIG, CARRIER_PRESETS } from '../data/initialData';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Receipt,
  FileSpreadsheet,
  X,
  PhoneCall,
  Smartphone,
  Wifi,
  Globe,
  TabletSmartphone,
  ShieldCheck,
  CreditCard,
  Headphones,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: MobileExpense[];
  lines: PhoneLine[];
  budget: UserBudgetSettings;
  onEdit: (expense: MobileExpense) => void;
  onDelete: (id: string) => void;
  onDuplicate: (expense: MobileExpense) => void;
  onAddNew: () => void;
  onExportCsv: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  lines,
  budget,
  onEdit,
  onDelete,
  onDuplicate,
  onAddNew,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [onlyTaxDeductible, setOnlyTaxDeductible] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Phone line map for fast lookup
  const lineMap = new Map(lines.map((l) => [l.id, l]));

  // Month list from available expenses
  const months = Array.from(
    new Set(expenses.map((e) => e.date.substring(0, 7)))
  ).sort().reverse();

  // Filtered and sorted expenses
  const filtered = expenses
    .filter((e) => {
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (selectedLine !== 'all' && e.phoneLineId !== selectedLine) return false;
      if (selectedMonth !== 'all' && !e.date.startsWith(selectedMonth)) return false;
      if (onlyTaxDeductible && !e.isTaxDeductible) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesCarrier = e.carrier.toLowerCase().includes(q);
        const matchesNotes = (e.notes || '').toLowerCase().includes(q);
        const matchesLine = (lineMap.get(e.phoneLineId)?.name || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCarrier && !matchesNotes && !matchesLine) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

  const totalFilteredAmount = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (catKey: ExpenseCategory) => {
    switch (catKey) {
      case 'monthly_plan':
        return <PhoneCall className="w-4 h-4 text-emerald-400" />;
      case 'prepaid_airtime':
        return <Smartphone className="w-4 h-4 text-blue-400" />;
      case 'data_pack':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'roaming':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'device_financing':
        return <TabletSmartphone className="w-4 h-4 text-amber-400" />;
      case 'insurance':
        return <ShieldCheck className="w-4 h-4 text-rose-400" />;
      case 'app_subscription':
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      case 'accessories':
        return <Headphones className="w-4 h-4 text-orange-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses, carrier, phone line, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExportCsv}
              title="Export filtered records to CSV"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => (
              <option key={k} value={k}>
                {cfg.label}
              </option>
            ))}
          </select>

          {/* Line Dropdown */}
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
          >
            <option value="all">All Devices / Lines</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.carrier})
              </option>
            ))}
          </select>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
          >
            <option value="all">All Billing Cycles</option>
            {months.map((m) => {
              const [y, mo] = m.split('-');
              const label = new Date(parseInt(y), parseInt(mo) - 1, 1).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              });
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </select>

          {/* Tax Deductible Toggle */}
          <button
            type="button"
            onClick={() => setOnlyTaxDeductible(!onlyTaxDeductible)}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors text-xs ${
              onlyTaxDeductible
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tax Deductible Only</span>
          </button>

          {/* Sort selector */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Cost</option>
              <option value="amount-asc">Lowest Cost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary of Current Filter View */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-medium">
        <span>
          Showing <strong className="text-white">{filtered.length}</strong> {filtered.length === 1 ? 'expense' : 'expenses'}
        </span>
        <span>
          Filtered Total:{' '}
          <strong className="text-cyan-400 font-mono text-sm">
            {formatCurrency(totalFilteredAmount, budget.currencySymbol, budget.currency)}
          </strong>
        </span>
      </div>

      {/* Expenses Ledger Items */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
          <h4 className="text-base font-semibold text-white">No expenses matched your filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting search query or filter tags, or log a new phone bill / top-up.
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mobile Expense</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => {
            const line = lineMap.get(item.phoneLineId);
            const categoryCfg = CATEGORY_CONFIG[item.category] || {
              label: item.category,
              color: 'text-slate-400',
              bg: 'bg-slate-800',
              border: 'border-slate-700',
            };
            const carrierPreset = CARRIER_PRESETS.find((c) => c.name === item.carrier);

            return (
              <div
                key={item.id}
                className="group bg-slate-900/80 hover:bg-slate-850/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon & Main Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${categoryCfg.bg} ${categoryCfg.border}`}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
                          {item.title}
                        </h4>

                        {/* Status badge */}
                        {item.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                        ) : item.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Clock className="w-3 h-3" /> Scheduled
                          </span>
                        )}

                        {item.isTaxDeductible && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            <Briefcase className="w-3 h-3" /> Tax Deductible
                          </span>
                        )}
                      </div>

                      {/* Meta badges: Line, Carrier, Date, Data Pack */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        {/* Carrier Tag */}
                        <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                          {carrierPreset ? (
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: carrierPreset.color }}
                            />
                          ) : null}
                          {item.carrier}
                        </span>

                        <span>•</span>

                        {/* Phone line */}
                        <span className="text-slate-300">
                          {line ? line.name : 'Unassigned Line'}
                        </span>

                        <span>•</span>

                        {/* Date */}
                        <span className="font-mono text-slate-400">{formatDate(item.date)}</span>

                        {/* Data included if any */}
                        {item.dataIncludedGb && item.dataIncludedGb > 0 && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-800/40 text-[11px]">
                              {item.dataIncludedGb} GB (
                              {formatCurrency(
                                item.amount / item.dataIncludedGb,
                                budget.currencySymbol,
                                budget.currency
                              )}
                              /GB)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Notes snippet */}
                      {item.notes && (
                        <p className="text-xs text-slate-400 line-clamp-1 italic pt-0.5">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    {/* Receipt thumbnail button */}
                    {item.receiptImage && (
                      <button
                        onClick={() => setViewingReceipt(item.receiptImage!)}
                        title="View bill receipt"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition-colors"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    )}

                    {/* Amount */}
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold font-mono text-white tracking-tight">
                        {formatCurrency(item.amount, budget.currencySymbol, budget.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        {item.paymentMethod}
                      </div>
                    </div>

                    {/* Action buttons (hover or mobile visible) */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDuplicate(item)}
                        title="Duplicate for this cycle"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit expense"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        title="Delete expense"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Receipt Preview Lightbox Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-3 right-3 p-2 bg-slate-800 text-slate-300 hover:text-white rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-semibold text-white mb-3">Attached Bill / Receipt</h4>
            <div className="overflow-auto max-h-[75vh] rounded-xl border border-slate-800">
              <img
                src={viewingReceipt}
                alt="Receipt Full Preview"
                className="max-w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
