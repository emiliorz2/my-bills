import type { User } from './user'

export interface InvoiceDetail {
  product: string;
  quantity: number;
  unitPrice: number;
}

export interface Source {
  type: string;
  description: string | null;
  receivedAt: string;
  fileUrl?: string | null;
}

export interface Expense {
  id: number;
  userId: number;
  user?: User;
  vendor: string | null;
  description: string;
  total: number;
  currency: string;
  expenseType?: string;
  category?: string | null;
  date: string;
  source: Source;
  invoiceDetails: InvoiceDetail[];
}
