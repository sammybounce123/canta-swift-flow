import { useSyncExternalStore } from "react";
import type { FxQuote } from "./supplier-data";

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  hsCode?: string;
  cartons?: number;
  weight?: number;
  cbm?: number;
};

export type InvoiceStatus = "Draft" | "Issued" | "Payment Requested" | "Paid" | "Cancelled";
export type PaymentRequestStatus =
  | "None"
  | "Pending"
  | "Sent"
  | "Buyer Verifying"
  | "Buyer Paid"
  | "Settled";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  dueDate: string;
  poNumber?: string;
  shipmentRef?: string;
  buyerReference?: string;
  currency: "RMB" | "USD" | "NGN";
  supplier: { company: string; address: string };
  buyer: { company: string; email: string; phone: string; address: string };
  shippingOrigin: string;
  destination: string;
  incoterm?: string;
  notes?: string;
  items: InvoiceItem[];
  discount: number;
  shipping: number;
  otherCharges: number;
  subtotal: number;
  total: number;
  fxQuoteId?: string;
  fxRate?: number;
  ngnBuyerPays?: number;
  cantaFee?: number;
  estReceivable?: number;
  settlementCurrency?: "RMB" | "USD";
  payoutAccount?: string;
  quoteExpiresAt?: number;
  status: InvoiceStatus;
  paymentRequestStatus: PaymentRequestStatus;
};

const INVOICES: Invoice[] = [];
let version = 0;
const subs = new Set<() => void>();
let seq = 42;

export function nextInvoiceNumber() {
  const n = String(seq).padStart(4, "0");
  return `CANTA-INV-2026-${n}`;
}

export const invoiceStore = {
  list: () => INVOICES,
  get: (id: string) => INVOICES.find((i) => i.id === id) ?? null,
  add: (
    inv: Omit<Invoice, "id" | "createdAt" | "status" | "paymentRequestStatus"> &
      Partial<Pick<Invoice, "status" | "paymentRequestStatus">>,
  ) => {
    const full: Invoice = {
      id: `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: inv.status ?? "Draft",
      paymentRequestStatus: inv.paymentRequestStatus ?? "None",
      ...inv,
    };
    INVOICES.unshift(full);
    seq++;
    version++;
    subs.forEach((f) => f());
    return full;
  },
  update: (id: string, patch: Partial<Invoice>) => {
    const idx = INVOICES.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    INVOICES[idx] = { ...INVOICES[idx], ...patch };
    version++;
    subs.forEach((f) => f());
    return INVOICES[idx];
  },
  remove: (id: string) => {
    const idx = INVOICES.findIndex((i) => i.id === id);
    if (idx === -1) return;
    INVOICES.splice(idx, 1);
    version++;
    subs.forEach((f) => f());
  },
  duplicate: (id: string) => {
    const src = INVOICES.find((i) => i.id === id);
    if (!src) return null;
    const number = nextInvoiceNumber();
    return invoiceStore.add({
      ...src,
      invoiceNumber: number,
      status: "Draft",
      paymentRequestStatus: "None",
    });
  },
  subscribe: (f: () => void) => {
    subs.add(f);
    return () => subs.delete(f);
  },
  getVersion: () => version,
};

export function useInvoices() {
  useSyncExternalStore(invoiceStore.subscribe, invoiceStore.getVersion, invoiceStore.getVersion);
  return INVOICES;
}

export function calcTotals(
  items: InvoiceItem[],
  discount: number,
  shipping: number,
  other: number,
) {
  const subtotal = items.reduce(
    (s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0),
    0,
  );
  const total = Math.max(
    0,
    subtotal - (Number(discount) || 0) + (Number(shipping) || 0) + (Number(other) || 0),
  );
  return { subtotal, total };
}

export function isQuoteExpired(q: Pick<FxQuote, "expiresAt" | "status"> | undefined | null) {
  if (!q) return true;
  if (q.status === "Expired" || q.status === "Cancelled") return true;
  return Date.now() > q.expiresAt;
}
