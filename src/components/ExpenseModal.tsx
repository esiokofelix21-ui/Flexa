import React, { useState, useEffect } from 'react';
import { MobileExpense, PhoneLine, UserBudgetSettings, ExpenseCategory, BillingCycle, PaymentMethod, PaymentStatus } from '../types';
import { CATEGORY_CONFIG, CARRIER_PRESETS } from '../data/initialData';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: MobileExpense) => void;
  initialExpense?: MobileExpense | null;
  lines: PhoneLine[];
  budget: UserBudgetSettings;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
  lines,
  budget,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('monthly_plan');
  const [carrier, setCarrier] = useState('T-Mobile');
  const [customCarrier, setCustomCarrier] = useState('');
  const [phoneLineId, setPhoneLineId] = useState(lines[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly_recurring');
  const [dataIncludedGb, setDataIncludedGb] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Carrier Auto-Pay');
  const [status, setStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title);
      setAmount(initialExpense.amount.toString());
      setCategory(initialExpense.category);
      if (CARRIER_PRESETS.some((c) => c.name === initialExpense.carrier)) {
        setCarrier(initialExpense.carrier);
        setCustomCarrier('');
      } else {
        setCarrier('Other');
        setCustomCarrier(initialExpense.carrier);
      }
      setPhoneLineId(initialExpense.phoneLineId || lines[0]?.id || '');
      setDate(initialExpense.date);
      setBillingCycle(initialExpense.billingCycle);
      setDataIncludedGb(initialExpense.dataIncludedGb ? initialExpense.dataIncludedGb.toString() : '');
      setPaymentMethod(initialExpense.paymentMethod);
      setStatus(initialExpense.status);
      setNotes(initialExpense.notes || '');
      setIsTaxDeductible(Boolean(initialExpense.isTaxDeductible));
      setReceiptImage(initialExpense.receiptImage);
    } else {
      // Default reset
      setTitle('');
      setAmount('');
      setCategory('monthly_plan');
      setCarrier(lines[0]?.carrier || 'T-Mobile');
      setCustomCarrier('');
      setPhoneLineId(lines[0]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setBillingCycle('monthly_recurring');
      setDataIncludedGb('');
      setPaymentMethod('Carrier Auto-Pay');
      setStatus('paid');
      setNotes('');
      setIsTaxDeductible(false);
      setReceiptImage(undefined);
    }
    setError(null);
  }, [initialExpense, isOpen, lines]);

  if (!isOpen) return null;

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be under 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title or expense description.');
      return;
    }

    const resolvedCarrier = carrier === 'Other' ? (customCarrier.trim() || 'Custom Carrier') : carrier;

    const newExpense: MobileExpense = {
      id: initialExpense ? initialExpense.id : `exp-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      currency: budget.currency,
      date,
      category,
      carrier: resolvedCarrier,
      phoneLineId,
      billingCycle,
      dataIncludedGb: dataIncludedGb ? parseFloat(dataIncludedGb) : undefined,
      paymentMethod,
      status,
      notes: notes.trim() || undefined,
      receiptImage,
      isTaxDeductible,
    };

    onSave(newExpense);
    onClose();
  };

  // Quick preset title auto-fill when category changes if title is empty
  const handleCategorySelect = (catKey: ExpenseCategory) => {
    setCategory(catKey);
    if (!title || title.includes('Plan') || title.includes('Recharge') || title.includes('Data')) {
      const selectedLine = lines.find((l) => l.id === phoneLineId);
      const lineName = selectedLine ? selectedLine.name : 'Phone';
      if (catKey === 'monthly_plan') setTitle(`${carrier} Monthly Bill (${lineName})`);
      else if (catKey === 'prepaid_airtime') setTitle(`${carrier} Airtime Recharge`);
      else if (catKey === 'data_pack') setTitle(`${carrier} Extra Data Pack`);
      else if (catKey === 'roaming') setTitle('International Roaming Pass');
      else if (catKey === 'device_financing') setTitle('Smartphone Monthly Installment');
      else if (catKey === 'insurance') setTitle('Device Care / Protection Plan');
      else if (catKey === 'accessories') setTitle('Phone Accessory / Charger');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {initialExpense ? 'Edit Mobile Expense' : 'Log Mobile Expense'}
            </h2>
            <p className="text-xs text-slate-400">
              Track phone bills, airtime, data boosters, roaming, and hardware
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Amount ({budget.currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-base">
                  {budget.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expense Title / Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. T-Mobile Monthly 5G Plan"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategorySelect(catKey as ExpenseCategory)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-sm ring-1 ring-cyan-500/40'
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="mt-0.5">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-500'}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-tight truncate">{config.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{config.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carrier & Line Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Carrier / Telecom Operator
              </label>
              <div className="space-y-2">
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {CARRIER_PRESETS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                  <option value="Other">Custom / Other Carrier...</option>
                </select>

                {carrier === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter carrier name"
                    value={customCarrier}
                    onChange={(e) => setCustomCarrier(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Line / Device
              </label>
              <select
                value={phoneLineId}
                onChange={(e) => setPhoneLineId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name} {line.phoneNumber ? `(${line.phoneNumber})` : ''} - {line.carrier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Billing Cycle & Included GB */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Billing Frequency
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="monthly_recurring">Monthly Recurring Bill</option>
                <option value="one_off">One-Off Top-up / Pass</option>
                <option value="weekly">Weekly Pack</option>
                <option value="yearly">Yearly Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Data Volume (GB, Optional)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="e.g. 20 (for Cost/GB)"
                value={dataIncludedGb}
                onChange={(e) => setDataIncludedGb(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Carrier Auto-Pay">Carrier Auto-Pay</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Apple Pay / Google Pay">Apple Pay / Google Pay</option>
                <option value="Mobile Money">Mobile Money (M-Pesa / MTN MoMo)</option>
                <option value="Debit / Bank">Direct Debit / Bank Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Status
              </label>
              <div className="flex gap-2">
                {(['paid', 'pending', 'scheduled'] as PaymentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl capitalize transition-all border ${
                      status === st
                        ? st === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : st === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tax Deductible Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-white block">Tax Deductible Phone Expense</span>
              <span className="text-[11px] text-slate-400">
                Mark as business/remote work tax deduction or employer reimbursement
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTaxDeductible(!isTaxDeductible)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isTaxDeductible ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Notes & Receipt Upload */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notes / Plan Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Include invoice reference, auto-renewal date, speed throttle terms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bill / Receipt Attachment
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs text-slate-200 hover:text-white transition-colors">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{receiptImage ? 'Change Receipt' : 'Upload Bill Screenshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
                {receiptImage && (
                  <div className="flex items-center gap-2">
                    <img
                      src={receiptImage}
                      alt="Receipt"
                      className="w-10 h-10 object-cover rounded-lg border border-cyan-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => setReceiptImage(undefined)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{initialExpense ? 'Save Changes' : 'Log Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
