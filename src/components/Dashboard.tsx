import React, { useState } from 'react';
import { MobileExpense, PhoneLine, UserBudgetSettings } from '../types';
import { formatCurrency, getDaysUntil } from '../utils/formatters';
import { CATEGORY_CONFIG, CARRIER_PRESETS } from '../data/initialData';
import { SpendingChart } from './Charts/SpendingChart';
import { CategoryDonut } from './Charts/CategoryDonut';
import {
  Smartphone,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Zap,
  Calendar,
  Wifi,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface DashboardProps {
  expenses: MobileExpense[];
  lines: PhoneLine[];
  budget: UserBudgetSettings;
  onOpenAddExpense: () => void;
  onQuickLogBill: (line: PhoneLine) => void;
  onNavigateTab: (tab: 'dashboard' | 'expenses' | 'lines' | 'optimizer' | 'reports') => void;
  onUpdateBudget: (newBudget: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  lines,
  budget,
  onOpenAddExpense,
  onQuickLogBill,
  onNavigateTab,
  onUpdateBudget,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState(budget.monthlyBudget.toString());

  // Filter expenses for current month
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthKey));

  const totalCurrentMonthSpent = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
  const budgetPercentage =
    budget.monthlyBudget > 0 ? (totalCurrentMonthSpent / budget.monthlyBudget) * 100 : 0;
  const remainingBudget = Math.max(0, budget.monthlyBudget - totalCurrentMonthSpent);

  // Phone financing total remaining
  const totalHardwareFinancingLeft = lines.reduce(
    (acc, l) => acc + (l.deviceFinancing ? l.deviceFinancing.remainingBalance : 0),
    0
  );

  // Upcoming bills due in next 10 days
  const upcomingLines = lines
    .map((l) => ({ line: l, dueInfo: getDaysUntil(l.billingDueDay) }))
    .sort((a, b) => a.dueInfo.days - b.dueInfo.days);

  const urgentBills = upcomingLines.filter((i) => i.dueInfo.days <= 7);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetValue);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
    }
    setIsEditingBudget(false);
  };

  const lineMap = new Map(lines.map((l) => [l.id, l]));

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if budget exceeded or close */}
      {budgetPercentage >= budget.alertThresholdPercent && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            budgetPercentage > 100
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong>
                {budgetPercentage > 100
                  ? `Mobile Budget Exceeded by ${Math.round(budgetPercentage - 100)}%!`
                  : `Mobile Budget Warning: ${Math.round(budgetPercentage)}% reached!`}
              </strong>{' '}
              You have spent {formatCurrency(totalCurrentMonthSpent, budget.currencySymbol, budget.currency)} of{' '}
              {formatCurrency(budget.monthlyBudget, budget.currencySymbol, budget.currency)} this cycle.
            </div>
          </div>
          <button
            onClick={() => setIsEditingBudget(true)}
            className="text-xs font-semibold underline whitespace-nowrap hover:text-white"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Month Spend vs Budget */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">This Month's Spend</span>
              <button
                onClick={() => setIsEditingBudget(!isEditingBudget)}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                {isEditingBudget ? 'Close' : 'Set Budget'}
              </button>
            </div>

            {isEditingBudget ? (
              <form onSubmit={handleSaveBudget} className="flex gap-2 my-1">
                <input
                  type="number"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value)}
                  className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
                <button
                  type="submit"
                  className="px-2 py-1 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Save
                </button>
              </form>
            ) : (
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {formatCurrency(totalCurrentMonthSpent, budget.currencySymbol, budget.currency)}
              </div>
            )}

            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Budget: {formatCurrency(budget.monthlyBudget, budget.currencySymbol, budget.currency)}</span>
              <span
                className={`font-semibold font-mono ${
                  budgetPercentage > 100
                    ? 'text-rose-400'
                    : budgetPercentage > 80
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {Math.round(budgetPercentage)}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercentage > 100
                    ? 'bg-rose-500'
                    : budgetPercentage > 80
                    ? 'bg-amber-400'
                    : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, budgetPercentage)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 text-right">
              {remainingBudget > 0
                ? `${formatCurrency(remainingBudget, budget.currencySymbol, budget.currency)} left to spend`
                : 'Over budget limit'}
            </div>
          </div>
        </div>

        {/* Card 2: Active Phone Lines */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Active Mobile Lines</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {lines.length}{' '}
              <span className="text-xs font-normal text-slate-400">
                {lines.length === 1 ? 'Line' : 'Lines'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Base commitment:{' '}
              <span className="text-slate-200 font-mono font-medium">
                {formatCurrency(
                  lines.reduce((acc, l) => acc + l.monthlyCost, 0),
                  budget.currencySymbol,
                  budget.currency
                )}
                /mo
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('lines')}
            className="mt-4 text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between group pt-2 border-t border-slate-800/80"
          >
            <span>Manage All Lines</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 3: Financed Devices Balance */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Device Hardware Balance</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black font-mono text-amber-300 tracking-tight">
              {formatCurrency(totalHardwareFinancingLeft, budget.currencySymbol, budget.currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              0% APR Carrier installments remaining
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('lines')}
            className="mt-4 text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center justify-between group pt-2 border-t border-slate-800/80"
          >
            <span>View Hardware Payments</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Card 4: Upcoming Bill Due Alert */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Next Due Carrier Bill</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {upcomingLines.length > 0 ? (
              <>
                <div className="text-base font-bold text-white tracking-tight truncate">
                  {upcomingLines[0].line.carrier} - {upcomingLines[0].line.name}
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {upcomingLines[0].dueInfo.isToday ? (
                    <span className="text-rose-400 font-bold">Due TODAY!</span>
                  ) : (
                    <span>Due in {upcomingLines[0].dueInfo.days} days</span>
                  )}
                  <span className="font-mono font-bold text-white ml-auto">
                    {formatCurrency(
                      upcomingLines[0].line.monthlyCost,
                      budget.currencySymbol,
                      budget.currency
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-400 mt-2">No upcoming bills</div>
            )}
          </div>

          {upcomingLines.length > 0 && (
            <button
              onClick={() => onQuickLogBill(upcomingLines[0].line)}
              className="mt-4 w-full py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Quick Log Bill</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SpendingChart expenses={expenses} budget={budget} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut expenses={expenses} budget={budget} />
        </div>
      </div>

      {/* Bottom Row: Upcoming Bills Schedule + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill Calendar & Quick Pay */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Monthly Bill Due Dates</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Auto-renewal & due dates for each phone line</p>
            </div>
            <button
              onClick={() => onNavigateTab('lines')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingLines.slice(0, 4).map(({ line, dueInfo }) => (
              <div
                key={line.id}
                className="flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-2xl text-xs transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs font-mono">
                    {line.billingDueDay}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-semibold truncate">{line.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {line.carrier} • {line.planName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white font-mono font-bold">
                      {formatCurrency(line.monthlyCost, budget.currencySymbol, budget.currency)}
                    </div>
                    <div
                      className={`text-[10px] font-medium ${
                        dueInfo.isToday
                          ? 'text-rose-400 font-bold'
                          : dueInfo.days <= 5
                          ? 'text-amber-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {dueInfo.isToday ? 'DUE TODAY' : `in ${dueInfo.days} days`}
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickLogBill(line)}
                    title="Log this bill"
                    className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses Ledger */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Recent Mobile Expenses</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest phone bills, airtime & add-ons</p>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-cyan-400 hover:underline font-medium"
            >
              View All ({expenses.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {expenses.slice(0, 4).map((item) => {
              const line = lineMap.get(item.phoneLineId);
              const cfg = CATEGORY_CONFIG[item.category];

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-2xl text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.carrier} • {line ? line.name : 'Shared'} • {item.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-white font-mono font-bold">
                      {formatCurrency(item.amount, budget.currencySymbol, budget.currency)}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">{item.paymentMethod}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onOpenAddExpense}
            className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Log Another Mobile Expense</span>
          </button>
        </div>
      </div>
    </div>
  );
};
