export enum TaxGroupId {
  DISTRIBUTION = 1,
  SERVICES_CONSTRUCTION = 2,
  PRODUCTION_TRANSPORT = 3,
  OTHER = 4,
  RENTAL = 5
}

export type ExpenseCategory = 'RENT' | 'UTILITIES' | 'SUPPLIES' | 'MARKETING' | 'SALARY' | 'OTHER';

export interface TaxGroup {
  id: TaxGroupId;
  name: string;
  shortName: string;
  vatRate: number; // Percentage
  pitRate: number; // Percentage
  description: string;
  warning?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  taxGroupId?: TaxGroupId; // Only relevant for INCOME
  expenseCategory?: ExpenseCategory; // Only relevant for EXPENSE
  hasInvoice: boolean;
}

export interface TaxCalculationResult {
  revenue: number;
  vatAmount: number;
  pitAmount: number;
  totalTax: number;
  licenseFee: number; // Thuế môn bài
  totalLiability: number;
}

export interface UserProfile {
  name: string;
  taxCode: string; // MST
  address: string;
}

export type ViewState = 'DASHBOARD' | 'CALCULATOR' | 'LEDGER' | 'AI_ASSISTANT';
