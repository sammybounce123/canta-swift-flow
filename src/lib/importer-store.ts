// Customer-facing Importer store (demo, localStorage-backed).
//
// Naming rule: importer customers never see "Trade File". The customer-facing
// object here is a Supplier Payment (SP-YYYY-NNNN). Internal ops/admin screens
// keep their own Trade File objects untouched.

import { useSyncExternalStore } from "react";

const KEY = "canta:importer:v1";

export type PaymentStatus =
  | "Draft"
  | "Awaiting documents"
  | "Awaiting FX quote"
  | "Quote ready"
  | "Quote expired"
  | "Awaiting funding"
  | "Funded"
  | "Compliance review"
  | "Processing payout"
  | "Supplier paid"
  | "Receipt available"
  | "Failed"
  | "Refunded";

export const NEXT_ACTION: Record<PaymentStatus, string> = {
  "Draft": "Add supplier bank details",
  "Awaiting documents": "Upload invoice",
  "Awaiting FX quote": "Wait for quote",
  "Quote ready": "Accept quote",
  "Quote expired": "Request a new quote",
  "Awaiting funding": "Fund balance",
  "Funded": "Wait for review",
  "Compliance review": "Wait for review",
  "Processing payout": "Wait for payout",
  "Supplier paid": "Download receipt",
  "Receipt available": "Download receipt",
  "Failed": "Contact support",
  "Refunded": "Contact support",
};

export type SupplierRecord = {
  id: string;
  name: string;
  country: string;
  contact?: string;
  contactChannel?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  bankAddress?: string;
  currency: string;
  status: "Saved" | "Details checked" | "Needs details";
  lastPayment?: string;
};

export type SupplierPayment = {
  id: string;
  supplierId?: string;
  supplier: string;
  country: string;
  bank: string;
  accountNumber: string;
  swift: string;
  currency: string;
  amount: number;
  ngnCost: number;
  rate: number;
  fee: number;
  description: string;
  purpose: string;
  notes?: string;
  status: PaymentStatus;
  createdAt: string;
  fundedFrom?: string;
  documents: string[];
  receiptNo?: string;
};

export type FundingEntry = {
  id: string;
  method: "NGN" | "USDT";
  amount: number;
  status: "Awaiting payment" | "Payment received" | "Under review" | "Balance credited" | "Failed";
  createdAt: string;
};

export type ImporterDoc = {
  id: string;
  name: string;
  type: string;
  linkedPayment?: string;
  linkedShipment?: string;
  status: "Uploaded" | "Under review" | "Approved" | "Needs correction";
  uploadedAt: string;
};

export type ImporterShipment = {
  id: string;
  blNumber: string;
  paymentRef?: string;
  shippingLine: string;
  vessel?: string;
  container: string;
  portLoading: string;
  portDestination: string;
  eta: string;
  status:
    | "Documents uploaded"
    | "BL under review"
    | "Shipment booked"
    | "In transit"
    | "Arriving soon"
    | "Arrived"
    | "Clearing"
    | "Delivered"
    | "Issue reported";
  notify: boolean;
};

export type ImporterNotification = {
  id: string;
  kind: "Payment" | "Balance" | "FX" | "Compliance" | "Shipment" | "Receipt";
  text: string;
  at: string;
  read: boolean;
};

export type ImporterState = {
  ngnBalance: number;
  usdtBalance: number;
  suppliers: SupplierRecord[];
  payments: SupplierPayment[];
  funding: FundingEntry[];
  documents: ImporterDoc[];
  shipments: ImporterShipment[];
  notifications: ImporterNotification[];
  notifySettings: { whatsapp: boolean; email: boolean; inApp: boolean };
};

function iso(daysFromNow: number) {
  return new Date(Date.now() + daysFromNow * 86400000).toISOString().slice(0, 10);
}

export const FX_RATES: Record<string, number> = {
  RMB: 232, USD: 1650, EUR: 1780, GBP: 2080, AED: 450, CAD: 1210, TRY: 48, INR: 20,
};

export const CURRENCIES = Object.keys(FX_RATES);

export const COUNTRIES = [
  "China", "Turkey", "India", "Vietnam", "United Arab Emirates", "United Kingdom",
  "United States", "Germany", "Netherlands", "Canada", "South Africa", "Nigeria",
];

function seed(): ImporterState {
  return {
    ngnBalance: 24_500_000,
    usdtBalance: 3_200,
    suppliers: [
      { id: "SUP-001", name: "Yiwu Fashion Co.", country: "China", contact: "Mei Lin", contactChannel: "mei@yiwufashion.cn", bankName: "Bank of China", accountName: "Yiwu Fashion Co. Ltd", accountNumber: "6217 0021 8899 4410", swift: "BKCHCNBJ", currency: "RMB", status: "Details checked", lastPayment: iso(-12) },
      { id: "SUP-002", name: "Istanbul Textiles", country: "Turkey", contact: "Ahmet K.", contactChannel: "ahmet@istex.tr", bankName: "Ziraat Bankasi", accountName: "Istanbul Textiles A.S.", accountNumber: "TR33 0006 1005 1978 6457", swift: "TCZBTR2A", currency: "EUR", status: "Saved", lastPayment: iso(-40) },
      { id: "SUP-003", name: "Northwind Trading FZE", country: "United Arab Emirates", contact: "Sara N.", contactChannel: "sara@northwind.ae", bankName: "Emirates NBD", accountName: "Northwind Trading FZE", accountNumber: "AE07 0331 2345 6789 0123", swift: "EBILAEAD", currency: "USD", status: "Saved" },
    ],
    payments: [
      { id: "SP-2026-0139", supplier: "Yiwu Fashion Co.", country: "China", bank: "Bank of China", accountNumber: "6217 0021 8899 4410", swift: "BKCHCNBJ", currency: "RMB", amount: 180_000, ngnCost: 41_760_000, rate: 232, fee: 62_000, description: "Apparel order #2291", purpose: "Goods import payment", status: "Receipt available", createdAt: iso(-12), documents: ["Commercial invoice", "Packing list"], receiptNo: "RC-2026-0139" },
      { id: "SP-2026-0140", supplier: "Istanbul Textiles", country: "Turkey", bank: "Ziraat Bankasi", accountNumber: "TR33 0006 1005 1978 6457", swift: "TCZBTR2A", currency: "EUR", amount: 24_500, ngnCost: 43_610_000, rate: 1780, fee: 58_000, description: "Cotton rolls", purpose: "Goods import payment", status: "Compliance review", createdAt: iso(-3), documents: ["Proforma invoice"] },
      { id: "SP-2026-0141", supplier: "Northwind Trading FZE", country: "United Arab Emirates", bank: "Emirates NBD", accountNumber: "AE07 0331 2345 6789 0123", swift: "EBILAEAD", currency: "USD", amount: 32_000, ngnCost: 52_800_000, rate: 1650, fee: 61_000, description: "Generator parts", purpose: "Goods import payment", status: "Awaiting funding", createdAt: iso(-1), documents: [] },
    ],
    funding: [
      { id: "FD-1042", method: "NGN", amount: 20_000_000, status: "Balance credited", createdAt: iso(-9) },
      { id: "FD-1043", method: "USDT", amount: 3_200, status: "Balance credited", createdAt: iso(-5) },
      { id: "FD-1044", method: "NGN", amount: 6_000_000, status: "Under review", createdAt: iso(-1) },
    ],
    documents: [
      { id: "DOC-2001", name: "Commercial invoice — Yiwu 2291.pdf", type: "Commercial invoice", linkedPayment: "SP-2026-0139", status: "Approved", uploadedAt: iso(-12) },
      { id: "DOC-2002", name: "Packing list — Yiwu 2291.pdf", type: "Packing list", linkedPayment: "SP-2026-0139", status: "Approved", uploadedAt: iso(-12) },
      { id: "DOC-2003", name: "Proforma invoice — Istex.pdf", type: "Proforma invoice", linkedPayment: "SP-2026-0140", status: "Under review", uploadedAt: iso(-3) },
      { id: "DOC-2004", name: "Bill of Lading — MSCU4410.pdf", type: "Bill of Lading", linkedShipment: "SH-3301", status: "Uploaded", uploadedAt: iso(-6) },
    ],
    shipments: [
      { id: "SH-3301", blNumber: "MSCUNG2291", paymentRef: "SP-2026-0139", shippingLine: "MSC", vessel: "MSC Aurora", container: "MSCU4410221", portLoading: "Ningbo", portDestination: "Apapa, Lagos", eta: iso(9), status: "In transit", notify: true },
      { id: "SH-3302", blNumber: "TRKX88120", paymentRef: "SP-2026-0140", shippingLine: "Arkas Line", vessel: "Arkas Star", container: "ARKU7781002", portLoading: "Izmir", portDestination: "Onne, Port Harcourt", eta: iso(3), status: "Arriving soon", notify: true },
      { id: "SH-3303", blNumber: "ENBD40021", shippingLine: "Maersk", container: "MRKU5512009", portLoading: "Jebel Ali", portDestination: "Apapa, Lagos", eta: iso(-4), status: "Clearing", notify: false },
    ],
    notifications: [
      { id: "N-1", kind: "Shipment", text: "SH-3302 is arriving soon at Onne, Port Harcourt.", at: iso(0), read: false },
      { id: "N-2", kind: "Compliance", text: "SP-2026-0140 is under compliance review before payout.", at: iso(-1), read: false },
      { id: "N-3", kind: "Receipt", text: "Receipt RC-2026-0139 is ready to download.", at: iso(-11), read: true },
    ],
    notifySettings: { whatsapp: true, email: true, inApp: true },
  };
}

let serverSnapshot: ImporterState | null = null;
function serverState(): ImporterState {
  if (!serverSnapshot) serverSnapshot = seed();
  return serverSnapshot;
}

let state: ImporterState | null = null;
const listeners = new Set<() => void>();

function read(): ImporterState {
  if (state) return state;
  if (typeof window === "undefined") return serverState();
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? { ...seed(), ...JSON.parse(raw) } : seed();
  } catch {
    state = seed();
  }
  return state as ImporterState;
}

function commit(next: ImporterState) {
  state = next;
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function update(fn: (s: ImporterState) => ImporterState) {
  commit(fn(read()));
}

export function useImporter(): ImporterState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => read(),
    () => serverState(),
  );
}

export function notify(kind: ImporterNotification["kind"], text: string) {
  update((s) => ({
    ...s,
    notifications: [{ id: `N-${Date.now()}`, kind, text, at: new Date().toISOString().slice(0, 10), read: false }, ...s.notifications].slice(0, 60),
  }));
}

export function nextPaymentRef(s: ImporterState) {
  const year = new Date().getFullYear();
  const n = s.payments.length + 142;
  return `SP-${year}-${String(n).padStart(4, "0")}`;
}

export function addSupplier(data: Omit<SupplierRecord, "id" | "status">) {
  const id = `SUP-${String(read().suppliers.length + 1).padStart(3, "0")}`;
  update((s) => ({ ...s, suppliers: [{ id, status: "Saved", ...data }, ...s.suppliers] }));
  return id;
}

export function updateSupplier(id: string, patch: Partial<SupplierRecord>) {
  update((s) => ({ ...s, suppliers: s.suppliers.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
}

export function addPayment(p: Omit<SupplierPayment, "id" | "createdAt">) {
  const id = nextPaymentRef(read());
  update((s) => ({ ...s, payments: [{ ...p, id, createdAt: new Date().toISOString().slice(0, 10) }, ...s.payments] }));
  notify("Payment", `Supplier Payment ${id} submitted and queued for review.`);
  return id;
}

export function setPaymentStatus(id: string, status: PaymentStatus) {
  update((s) => ({ ...s, payments: s.payments.map((p) => (p.id === id ? { ...p, status } : p)) }));
}

export function debitBalance(amount: number) {
  update((s) => ({ ...s, ngnBalance: Math.max(0, s.ngnBalance - amount) }));
}

export function addFunding(method: FundingEntry["method"], amount: number) {
  const id = `FD-${Math.floor(1100 + Math.random() * 800)}`;
  update((s) => ({ ...s, funding: [{ id, method, amount, status: "Awaiting payment", createdAt: new Date().toISOString().slice(0, 10) }, ...s.funding] }));
  notify("Balance", `Funding request ${id} created — awaiting payment.`);
  return id;
}

export function advanceFunding(id: string) {
  const order: FundingEntry["status"][] = ["Awaiting payment", "Payment received", "Under review", "Balance credited"];
  update((s) => ({
    ...s,
    funding: s.funding.map((f) => {
      if (f.id !== id) return f;
      const i = order.indexOf(f.status);
      return { ...f, status: order[Math.min(i + 1, order.length - 1)] };
    }),
  }));
}

export function addDocument(d: Omit<ImporterDoc, "id" | "uploadedAt" | "status"> & { status?: ImporterDoc["status"] }) {
  const id = `DOC-${Math.floor(3000 + Math.random() * 900)}`;
  update((s) => ({
    ...s,
    documents: [{ id, uploadedAt: new Date().toISOString().slice(0, 10), status: d.status ?? "Uploaded", ...d }, ...s.documents],
  }));
  return id;
}

export function addShipment(sh: Omit<ImporterShipment, "id" | "status" | "notify"> & { notify?: boolean }) {
  const id = `SH-${Math.floor(3300 + Math.random() * 600)}`;
  update((s) => ({ ...s, shipments: [{ id, status: "Documents uploaded", notify: sh.notify ?? true, ...sh }, ...s.shipments] }));
  notify("Shipment", `Bill of Lading uploaded for ${id}.`);
  return id;
}

export function updateShipment(id: string, patch: Partial<ImporterShipment>) {
  update((s) => ({ ...s, shipments: s.shipments.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
}

export function markAllRead() {
  update((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
}

export function setNotifySetting(k: keyof ImporterState["notifySettings"], v: boolean) {
  update((s) => ({ ...s, notifySettings: { ...s.notifySettings, [k]: v } }));
}

export const fmtNGN = (n: number) =>
  `₦${Math.round(n).toLocaleString("en-NG")}`;

export const fmtCcy = (n: number, ccy: string) =>
  `${ccy} ${Math.round(n).toLocaleString("en-US")}`;

export function quoteFor(amount: number, currency: string) {
  const rate = FX_RATES[currency] ?? 1650;
  const gross = amount * rate;
  const fee = Math.round(gross * 0.004);
  return { rate, ngnCost: Math.round(gross + fee), fee };
}
