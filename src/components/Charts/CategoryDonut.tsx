import React, { useState } from 'react';
import { MobileExpense, UserBudgetSettings } from '../../types';
import { CATEGORY_CONFIG } from '../../data/initialData';
import { formatCurrency } from '../../utils/formatters';

interface CategoryDonutProps {
  expenses: MobileExpense[];
  budget: UserBudgetSettings;
}

export const CategoryDonut: React.FC<CategoryDonutProps> = ({ expenses, budget }) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categoryTotals: Record<string, number> = {};
  let totalSpend = 0;

  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    totalSpend += e.amount;
  });

  const categories = Object.keys(categoryTotals)
    .map((catKey) => ({
      key: catKey,
      total: categoryTotals[catKey],
      config: CATEGORY_CONFIG[catKey] || {
        label: catKey,
        color: 'text-slate-400',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        desc: '',
      },
    }))
    .sort((a, b) => b.total - a.total);

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  // Colors for donut slices
  const sliceColors: Record<string, string> = {
    monthly_plan: '#10b981', // emerald
    prepaid_airtime: '#3b82f6', // blue
    data_pack: '#06b6d4', // cyan
    roaming: '#6366f1', // indigo
    device_financing: '#f59e0b', // amber
    insurance: '#f43f5e', // rose
    app_subscription: '#a855f7', // purple
    accessories: '#f97316', // orange
    other: '#94a3b8', // slate
  };

  const slices = categories.map((cat) => {
    const percent = totalSpend > 0 ? cat.total / totalSpend : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;
    return {
      ...cat,
      percent,
      strokeDasharray,
      strokeDashoffset,
      colorHex: sliceColors[cat.key] || '#64748b',
    };
  });

  const activeCategory = hoveredCategory
    ? categories.find((c) => c.key === hoveredCategory)
    : categories[0];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white tracking-tight">Category Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">Where your mobile budget goes</p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-400">
          Total: {formatCurrency(totalSpend, budget.currencySymbol, budget.currency)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mt-2">
        {/* SVG Donut */}
        <div className="relative flex-shrink-0 w-[180px] h-[180px] flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {totalSpend > 0 &&
              slices.map((slice) => {
                const isHovered = hoveredCategory === slice.key;
                return (
                  <circle
                    key={slice.key}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={slice.colorHex}
                    strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredCategory(slice.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
          </svg>

          {/* Center Info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            <span className="text-xs text-slate-400 truncate max-w-[120px]">
              {activeCategory ? activeCategory.config.label : 'Expenses'}
            </span>
            <span className="text-base font-bold text-white font-mono mt-0.5">
              {activeCategory
                ? formatCurrency(activeCategory.total, budget.currencySymbol, budget.currency)
                : formatCurrency(totalSpend, budget.currencySymbol, budget.currency)}
            </span>
            <span className="text-[10px] text-cyan-400 font-medium">
              {activeCategory && totalSpend > 0
                ? `${Math.round((activeCategory.total / totalSpend) * 100)}% of spend`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Categories List / Legend */}
        <div className="w-full flex-1 space-y-2 max-h-[190px] overflow-y-auto pr-1">
          {categories.map((cat) => {
            const isHovered = hoveredCategory === cat.key;
            const pct = totalSpend > 0 ? Math.round((cat.total / totalSpend) * 100) : 0;
            const colorHex = sliceColors[cat.key] || '#64748b';

            return (
              <div
                key={cat.key}
                onMouseEnter={() => setHoveredCategory(cat.key)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                  isHovered ? 'bg-slate-800 ring-1 ring-slate-700' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-slate-200 font-medium truncate">{cat.config.label}</span>
                </div>
                <div className="flex items-center gap-2 text-right flex-shrink-0">
                  <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                  <span className="text-white font-mono font-semibold">
                    {formatCurrency(cat.total, budget.currencySymbol, budget.currency)}
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
