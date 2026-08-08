import { useSyncExternalStore } from "react";
import { useHydrated } from "@tanstack/react-router";

// ---------------------------------------------------------------------------
// Automatic Convert toggle
// ---------------------------------------------------------------------------

const AC_KEY = "canta:supplier:autoConvert";
let autoConvert = true;
let acHydrated = false;
const acSubs = new Set<() => void>();

export const autoConvertStore = {
  get: () => autoConvert,
  getServer: () => true,
  set: (v: boolean) => {
    autoConvert = v;
    try {
      window.localStorage.setItem(AC_KEY, v ? "on" : "off");
    } catch {
      /* ignore */
    }
    acSubs.forEach((f) => f());
  },
  subscribe: (f: () => void) => {
    if (!acHydrated) {
      acHydrated = true;
      try {
        const stored = window.localStorage.getItem(AC_KEY);
        if (stored) {
          const v = stored === "on";
          if (v !== autoConvert) {
            autoConvert = v;
            queueMicrotask(() => acSubs.forEach((s) => s()));
          }
        }
      } catch {
        /* ignore */
      }
    }
    acSubs.add(f);
    return () => acSubs.delete(f);
  },
};

export function useAutoConvert() {
  // Render the SSR default until hydration completes, so the persisted value
  // never changes rendered attributes during the hydration pass.
  const hydrated = useHydrated();
  const value = useSyncExternalStore(
    autoConvertStore.subscribe,
    autoConvertStore.get,
    autoConvertStore.getServer,
  );
  return hydrated ? value : autoConvertStore.getServer();
}

// ---------------------------------------------------------------------------
// RMB bank accounts (settlement destinations)
// ---------------------------------------------------------------------------

import {
  canReceivePayout,
  logPayoutEvent,
  maskAccountNumber,
  payoutReviewQueue,
  type PayoutAccountStatus,
} from "@/lib/payout-security";

export type BankStatus = PayoutAccountStatus;

/** Supplier company name used for account-holder name matching. */
export const SUPPLIER_COMPANY = "Guangzhou Tech Factory Co., Ltd";
export const SUPPLIER_ALIASES = ["Guangzhou Tech Factory", "GZ Tech Factory Co Ltd"];

export function nameMatchesSupplier(holder: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = norm(holder);
  if (!target) return false;
  return [SUPPLIER_COMPANY, ...SUPPLIER_ALIASES].some(
    (n) => norm(n) === target || target.includes(norm(n)) || norm(n).includes(target),
  );
}

export type RmbBankAccount = {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  swift: string;
  cnaps?: string;
  branch: string;
  bankAddress: string;
  province: string;
  currency: "RMB" | "USD";
  status: BankStatus;
  isSettlementDestination: boolean;
  rejectionReason?: string;
  proofFileName?: string;
  changedAt?: string;
};

let BANKS: RmbBankAccount[] = [
  {
    id: "RB-1001",
    bankName: "ICBC — Industrial and Commercial Bank of China",
    accountHolder: "Guangzhou Tech Factory Co., Ltd",
    accountNumber: "6222000000004821",
    swift: "ICBKCNBJGDG",
    cnaps: "102581000012",
    branch: "Guangzhou Baiyun Branch",
    bankAddress: "No. 118 Baiyun Avenue, Baiyun District",
    province: "Guangdong / Guangzhou",
    currency: "RMB",
    status: "Verified",
    isSettlementDestination: true,
    proofFileName: "icbc-account-confirmation.pdf",
  },
  {
    id: "RB-1002",
    bankName: "Bank of China",
    accountHolder: "Guangzhou Tech Factory Co., Ltd",
    accountNumber: "6217000000009012",
    swift: "BKCHCNBJ400",
    branch: "Guangdong Branch",
    bankAddress: "No. 197 Dongfeng West Road",
    province: "Guangdong / Guangzhou",
    currency: "USD",
    status: "Pending Review",
    isSettlementDestination: false,
  },
];

let bankSeq = 1003;
const bankSubs = new Set<() => void>();
const notifyBanks = () => bankSubs.forEach((f) => f());

// Automatic Convert pause (triggered by any payout-account change)
let acPaused = false;
let acPauseReason = "";
const acPauseSubs = new Set<() => void>();
const notifyPause = () => acPauseSubs.forEach((f) => f());

export const autoConvertPause = {
  get: () => acPaused,
  reason: () => acPauseReason,
  pause: (reason: string) => {
    acPaused = true;
    acPauseReason = reason;
    notifyPause();
    logPayoutEvent({
      action: "Automatic Convert paused",
      workspace: "Supplier",
      entity: "Automatic Convert",
      actor: "Supplier admin",
      reason,
      result: "Pending",
    });
  },
  resume: () => {
    acPaused = false;
    acPauseReason = "";
    notifyPause();
    logPayoutEvent({
      action: "Automatic Convert resumed",
      workspace: "Supplier",
      entity: "Automatic Convert",
      actor: "Canta Ops",
    });
  },
  subscribe: (f: () => void) => {
    acPauseSubs.add(f);
    return () => acPauseSubs.delete(f);
  },
};

export function useAutoConvertPaused() {
  const paused = useSyncExternalStore(
    autoConvertPause.subscribe,
    autoConvertPause.get,
    () => false,
  );
  return paused;
}

export const rmbBankStore = {
  list: () => BANKS,
  destination: () => BANKS.find((b) => b.isSettlementDestination) ?? null,
  add: (b: Omit<RmbBankAccount, "id" | "status" | "isSettlementDestination">) => {
    const full: RmbBankAccount = {
      id: `RB-${bankSeq++}`,
      status: "Pending Review",
      isSettlementDestination: false,
      ...b,
    };
    BANKS = [...BANKS, full];
    notifyBanks();
    logPayoutEvent({
      action: "Account created",
      workspace: "Supplier",
      entity: `${full.id} · ${maskAccountNumber(full.accountNumber)}`,
      actor: "Supplier admin",
      next: maskAccountNumber(full.accountNumber),
      result: "Pending",
    });
    payoutReviewQueue.add({
      workspace: "Supplier",
      business: SUPPLIER_COMPANY,
      accountHolder: full.accountHolder,
      bank: full.bankName,
      currency: full.currency,
      accountNumber: full.accountNumber,
      submittedBy: "Supplier admin",
      documents: full.proofFileName ? [full.proofFileName] : [],
      nameMatch: nameMatchesSupplier(full.accountHolder) ? "Match" : "Mismatch",
      riskFlags: [
        ...(full.proofFileName ? [] : ["No bank proof uploaded"]),
        ...(nameMatchesSupplier(full.accountHolder) ? [] : ["Account holder name mismatch"]),
      ],
      previousChanges: 0,
      linkedRef: full.id,
    });
    autoConvertPause.pause("New RMB bank account added — awaiting Canta review.");
    return full;
  },
  update: (id: string, patch: Partial<RmbBankAccount>) => {
    const prev = BANKS.find((b) => b.id === id);
    BANKS = BANKS.map((b) =>
      b.id === id
        ? {
            ...b,
            ...patch,
            status: "Locked After Change",
            isSettlementDestination: false,
            changedAt: new Date().toISOString(),
          }
        : b,
    );
    notifyBanks();
    logPayoutEvent({
      action: "Account edited",
      workspace: "Supplier",
      entity: `${id} · ${maskAccountNumber(prev?.accountNumber ?? "")}`,
      actor: "Supplier admin",
      previous: maskAccountNumber(prev?.accountNumber ?? ""),
      next: maskAccountNumber(patch.accountNumber ?? prev?.accountNumber ?? ""),
      result: "Pending",
    });
    autoConvertPause.pause("RMB bank account details changed — Canta Ops must approve the change.");
  },
  submitForVerification: (id: string) => {
    BANKS = BANKS.map((b) =>
      b.id === id ? { ...b, status: "Pending Review", rejectionReason: undefined } : b,
    );
    notifyBanks();
    logPayoutEvent({
      action: "Account submitted",
      workspace: "Supplier",
      entity: id,
      actor: "Supplier admin",
      result: "Pending",
    });
  },
  approve: (id: string) => {
    BANKS = BANKS.map((b) => (b.id === id ? { ...b, status: "Verified" } : b));
    notifyBanks();
    logPayoutEvent({
      action: "Account approved",
      workspace: "Ops",
      entity: id,
      actor: "Canta Ops",
      role: "Ops reviewer",
      next: "Verified",
    });
    autoConvertPause.resume();
  },
  setDestination: (
    id: string,
    opts?: { kybApproved?: boolean },
  ): { ok: boolean; error?: string } => {
    const acc = BANKS.find((b) => b.id === id);
    if (!acc) return { ok: false, error: "Account not found." };
    if (opts && opts.kybApproved === false) {
      return { ok: false, error: "Your business verification (KYB) must be approved first." };
    }
    if (!canReceivePayout(acc.status)) {
      return {
        ok: false,
        error:
          acc.status === "Locked After Change"
            ? "This account changed and is locked until Canta re-verifies it."
            : "Only a verified bank account can receive settlement.",
      };
    }
    if (!nameMatchesSupplier(acc.accountHolder)) {
      return { ok: false, error: "Account holder name must match your registered company name." };
    }
    BANKS = BANKS.map((b) => ({ ...b, isSettlementDestination: b.id === id }));
    notifyBanks();
    logPayoutEvent({
      action: "Account set as default",
      workspace: "Supplier",
      entity: `${id} · ${maskAccountNumber(acc.accountNumber)}`,
      actor: "Supplier admin",
      next: "Settlement destination",
    });
    return { ok: true };
  },
  subscribe: (f: () => void) => {
    bankSubs.add(f);
    return () => bankSubs.delete(f);
  },
};

export function useRmbBanks() {
  return useSyncExternalStore(rmbBankStore.subscribe, rmbBankStore.list, rmbBankStore.list);
}

export function maskAccount(n: string) {
  return n.length <= 4 ? n : `**** ${n.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Simple supplier invoices
// ---------------------------------------------------------------------------

export type SimpleInvoiceStatus =
  | "Draft"
  | "Quote Locked"
  | "Sent to Buyer"
  | "Buyer Viewed"
  | "Awaiting NGN Payment"
  | "NGN Received"
  | "Compliance Review"
  | "Auto-Converting"
  | "RMB Settlement Pending"
  | "RMB Paid"
  | "Expired"
  | "Cancelled";

export const INVOICE_STATUS_TONE: Record<SimpleInvoiceStatus, string> = {
  Draft: "bg-muted text-foreground",
  "Quote Locked": "bg-blue-100 text-blue-800",
  "Sent to Buyer": "bg-blue-100 text-blue-800",
  "Buyer Viewed": "bg-blue-100 text-blue-800",
  "Awaiting NGN Payment": "bg-amber-100 text-amber-800",
  "NGN Received": "bg-primary/10 text-primary",
  "Compliance Review": "bg-amber-100 text-amber-800",
  "Auto-Converting": "bg-indigo-100 text-indigo-800",
  "RMB Settlement Pending": "bg-indigo-100 text-indigo-800",
  "RMB Paid": "bg-emerald-100 text-emerald-800",
  Expired: "bg-destructive/10 text-destructive",
  Cancelled: "bg-muted text-foreground",
};

export type SendChannel = "WhatsApp" | "Email" | "WeChat" | "Not sent";

export type SimpleInvoice = {
  id: string;
  invoiceNumber: string;
  paymentRequestId: string;
  buyerCompany: string;
  buyerWhatsapp: string;
  buyerEmail: string;
  buyerWechat?: string;
  goods: string;
  amountRmb: number;
  fxRate: number;
  feeNgn: number;
  amountNgn: number;
  quoteExpiresAt: number;
  dueDate: string;
  notes?: string;
  paymentLink: string;
  payoutAccountId: string;
  status: SimpleInvoiceStatus;
  sentBy: SendChannel;
  createdAt: string;
  receiptId?: string;
  providerConfirmed?: boolean;
  providerRef?: string;
  settledAt?: number;
  events: TimelineEvent[];
};

export type TimelineEvent = {
  id: string;
  label: string;
  detail?: string;
  at: number;
};

let evtSeq = 0;
export function makeEvent(label: string, detail?: string, at = Date.now()): TimelineEvent {
  evtSeq++;
  return { id: `ev_${evtSeq}`, label, detail, at };
}

/** Deterministic, locale-free timestamp so SSR and client agree. */
export function formatStamp(ts: number) {
  return `${new Date(ts).toISOString().replace("T", " ").slice(0, 16)} UTC`;
}

export const FX_RATE = 204.35;
export const FEE_RATE = 0.009; // 0.9% Canta fee, shown on every quote

export function quoteFor(amountRmb: number, rate = FX_RATE) {
  const gross = Math.round(amountRmb * rate);
  const feeNgn = Math.round(gross * FEE_RATE);
  return { rate, feeNgn, amountNgn: gross + feeNgn };
}

// Seed timestamps are relative to today, floored to midnight UTC so SSR and
// client render identical markup while demo dates never drift into the past.
const DAY = 86_400_000;
const SEED_NOW = Math.floor(Date.now() / DAY) * DAY;
const dayStamp = (offsetDays: number) =>
  new Date(SEED_NOW + offsetDays * DAY).toISOString().slice(0, 10);

let invSeq = 48;
export function nextInvoiceNumber() {
  return `INV-2026-${String(invSeq).padStart(3, "0")}`;
}
export function nextPaymentRequestId() {
  return `PR-3${String(invSeq).padStart(3, "0")}`;
}

/** Demo-safe payment link. Stored relative, resolved to an absolute URL on copy. */
export function paymentPath(paymentRequestId: string) {
  return `/pay/${paymentRequestId.toLowerCase()}`;
}
export function paymentLinkUrl(inv: SimpleInvoice) {
  const base =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://canta.app";
  return inv.paymentLink.startsWith("http") ? inv.paymentLink : `${base}${inv.paymentLink}`;
}

const SEED_STEP_LABELS: Array<[SimpleInvoiceStatus, string]> = [
  ["Draft", "Invoice created"],
  ["Quote Locked", "Quote generated"],
  ["Sent to Buyer", "Invoice sent to buyer"],
  ["Buyer Viewed", "Buyer viewed invoice"],
  ["Awaiting NGN Payment", "Awaiting NGN payment"],
  ["NGN Received", "NGN received and matched"],
  ["Compliance Review", "Compliance review started"],
  ["Auto-Converting", "NGN converted to RMB"],
  ["RMB Settlement Pending", "RMB payout initiated"],
  ["RMB Paid", "Provider confirmed payout — RMB paid"],
];

function seedEvents(status: SimpleInvoiceStatus, startedAt: number): TimelineEvent[] {
  const reached = SEED_STEP_LABELS.findIndex(([s]) => s === status);
  const upTo = reached === -1 ? 1 : reached;
  return SEED_STEP_LABELS.slice(0, upTo + 1).map(([, label], i) =>
    makeEvent(label, undefined, startedAt + i * 3_600_000),
  );
}

function seed(
  n: number,
  buyerCompany: string,
  goods: string,
  amountRmb: number,
  status: SimpleInvoiceStatus,
  sentBy: SendChannel,
  expiryOffsetDays: number,
  createdOffsetDays: number,
): SimpleInvoice {
  const createdMs = SEED_NOW + createdOffsetDays * DAY;
  const createdAt = dayStamp(createdOffsetDays);
  const q = quoteFor(amountRmb);
  const events = seedEvents(status, createdMs);
  if (status === "Expired")
    events.push(makeEvent("Quote expired", "Refresh the quote to create a new payment link."));
  return {
    id: `si_${n}`,
    invoiceNumber: `INV-2026-0${n}`,
    paymentRequestId: `PR-30${n}`,
    buyerCompany,
    buyerWhatsapp: "+234 802 111 2233",
    buyerEmail: "buyer@example.ng",
    goods,
    amountRmb,
    fxRate: q.rate,
    feeNgn: q.feeNgn,
    amountNgn: q.amountNgn,
    quoteExpiresAt: SEED_NOW + expiryOffsetDays * DAY,
    dueDate: dayStamp(21),
    paymentLink: paymentPath(`PR-30${n}`),
    payoutAccountId: "RB-1001",
    status,
    sentBy,
    createdAt,
    receiptId: status === "RMB Paid" ? `RC-30${n}` : undefined,
    providerConfirmed: status === "RMB Paid",
    providerRef: status === "RMB Paid" ? `PCONF-30${n}` : undefined,
    settledAt: status === "RMB Paid" ? createdMs + 4 * DAY : undefined,
    events,
  };
}

const SIMPLE_INVOICES: SimpleInvoice[] = [
  seed(
    41,
    "Zenith Imports Nigeria",
    "Bluetooth speakers x 500",
    94_500,
    "RMB Paid",
    "WhatsApp",
    -3,
    -14,
  ),
  seed(44, "Abuja Imports Ltd", "LED panels x 220", 42_300, "Auto-Converting", "Email", 5, -4),
  seed(
    45,
    "Kano Distributors",
    "Industrial sewing machines",
    69_100,
    "NGN Received",
    "WhatsApp",
    6,
    -2,
  ),
  seed(
    46,
    "Port Harcourt Trading",
    "Solar inverters x 60",
    34_200,
    "Awaiting NGN Payment",
    "WeChat",
    10,
    -1,
  ),
  seed(
    47,
    "Zenith Imports Nigeria",
    "Plastic injection moulds",
    29_900,
    "Expired",
    "WhatsApp",
    -5,
    -8,
  ),
];

let invVersion = 0;
const invSubs = new Set<() => void>();
const notifyInv = () => {
  invVersion++;
  invSubs.forEach((f) => f());
};

export const simpleInvoiceStore = {
  list: () => SIMPLE_INVOICES,
  get: (id: string) => SIMPLE_INVOICES.find((i) => i.id === id) ?? null,
  add: (
    data: Omit<
      SimpleInvoice,
      | "id"
      | "invoiceNumber"
      | "paymentRequestId"
      | "paymentLink"
      | "createdAt"
      | "status"
      | "sentBy"
      | "events"
    > &
      Partial<Pick<SimpleInvoice, "status" | "sentBy" | "events">>,
  ) => {
    const invoiceNumber = nextInvoiceNumber();
    const paymentRequestId = nextPaymentRequestId();
    invSeq++;
    const full: SimpleInvoice = {
      id: `si_${Date.now().toString(36)}`,
      invoiceNumber,
      paymentRequestId,
      paymentLink: paymentPath(paymentRequestId),
      createdAt: new Date().toISOString().slice(0, 10),
      status: data.status ?? "Quote Locked",
      sentBy: data.sentBy ?? "Not sent",
      ...data,
      events: [makeEvent("Invoice created"), makeEvent("Quote generated")],
    };
    SIMPLE_INVOICES.unshift(full);
    notifyInv();
    return full;
  },
  update: (id: string, patch: Partial<SimpleInvoice>) => {
    const idx = SIMPLE_INVOICES.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    SIMPLE_INVOICES[idx] = { ...SIMPLE_INVOICES[idx], ...patch };
    notifyInv();
    return SIMPLE_INVOICES[idx];
  },
  remove: (id: string) => {
    const idx = SIMPLE_INVOICES.findIndex((i) => i.id === id);
    if (idx === -1) return;
    SIMPLE_INVOICES.splice(idx, 1);
    notifyInv();
  },
  duplicate: (id: string) => {
    const src = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!src) return null;
    return simpleInvoiceStore.add({ ...src, status: "Draft", sentBy: "Not sent", events: [] });
  },
  /** Append a timeline event without changing invoice status. */
  addEvent: (id: string, label: string, detail?: string) => {
    const inv = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!inv) return;
    simpleInvoiceStore.update(id, { events: [...inv.events, makeEvent(label, detail)] });
  },
  /** Refreshing a quote re-prices and re-opens the 15-minute window. */
  refreshQuote: (id: string) => {
    const inv = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!inv) return null;
    const q = previewRefreshedQuote(inv);
    return simpleInvoiceStore.update(id, {
      fxRate: q.rate,
      feeNgn: q.feeNgn,
      amountNgn: q.amountNgn,
      quoteExpiresAt: q.expiresAt,
      status: "Quote Locked",
      paymentLink: paymentPath(inv.paymentRequestId),
      events: [
        ...inv.events,
        makeEvent(
          "Quote refreshed",
          `New rate ₦${q.rate} / ¥1 · ₦${q.amountNgn.toLocaleString()} · valid 15 minutes`,
        ),
      ],
    });
  },
  /** Demo only: a Nigerian buyer pays the NGN amount and the provider confirms it. */
  simulateBuyerPayment: (id: string): { ok: boolean; error?: string } => {
    const inv = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!inv) return { ok: false, error: "Invoice not found." };
    if (!AWAITING_PAYMENT.includes(inv.status))
      return { ok: false, error: "This invoice is not awaiting buyer payment." };
    if (isInvoiceQuoteExpired(inv))
      return { ok: false, error: "Quote expired — refresh the quote before payment." };
    simpleInvoiceStore.update(id, {
      status: "NGN Received",
      events: [
        ...inv.events,
        makeEvent(
          "NGN received and matched",
          `₦${inv.amountNgn.toLocaleString()} matched to ${inv.invoiceNumber}`,
        ),
      ],
    });
    return { ok: true };
  },
  /** Manual conversion request, used when Automatic Convert is OFF. */
  requestConversion: (id: string): { ok: boolean; error?: string } => {
    const inv = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!inv) return { ok: false, error: "Invoice not found." };
    if (inv.status !== "NGN Received")
      return { ok: false, error: "Conversion can only be requested once NGN is received." };
    simpleInvoiceStore.update(id, {
      status: "Compliance Review",
      events: [...inv.events, makeEvent("Compliance review started")],
    });
    return { ok: true };
  },
  /**
   * Advance one settlement stage. RMB Paid is only ever reached through an
   * explicit payout-provider confirmation, which also issues the receipt.
   */
  advanceSettlement: (
    id: string,
  ): { ok: boolean; status?: SimpleInvoiceStatus; error?: string } => {
    const inv = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!inv) return { ok: false, error: "Invoice not found." };
    if (inv.status === "RMB Settlement Pending")
      return simpleInvoiceStore.confirmProviderPayout(id);
    const next = SETTLEMENT_NEXT[inv.status];
    if (!next) return { ok: false, error: "No further settlement stage for this invoice." };
    simpleInvoiceStore.update(id, {
      status: next,
      events: [...inv.events, makeEvent(SETTLEMENT_EVENT_LABEL[next] ?? next)],
    });
    return { ok: true, status: next };
  },
  /**
   * Demo stand-in for the payout provider webhook. Only this call may mark an
   * invoice RMB Paid and issue the settlement receipt.
   */
  confirmProviderPayout: (
    id: string,
  ): { ok: boolean; status?: SimpleInvoiceStatus; error?: string } => {
    const inv = SIMPLE_INVOICES.find((i) => i.id === id);
    if (!inv) return { ok: false, error: "Invoice not found." };
    if (inv.status !== "RMB Settlement Pending")
      return {
        ok: false,
        error: "Provider confirmation is only possible once the RMB payout is pending.",
      };
    const now = Date.now();
    const ref = `PCONF-${inv.paymentRequestId.replace("PR-", "")}`;
    simpleInvoiceStore.update(id, {
      status: "RMB Paid",
      receiptId: `RC-${inv.paymentRequestId.replace("PR-", "")}`,
      providerConfirmed: true,
      providerRef: ref,
      settledAt: now,
      events: [
        ...inv.events,
        makeEvent("Provider confirmed payout", `Provider reference ${ref}`, now),
        makeEvent("RMB paid to your bank account", `¥${inv.amountRmb.toLocaleString()}`, now),
        makeEvent(
          "Receipt available",
          `Receipt RC-${inv.paymentRequestId.replace("PR-", "")}`,
          now,
        ),
      ],
    });
    return { ok: true, status: "RMB Paid" };
  },
  subscribe: (f: () => void) => {
    invSubs.add(f);
    return () => invSubs.delete(f);
  },
  getVersion: () => invVersion,
};

const AWAITING_PAYMENT: SimpleInvoiceStatus[] = [
  "Quote Locked",
  "Sent to Buyer",
  "Buyer Viewed",
  "Awaiting NGN Payment",
];

const SETTLEMENT_NEXT: Partial<Record<SimpleInvoiceStatus, SimpleInvoiceStatus>> = {
  "NGN Received": "Compliance Review",
  "Compliance Review": "Auto-Converting",
  "Auto-Converting": "RMB Settlement Pending",
  "RMB Settlement Pending": "RMB Paid",
};

/** Label for the next demo step in the settlement chain. */
export const SETTLEMENT_NEXT_LABEL: Partial<Record<SimpleInvoiceStatus, string>> = {
  "NGN Received": "Simulate compliance review",
  "Compliance Review": "Simulate conversion",
  "Auto-Converting": "Simulate payout initiated",
  "RMB Settlement Pending": "Simulate provider confirmation",
};

const SETTLEMENT_EVENT_LABEL: Partial<Record<SimpleInvoiceStatus, string>> = {
  "Compliance Review": "Compliance review started",
  "Auto-Converting": "NGN converted to RMB",
  "RMB Settlement Pending": "RMB payout initiated",
};

/** Re-price an expired quote without committing it, for the Refresh Quote modal. */
export function previewRefreshedQuote(inv: SimpleInvoice) {
  const drift = ((inv.amountRmb % 7) - 3) * 0.15; // small deterministic demo movement
  const rate = Math.round((FX_RATE + drift) * 100) / 100;
  const q = quoteFor(inv.amountRmb, rate);
  return { ...q, expiresAt: Date.now() + 15 * 60 * 1000 };
}

export function useSimpleInvoices() {
  useSyncExternalStore(
    simpleInvoiceStore.subscribe,
    simpleInvoiceStore.getVersion,
    simpleInvoiceStore.getVersion,
  );
  return SIMPLE_INVOICES;
}

/** Terminal / post-payment statuses are never treated as expired. */
const PAID_ON: SimpleInvoiceStatus[] = [
  "NGN Received",
  "Compliance Review",
  "Auto-Converting",
  "RMB Settlement Pending",
  "RMB Paid",
  "Cancelled",
];

export function isInvoiceQuoteExpired(inv: SimpleInvoice) {
  if (PAID_ON.includes(inv.status)) return false;
  return inv.status === "Expired" || Date.now() > inv.quoteExpiresAt;
}

/** Expired quotes can never be sent to a buyer. */
export function canSendInvoice(inv: SimpleInvoice) {
  return !isInvoiceQuoteExpired(inv) && !PAID_ON.includes(inv.status);
}

export function formatExpiry(ts: number) {
  const ms = ts - Date.now();
  if (ms <= 0) return "Expired";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

// ---------------------------------------------------------------------------
// Derived NGN balances
// ---------------------------------------------------------------------------

export function ngnSummary(invoices: SimpleInvoice[]) {
  const received = invoices.filter((i) => i.status === "NGN Received");
  const awaitingConversion = invoices.filter((i) =>
    ["NGN Received", "Compliance Review"].includes(i.status),
  );
  const converting = invoices.filter((i) =>
    ["Auto-Converting", "RMB Settlement Pending"].includes(i.status),
  );
  const pendingPayment = invoices.filter((i) =>
    ["Sent to Buyer", "Buyer Viewed", "Awaiting NGN Payment"].includes(i.status),
  );
  const paid = invoices.filter((i) => i.status === "RMB Paid");
  const sum = (rows: SimpleInvoice[], k: "amountNgn" | "amountRmb") =>
    rows.reduce((s, r) => s + r[k], 0);
  return {
    available: sum(received, "amountNgn"),
    pending: sum(pendingPayment, "amountNgn"),
    receivedToday: sum(received, "amountNgn"),
    awaitingConversion: sum(awaitingConversion, "amountNgn"),
    convertedNgn: sum(converting, "amountNgn"),
    rmbPending: sum(converting, "amountRmb"),
    rmbPaid: sum(paid, "amountRmb"),
    linked: [...received, ...awaitingConversion, ...converting].filter(
      (v, i, a) => a.indexOf(v) === i,
    ),
  };
}

export const NGN_COLLECTION_ACCOUNT = {
  bankName: "Providus Bank",
  accountName: "Canta Collections / Guangzhou Tech Factory",
  accountNumber: "9901234567",
  currency: "NGN",
  reference: "Use the invoice number as payment reference",
};

export function paymentInstructions(inv?: SimpleInvoice) {
  return [
    "Canta payment instructions",
    `Bank: ${NGN_COLLECTION_ACCOUNT.bankName}`,
    `Account name: ${NGN_COLLECTION_ACCOUNT.accountName}`,
    `Account number: ${NGN_COLLECTION_ACCOUNT.accountNumber}`,
    "Currency: NGN",
    inv ? `Reference: ${inv.invoiceNumber}` : NGN_COLLECTION_ACCOUNT.reference,
    inv ? `Amount: ₦${inv.amountNgn.toLocaleString()}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function wechatMessage(inv: SimpleInvoice) {
  return `Hello ${inv.buyerCompany}, Guangzhou Tech Factory has sent you an invoice through Canta (${inv.invoiceNumber}, ₦${inv.amountNgn.toLocaleString()}). Please pay the NGN amount using the secure Canta payment link: ${inv.paymentLink}. Once payment and compliance review are completed, Canta will settle RMB to our verified bank account.`;
}

export function copyText(text: string) {
  try {
    void navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Payment timeline
// ---------------------------------------------------------------------------

export type TimelineStepState = "Completed" | "Current" | "Pending" | "Blocked";

export type TimelineStep = {
  key: string;
  label: string;
  explain: string;
  state: TimelineStepState;
  at?: number;
  blocker?: string;
};

const TIMELINE_STEPS: Array<{ key: string; label: string; explain: string }> = [
  { key: "created", label: "Invoice Created", explain: "You created the invoice for your buyer." },
  {
    key: "quote",
    label: "Quote Generated",
    explain: "The RMB amount was priced in NGN at a locked rate.",
  },
  {
    key: "sent",
    label: "Invoice Sent",
    explain: "The invoice and payment link went to the buyer.",
  },
  { key: "viewed", label: "Buyer Viewed", explain: "The buyer opened the payment link." },
  {
    key: "awaiting",
    label: "Awaiting NGN Payment",
    explain: "Waiting for the buyer to pay NGN into your Canta collection account.",
  },
  {
    key: "received",
    label: "NGN Received",
    explain: "Canta matched the buyer's NGN payment to this invoice.",
  },
  {
    key: "compliance",
    label: "Compliance Review",
    explain: "Standard checks run before any conversion.",
  },
  { key: "converting", label: "Auto-Converting", explain: "NGN is converted to RMB at your rate." },
  {
    key: "payout",
    label: "RMB Settlement Pending",
    explain: "RMB payout queued to your verified bank account.",
  },
  {
    key: "provider",
    label: "Provider Confirmation",
    explain: "The payout provider must confirm the transfer.",
  },
  { key: "paid", label: "RMB Paid", explain: "RMB arrived in your Chinese bank account." },
  {
    key: "receipt",
    label: "Receipt Available",
    explain: "Settlement receipt issued after provider confirmation.",
  },
];

const STATUS_PROGRESS: Record<SimpleInvoiceStatus, number> = {
  Draft: 0,
  "Quote Locked": 1,
  "Sent to Buyer": 2,
  "Buyer Viewed": 3,
  "Awaiting NGN Payment": 4,
  "NGN Received": 5,
  "Compliance Review": 6,
  "Auto-Converting": 7,
  "RMB Settlement Pending": 8,
  "RMB Paid": 11,
  Expired: 1,
  Cancelled: 0,
};

/**
 * Derive the twelve-step payment timeline for an invoice. `blockers` carries
 * account-level problems (verification, bank) that stop progress.
 */
export function invoiceTimeline(inv: SimpleInvoice, blockers: string[] = []): TimelineStep[] {
  const expired = isInvoiceQuoteExpired(inv);
  const reached = STATUS_PROGRESS[inv.status] ?? 0;
  const paid = inv.status === "RMB Paid";
  return TIMELINE_STEPS.map((step, i) => {
    let state: TimelineStepState =
      i < reached ? "Completed" : i === reached ? "Current" : "Pending";
    if (paid) state = "Completed";
    let blocker: string | undefined;
    if (state === "Current") {
      if (expired && !paid) {
        state = "Blocked";
        blocker = "Quote expired — refresh quote to continue.";
      } else if (inv.status === "Cancelled") {
        state = "Blocked";
        blocker = "Invoice cancelled.";
      } else if (step.key === "compliance") {
        blocker = "Compliance review pending.";
      } else if (step.key === "provider") {
        blocker = "Provider confirmation pending.";
      } else if (blockers.length > 0 && i >= 5) {
        state = "Blocked";
        blocker = blockers.join(" · ");
      }
    }
    if (i === 9 && inv.status === "RMB Settlement Pending") {
      state = "Current";
      blocker = "Provider confirmation pending.";
    }
    const at = inv.events[Math.min(i, inv.events.length - 1)]?.at;
    return {
      ...step,
      state,
      blocker,
      at: state === "Completed" ? (i < inv.events.length ? inv.events[i]!.at : at) : undefined,
    };
  });
}

// ---------------------------------------------------------------------------
// Buyer reminder + receipt
// ---------------------------------------------------------------------------

export const SUPPLIER_NAME = "Guangzhou Tech Factory";

export function reminderMessage(inv: SimpleInvoice) {
  return [
    `Hello ${inv.buyerCompany},`,
    `${SUPPLIER_NAME} has sent you invoice ${inv.invoiceNumber} through Canta.`,
    `Amount: ¥${inv.amountRmb.toLocaleString()} (₦${inv.amountNgn.toLocaleString()} at ₦${inv.fxRate} / ¥1)`,
    `Payment link: ${paymentLinkUrl(inv)}`,
    `Quote valid until: ${formatStamp(inv.quoteExpiresAt)}`,
    "Please pay the NGN amount using the secure Canta payment link before the quote expires.",
  ].join("\n");
}

export function whatsappHref(inv: SimpleInvoice) {
  const digits = inv.buyerWhatsapp.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(reminderMessage(inv))}`;
}

export function mailtoHref(inv: SimpleInvoice) {
  return `mailto:${inv.buyerEmail}?subject=${encodeURIComponent(
    `Invoice ${inv.invoiceNumber} from ${SUPPLIER_NAME}`,
  )}&body=${encodeURIComponent(reminderMessage(inv))}`;
}

export function receiptText(inv: SimpleInvoice, bankLine: string) {
  return [
    "CANTA SETTLEMENT RECEIPT",
    "-----------------------------------------",
    `Receipt number: ${inv.receiptId ?? "—"}`,
    `Invoice number: ${inv.invoiceNumber}`,
    `Payment request: ${inv.paymentRequestId}`,
    `Buyer: ${inv.buyerCompany}`,
    `Supplier: ${SUPPLIER_NAME}`,
    `NGN amount paid: ₦${inv.amountNgn.toLocaleString()}`,
    `RMB amount settled: ¥${inv.amountRmb.toLocaleString()}`,
    `FX rate: ₦${inv.fxRate} / ¥1`,
    `Canta fee: ₦${inv.feeNgn.toLocaleString()}`,
    `Settlement bank account: ${bankLine}`,
    `Provider confirmation reference: ${inv.providerRef ?? "—"}`,
    `Date: ${formatStamp(inv.settledAt ?? Date.now())}`,
    "Status: RMB Paid",
    "Compliance: Payment matched and compliance review completed before conversion.",
    "-----------------------------------------",
    "Demo data — illustrative receipt generated by the Canta demo environment.",
  ].join("\n");
}

export function downloadTextFile(filename: string, contents: string) {
  try {
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/** Statuses where an unpaid payment link / buyer reminder still makes sense. */
export const UNPAID_STATUSES: SimpleInvoiceStatus[] = [
  "Quote Locked",
  "Sent to Buyer",
  "Buyer Viewed",
  "Awaiting NGN Payment",
];

export const SETTLEMENT_STATUSES: SimpleInvoiceStatus[] = [
  "NGN Received",
  "Compliance Review",
  "Auto-Converting",
  "RMB Settlement Pending",
  "RMB Paid",
];
