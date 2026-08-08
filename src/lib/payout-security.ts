// Shared payout-account security model used by every Canta workspace.
// A payout account (supplier RMB bank, importer supplier bank, partner
// solicitor account, treasury beneficiary) is a high-risk financial object:
// it can only receive money once it is Verified/Active.

import { addAuditEntry, getAuditEntries, subscribeAudit } from "@/lib/treasury-audit";
import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------ */
/* Status model                                                        */
/* ------------------------------------------------------------------ */

export type PayoutAccountStatus =
  | "Draft"
  | "Submitted"
  | "Pending Review"
  | "More Info Required"
  | "Verified"
  | "Active"
  | "Rejected"
  | "Locked After Change"
  | "Disabled";

export const PAYOUT_ACCOUNT_STATUSES: PayoutAccountStatus[] = [
  "Draft",
  "Submitted",
  "Pending Review",
  "More Info Required",
  "Verified",
  "Active",
  "Rejected",
  "Locked After Change",
  "Disabled",
];

export const PAYOUT_STATUS_TONE: Record<PayoutAccountStatus, string> = {
  Draft: "bg-muted text-foreground",
  Submitted: "bg-blue-100 text-blue-800",
  "Pending Review": "bg-amber-100 text-amber-800",
  "More Info Required": "bg-amber-100 text-amber-800",
  Verified: "bg-emerald-100 text-emerald-800",
  Active: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-destructive/10 text-destructive",
  "Locked After Change": "bg-destructive/10 text-destructive",
  Disabled: "bg-muted text-muted-foreground",
};

/** Only Verified/Active accounts may receive settlement, payout or bulk payout. */
export function canReceivePayout(status: PayoutAccountStatus | string): boolean {
  return status === "Verified" || status === "Active";
}

export function payoutBlockReason(status: PayoutAccountStatus | string): string | null {
  if (canReceivePayout(status)) return null;
  switch (status) {
    case "Locked After Change":
      return "Account details changed — payouts are paused until Canta re-verifies this account.";
    case "Rejected":
      return "This account was rejected and cannot receive payouts.";
    case "Disabled":
      return "This account is disabled and cannot receive payouts.";
    case "More Info Required":
      return "More information is required before this account can receive payouts.";
    default:
      return "This account is awaiting verification and cannot receive payouts yet.";
  }
}

/* ------------------------------------------------------------------ */
/* Masking                                                             */
/* ------------------------------------------------------------------ */

export function maskAccountNumber(n: string): string {
  const clean = (n ?? "").replace(/\s+/g, "");
  if (clean.length <= 4) return clean || "—";
  return `**** **** ${clean.slice(-4)}`;
}

export function maskedSummary(n: string): string {
  return maskAccountNumber(n);
}

/* ------------------------------------------------------------------ */
/* Audit trail                                                         */
/* ------------------------------------------------------------------ */

export type PayoutAuditAction =
  | "Account created"
  | "Account edited"
  | "Account submitted"
  | "Account approved"
  | "Account rejected"
  | "Account locked"
  | "Account set as default"
  | "Bank account details revealed"
  | "Automatic Convert paused"
  | "Automatic Convert resumed"
  | "Payout attempted"
  | "Payout blocked"
  | "Payout confirmed"
  | "More information requested";

export type SecurityWorkspace = "Supplier" | "Importer" | "Partner" | "Treasury" | "Ops";

export function logPayoutEvent(input: {
  action: PayoutAuditAction;
  workspace: SecurityWorkspace;
  entity: string;
  actor?: string;
  role?: string;
  reason?: string;
  previous?: string;
  next?: string;
  result?: "Success" | "Pending" | "Failed";
}) {
  const device = "Demo device · IP 198.51.100.24";
  const parts = [
    `role=${input.role ?? "Admin"}`,
    input.previous ? `prev=${input.previous}` : null,
    input.next ? `new=${input.next}` : null,
    input.reason ? `reason=${input.reason}` : null,
    device,
  ].filter(Boolean);
  return addAuditEntry({
    actor: input.actor ?? "Demo Admin",
    workspace: input.workspace,
    action: input.action,
    entity: input.entity,
    result: input.result ?? "Success",
    detail: parts.join(" · "),
  });
}

export function usePayoutAudit() {
  return useSyncExternalStore(
    subscribeAudit,
    getAuditEntries,
    () => [] as ReturnType<typeof getAuditEntries>,
  );
}

/* ------------------------------------------------------------------ */
/* Ops review queue                                                    */
/* ------------------------------------------------------------------ */

export type ReviewItem = {
  id: string;
  workspace: SecurityWorkspace;
  business: string;
  accountHolder: string;
  bank: string;
  currency: string;
  accountNumber: string;
  submittedBy: string;
  submittedAt: string;
  documents: string[];
  nameMatch: "Match" | "Partial match" | "Mismatch";
  riskFlags: string[];
  previousChanges: number;
  linkedRef: string;
  status: PayoutAccountStatus;
  note?: string;
};

const today = () => new Date().toISOString().slice(0, 10);

let QUEUE: ReviewItem[] = [
  {
    id: "PAR-2001",
    workspace: "Supplier",
    business: "Guangzhou Tech Factory Co., Ltd",
    accountHolder: "Guangzhou Tech Factory Co., Ltd",
    bank: "Bank of China — Guangdong Branch",
    currency: "USD",
    accountNumber: "6217000000009012",
    submittedBy: "Supplier admin (Li Wei)",
    submittedAt: "2026-08-05",
    documents: ["bank-confirmation.pdf"],
    nameMatch: "Match",
    riskFlags: ["First account in this currency"],
    previousChanges: 0,
    linkedRef: "INV-2041",
    status: "Pending Review",
  },
  {
    id: "PAR-2002",
    workspace: "Partner",
    business: "Kingsbridge Property Partners",
    accountHolder: "Harcourt & Wells LLP Client Account",
    bank: "Demo Bank UK",
    currency: "GBP",
    accountNumber: "20114412",
    submittedBy: "Partner admin",
    submittedAt: "2026-08-06",
    documents: ["engagement-letter.pdf"],
    nameMatch: "Partial match",
    riskFlags: ["Client funds account", "Awaiting solicitor confirmation"],
    previousChanges: 1,
    linkedRef: "KPP-2026-0142",
    status: "Pending Review",
  },
  {
    id: "PAR-2003",
    workspace: "Treasury",
    business: "Canta Enterprise Treasury",
    accountHolder: "Tailwind Logistics LLC",
    bank: "Demo Bank NA",
    currency: "USD",
    accountNumber: "10000000003391",
    submittedBy: "Treasury operator",
    submittedAt: "2026-08-07",
    documents: [],
    nameMatch: "Match",
    riskFlags: ["No supporting document"],
    previousChanges: 0,
    linkedRef: "BEN-1006",
    status: "Pending Review",
  },
];

let qSeq = 2004;
const qSubs = new Set<() => void>();
const notifyQueue = () => qSubs.forEach((f) => f());

export const payoutReviewQueue = {
  list: () => QUEUE,
  add: (
    item: Omit<ReviewItem, "id" | "submittedAt" | "status"> & { status?: PayoutAccountStatus },
  ) => {
    const full: ReviewItem = {
      id: `PAR-${qSeq++}`,
      submittedAt: today(),
      status: item.status ?? "Pending Review",
      ...item,
    };
    QUEUE = [full, ...QUEUE];
    notifyQueue();
    logPayoutEvent({
      action: "Account submitted",
      workspace: item.workspace,
      entity: `${full.id} · ${maskAccountNumber(full.accountNumber)}`,
      actor: full.submittedBy,
      next: maskAccountNumber(full.accountNumber),
      result: "Pending",
    });
    return full;
  },
  setStatus: (id: string, status: PayoutAccountStatus, reason?: string) => {
    const item = QUEUE.find((q) => q.id === id);
    if (!item) return;
    QUEUE = QUEUE.map((q) => (q.id === id ? { ...q, status, note: reason ?? q.note } : q));
    notifyQueue();
    const action: PayoutAuditAction =
      status === "Verified" || status === "Active"
        ? "Account approved"
        : status === "Rejected"
          ? "Account rejected"
          : status === "Locked After Change"
            ? "Account locked"
            : status === "More Info Required"
              ? "More information requested"
              : "Account edited";
    logPayoutEvent({
      action,
      workspace: "Ops",
      entity: `${item.id} · ${item.accountHolder}`,
      actor: "Canta Ops",
      role: "Ops reviewer",
      previous: item.status,
      next: status,
      ...(reason ? { reason } : {}),
    });
  },
  subscribe: (f: () => void) => {
    qSubs.add(f);
    return () => qSubs.delete(f);
  },
};

export function usePayoutReviewQueue() {
  return useSyncExternalStore(
    payoutReviewQueue.subscribe,
    payoutReviewQueue.list,
    payoutReviewQueue.list,
  );
}

/* ------------------------------------------------------------------ */
/* Account-change alerts                                               */
/* ------------------------------------------------------------------ */

export function accountChangeAlert(name: string) {
  return `A payout account was added or changed for ${name}. Payouts are paused until Canta verifies the account.`;
}

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export const SECURITY_COPY = {
  supplier: "Canta only pays RMB to verified bank accounts owned by your business.",
  supplierAutoConvertBlocked:
    "Automatic Convert is blocked until your RMB bank account is verified.",
  partner:
    "Solicitor payout accounts must be confirmed and verified before client funds can be released.",
  treasury:
    "Bulk Payout only uses verified saved beneficiaries in the same currency as the source wallet.",
  importer:
    "Supplier bank details are reviewed before payout. Your supplier does not need a Canta account.",
  stepUp: "For security, Canta requires confirmation before changing payout details.",
};
