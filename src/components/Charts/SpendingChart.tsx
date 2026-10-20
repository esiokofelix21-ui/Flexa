import React, { useState } from 'react';
import { MobileExpense, UserBudgetSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface SpendingChartProps {
  expenses: MobileExpense[];
  budget: UserBudgetSettings;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ expenses, budget }) => {
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Group expenses by Year-Month (e.g. "2024-09", "2024-10")
  const monthlyData: Record<string, { total: number; plan: number; financing: number; other: number }> = {};

  // Build the last 6 months list
  const now = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${yyyy}-${mm}`;
    months.push(key);
    monthlyData[key] = { total: 0, plan: 0, financing: 0, other: 0 };
  }

  // Populate data
  expenses.forEach((e) => {
    const key = e.date.substring(0, 7);
    if (monthlyData[key]) {
      monthlyData[key].total += e.amount;
      if (e.category === 'monthly_plan' || e.category === 'prepaid_airtime') {
        monthlyData[key].plan += e.amount;
      } else if (e.category === 'device_financing') {
        monthlyData[key].financing += e.amount;
      } else {
        monthlyData[key].other += e.amount;
      }
    }
  });

  const maxVal = Math.max(
    budget.monthlyBudget * 1.25,
    ...months.map((m) => monthlyData[m]?.total || 0),
    100
  );

  const chartHeight = 160;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            Monthly Spend Trend
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              Last 6 Months
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Cellular plans, device payments & mobile addons</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
            <span>Carrier Plans</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
            <span>Phone Financing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
            <span>Add-ons / Roaming</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <span className="w-3 h-0.5 bg-rose-400/80 border-t border-dashed"></span>
            <span className="text-rose-300">Budget ({budget.currencySymbol}{budget.monthlyBudget})</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative pt-6">
        {/* Budget Reference Line */}
        {budget.monthlyBudget > 0 && (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed border-rose-500/40 z-10 pointer-events-none flex items-center justify-end pr-2"
            style={{
              top: `${Math.max(8, chartHeight - (budget.monthlyBudget / maxVal) * chartHeight + 24)}px`,
            }}
          >
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-rose-400 border border-rose-500/30 font-mono">
              Limit {formatCurrency(budget.monthlyBudget, budget.currencySymbol, budget.currency)}
            </span>
          </div>
        )}

        {/* Bars Container */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end" style={{ height: `${chartHeight}px` }}>
          {months.map((mKey) => {
            const data = monthlyData[mKey];
            const [y, m] = mKey.split('-');
            const monthLabel = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-US', {
              month: 'short',
            });
            const isHovered = hoveredMonth === mKey;
            const isCurrentMonth = mKey === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            const totalHeightPx = (data.total / maxVal) * chartHeight;
            const planHeight = data.total > 0 ? (data.plan / data.total) * totalHeightPx : 0;
            const financeHeight = data.total > 0 ? (data.financing / data.total) * totalHeightPx : 0;
            const otherHeight = data.total > 0 ? (data.other / data.total) * totalHeightPx : 0;

            const isOverBudget = budget.monthlyBudget > 0 && data.total > budget.monthlyBudget;

            return (
              <div
                key={mKey}
                className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(mKey)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-24 z-30 bg-slate-800 text-white border border-slate-700 rounded-xl p-2.5 shadow-2xl text-xs w-44 pointer-events-none transition-all">
                    <div className="flex items-center justify-between font-semibold border-b border-slate-700 pb-1 mb-1.5">
                      <span>{monthLabel} {y}</span>
                      <span className={isOverBudget ? 'text-rose-400' : 'text-emerald-400'}>
                        {formatCurrency(data.total, budget.currencySymbol, budget.currency)}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-cyan-400">Plans:</span>
                        <span>{formatCurrency(data.plan, budget.currencySymbol, budget.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400">Financing:</span>
                        <span>{formatCurrency(data.financing, budget.currencySymbol, budget.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-indigo-400">Add-ons/Other:</span>
                        <span>{formatCurrency(data.other, budget.currencySymbol, budget.currency)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount label on bar */}
                <div className="text-[10px] font-mono text-slate-400 mb-1.5 transition-colors group-hover:text-white">
                  {data.total > 0 ? `${budget.currencySymbol}${Math.round(data.total)}` : '—'}
                </div>

                {/* Stacked Bar */}
                <div
                  className={`w-full max-w-[46px] rounded-t-lg overflow-hidden flex flex-col-reverse transition-all duration-300 ${
                    isHovered ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 brightness-110' : ''
                  } ${isCurrentMonth ? 'bg-slate-800' : 'bg-slate-800/60'}`}
                  style={{
                    height: `${Math.max(data.total > 0 ? 6 : 2, totalHeightPx)}px`,
                  }}
                >
                  <div style={{ height: `${planHeight}px` }} className="w-full bg-cyan-500 hover:bg-cyan-400 transition-colors" />
                  <div style={{ height: `${financeHeight}px` }} className="w-full bg-amber-500 hover:bg-amber-400 transition-colors" />
                  <div style={{ height: `${otherHeight}px` }} className="w-full bg-indigo-500 hover:bg-indigo-400 transition-colors" />
                </div>

                {/* X-axis Month Label */}
                <div className="mt-2.5 text-center">
                  <span
                    className={`text-xs font-medium block ${
                      isCurrentMonth
                        ? 'text-cyan-400 font-bold underline decoration-cyan-400/50 underline-offset-4'
                        : 'text-slate-400'
                    }`}
                  >
                    {monthLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
