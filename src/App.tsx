import React, { useState, useEffect } from 'react';
import { MobileExpense, PhoneLine, UserBudgetSettings } from './types';
import {
  getStoredExpenses,
  saveExpenses,
  getStoredLines,
  saveLines,
  getStoredBudget,
  saveBudget,
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { LinesManager } from './components/LinesManager';
import { PlanOptimizer } from './components/PlanOptimizer';
import { ExpenseModal } from './components/ExpenseModal';
import { ReportsModal } from './components/ReportsModal';
import { exportToCsv } from './utils/storage';
import { Plus, Smartphone, Wifi, BatteryCharging, Signal } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<MobileExpense[]>(() => getStoredExpenses());
  const [lines, setLines] = useState<PhoneLine[]>(() => getStoredLines());
  const [budget, setBudget] = useState<UserBudgetSettings>(() => getStoredBudget());

  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'lines' | 'optimizer' | 'reports'>('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MobileExpense | null>(null);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveLines(lines);
  }, [lines]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveExpense = (savedExpense: MobileExpense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === savedExpense.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedExpense;
        return next;
      }
      return [savedExpense, ...prev];
    });
    showToast(editingExpense ? 'Expense updated!' : 'Expense logged!');
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Delete this mobile expense record?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('Expense deleted.');
    }
  };

  const handleDuplicateExpense = (item: MobileExpense) => {
    const duplicated: MobileExpense = {
      ...item,
      id: `exp-${Date.now()}`,
      title: `${item.title} (Copy)`,
      date: new Date().toISOString().slice(0, 10),
    };
    setExpenses((prev) => [duplicated, ...prev]);
    showToast('Expense duplicated for this billing cycle!');
  };

  const handleQuickLogBill = (line: PhoneLine) => {
    const today = new Date().toISOString().slice(0, 10);
    const newBill: MobileExpense = {
      id: `exp-${Date.now()}`,
      title: `${line.carrier} Monthly Bill (${line.name})`,
      amount: line.monthlyCost,
      currency: budget.currency,
      date: today,
      category: 'monthly_plan',
      carrier: line.carrier,
      phoneLineId: line.id,
      billingCycle: 'monthly_recurring',
      dataIncludedGb: line.isUnlimitedData ? undefined : line.dataAllowanceGb,
      paymentMethod: 'Carrier Auto-Pay',
      status: 'paid',
      notes: `Standard monthly cycle bill for ${line.planName}`,
    };

    const newExpenses = [newBill];

    // If device financing exists, add financing entry too
    if (line.deviceFinancing) {
      newExpenses.push({
        id: `exp-${Date.now() + 1}`,
        title: `${line.deviceModel || 'Phone'} Installment (${line.name})`,
        amount: line.deviceFinancing.monthlyPayment,
        currency: budget.currency,
        date: today,
        category: 'device_financing',
        carrier: line.carrier,
        phoneLineId: line.id,
        billingCycle: 'monthly_recurring',
        paymentMethod: 'Carrier Auto-Pay',
        status: 'paid',
        notes: `Month ${line.deviceFinancing.completedMonths + 1}/${line.deviceFinancing.totalMonths} installment`,
      });
    }

    setExpenses((prev) => [...newExpenses, ...prev]);
    showToast(`Logged monthly bill for ${line.name}!`);
  };

  const handleAddLine = (line: PhoneLine) => {
    setLines((prev) => [...prev, line]);
    showToast('Phone line added!');
  };

  const handleUpdateLine = (line: PhoneLine) => {
    setLines((prev) => prev.map((l) => (l.id === line.id ? line : l)));
    showToast('Phone line updated!');
  };

  const handleDeleteLine = (id: string) => {
    if (lines.length <= 1) {
      alert('You must have at least one phone line.');
      return;
    }
    if (window.confirm('Delete this phone line? Past expenses will remain in records.')) {
      setLines((prev) => prev.filter((l) => l.id !== id));
      showToast('Phone line removed.');
    }
  };

  const handleCurrencyChange = (currencyCode: string, symbol: string) => {
    setBudget((prev) => ({
      ...prev,
      currency: currencyCode,
      currencySymbol: symbol,
    }));
    showToast(`Currency updated to ${currencyCode}`);
  };

  const handleUpdateBudget = (newBudgetAmount: number) => {
    setBudget((prev) => ({
      ...prev,
      monthlyBudget: newBudgetAmount,
    }));
    showToast('Monthly budget updated!');
  };

  const handleRestoreData = (data: {
    expenses: MobileExpense[];
    lines: PhoneLine[];
    budget: UserBudgetSettings;
  }) => {
    setExpenses(data.expenses);
    setLines(data.lines);
    setBudget(data.budget);
    showToast('Data restored successfully!');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            expenses={expenses}
            lines={lines}
            budget={budget}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onQuickLogBill={handleQuickLogBill}
            onNavigateTab={setActiveTab}
            onUpdateBudget={handleUpdateBudget}
          />
        );
      case 'expenses':
        return (
          <ExpenseList
            expenses={expenses}
            lines={lines}
            budget={budget}
            onEdit={(exp) => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDelete={handleDeleteExpense}
            onDuplicate={handleDuplicateExpense}
            onAddNew={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onExportCsv={() => exportToCsv(expenses, lines)}
          />
        );
      case 'lines':
        return (
          <LinesManager
            lines={lines}
            budget={budget}
            onAddLine={handleAddLine}
            onUpdateLine={handleUpdateLine}
            onDeleteLine={handleDeleteLine}
            onQuickLogBill={handleQuickLogBill}
          />
        );
      case 'optimizer':
        return <PlanOptimizer expenses={expenses} lines={lines} budget={budget} />;
      default:
        return null;
    }
  };

  // Main Content Wrap
  const appContent = (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        budget={budget}
        onCurrencyChange={handleCurrencyChange}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenReports={() => setIsReportsModalOpen(true)}
        isMobilePreview={isMobilePreview}
        setIsMobilePreview={setIsMobilePreview}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderActiveTab()}
      </main>

      {/* Floating Action Button on mobile */}
      <button
        onClick={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        className="md:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/50 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Log Mobile Expense"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialExpense={editingExpense}
        lines={lines}
        budget={budget}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        expenses={expenses}
        lines={lines}
        budget={budget}
        onRestoreData={handleRestoreData}
      />
    </div>
  );

  // If Mobile Preview Frame is activated, wrap inside a sleek iPhone 16 Frame
  if (isMobilePreview) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="mb-3 flex items-center gap-3 text-slate-400 text-xs">
          <span>Realistic Mobile Device Simulator</span>
          <button
            onClick={() => setIsMobilePreview(false)}
            className="text-cyan-400 hover:underline font-semibold"
          >
            Switch to Fluid Desktop
          </button>
        </div>

        {/* iPhone Frame */}
        <div className="relative w-full max-w-[410px] h-[850px] bg-slate-900 rounded-[52px] border-[10px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ring-1 ring-slate-700">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-50 flex items-center justify-between px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>

          {/* Status bar */}
          <div className="h-10 bg-slate-950 flex items-center justify-between px-6 pt-2 text-[10px] text-slate-400 z-40 select-none">
            <span className="font-semibold text-white">9:41</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3 text-cyan-400" />
              <span className="font-bold text-[9px] text-cyan-400">5G</span>
              <Wifi className="w-3 h-3" />
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Screen Content Scrollable */}
          <div className="flex-1 overflow-y-auto">{appContent}</div>

          {/* Home indicator bar */}
          <div className="h-5 bg-slate-950 flex items-center justify-center">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return appContent;
}
