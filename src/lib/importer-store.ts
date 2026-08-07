// Customer-facing Importer store (demo, localStorage-backed).
//
// Naming rule: importer customers never see "Trade File". The customer-facing
// object here is a Supplier Payment (SP-YYYY-NNNN). Internal ops/admin screens
// keep their own Trade File objects untouched.

import { useSyncExternalStore } from "react";

const KEY = "canta:importer:v2";

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

export type WalletCcy = "NGN" | "USDT" | "USD" | "GBP" | "EUR";

export const WALLET_CCYS: WalletCcy[] = ["NGN", "USDT", "USD", "GBP", "EUR"];

/** Only these rails can be funded directly today. */
export const FUNDABLE_CCYS: WalletCcy[] = ["NGN", "USDT"];

export const USDT_NETWORKS = ["TRC20", "ERC20", "BEP20"] as const;
export type UsdtNetwork = (typeof USDT_NETWORKS)[number];

export type ImporterWallet = {
  ccy: WalletCcy;
  available: number;
  pending: number;
  status: "Active" | "Pending" | "Disabled";
  lastActivity: string;
};

export type FundingStatus =
  | "Awaiting NGN Payment"
  | "Awaiting USDT Transfer"
  | "Payment confirmation submitted"
  | "Transfer confirmation submitted"
  | "Blockchain confirmation pending"
  | "Provider confirmation pending"
  | "Under review"
  | "Wallet credited"
  | "Failed"
  | "Expired"
  | "Cancelled";

export const FUNDING_OPEN: FundingStatus[] = [
  "Awaiting NGN Payment",
  "Awaiting USDT Transfer",
  "Payment confirmation submitted",
  "Transfer confirmation submitted",
  "Blockchain confirmation pending",
  "Provider confirmation pending",
  "Under review",
];

export type FundingEntry = {
  id: string;
  method: "NGN" | "USDT";
  network?: UsdtNetwork;
  amount: number;
  purpose?: string;
  reference: string;
  address?: string;
  status: FundingStatus;
  createdAt: string;
  expiresAt?: string;
  providerRef?: string;
  receiptNo?: string;
};

export type WalletTxType =
  | "Wallet funding"
  | "Supplier payment"
  | "FX conversion"
  | "Refund"
  | "Fee"
  | "Receipt generated";

export type WalletTx = {
  id: string;
  at: string;
  ccy: WalletCcy;
  type: WalletTxType;
  amount: number;
  status: "Completed" | "Pending" | "Failed";
  reference: string;
  receiptNo?: string;
};

export type FundingReceipt = {
  receiptNo: string;
  fundingRef: string;
  ccy: WalletCcy;
  amount: number;
  method: string;
  providerRef: string;
  at: string;
  status: "Wallet credited";
};

export type PaymentDraft = {
  id: string;
  at: string;
  supplier: string;
  amountLabel: string;
  form: Record<string, unknown>;
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
  wallets: ImporterWallet[];
  walletTx: WalletTx[];
  fundingReceipts: FundingReceipt[];
  drafts: PaymentDraft[];
  suppliers: SupplierRecord[];
  payments: SupplierPayment[];
  funding: FundingEntry[];
  documents: ImporterDoc[];
  shipments: ImporterShipment[];
  notifications: ImporterNotification[];
  notifySettings: { whatsapp: boolean; email: boolean; inApp: boolean };
  alerts: {
    paymentUpdates: boolean;
    fxExpiry: boolean;
    shipmentUpdates: boolean;
    receiptAvailable: boolean;
    blTracking: boolean;
  };
  prefs: {
    fundingCurrency: "NGN" | "USDT";
    settlementCurrency: string;
    saveSupplierByDefault: boolean;
    usdtWarnings: boolean;
    emailFundingReceipts: boolean;
    whatsappPaymentNotifications: boolean;
  };
  business: { name: string; contact: string; email: string; phone: string; address: string };
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
    wallets: [
      { ccy: "NGN", available: 24_500_000, pending: 6_000_000, status: "Active", lastActivity: iso(-1) },
      { ccy: "USDT", available: 3_200, pending: 0, status: "Active", lastActivity: iso(-5) },
    ],
    walletTx: [
      { id: "WT-9001", at: iso(-9), ccy: "NGN", type: "Wallet funding", amount: 20_000_000, status: "Completed", reference: "FD-1042", receiptNo: "FR-1042" },
      { id: "WT-9002", at: iso(-5), ccy: "USDT", type: "Wallet funding", amount: 3_200, status: "Completed", reference: "FD-1043", receiptNo: "FR-1043" },
      { id: "WT-9003", at: iso(-1), ccy: "NGN", type: "Wallet funding", amount: 6_000_000, status: "Pending", reference: "FD-1044" },
    ],
    fundingReceipts: [
      { receiptNo: "FR-1042", fundingRef: "FD-1042", ccy: "NGN", amount: 20_000_000, method: "NGN bank transfer", providerRef: "PRV-NGN-448120", at: iso(-9), status: "Wallet credited" },
      { receiptNo: "FR-1043", fundingRef: "FD-1043", ccy: "USDT", amount: 3_200, method: "USDT transfer (TRC20)", providerRef: "PRV-USDT-771903", at: iso(-5), status: "Wallet credited" },
    ],
    drafts: [],
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
      { id: "FD-1042", method: "NGN", amount: 20_000_000, reference: "CANTA-FD-1042", status: "Wallet credited", createdAt: iso(-9), providerRef: "PRV-NGN-448120", receiptNo: "FR-1042" },
      { id: "FD-1043", method: "USDT", network: "TRC20", amount: 3_200, reference: "CANTA-FD-1043", status: "Wallet credited", createdAt: iso(-5), providerRef: "PRV-USDT-771903", receiptNo: "FR-1043" },
      { id: "FD-1044", method: "NGN", amount: 6_000_000, reference: "CANTA-FD-1044", status: "Under review", createdAt: iso(-1) },
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
    alerts: { paymentUpdates: true, fxExpiry: true, shipmentUpdates: true, receiptAvailable: true, blTracking: true },
    prefs: { fundingCurrency: "NGN", settlementCurrency: "RMB", saveSupplierByDefault: true, usdtWarnings: true, emailFundingReceipts: true, whatsappPaymentNotifications: true },
    business: { name: "Bakare Imports Ltd", contact: "Tunde Bakare", email: "tunde@bakareimports.ng", phone: "+234 803 000 0000", address: "12 Balogun Street, Lagos Island, Lagos" },
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

/* ---------------------------------------------------------------- wallets */

export const NGN_COLLECTION_ACCOUNT = {
  bank: "Providus Bank",
  accountName: "Canta Collections / Bakare Imports Ltd",
  accountNumber: "9901234567",
};

export const USDT_ADDRESSES: Record<UsdtNetwork, string> = {
  TRC20: "TXk9QeDemoWalletAddressNotReal4421",
  ERC20: "0xDemoWalletAddressNotReal00000000000a41c9",
  BEP20: "0xDemoBep20AddressNotReal0000000000b7712d",
};

export const USDT_CONFIRMATIONS: Record<UsdtNetwork, number> = { TRC20: 19, ERC20: 12, BEP20: 15 };

export const walletOf = (s: ImporterState, ccy: WalletCcy) => s.wallets.find((w) => w.ccy === ccy);

export const fmtWallet = (n: number, ccy: WalletCcy) =>
  ccy === "NGN" ? fmtNGN(n)
    : ccy === "USDT" ? `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`
    : `${ccy === "USD" ? "$" : ccy === "GBP" ? "£" : "€"}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

const today = () => new Date().toISOString().slice(0, 10);

export function createWallet(ccy: WalletCcy) {
  update((s) =>
    s.wallets.some((w) => w.ccy === ccy)
      ? s
      : {
          ...s,
          wallets: [...s.wallets, { ccy, available: 0, pending: 0, status: "Active", lastActivity: today() }],
          walletTx: [
            { id: `WT-${Date.now()}`, at: today(), ccy, type: "Wallet funding", amount: 0, status: "Completed", reference: `Wallet created — ${ccy}` },
            ...s.walletTx,
          ],
        },
  );
  notify("Balance", `${ccy} wallet created.`);
}

function applyWallet(s: ImporterState, ccy: WalletCcy, patch: (w: ImporterWallet) => ImporterWallet): ImporterState {
  const wallets = s.wallets.map((w) => (w.ccy === ccy ? { ...patch(w), lastActivity: today() } : w));
  const ngn = wallets.find((w) => w.ccy === "NGN");
  const usdt = wallets.find((w) => w.ccy === "USDT");
  return { ...s, wallets, ngnBalance: ngn?.available ?? s.ngnBalance, usdtBalance: usdt?.available ?? s.usdtBalance };
}

export function creditWallet(ccy: WalletCcy, amount: number) {
  update((s) => applyWallet(s, ccy, (w) => ({ ...w, available: w.available + amount })));
}

export function debitWallet(ccy: WalletCcy, amount: number) {
  update((s) => applyWallet(s, ccy, (w) => ({ ...w, available: Math.max(0, w.available - amount) })));
}

export function addWalletTx(tx: Omit<WalletTx, "id" | "at"> & { at?: string }) {
  update((s) => ({ ...s, walletTx: [{ id: `WT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, at: tx.at ?? today(), ...tx }, ...s.walletTx] }));
}

/* ---------------------------------------------------------------- funding */

export function startFunding(input: {
  method: "NGN" | "USDT";
  amount: number;
  network?: UsdtNetwork;
  purpose?: string;
}) {
  const id = `FD-${Math.floor(1100 + Math.random() * 800)}`;
  const entry: FundingEntry = {
    id,
    method: input.method,
    network: input.network,
    amount: input.amount,
    purpose: input.purpose,
    reference: `CANTA-${id}`,
    address: input.method === "USDT" && input.network ? USDT_ADDRESSES[input.network] : undefined,
    status: input.method === "NGN" ? "Awaiting NGN Payment" : "Awaiting USDT Transfer",
    createdAt: today(),
    expiresAt: new Date(Date.now() + 2 * 3600_000).toISOString(),
  };
  update((s) => applyWallet({ ...s, funding: [entry, ...s.funding] }, input.method, (w) => ({ ...w, pending: w.pending + input.amount })));
  addWalletTx({ ccy: input.method, type: "Wallet funding", amount: input.amount, status: "Pending", reference: id });
  notify("Balance", `Funding request ${id} created — ${entry.status.toLowerCase()}.`);
  return id;
}

export function confirmFundingSent(id: string) {
  update((s) => ({
    ...s,
    funding: s.funding.map((f) =>
      f.id === id
        ? { ...f, status: f.method === "NGN" ? "Payment confirmation submitted" : "Transfer confirmation submitted" }
        : f,
    ),
  }));
}

/** Demo-only: stands in for the payment provider / blockchain callback. */
export function simulateProviderConfirmation(id: string) {
  const f = read().funding.find((x) => x.id === id);
  if (!f || f.status === "Wallet credited") return;
  const receiptNo = `FR-${id.replace("FD-", "")}`;
  const providerRef = `PRV-${f.method}-${Math.floor(100000 + Math.random() * 899999)}`;
  update((s) => {
    const withWallet = applyWallet(s, f.method, (w) => ({
      ...w,
      available: w.available + f.amount,
      pending: Math.max(0, w.pending - f.amount),
    }));
    return {
      ...withWallet,
      funding: withWallet.funding.map((x) => (x.id === id ? { ...x, status: "Wallet credited", providerRef, receiptNo } : x)),
      fundingReceipts: [
        {
          receiptNo,
          fundingRef: id,
          ccy: f.method as WalletCcy,
          amount: f.amount,
          method: f.method === "NGN" ? "NGN bank transfer" : `USDT transfer (${f.network ?? "TRC20"})`,
          providerRef,
          at: today(),
          status: "Wallet credited" as const,
        },
        ...withWallet.fundingReceipts,
      ],
      walletTx: withWallet.walletTx.map((t) =>
        t.reference === id && t.type === "Wallet funding" ? { ...t, status: "Completed" as const, receiptNo } : t,
      ),
    };
  });
  notify("Balance", `${f.method} wallet credited — funding ${id} confirmed. Receipt ${receiptNo} is available.`);
  return receiptNo;
}

export function cancelFunding(id: string) {
  const f = read().funding.find((x) => x.id === id);
  if (!f) return;
  update((s) => {
    const withWallet = applyWallet(s, f.method, (w) => ({ ...w, pending: Math.max(0, w.pending - f.amount) }));
    return {
      ...withWallet,
      funding: withWallet.funding.map((x) => (x.id === id ? { ...x, status: "Cancelled" as const } : x)),
      walletTx: withWallet.walletTx.filter((t) => t.reference !== id),
    };
  });
}

/* --------------------------------------------------------- payment drafts */

export function saveDraft(d: Omit<PaymentDraft, "id" | "at">) {
  const id = `DR-${Math.floor(1000 + Math.random() * 9000)}`;
  update((s) => ({ ...s, drafts: [{ id, at: today(), ...d }, ...s.drafts] }));
  return id;
}

export function removeDraft(id: string) {
  update((s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) }));
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

export function setAlert(k: keyof ImporterState["alerts"], v: boolean) {
  update((s) => ({ ...s, alerts: { ...s.alerts, [k]: v } }));
}

export function setPref<K extends keyof ImporterState["prefs"]>(k: K, v: ImporterState["prefs"][K]) {
  update((s) => ({ ...s, prefs: { ...s.prefs, [k]: v } }));
}

export function setBusiness(patch: Partial<ImporterState["business"]>) {
  update((s) => ({ ...s, business: { ...s.business, ...patch } }));
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

/* ------------------------------------------------- remittance quoting ---- */

/** Indicative NGN value of 1 unit of each wallet currency (demo rates). */
export const WALLET_NGN_RATE: Record<WalletCcy, number> = {
  NGN: 1,
  USDT: 1640,
  USD: FX_RATES.USD,
  GBP: FX_RATES.GBP,
  EUR: FX_RATES.EUR,
};

export const REMITTANCE_FEE_PCT = 0.004;

export type RemittanceLeg = {
  ccy: WalletCcy;
  rate: number;      // units of target ccy per 1 unit of funded ccy
  receive: number;   // amount credited to the target wallet after fee
};

/**
 * Every wallet is funded with NGN or USDT. This returns the indicative amount
 * you would receive in each other wallet currency after converting.
 */
export function remittanceQuote(method: "NGN" | "USDT", amount: number): {
  fee: number;
  net: number;
  legs: RemittanceLeg[];
} {
  const fee = Math.round(amount * REMITTANCE_FEE_PCT * 100) / 100;
  const net = Math.max(0, amount - fee);
  const src = WALLET_NGN_RATE[method];
  const legs = WALLET_CCYS.filter((c) => c !== method).map((c) => {
    const rate = src / WALLET_NGN_RATE[c];
    return { ccy: c, rate, receive: net * rate };
  });
  return { fee, net, legs };
}

/* ------------------------------------ global send currencies + lock ------ */

/**
 * Popular destination currencies importers send to. Suppliers do not need a
 * Canta wallet, so quoting is not limited to wallet currencies.
 * Values are indicative NGN per 1 unit (demo rates).
 */
export const GLOBAL_SEND_CCYS: { code: string; name: string; ngnRate: number }[] = [
  { code: "USD", name: "US Dollar", ngnRate: FX_RATES.USD },
  { code: "EUR", name: "Euro", ngnRate: FX_RATES.EUR },
  { code: "GBP", name: "British Pound", ngnRate: FX_RATES.GBP },
  { code: "CNY", name: "Chinese Yuan", ngnRate: FX_RATES.RMB },
  { code: "AED", name: "UAE Dirham", ngnRate: FX_RATES.AED },
  { code: "INR", name: "Indian Rupee", ngnRate: FX_RATES.INR },
  { code: "TRY", name: "Turkish Lira", ngnRate: FX_RATES.TRY },
  { code: "CAD", name: "Canadian Dollar", ngnRate: FX_RATES.CAD },
  { code: "JPY", name: "Japanese Yen", ngnRate: 11 },
  { code: "CHF", name: "Swiss Franc", ngnRate: 1880 },
  { code: "AUD", name: "Australian Dollar", ngnRate: 1080 },
  { code: "ZAR", name: "South African Rand", ngnRate: 90 },
  { code: "SGD", name: "Singapore Dollar", ngnRate: 1230 },
  { code: "HKD", name: "Hong Kong Dollar", ngnRate: 212 },
  { code: "KES", name: "Kenyan Shilling", ngnRate: 12.8 },
  { code: "GHS", name: "Ghanaian Cedi", ngnRate: 105 },
  { code: "USDT", name: "Tether USDT", ngnRate: WALLET_NGN_RATE.USDT },
];

export const ngnRateOf = (code: string) =>
  GLOBAL_SEND_CCYS.find((c) => c.code === code)?.ngnRate ?? WALLET_NGN_RATE.NGN;

/** Generic formatter that works for any send currency, not just wallets. */
export const fmtAnyCcy = (n: number, code: string) => {
  if (code === "NGN") return fmtNGN(n);
  if (code === "USDT") return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDT`;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${code}`;
  }
};

/** Seconds a remittance quote stays locked before it must be refreshed. */
export const QUOTE_LOCK_SECONDS = 90;

export type LockedQuote = {
  method: "NGN" | "USDT";
  amount: number;
  target: string;
  fee: number;
  net: number;
  rate: number;
  receive: number;
  lockedAt: number;
  expiresAt: number;
};

export function buildLockedQuote(method: "NGN" | "USDT", amount: number, target: string): LockedQuote {
  const fee = Math.round(amount * REMITTANCE_FEE_PCT * 100) / 100;
  const net = Math.max(0, amount - fee);
  const src = method === "NGN" ? 1 : WALLET_NGN_RATE.USDT;
  const rate = src / ngnRateOf(target);
  const lockedAt = Date.now();
  return { method, amount, target, fee, net, rate, receive: net * rate, lockedAt, expiresAt: lockedAt + QUOTE_LOCK_SECONDS * 1000 };
}
