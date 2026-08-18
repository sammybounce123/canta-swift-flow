// Consent-first identity verification for Partner Mode client payment cases.
//
// Compliance model (NDPA / CBN KYC):
//  - The partner salesperson may only enter basic case data and, optionally,
//    an ID *type* plus the last 4 characters of a reference. No selfie,
//    passport or full BVN/NIN may originate from the salesperson.
//  - The client must personally consent from the secure payment link before
//    any identity data is collected or processed.
//  - The case-specific NGN funding account is generated only after consent
//    plus identity validation (or an explicit Ops compliance approval).
//  - Raw BVN/NIN/passport/selfie are never stored. Only masked references
//    and mock provider results are kept in the demo store.

import { useSyncExternalStore } from "react";

export const CONSENT_TEXT_VERSION = "v1.0 (2026-08)";
export const PRIVACY_POLICY_VERSION = "v1.0 (2026-08)";
export const RETENTION_PERIOD = "7 years after settlement (regulatory record-keeping)";

export const CONSENT_TEXT =
  "I confirm that I am the person named on this payment request. I consent to Baron & Cabot sharing my details with Canta, and I consent to Canta collecting, storing, verifying, and processing my personal data, including BVN/NIN/passport/selfie where required, for identity verification, compliance checks, payment processing, transaction monitoring, and regulatory record-keeping.";

export type LinkStatus =
  | "Created"
  | "Sent"
  | "Viewed"
  | "Consent Pending"
  | "Identity Pending"
  | "Identity Verified"
  | "Account Generated"
  | "Awaiting NGN Payment"
  | "Paid"
  | "Quote Expired"
  | "Compliance Review"
  | "Converted"
  | "Solicitor Payout Pending"
  | "Solicitor Paid"
  | "Receipt Available";

export type IdentityStatus =
  | "Identity Pending"
  | "Identity Submitted"
  | "Identity Verified"
  | "Name Mismatch Review"
  | "More Info Required"
  | "Identity Rejected";

export type IdMethod = "BVN" | "NIN" | "Passport";

export type ConsentRecord = {
  paymentLinkId: string;
  caseId: string;
  clientName: string;
  contact: string;
  timestamp: string;
  ipPlaceholder: string;
  userAgent: string;
  consentTextVersion: string;
  privacyPolicyVersion: string;
  fields: string[];
  purpose: string;
};

export type IdentityRecord = {
  method: IdMethod;
  maskedRef: string; // never the full value
  passportCountry?: string;
  passportExpiry?: string;
  dob?: string;
  address?: string;
  sourceOfFunds?: string;
  providerName: string; // name returned by the mock verification provider
  selfieRef: string; // mock provider reference, never the image
  selfieResult: "Pending" | "Passed" | "Failed";
  status: IdentityStatus;
  attempts: number;
  submittedAt: string;
};

export type CaseFundingAccount = {
  bank: string;
  accountName: string;
  accountNumber: string;
  reference: string;
  amountNgn: number;
  expiresAt: string;
  generatedAt: string;
  singleUse: true;
};

export type ComplianceTrigger =
  | "Name mismatch"
  | "BVN/NIN/passport mismatch"
  | "Selfie/liveness failed"
  | "Sanctions/PEP flag"
  | "High-value payment"
  | "New client"
  | "New solicitor account"
  | "Payment after quote expiry"
  | "Underpayment"
  | "Overpayment"
  | "Third-party funding"
  | "Multiple failed verification attempts"
  | "Reused BVN/NIN across unrelated clients";

export type ComplianceFlag = {
  id: string;
  caseId: string;
  ts: string;
  trigger: ComplianceTrigger;
  note?: string;
  state: "Open" | "Approved" | "Rejected" | "More Info Required" | "Escalated";
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
};

export type PartnerIdHint = {
  method: IdMethod;
  last4: string;
  assistedCapture: boolean;
  note: "Partner Provided — Awaiting Client Consent";
};

export type PaymentRecord = {
  amountNgn: number;
  receivedAt: string;
  variance: "Exact" | "Underpaid" | "Overpaid" | "After expiry";
};

export type CaseKyc = {
  caseId: string;
  linkId: string;
  linkStatus: LinkStatus;
  idHint?: PartnerIdHint;
  consent?: ConsentRecord;
  identity?: IdentityRecord;
  account?: CaseFundingAccount;
  payment?: PaymentRecord;
  flags: ComplianceFlag[];
  locked?: boolean;
};

type KycState = Record<string, CaseKyc>;

const KEY = "canta:partner:kyc:v1";

let state: KycState = {};
let hydrated = false;
const subs = new Set<() => void>();
const serverSnapshot: KycState = {};

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as KycState;
  } catch {
    /* keep empty */
  }
}

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }
  subs.forEach((f) => f());
}

export function subscribeKyc(f: () => void) {
  hydrate();
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

export function useKycState(): KycState {
  return useSyncExternalStore(
    subscribeKyc,
    () => {
      hydrate();
      return state;
    },
    () => serverSnapshot,
  );
}

export function getKyc(caseId: string, linkId = caseId): CaseKyc {
  hydrate();
  return state[caseId] ?? { caseId, linkId, linkStatus: "Created", flags: [] };
}

function write(caseId: string, next: CaseKyc) {
  hydrate();
  state = { ...state, [caseId]: next };
  emit();
}

export function setLinkStatus(caseId: string, linkId: string, status: LinkStatus) {
  const k = getKyc(caseId, linkId);
  if (k.linkStatus === status) return;
  write(caseId, { ...k, linkId, linkStatus: status });
}

export function setPartnerIdHint(
  caseId: string,
  linkId: string,
  hint: { method: IdMethod; last4: string; assistedCapture: boolean },
) {
  const k = getKyc(caseId, linkId);
  write(caseId, {
    ...k,
    linkId,
    idHint: {
      method: hint.method,
      last4: hint.last4.slice(-4),
      assistedCapture: hint.assistedCapture,
      note: "Partner Provided — Awaiting Client Consent",
    },
  });
}

/* ------------------------------ masking ---------------------------- */

export function maskIdRef(value: string): string {
  const v = value.replace(/\s/g, "");
  if (v.length <= 4) return `••••${v}`;
  return `${"•".repeat(Math.max(3, v.length - 4))}${v.slice(-4)}`;
}

/* ------------------------------ consent ---------------------------- */

export function recordConsent(input: {
  caseId: string;
  linkId: string;
  clientName: string;
  contact: string;
}): ConsentRecord {
  const k = getKyc(input.caseId, input.linkId);
  const consent: ConsentRecord = {
    paymentLinkId: input.linkId,
    caseId: input.caseId,
    clientName: input.clientName,
    contact: input.contact,
    timestamp: new Date().toISOString(),
    ipPlaceholder: "203.0.113.— (demo placeholder)",
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 120) : "demo-user-agent",
    consentTextVersion: CONSENT_TEXT_VERSION,
    privacyPolicyVersion: PRIVACY_POLICY_VERSION,
    fields: ["Name", "Email/phone", "BVN/NIN/passport", "Selfie/liveness", "Payment details"],
    purpose:
      "Identity verification, compliance screening, payment processing, transaction monitoring, regulatory record-keeping",
  };
  write(input.caseId, { ...k, linkId: input.linkId, consent, linkStatus: "Identity Pending" });
  return consent;
}

/* ---------------------------- identity ----------------------------- */

export type IdentityOutcome = "match" | "mismatch" | "selfie-fail" | "sanctions";

export function submitIdentity(input: {
  caseId: string;
  linkId: string;
  clientName: string;
  method: IdMethod;
  reference: string;
  passportCountry?: string;
  passportExpiry?: string;
  dob?: string;
  address?: string;
  sourceOfFunds?: string;
  outcome: IdentityOutcome;
}): { ok: boolean; status: IdentityStatus; error?: string } {
  const k = getKyc(input.caseId, input.linkId);
  if (!k.consent)
    return {
      ok: false,
      status: "Identity Pending",
      error: "Consent is required before identity verification.",
    };

  const attempts = (k.identity?.attempts ?? 0) + 1;
  const providerName =
    input.outcome === "mismatch" ? mismatchName(input.clientName) : input.clientName;
  const selfieResult: IdentityRecord["selfieResult"] =
    input.outcome === "selfie-fail" ? "Failed" : "Passed";

  let status: IdentityStatus = "Identity Verified";
  const flags: ComplianceFlag[] = [];
  if (input.outcome === "mismatch") {
    status = "Name Mismatch Review";
    flags.push(makeFlag(input.caseId, "Name mismatch", `Provider returned "${providerName}"`));
  } else if (input.outcome === "selfie-fail") {
    status = "Identity Rejected";
    flags.push(makeFlag(input.caseId, "Selfie/liveness failed"));
  } else if (input.outcome === "sanctions") {
    status = "More Info Required";
    flags.push(makeFlag(input.caseId, "Sanctions/PEP flag", "Screening hit — manual review"));
  }
  if (attempts >= 3 && status !== "Identity Verified") {
    flags.push(makeFlag(input.caseId, "Multiple failed verification attempts"));
  }

  const identity: IdentityRecord = {
    method: input.method,
    maskedRef: maskIdRef(input.reference),
    passportCountry: input.passportCountry,
    passportExpiry: input.passportExpiry,
    dob: input.dob,
    address: input.address,
    sourceOfFunds: input.sourceOfFunds,
    providerName,
    selfieRef: `SELFIE-REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    selfieResult,
    status,
    attempts,
    submittedAt: new Date().toISOString(),
  };

  write(input.caseId, {
    ...k,
    linkId: input.linkId,
    identity,
    flags: [...k.flags, ...flags],
    linkStatus: status === "Identity Verified" ? "Identity Verified" : "Compliance Review",
  });
  return { ok: status === "Identity Verified", status };
}

function mismatchName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[parts.length - 1]} Adebayo` : `${name} Adebayo`;
}

function makeFlag(caseId: string, trigger: ComplianceTrigger, note?: string): ComplianceFlag {
  return {
    id: `CF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    caseId,
    ts: new Date().toISOString(),
    trigger,
    note,
    state: "Open",
  };
}

export function raiseFlag(
  caseId: string,
  linkId: string,
  trigger: ComplianceTrigger,
  note?: string,
) {
  const k = getKyc(caseId, linkId);
  write(caseId, { ...k, linkId, flags: [...k.flags, makeFlag(caseId, trigger, note)] });
}

export function hasOpenFlags(caseId: string): boolean {
  return getKyc(caseId).flags.some((f) => f.state === "Open" || f.state === "Escalated");
}

export function listAllFlags(): ComplianceFlag[] {
  hydrate();
  return Object.values(state)
    .flatMap((k) => k.flags)
    .sort((a, b) => b.ts.localeCompare(a.ts));
}

export function decideFlag(
  caseId: string,
  flagId: string,
  state_: ComplianceFlag["state"],
  decidedBy: string,
  reason?: string,
) {
  const k = getKyc(caseId);
  write(caseId, {
    ...k,
    flags: k.flags.map((f) =>
      f.id === flagId
        ? { ...f, state: state_, decidedBy, decidedAt: new Date().toISOString(), reason }
        : f,
    ),
  });
}

/** Ops override: accept a reviewed identity so the case can proceed. */
export function opsAcceptIdentity(caseId: string, decidedBy: string) {
  const k = getKyc(caseId);
  if (!k.identity) return;
  write(caseId, {
    ...k,
    identity: { ...k.identity, status: "Identity Verified" },
    flags: k.flags.map((f) =>
      f.state === "Open"
        ? { ...f, state: "Approved", decidedBy, decidedAt: new Date().toISOString() }
        : f,
    ),
    linkStatus: "Identity Verified",
  });
}

export function lockCase(caseId: string, locked = true) {
  const k = getKyc(caseId);
  write(caseId, { ...k, locked });
}

/* ------------------------ funding account -------------------------- */

export function accountGenerationBlock(
  caseId: string,
  linkId: string,
  opts: { quoteExpired: boolean; solicitorVerified: boolean },
): string | null {
  const k = getKyc(caseId, linkId);
  if (k.locked) return "This payment case is locked by Canta Compliance.";
  if (!k.consent) return "Client consent is required before an account can be generated.";
  if (!k.identity) return "Identity verification must be submitted before account generation.";
  if (k.identity.status !== "Identity Verified")
    return "Identity is under review. Canta Compliance must approve before the account is generated.";
  if (opts.quoteExpired) return "Quote expired — a refreshed quote is required.";
  if (!opts.solicitorVerified) return "Solicitor payout account is not verified.";
  return null;
}

export function generateCaseAccount(input: {
  caseId: string;
  linkId: string;
  clientName: string;
  partnerName: string;
  amountNgn: number;
  expiresAt: string;
  quoteExpired: boolean;
  solicitorVerified: boolean;
}): { ok: boolean; error?: string; account?: CaseFundingAccount } {
  const block = accountGenerationBlock(input.caseId, input.linkId, {
    quoteExpired: input.quoteExpired,
    solicitorVerified: input.solicitorVerified,
  });
  if (block) return { ok: false, error: block };
  const k = getKyc(input.caseId, input.linkId);
  if (k.account) return { ok: true, account: k.account };

  const initials = input.clientName
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);
  const digits = `${input.caseId}${input.linkId}`.replace(/\D/g, "");
  const account: CaseFundingAccount = {
    bank: "Providus Bank (Canta case account)",
    accountName: `CANTA / ${input.partnerName.toUpperCase()} / ${initials}`,
    accountNumber: `99${digits.slice(-8).padStart(8, "0")}`,
    reference: input.caseId,
    amountNgn: input.amountNgn,
    expiresAt: input.expiresAt,
    generatedAt: new Date().toISOString(),
    singleUse: true,
  };
  write(input.caseId, {
    ...k,
    linkId: input.linkId,
    account,
    linkStatus: "Awaiting NGN Payment",
  });
  return { ok: true, account };
}

/* ----------------------------- payment ----------------------------- */

export function recordClientPayment(input: {
  caseId: string;
  linkId: string;
  amountNgn: number;
  expectedNgn: number;
  quoteExpired: boolean;
}): { ok: boolean; error?: string; variance: PaymentRecord["variance"] } {
  const k = getKyc(input.caseId, input.linkId);
  if (!k.account)
    return {
      ok: false,
      error: "No case account has been generated yet.",
      variance: "Exact",
    };
  let variance: PaymentRecord["variance"] = "Exact";
  const flags: ComplianceFlag[] = [];
  if (input.quoteExpired) {
    variance = "After expiry";
    flags.push(
      makeFlag(
        input.caseId,
        "Payment after quote expiry",
        "Conversion held — refreshed quote required",
      ),
    );
  } else if (input.amountNgn < input.expectedNgn) {
    variance = "Underpaid";
    flags.push(
      makeFlag(
        input.caseId,
        "Underpayment",
        `Outstanding ₦${Math.round(input.expectedNgn - input.amountNgn).toLocaleString()}`,
      ),
    );
  } else if (input.amountNgn > input.expectedNgn) {
    variance = "Overpaid";
    flags.push(
      makeFlag(
        input.caseId,
        "Overpayment",
        `Excess ₦${Math.round(input.amountNgn - input.expectedNgn).toLocaleString()}`,
      ),
    );
  }
  if (input.expectedNgn >= 100_000_000) {
    flags.push(makeFlag(input.caseId, "High-value payment", "Enhanced due diligence"));
  }
  write(input.caseId, {
    ...k,
    linkId: input.linkId,
    payment: { amountNgn: input.amountNgn, receivedAt: new Date().toISOString(), variance },
    flags: [...k.flags, ...flags],
    linkStatus: variance === "Exact" ? "Paid" : "Compliance Review",
  });
  return { ok: true, variance };
}

/** Settlement gate used by the payment store before conversion/payout. */
export function settlementBlock(caseId: string): string | null {
  const k = getKyc(caseId);
  if (k.locked) return "Payment case is locked by Canta Compliance.";
  if (!k.consent) return "Client has not consented — settlement blocked.";
  if (!k.identity || k.identity.status !== "Identity Verified")
    return "Client identity is not verified — settlement blocked.";
  if (!k.payment) return "No client NGN payment received yet.";
  if (k.payment.variance === "After expiry")
    return "Payment was received after the quote expired. A refreshed quote is required before conversion.";
  if (k.payment.variance === "Underpaid") return "Client underpaid — conversion blocked.";
  if (k.payment.variance === "Overpaid") return "Overpayment review required before conversion.";
  if (k.flags.some((f) => f.state === "Open" || f.state === "Escalated"))
    return "Open compliance review items must be resolved first.";
  return null;
}
