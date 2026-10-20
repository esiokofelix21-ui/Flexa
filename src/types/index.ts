export type ExpenseCategory =
  | 'monthly_plan'
  | 'prepaid_airtime'
  | 'data_pack'
  | 'roaming'
  | 'device_financing'
  | 'insurance'
  | 'app_subscription'
  | 'accessories'
  | 'other';

export type BillingCycle = 'one_off' | 'monthly_recurring' | 'weekly' | 'yearly';

export type PaymentMethod =
  | 'Credit Card'
  | 'Apple Pay / Google Pay'
  | 'Carrier Auto-Pay'
  | 'Mobile Money'
  | 'Debit / Bank';

export type PaymentStatus = 'paid' | 'pending' | 'scheduled';

export interface MobileExpense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string; // ISO YYYY-MM-DD
  category: ExpenseCategory;
  carrier: string;
  phoneLineId: string;
  billingCycle: BillingCycle;
  dataIncludedGb?: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  receiptImage?: string; // base64 or preview url
  isTaxDeductible?: boolean; // For remote/work phone claims
}

export interface PhoneLine {
  id: string;
  name: string; // e.g. "Primary iPhone 16", "Work SIM", "Mom's Phone"
  phoneNumber?: string; // e.g. "+1 (555) 019-2834"
  carrier: string;
  planName: string; // e.g. "Unlimited Plus 5G"
  monthlyCost: number;
  billingDueDay: number; // 1-31
  dataAllowanceGb: number; // 0 for unlimited or specific number
  isUnlimitedData: boolean;
  color: string; // Hex color for line tag
  deviceModel?: string; // e.g. "iPhone 16 Pro Max 256GB"
  deviceFinancing?: {
    totalMonths: number;
    completedMonths: number;
    monthlyPayment: number;
    remainingBalance: number;
    startDate: string;
  };
}

export interface UserBudgetSettings {
  monthlyBudget: number;
  currency: string;
  currencySymbol: string;
  alertThresholdPercent: number; // e.g., 80%
  fiscalCycleStartDay: number; // 1-31 (day of month billing begins)
}

export interface CarrierPreset {
  name: string;
  country: string;
  color: string;
  badge: string;
}
