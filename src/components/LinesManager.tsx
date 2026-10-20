import React, { useState } from 'react';
import { PhoneLine, UserBudgetSettings, MobileExpense } from '../types';
import { CARRIER_PRESETS } from '../data/initialData';
import { formatCurrency, getDaysUntil } from '../utils/formatters';
import {
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle,
  Clock,
  Zap,
  Users,
  X,
  CreditCard,
  Wifi,
} from 'lucide-react';

interface LinesManagerProps {
  lines: PhoneLine[];
  budget: UserBudgetSettings;
  onAddLine: (line: PhoneLine) => void;
  onUpdateLine: (line: PhoneLine) => void;
  onDeleteLine: (id: string) => void;
  onQuickLogBill: (line: PhoneLine) => void;
}

export const LinesManager: React.FC<LinesManagerProps> = ({
  lines,
  budget,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  onQuickLogBill,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<PhoneLine | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carrier, setCarrier] = useState('T-Mobile');
  const [planName, setPlanName] = useState('');
  const [monthlyCost, setMonthlyCost] = useState('');
  const [billingDueDay, setBillingDueDay] = useState('14');
  const [dataAllowanceGb, setDataAllowanceGb] = useState('50');
  const [isUnlimitedData, setIsUnlimitedData] = useState(true);
  const [deviceModel, setDeviceModel] = useState('');
  const [hasFinancing, setHasFinancing] = useState(false);
  const [financeTotalMonths, setFinanceTotalMonths] = useState('24');
  const [financeCompletedMonths, setFinanceCompletedMonths] = useState('6');
  const [financeMonthlyPayment, setFinanceMonthlyPayment] = useState('35.00');
  const [financeRemainingBalance, setFinanceRemainingBalance] = useState('630.00');

  const totalMonthlyCommitment = lines.reduce((acc, l) => acc + l.monthlyCost, 0);
  const totalFinancingMonthly = lines.reduce(
    (acc, l) => acc + (l.deviceFinancing ? l.deviceFinancing.monthlyPayment : 0),
    0
  );

  const openAddModal = () => {
    setEditingLine(null);
    setName('');
    setPhoneNumber('');
    setCarrier('T-Mobile');
    setPlanName('Unlimited 5G');
    setMonthlyCost('50.00');
    setBillingDueDay('15');
    setDataAllowanceGb('50');
    setIsUnlimitedData(true);
    setDeviceModel('');
    setHasFinancing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (line: PhoneLine) => {
    setEditingLine(line);
    setName(line.name);
    setPhoneNumber(line.phoneNumber || '');
    setCarrier(line.carrier);
    setPlanName(line.planName);
    setMonthlyCost(line.monthlyCost.toString());
    setBillingDueDay(line.billingDueDay.toString());
    setDataAllowanceGb(line.dataAllowanceGb.toString());
    setIsUnlimitedData(line.isUnlimitedData);
    setDeviceModel(line.deviceModel || '');
    if (line.deviceFinancing) {
      setHasFinancing(true);
      setFinanceTotalMonths(line.deviceFinancing.totalMonths.toString());
      setFinanceCompletedMonths(line.deviceFinancing.completedMonths.toString());
      setFinanceMonthlyPayment(line.deviceFinancing.monthlyPayment.toString());
      setFinanceRemainingBalance(line.deviceFinancing.remainingBalance.toString());
    } else {
      setHasFinancing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveLine = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(monthlyCost) || 0;
    const dueDay = parseInt(billingDueDay, 10) || 1;
    const dataGb = isUnlimitedData ? 0 : parseFloat(dataAllowanceGb) || 0;

    let deviceFinancing = undefined;
    if (hasFinancing) {
      deviceFinancing = {
        totalMonths: parseInt(financeTotalMonths, 10) || 24,
        completedMonths: parseInt(financeCompletedMonths, 10) || 0,
        monthlyPayment: parseFloat(financeMonthlyPayment) || 0,
        remainingBalance: parseFloat(financeRemainingBalance) || 0,
        startDate: new Date().toISOString().slice(0, 10),
      };
    }

    const savedLine: PhoneLine = {
      id: editingLine ? editingLine.id : `line-${Date.now()}`,
      name: name.trim() || 'Mobile Line',
      phoneNumber: phoneNumber.trim() || undefined,
      carrier,
      planName: planName.trim() || 'Standard Plan',
      monthlyCost: cost,
      billingDueDay: dueDay,
      dataAllowanceGb: dataGb,
      isUnlimitedData,
      color: editingLine ? editingLine.color : '#06b6d4',
      deviceModel: deviceModel.trim() || undefined,
      deviceFinancing,
    };

    if (editingLine) {
      onUpdateLine(savedLine);
    } else {
      onAddLine(savedLine);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" />
              <span>Multi-Line & Family Plan Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Phone Lines & Billing Cycles
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Track contract billing due days, monthly plans, and 0% phone financing across all
              personal and family lines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl">
              <div className="text-[11px] text-slate-400">Total Monthly Base</div>
              <div className="text-lg font-bold font-mono text-white">
                {formatCurrency(totalMonthlyCommitment, budget.currencySymbol, budget.currency)}
                <span className="text-xs text-slate-400 font-normal"> /mo</span>
              </div>
            </div>

            {totalFinancingMonthly > 0 && (
              <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl">
                <div className="text-[11px] text-amber-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>Hardware Financed</span>
                </div>
                <div className="text-lg font-bold font-mono text-amber-300">
                  {formatCurrency(totalFinancingMonthly, budget.currencySymbol, budget.currency)}
                  <span className="text-xs text-slate-400 font-normal"> /mo</span>
                </div>
              </div>
            )}

            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Phone Line</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {lines.map((line) => {
          const carrierPreset = CARRIER_PRESETS.find((c) => c.name === line.carrier);
          const dueStatus = getDaysUntil(line.billingDueDay);
          const hasPhoneFinance = Boolean(line.deviceFinancing);

          return (
            <div
              key={line.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                        {line.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{line.carrier}</span>
                        {line.phoneNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-400">{line.phoneNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(line)}
                      title="Edit Line"
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {lines.length > 1 && (
                      <button
                        onClick={() => onDeleteLine(line.id)}
                        title="Delete Line"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Plan Details Card */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-800/40 border border-slate-800 rounded-2xl mb-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Plan Name</span>
                    <span className="text-white font-semibold">{line.planName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Monthly Charge</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">
                      {formatCurrency(line.monthlyCost, budget.currencySymbol, budget.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Data Allowance</span>
                    <span className="text-slate-200 font-medium flex items-center gap-1">
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      {line.isUnlimitedData ? 'Unlimited 5G Data' : `${line.dataAllowanceGb} GB High Speed`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cycle Due Day</span>
                    <span className="text-slate-200 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-400" />
                      Every {line.billingDueDay}th of month
                    </span>
                  </div>
                </div>

                {/* Device Hardware & 0% Financing Tracker */}
                {line.deviceModel && (
                  <div className="p-3.5 bg-slate-800/20 border border-slate-800/80 rounded-2xl mb-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{line.deviceModel}</span>
                      </div>
                      {line.deviceFinancing && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono font-medium">
                          {line.deviceFinancing.completedMonths} / {line.deviceFinancing.totalMonths} mos paid
                        </span>
                      )}
                    </div>

                    {line.deviceFinancing && (
                      <div className="space-y-1">
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (line.deviceFinancing.completedMonths / line.deviceFinancing.totalMonths) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>
                            {formatCurrency(
                              line.deviceFinancing.monthlyPayment,
                              budget.currencySymbol,
                              budget.currency
                            )}
                            /mo payment
                          </span>
                          <span className="text-amber-300">
                            {formatCurrency(
                              line.deviceFinancing.remainingBalance,
                              budget.currencySymbol,
                              budget.currency
                            )}{' '}
                            balance left
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Quick Action: Log This Bill */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-300">
                    {dueStatus.isToday ? (
                      <strong className="text-rose-400">Bill due TODAY</strong>
                    ) : dueStatus.days <= 5 ? (
                      <span className="text-amber-400 font-semibold">Due in {dueStatus.days} days</span>
                    ) : (
                      <span>Due in {dueStatus.days} days</span>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => onQuickLogBill(line)}
                  className="px-3.5 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Log This Bill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Line Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden my-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingLine ? 'Edit Phone Line' : 'Add New Phone Line'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLine} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Line Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary iPhone 16"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Carrier</label>
                  <select
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {CARRIER_PRESETS.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unlimited Plus 5G"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Monthly Plan Cost ({budget.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Billing Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={billingDueDay}
                    onChange={(e) => setBillingDueDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Data settings */}
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Data Allowance</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUnlimitedData}
                      onChange={(e) => setIsUnlimitedData(e.target.checked)}
                      className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-slate-200">Unlimited 5G Data</span>
                  </label>
                </div>
                {!isUnlimitedData && (
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">Cap in GB per month</label>
                    <input
                      type="number"
                      step="1"
                      value={dataAllowanceGb}
                      onChange={(e) => setDataAllowanceGb(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Device and Installment toggle */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Device Model (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 16 Pro 256GB"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-300 font-semibold block">0% Carrier Phone Financing</span>
                    <span className="text-[10px] text-slate-400">Track monthly hardware installment balance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasFinancing}
                    onChange={(e) => setHasFinancing(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 w-4 h-4"
                  />
                </div>

                {hasFinancing && (
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-slate-400 text-[10px] block">Monthly Hardware Payment</label>
                      <input
                        type="number"
                        step="0.01"
                        value={financeMonthlyPayment}
                        onChange={(e) => setFinanceMonthlyPayment(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block">Remaining Balance ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={financeRemainingBalance}
                        onChange={(e) => setFinanceRemainingBalance(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block">Total Contract Months</label>
                      <input
                        type="number"
                        value={financeTotalMonths}
                        onChange={(e) => setFinanceTotalMonths(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px] block">Completed Months</label>
                      <input
                        type="number"
                        value={financeCompletedMonths}
                        onChange={(e) => setFinanceCompletedMonths(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors"
                >
                  {editingLine ? 'Update Line' : 'Add Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
