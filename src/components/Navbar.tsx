import React from 'react';
import { CURRENCIES } from '../utils/formatters';
import { UserBudgetSettings } from '../types';
import {
  Smartphone,
  Plus,
  LayoutDashboard,
  Receipt,
  Layers,
  Sparkles,
  FileText,
  Monitor,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'expenses' | 'lines' | 'optimizer' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'expenses' | 'lines' | 'optimizer' | 'reports') => void;
  budget: UserBudgetSettings;
  onCurrencyChange: (currencyCode: string, symbol: string) => void;
  onOpenAddExpense: () => void;
  onOpenReports: () => void;
  isMobilePreview: boolean;
  setIsMobilePreview: (v: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  budget,
  onCurrencyChange,
  onOpenAddExpense,
  onOpenReports,
  isMobilePreview,
  setIsMobilePreview,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'lines', label: 'Phone Lines', icon: Layers },
    { id: 'optimizer', label: 'Optimizer', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: FileText },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">MobiSpend</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  5G
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Mobile & Cellular Expense Tracker</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'reports') {
                      onOpenReports();
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Currency + Mobile View Toggle + Log Expense */}
          <div className="flex items-center gap-2">
            {/* Currency Selector */}
            <select
              value={budget.currency}
              onChange={(e) => {
                const found = CURRENCIES.find((c) => c.code === e.target.value);
                if (found) onCurrencyChange(found.code, found.symbol);
              }}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code}
                </option>
              ))}
            </select>

            {/* Device View toggle (Mobile Frame vs Fluid View) */}
            <button
              onClick={() => setIsMobilePreview(!isMobilePreview)}
              title={isMobilePreview ? 'Switch to Fluid Desktop View' : 'Switch to Mobile Phone View'}
              className={`p-2 rounded-xl border text-xs hidden lg:flex items-center gap-1.5 transition-colors ${
                isMobilePreview
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isMobilePreview ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-medium">{isMobilePreview ? 'Fluid' : 'Phone View'}</span>
            </button>

            {/* Log Expense Button */}
            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Log Expense</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs (bottom or sub-header) */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'reports') {
                    onOpenReports();
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
