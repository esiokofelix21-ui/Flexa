import React, { useState } from 'react';
import { MobileExpense, PhoneLine, UserBudgetSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  TrendingDown,
  Globe,
  Wifi,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Calculator,
  Percent,
} from 'lucide-react';

interface PlanOptimizerProps {
  expenses: MobileExpense[];
  lines: PhoneLine[];
  budget: UserBudgetSettings;
}

export const PlanOptimizer: React.FC<PlanOptimizerProps> = ({ expenses, lines, budget }) => {
  // Travel eSIM Simulator states
  const [tripDays, setTripDays] = useState<number>(7);
  const [carrierDailyPassRate, setCarrierDailyPassRate] = useState<number>(10);
  const [esimPackageCost, setEsimPackageCost] = useState<number>(18);

  // MVNO Simulator states
  const [currentPostpaidRate, setCurrentPostpaidRate] = useState<number>(
    lines[0]?.monthlyCost || 70
  );
  const [mvnoTargetRate, setMvnoTargetRate] = useState<number>(25);

  // Compute metrics from actual user expenses
  const expensesWithGb = expenses.filter((e) => e.dataIncludedGb && e.dataIncludedGb > 0);
  const totalGb = expensesWithGb.reduce((acc, e) => acc + (e.dataIncludedGb || 0), 0);
  const totalCostForGb = expensesWithGb.reduce((acc, e) => acc + e.amount, 0);
  const effectiveCostPerGb = totalGb > 0 ? totalCostForGb / totalGb : 0;

  // Identify roaming expenses
  const roamingExpenses = expenses.filter((e) => e.category === 'roaming');
  const totalRoamingSpent = roamingExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Identify insurance expenses
  const insuranceExpenses = expenses.filter((e) => e.category === 'insurance');
  const totalInsuranceSpent = insuranceExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Simulator calculations
  const carrierTripCost = tripDays * carrierDailyPassRate;
  const esimTripCost = esimPackageCost;
  const tripSavings = Math.max(0, carrierTripCost - esimTripCost);

  const monthlyMvnoSavings = Math.max(0, currentPostpaidRate - mvnoTargetRate);
  const annualMvnoSavings = monthlyMvnoSavings * 12;

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Telecom Cost Advisor</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Mobile Plan & Bill Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Audit cellular contracts, detect billing leakage, calculate real cost-per-GB, and
              simulate switching to discount eSIMs or MVNOs.
            </p>
          </div>

          {/* Quick Stat Pill */}
          <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Your Effective Cost / GB</div>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {effectiveCostPerGb > 0
                  ? formatCurrency(effectiveCostPerGb, budget.currencySymbol, budget.currency)
                  : 'N/A'}{' '}
                <span className="text-xs text-slate-400 font-normal">/ GB</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Based on {totalGb} GB across logged data packs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Actionable Audit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audit 1: Roaming Check */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4" />
              <span>International Roaming Audit</span>
            </div>
            <h3 className="text-base font-bold text-white">Travel Roaming Spent</h3>
            <p className="text-xs text-slate-400 mt-1">
              You have spent{' '}
              <strong className="text-indigo-300">
                {formatCurrency(totalRoamingSpent, budget.currencySymbol, budget.currency)}
              </strong>{' '}
              on roaming passes and travel eSIMs.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Travel eSIMs save 60-80% compared to $10/day carrier roaming passes.</span>
          </div>
        </div>

        {/* Audit 2: Phone Protection / AppleCare */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Device Insurance Check</span>
            </div>
            <h3 className="text-base font-bold text-white">Hardware Protection</h3>
            <p className="text-xs text-slate-400 mt-1">
              Carrier insurance often costs $15–$19/month. Direct manufacturer care or credit card phone
              protection often covers the exact same loss with zero monthly premium.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Potential annual savings: ~{budget.currencySymbol}150–220/year per phone.
            </span>
          </div>
        </div>

        {/* Audit 3: Carrier Autopay Discount */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Auto-Pay Discounts</span>
            </div>
            <h3 className="text-base font-bold text-white">Line Auto-Debit Savings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Major carriers (T-Mobile, Verizon, AT&T) offer $5 to $10 off per line when linked to a
              checking account or debit card.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              With {lines.length} lines, this can save you{' '}
              {formatCurrency(lines.length * 10 * 12, budget.currencySymbol, budget.currency)}/yr!
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Savings Simulators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator 1: Postpaid Carrier vs 5G MVNO */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Calculator className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">MVNO Switch Simulator</h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Mint, Visible, US Mobile
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Compare your standard postpaid plan to modern prepaid discount carriers running on the
            exact same 5G networks.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Current Carrier Rate /mo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  {budget.currencySymbol}
                </span>
                <input
                  type="number"
                  value={currentPostpaidRate}
                  onChange={(e) => setCurrentPostpaidRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target MVNO Rate /mo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  {budget.currencySymbol}
                </span>
                <input
                  type="number"
                  value={mvnoTargetRate}
                  onChange={(e) => setMvnoTargetRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-800/40 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300">Projected Annual Savings:</div>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {formatCurrency(annualMvnoSavings, budget.currencySymbol, budget.currency)}
                <span className="text-xs text-slate-400 font-normal"> / year</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950">
                {Math.round((monthlyMvnoSavings / (currentPostpaidRate || 1)) * 100)}% cheaper
              </span>
            </div>
          </div>
        </div>

        {/* Simulator 2: Roaming Pass vs Travel eSIM */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400">
              <Globe className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Travel Roaming Calculator</h3>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Airalo, Nomad, Saily
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Plan international trips: Carrier daily roaming pass vs purchasing a local travel eSIM.
          </p>

          <div className="grid grid-cols-3 gap-2.5 text-xs pt-1">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Trip Duration</label>
              <input
                type="number"
                min="1"
                value={tripDays}
                onChange={(e) => setTripDays(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">days</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Carrier Daily Pass</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  {budget.currencySymbol}
                </span>
                <input
                  type="number"
                  value={carrierDailyPassRate}
                  onChange={(e) => setCarrierDailyPassRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">/ day</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Travel eSIM Cost</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono">
                  {budget.currencySymbol}
                </span>
                <input
                  type="number"
                  value={esimPackageCost}
                  onChange={(e) => setEsimPackageCost(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">flat pack</span>
            </div>
          </div>

          {/* Results Box */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-800/40 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300">Trip Savings using eSIM:</div>
              <div className="text-2xl font-black font-mono text-indigo-400">
                {formatCurrency(tripSavings, budget.currencySymbol, budget.currency)}
              </div>
              <div className="text-[10px] text-slate-400">
                Carrier: {formatCurrency(carrierTripCost, budget.currencySymbol, budget.currency)} vs eSIM:{' '}
                {formatCurrency(esimTripCost, budget.currencySymbol, budget.currency)}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500 text-white">
                Save {Math.round((tripSavings / (carrierTripCost || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
