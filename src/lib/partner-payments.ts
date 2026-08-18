// Partner Mode: client-to-solicitor payment mapping.
//
// A Client Payment Case maps a client + property to a solicitor, a verified
// solicitor payout account, a payout currency, an FX quote (NGN -> payout
// currency) and a Client Payment Link. Client NGN payments land in the
// Partner NGN Wallet but stay linked to the case that produced them.
//
// Partner fees (e.g. Kingsbridge's own GBP fee) are a separate object and
// settle only to the verified Partner GBP account.

import { useSyncExternalStore } from "react";
import { SOLICITORS, PARTNER_ORG } from "@/lib/partner";
import { canReceivePayout, logPayoutEvent, type PayoutAccountStatus } from "@/lib/payout-security";
import { recordClientPayment, setLinkStatus, settlementBlock } from "@/lib/partner-kyc";

/* ------------------------------------------------------------------ */
/* Currencies & pricing                                                */
/* ------------------------------------------------------------------ */

export type PayoutCurrency = "GBP" | "USD" | "EUR" | "AED" | "CAD";

export const PAYOUT_CURRENCIES: PayoutCurrency[] = ["GBP", "USD", "EUR", "AED", "CAD"];

/** Indicative demo rates: 1 unit of payout currency = X NGN. */
export const NGN_PER_UNIT: Record<PayoutCurrency, number> = {
  GBP: 2148.5,
  USD: 1682.4,
  EUR: 1831.2,
  AED: 458.1,
  CAD: 1229.7,
};

export const CANTA_FEE_PCT = 0.006;
export const QUOTE_MINUTES = 30;

export function currencySymbol(c: PayoutCurrency): string {
  return { GBP: "£", USD: "$", EUR: "€", AED: "AED ", CAD: "C$" }[c];
}

export function formatFx(amount: number, c: PayoutCurrency): string {
  return `${currencySymbol(c)}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatNgn(amount: number): string {
  return `₦${Math.round(amount).toLocaleString()}`;
}

export type Quote = {
  rate: number;
  payoutAmount: number;
  currency: PayoutCurrency;
  feeNgn: number;
  ngnTotal: number;
  createdAt: string;
  expiresAt: string;
};

export function buildQuote(payoutAmount: number, currency: PayoutCurrency): Quote {
  const jitter = 1 + (Math.random() - 0.5) * 0.004;
  const rate = Math.round(NGN_PER_UNIT[currency] * jitter * 100) / 100;
  const base = payoutAmount * rate;
  const feeNgn = Math.round(base * CANTA_FEE_PCT);
  const now = new Date();
  return {
    rate,
    payoutAmount,
    currency,
    feeNgn,
    ngnTotal: Math.round(base + feeNgn),
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + QUOTE_MINUTES * 60_000).toISOString(),
  };
}

export function quoteExpired(q: { expiresAt: string }): boolean {
  return new Date(q.expiresAt).getTime() <= Date.now();
}

/* ------------------------------------------------------------------ */
/* Solicitor payout accounts (by currency)                             */
/* ------------------------------------------------------------------ */

export type SolicitorPayoutAccount = {
  id: string;
  solicitorId: string;
  currency: PayoutCurrency;
  bank: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  iban?: string;
  proof?: string;
  status: PayoutAccountStatus;
  addedAt: string;
};

export type PartnerFeeAccount = {
  id: string;
  label: string;
  currency: "GBP";
  bank: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  status: PayoutAccountStatus;
};

export const PARTNER_FEE_ACCOUNT: PartnerFeeAccount = {
  id: "PFA-GBP-1",
  label: `${PARTNER_ORG.name} — Partner Fee Account`,
  currency: "GBP",
  bank: "Lloyds Bank",
  accountName: `${PARTNER_ORG.name} Ltd`,
  accountNumber: "30948812441907",
  swift: "LOYDGB21",
  status: "Verified",
};

function seedAccounts(): SolicitorPayoutAccount[] {
  const statusFor = (v: string): PayoutAccountStatus =>
    v === "Verified"
      ? "Verified"
      : v === "Re-verification"
        ? "Locked After Change"
        : "Pending Review";
  const base = SOLICITORS.map((s, i) => ({
    id: `SPA-${s.id}-GBP`,
    solicitorId: s.id,
    currency: "GBP" as PayoutCurrency,
    bank: s.bank,
    accountName: s.accountName,
    accountNumber: `GB${(9000000 + i * 137).toString()}${s.id.replace(/\D/g, "")}`,
    swift: s.swift,
    iban: s.iban,
    status: statusFor(s.verified),
    addedAt: "2026-01-12T09:00:00.000Z",
  }));
  // One solicitor also holds a verified USD account, and one an unverified EUR.
  if (base[0]) {
    base.push({
      id: "SPA-SOL-001-USD",
      solicitorId: base[0].solicitorId,
      currency: "USD",
      bank: "Barclays Bank PLC",
      accountName: "Hartwell & Greaves USD Client A/C",
      accountNumber: "US4408112277631",
      swift: "BARCGB22",
      iban: undefined,
      status: "Verified",
      addedAt: "2026-02-02T09:00:00.000Z",
    });
  }
  if (base[1]) {
    base.push({
      id: "SPA-SOL-002-EUR",
      solicitorId: base[1].solicitorId,
      currency: "EUR",
      bank: "HSBC Continental Europe",
      accountName: "Carter & Linton EUR Client Account",
      accountNumber: "IE9988220041123",
      swift: "HBUKGB4B",
      iban: "IE29 AIBK 9311 5212 3456 78",
      status: "Pending Review",
      addedAt: "2026-03-19T09:00:00.000Z",
    });
  }
  return base;
}

/* ------------------------------------------------------------------ */
/* Client Payment Cases                                                */
/* ------------------------------------------------------------------ */

export type PartnerCaseStatus =
  | "Case Created"
  | "Solicitor Selected"
  | "FX Quote Generated"
  | "Payment Link Sent"
  | "Client Viewed"
  | "Awaiting NGN Payment"
  | "NGN Received"
  | "Compliance Review"
  | "FX Conversion"
  | "Solicitor Payout Pending"
  | "Provider Confirmation Pending"
  | "Solicitor Paid"
  | "Receipt Available";

export const PARTNER_CASE_STATUSES: PartnerCaseStatus[] = [
  "Case Created",
  "Solicitor Selected",
  "FX Quote Generated",
  "Payment Link Sent",
  "Client Viewed",
  "Awaiting NGN Payment",
  "NGN Received",
  "Compliance Review",
  "FX Conversion",
  "Solicitor Payout Pending",
  "Provider Confirmation Pending",
  "Solicitor Paid",
  "Receipt Available",
];

export function partnerCaseTone(s: PartnerCaseStatus): string {
  if (s === "Solicitor Paid" || s === "Receipt Available")
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "NGN Received" || s === "FX Conversion" || s === "Solicitor Payout Pending")
    return "bg-blue-100 text-blue-800 border-blue-200";
  if (s === "Compliance Review" || s === "Provider Confirmation Pending")
    return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-muted text-foreground border-border";
}

export type TimelineEntry = { ts: string; label: string; note?: string };

export type ClientPaymentCase = {
  id: string; // PC-2026-0142
  linkId: string; // PL-2026-0142
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  country: string;
  property: string;
  purpose: string;
  notes?: string;
  partnerName: string;
  createdBy: string;
  solicitorId: string;
  solicitorAccountId: string;
  payoutCurrency: PayoutCurrency;
  quote: Quote;
  status: PartnerCaseStatus;
  ngnReceived?: number;
  receivedAt?: string;
  convertedAt?: string;
  paidAt?: string;
  providerRef?: string;
  receiptId?: string;
  createdAt: string;
  timeline: TimelineEntry[];
};

export type PartnerFeePayment = {
  id: string; // PF-2026-0142
  linkId: string;
  clientName: string;
  property: string;
  feeAmount: number;
  currency: "GBP";
  quote: Quote;
  destinationAccountId: string;
  status: PartnerCaseStatus;
  ngnReceived?: number;
  paidAt?: string;
  receiptId?: string;
  createdAt: string;
  timeline: TimelineEntry[];
};

type StoreState = {
  accounts: SolicitorPayoutAccount[];
  cases: ClientPaymentCase[];
  fees: PartnerFeePayment[];
  seq: number;
};

const KEY = "canta:partner:payments:v1";

function seedState(): StoreState {
  return { accounts: seedAccounts(), cases: [], fees: [], seq: 141 };
}

let state: StoreState = seedState();
let hydrated = false;
const subs = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      if (parsed && Array.isArray(parsed.accounts)) state = parsed;
    }
  } catch {
    /* keep seed */
  }
}

function emit() {
  persist();
  subs.forEach((f) => f());
}

export function subscribePartnerPayments(f: () => void) {
  hydrate();
  subs.add(f);
  f();
  return () => {
    subs.delete(f);
  };
}

const serverSnapshot: StoreState = seedState();

export function usePartnerPayments(): StoreState {
  return useSyncExternalStore(
    (f) => subscribePartnerPayments(f),
    () => {
      hydrate();
      return state;
    },
    () => serverSnapshot,
  );
}

/* --------------------------- accounts ---------------------------- */

export function listSolicitorAccounts(): SolicitorPayoutAccount[] {
  hydrate();
  return state.accounts;
}

export function accountsForSolicitor(solicitorId: string): SolicitorPayoutAccount[] {
  return listSolicitorAccounts().filter((a) => a.solicitorId === solicitorId);
}

export function verifiedAccount(
  solicitorId: string,
  currency: PayoutCurrency,
): SolicitorPayoutAccount | undefined {
  return accountsForSolicitor(solicitorId).find(
    (a) => a.currency === currency && canReceivePayout(a.status),
  );
}

export function solicitorCurrencies(solicitorId: string): PayoutCurrency[] {
  return Array.from(new Set(accountsForSolicitor(solicitorId).map((a) => a.currency)));
}

export function currencyBlockMessage(solicitorId: string, currency: PayoutCurrency): string | null {
  if (verifiedAccount(solicitorId, currency)) return null;
  const verified = solicitorCurrencies(solicitorId).filter((c) => verifiedAccount(solicitorId, c));
  const alt = verified.length ? verified.join(" / ") : "another currency";
  return `This solicitor does not have a verified ${currency} account. Add and verify a ${currency} solicitor account or select ${alt}.`;
}

export function addSolicitorAccount(input: {
  solicitorId: string;
  currency: PayoutCurrency;
  bank: string;
  accountName: string;
  accountNumber: string;
  swift: string;
  iban?: string;
  proof?: string;
  actor?: string;
}): SolicitorPayoutAccount {
  hydrate();
  const acct: SolicitorPayoutAccount = {
    id: `SPA-${input.solicitorId}-${input.currency}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    solicitorId: input.solicitorId,
    currency: input.currency,
    bank: input.bank,
    accountName: input.accountName,
    accountNumber: input.accountNumber,
    swift: input.swift,
    iban: input.iban,
    proof: input.proof,
    status: "Pending Review",
    addedAt: new Date().toISOString(),
  };
  state = { ...state, accounts: [...state.accounts, acct] };
  logPayoutEvent({
    action: "Account created",
    workspace: "Partner",
    entity: `${acct.accountName} (${acct.currency})`,
    actor: input.actor,
    next: "Pending Review",
    result: "Pending",
  });
  emit();
  return acct;
}

export function updateSolicitorAccount(
  id: string,
  patch: Partial<
    Pick<SolicitorPayoutAccount, "bank" | "accountName" | "accountNumber" | "swift" | "iban">
  >,
  actor?: string,
) {
  hydrate();
  state = {
    ...state,
    accounts: state.accounts.map((a) =>
      a.id === id ? { ...a, ...patch, status: "Locked After Change" as PayoutAccountStatus } : a,
    ),
  };
  logPayoutEvent({
    action: "Account edited",
    workspace: "Partner",
    entity: id,
    actor,
    next: "Locked After Change",
    result: "Pending",
  });
  emit();
}

export function setSolicitorAccountStatus(
  id: string,
  status: PayoutAccountStatus,
  actor?: string,
  reason?: string,
) {
  hydrate();
  const prev = state.accounts.find((a) => a.id === id)?.status;
  state = {
    ...state,
    accounts: state.accounts.map((a) => (a.id === id ? { ...a, status } : a)),
  };
  logPayoutEvent({
    action:
      status === "Verified" || status === "Active"
        ? "Account approved"
        : status === "Rejected"
          ? "Account rejected"
          : "Account submitted",
    workspace: "Partner",
    entity: id,
    actor,
    previous: prev,
    next: status,
    reason,
  });
  emit();
}

/* ----------------------------- cases ------------------------------ */

function nextRef(): { id: string; linkId: string; feeId: string } {
  const n = String(++state.seq).padStart(4, "0");
  return { id: `PC-2026-${n}`, linkId: `PL-2026-${n}`, feeId: `PF-2026-${n}` };
}

function push(tl: TimelineEntry[], label: string, note?: string): TimelineEntry[] {
  return [...tl, { ts: new Date().toISOString(), label, note }];
}

export function createClientPaymentCase(input: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  country: string;
  property: string;
  purpose: string;
  notes?: string;
  solicitorId: string;
  solicitorAccountId: string;
  payoutCurrency: PayoutCurrency;
  payoutAmount: number;
  createdBy: string;
}): ClientPaymentCase {
  hydrate();
  const ref = nextRef();
  const quote = buildQuote(input.payoutAmount, input.payoutCurrency);
  const now = new Date().toISOString();
  const kase: ClientPaymentCase = {
    id: ref.id,
    linkId: ref.linkId,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    clientPhone: input.clientPhone,
    country: input.country,
    property: input.property,
    purpose: input.purpose,
    notes: input.notes,
    partnerName: PARTNER_ORG.name,
    createdBy: input.createdBy,
    solicitorId: input.solicitorId,
    solicitorAccountId: input.solicitorAccountId,
    payoutCurrency: input.payoutCurrency,
    quote,
    status: "Awaiting NGN Payment",
    createdAt: now,
    timeline: [
      { ts: now, label: "Case Created" },
      { ts: now, label: "Solicitor Selected" },
      {
        ts: now,
        label: "FX Quote Generated",
        note: `Rate 1 ${input.payoutCurrency} = ₦${quote.rate}`,
      },
      { ts: now, label: "Client Payment Link created" },
    ],
  };
  state = { ...state, cases: [kase, ...state.cases] };
  emit();
  return kase;
}

export function getClientPaymentCase(id: string): ClientPaymentCase | undefined {
  hydrate();
  return state.cases.find((c) => c.id === id || c.linkId === id);
}

export function listClientPaymentCases(): ClientPaymentCase[] {
  hydrate();
  return state.cases;
}

function updateCase(id: string, fn: (c: ClientPaymentCase) => ClientPaymentCase) {
  hydrate();
  state = { ...state, cases: state.cases.map((c) => (c.id === id ? fn(c) : c)) };
  emit();
}

export function refreshCaseQuote(id: string) {
  const c = getClientPaymentCase(id);
  if (!c) return;
  const quote = buildQuote(c.quote.payoutAmount, c.payoutCurrency);
  updateCase(id, (k) => ({
    ...k,
    quote,
    timeline: push(k.timeline, "FX quote refreshed", `Rate 1 ${k.payoutCurrency} = ₦${quote.rate}`),
  }));
}

export function markCaseLinkSent(id: string, channel: string) {
  const c = getClientPaymentCase(id);
  if (c) setLinkStatus(c.id, c.linkId, "Sent");
  updateCase(id, (k) => ({
    ...k,
    status: k.status === "Awaiting NGN Payment" ? "Payment Link Sent" : k.status,
    timeline: push(k.timeline, "Payment Link Sent", channel),
  }));
}

export function markCaseLinkViewed(id: string) {
  const c = getClientPaymentCase(id);
  if (!c || c.ngnReceived) return;
  setLinkStatus(c.id, c.linkId, "Viewed");
  if (c.status === "Client Viewed") return;
  updateCase(id, (k) => ({
    ...k,
    status: "Client Viewed",
    timeline: push(k.timeline, "Client Viewed"),
  }));
}

/**
 * Demo-only: the client pays into the case-specific NGN account. Requires
 * consent + identity verification + a generated case account. Payments after
 * expiry, underpayments and overpayments are held for compliance review.
 */
export function simulateClientPayment(
  id: string,
  amountNgn?: number,
): { ok: boolean; error?: string; variance?: string } {
  const c = getClientPaymentCase(id);
  if (!c) return { ok: false, error: "Case not found" };
  const expired = quoteExpired(c.quote);
  const amount = amountNgn ?? c.quote.ngnTotal;
  const res = recordClientPayment({
    caseId: c.id,
    linkId: c.linkId,
    amountNgn: amount,
    expectedNgn: c.quote.ngnTotal,
    quoteExpired: expired,
  });
  if (!res.ok) return { ok: false, error: res.error };
  const now = new Date().toISOString();
  const note =
    res.variance === "After expiry"
      ? "Rate Expired Review — refreshed quote required"
      : res.variance === "Underpaid"
        ? "Partially Paid — conversion blocked"
        : res.variance === "Overpaid"
          ? "Overpaid Review — Ops decision required"
          : undefined;
  updateCase(id, (k) => ({
    ...k,
    status: "Compliance Review",
    ngnReceived: amount,
    receivedAt: now,
    timeline: push(
      push(k.timeline, "NGN Received", `${formatNgn(amount)} into case-linked Partner NGN Wallet`),
      "Compliance Review",
      note,
    ),
  }));
  return { ok: true, variance: res.variance };
}

export function passComplianceAndConvert(id: string): { ok: boolean; error?: string } {
  const c = getClientPaymentCase(id);
  if (!c) return { ok: false, error: "Case not found" };
  const gate = settlementBlock(c.id);
  if (gate) {
    logPayoutEvent({
      action: "Payout blocked",
      workspace: "Partner",
      entity: c.id,
      reason: gate,
      result: "Failed",
    });
    return { ok: false, error: gate };
  }

  const acct = listSolicitorAccounts().find((a) => a.id === c.solicitorAccountId);
  if (!acct || !canReceivePayout(acct.status)) {
    logPayoutEvent({
      action: "Payout blocked",
      workspace: "Partner",
      entity: c.id,
      reason: "Solicitor account not verified",
      result: "Failed",
    });
    return { ok: false, error: "Solicitor payout account is not verified — settlement blocked." };
  }
  setLinkStatus(c.id, c.linkId, "Solicitor Payout Pending");
  updateCase(id, (k) => ({
    ...k,
    status: "Provider Confirmation Pending",
    convertedAt: new Date().toISOString(),
    timeline: push(
      push(
        push(k.timeline, "FX Conversion", `NGN converted to ${k.payoutCurrency}`),
        "Solicitor Payout Pending",
      ),
      "Provider Confirmation Pending",
    ),
  }));
  logPayoutEvent({
    action: "Payout attempted",
    workspace: "Partner",
    entity: `${c.id} → ${acct.accountName}`,
    result: "Pending",
  });
  return { ok: true };
}

/** Demo-only: provider confirms the solicitor payout; unlocks the receipt. */
export function simulateProviderConfirmation(id: string): { ok: boolean; error?: string } {
  const c = getClientPaymentCase(id);
  if (!c) return { ok: false, error: "Case not found" };
  if (c.status !== "Provider Confirmation Pending")
    return { ok: false, error: "Payout has not been submitted to the provider yet." };
  const ref = `PRV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  setLinkStatus(c.id, c.linkId, "Receipt Available");
  updateCase(id, (k) => ({
    ...k,
    status: "Receipt Available",
    paidAt: new Date().toISOString(),
    providerRef: ref,
    receiptId: `RCP-${k.id}`,
    timeline: push(push(k.timeline, "Solicitor Paid", ref), "Receipt Available"),
  }));
  logPayoutEvent({
    action: "Payout confirmed",
    workspace: "Partner",
    entity: `${c.id} · ${ref}`,
    result: "Success",
  });
  return { ok: true };
}

/* --------------------------- partner fee -------------------------- */

export function createPartnerFeePayment(input: {
  clientName: string;
  property: string;
  feeAmount: number;
}): PartnerFeePayment {
  hydrate();
  const ref = nextRef();
  const quote = buildQuote(input.feeAmount, "GBP");
  const now = new Date().toISOString();
  const fee: PartnerFeePayment = {
    id: ref.feeId,
    linkId: ref.linkId,
    clientName: input.clientName,
    property: input.property,
    feeAmount: input.feeAmount,
    currency: "GBP",
    quote,
    destinationAccountId: PARTNER_FEE_ACCOUNT.id,
    status: "Awaiting NGN Payment",
    createdAt: now,
    timeline: [
      { ts: now, label: "Partner fee payment created" },
      { ts: now, label: "FX Quote Generated", note: `Rate 1 GBP = ₦${quote.rate}` },
    ],
  };
  state = { ...state, fees: [fee, ...state.fees] };
  emit();
  return fee;
}

export function listPartnerFeePayments(): PartnerFeePayment[] {
  hydrate();
  return state.fees;
}

export function getPartnerFeePayment(id: string): PartnerFeePayment | undefined {
  hydrate();
  return state.fees.find((f) => f.id === id || f.linkId === id);
}

function updateFee(id: string, fn: (f: PartnerFeePayment) => PartnerFeePayment) {
  hydrate();
  state = { ...state, fees: state.fees.map((f) => (f.id === id ? fn(f) : f)) };
  emit();
}

export function simulateFeePayment(id: string): { ok: boolean; error?: string } {
  const f = getPartnerFeePayment(id);
  if (!f) return { ok: false, error: "Fee payment not found" };
  if (quoteExpired(f.quote))
    return { ok: false, error: "Quote expired — refresh the quote before payment." };
  if (!canReceivePayout(PARTNER_FEE_ACCOUNT.status))
    return { ok: false, error: "Partner GBP account is not verified — settlement blocked." };
  updateFee(id, (k) => ({
    ...k,
    status: "Provider Confirmation Pending",
    ngnReceived: k.quote.ngnTotal,
    timeline: push(push(k.timeline, "NGN Received"), "Provider Confirmation Pending"),
  }));
  return { ok: true };
}

export function confirmFeePayment(id: string): { ok: boolean; error?: string } {
  const f = getPartnerFeePayment(id);
  if (!f) return { ok: false, error: "Fee payment not found" };
  if (f.status !== "Provider Confirmation Pending")
    return { ok: false, error: "No client payment received yet." };
  updateFee(id, (k) => ({
    ...k,
    status: "Receipt Available",
    paidAt: new Date().toISOString(),
    receiptId: `RCP-${k.id}`,
    timeline: push(k.timeline, "Partner fee settled to Partner GBP account"),
  }));
  logPayoutEvent({
    action: "Payout confirmed",
    workspace: "Partner",
    entity: `${f.id} · Partner fee`,
    result: "Success",
  });
  return { ok: true };
}

export function refreshFeeQuote(id: string) {
  const f = getPartnerFeePayment(id);
  if (!f) return;
  updateFee(id, (k) => ({
    ...k,
    quote: buildQuote(k.feeAmount, "GBP"),
    timeline: push(k.timeline, "FX quote refreshed"),
  }));
}

/* ------------------------- partner NGN wallet ---------------------- */

export type PartnerWalletSummary = {
  balanceNgn: number;
  pendingClientPayments: number;
  pendingClientPaymentsNgn: number;
  awaitingConversionNgn: number;
  convertedNgn: number;
  settlementPending: number;
  solicitorPaid: number;
  solicitorPaidThisMonth: number;
  activeCases: number;
  feesPending: number;
  feesReceivedGbp: number;
  byCase: {
    caseId: string;
    clientName: string;
    solicitorId: string;
    ngn: number;
    status: PartnerCaseStatus;
  }[];
};

export function partnerWalletSummary(
  cases: ClientPaymentCase[],
  fees: PartnerFeePayment[],
): PartnerWalletSummary {
  const received = cases.filter((c) => !!c.ngnReceived);
  const awaiting = cases.filter((c) => !c.ngnReceived);
  const held = received.filter((c) => c.status === "Compliance Review");
  const converted = received.filter((c) => c.status !== "Compliance Review");
  const paid = received.filter(
    (c) => c.status === "Solicitor Paid" || c.status === "Receipt Available",
  );
  const month = new Date().getMonth();
  return {
    balanceNgn: held.reduce((s, c) => s + (c.ngnReceived ?? 0), 0),
    pendingClientPayments: awaiting.length,
    pendingClientPaymentsNgn: awaiting.reduce((s, c) => s + c.quote.ngnTotal, 0),
    awaitingConversionNgn: held.reduce((s, c) => s + (c.ngnReceived ?? 0), 0),
    convertedNgn: converted.reduce((s, c) => s + (c.ngnReceived ?? 0), 0),
    settlementPending: received.filter((c) => c.status === "Provider Confirmation Pending").length,
    solicitorPaid: paid.length,
    solicitorPaidThisMonth: paid.filter((c) => c.paidAt && new Date(c.paidAt).getMonth() === month)
      .length,
    activeCases: cases.filter((c) => c.status !== "Receipt Available").length,
    feesPending: fees.filter((f) => f.status !== "Receipt Available").length,
    feesReceivedGbp: fees
      .filter((f) => f.status === "Receipt Available")
      .reduce((s, f) => s + f.feeAmount, 0),
    byCase: received.map((c) => ({
      caseId: c.id,
      clientName: c.clientName,
      solicitorId: c.solicitorId,
      ngn: c.ngnReceived ?? 0,
      status: c.status,
    })),
  };
}

/* ---------------------------- messaging ---------------------------- */

export function paymentLinkUrl(linkId: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/pay/partner/${linkId}`;
}

export function clientEmailMessage(c: ClientPaymentCase, firmName: string): string {
  return [
    `Subject: Property payment instruction — ${c.property} (${c.id})`,
    "",
    `Dear ${c.clientName},`,
    "",
    `${c.partnerName} has prepared your property payment for ${c.property}.`,
    `Solicitor: ${firmName}`,
    `Solicitor receives: ${formatFx(c.quote.payoutAmount, c.payoutCurrency)}`,
    `You pay: ${formatNgn(c.quote.ngnTotal)}`,
    `FX rate: 1 ${c.payoutCurrency} = ₦${c.quote.rate}`,
    `Quote expires: ${new Date(c.quote.expiresAt).toLocaleString()}`,
    "",
    `Pay securely here: ${paymentLinkUrl(c.linkId)}`,
    "",
    "Pay the NGN amount before the quote expires. If payment is received after expiry, Canta may require a refreshed quote.",
    "",
    `${c.partnerName}`,
  ].join("\n");
}

export function clientWhatsAppMessage(c: ClientPaymentCase, firmName: string): string {
  return [
    `Hello ${c.clientName}, this is ${c.partnerName}.`,
    `Your property payment for ${c.property} is ready.`,
    `Solicitor: ${firmName} — receives ${formatFx(c.quote.payoutAmount, c.payoutCurrency)}.`,
    `You pay ${formatNgn(c.quote.ngnTotal)} (1 ${c.payoutCurrency} = ₦${c.quote.rate}).`,
    `Pay here: ${paymentLinkUrl(c.linkId)}`,
    "Please pay before the quote expires.",
  ].join(" ");
}
