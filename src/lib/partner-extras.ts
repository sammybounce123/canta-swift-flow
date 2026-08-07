// Extensions layered on top of partner-store: solicitor verification state,
// commission ledger, document audit trail, and partner settings (commissions toggle).
// All client-only, persisted to localStorage.

import type { PartnerRole } from "./partner";

const CHANGE_EVENT = "partner-extras-change";
function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function subscribeExtras(fn: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, fn);
  return () => window.removeEventListener(CHANGE_EVENT, fn);
}
function uid(p: string) {
  return `${p}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
function now() {
  return new Date().toISOString();
}

/* ---------- Settings ---------- */
export type PartnerSettings = {
  commissionsEnabled: boolean;
  marketerSeesOwnCommission: boolean;
  hideBVNFromPartner: boolean;
  requireAdminApprovalForBankEdit: boolean;
};
const SETTINGS_KEY = "canta:partner:settings:v1";
const DEFAULT_SETTINGS: PartnerSettings = {
  commissionsEnabled: true,
  marketerSeesOwnCommission: true,
  hideBVNFromPartner: true,
  requireAdminApprovalForBankEdit: true,
};
export function getSettings(): PartnerSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
export function setSetting<K extends keyof PartnerSettings>(k: K, v: PartnerSettings[K]) {
  const next = { ...getSettings(), [k]: v };
  if (typeof window !== "undefined")
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  emit();
}

/* ---------- Solicitor verification state ---------- */
export type SolicitorVStatus =
  | "Draft"
  | "Pending Verification"
  | "Verified"
  | "More Info Required"
  | "Rejected"
  | "Suspended";
export const SOLICITOR_STATUSES: SolicitorVStatus[] = [
  "Draft",
  "Pending Verification",
  "Verified",
  "More Info Required",
  "Rejected",
  "Suspended",
];
const SOL_KEY = "canta:partner:sol-state:v1";
type SolState = Record<
  string,
  { status: SolicitorVStatus; pinned: boolean; lastVerifiedAt?: string }
>;
function readSol(): SolState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SOL_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeSol(s: SolState) {
  if (typeof window !== "undefined") window.localStorage.setItem(SOL_KEY, JSON.stringify(s));
  emit();
}
export function getSolicitorState(id: string, seed: { verified: string; preferred: boolean }) {
  const all = readSol();
  if (all[id]) return all[id];
  const status: SolicitorVStatus =
    seed.verified === "Verified"
      ? "Verified"
      : seed.verified === "Pending"
        ? "Pending Verification"
        : "More Info Required";
  return {
    status,
    pinned: seed.preferred,
    lastVerifiedAt: status === "Verified" ? "2026-05-01" : undefined,
  };
}
export function setSolicitorStatus(
  id: string,
  status: SolicitorVStatus,
  seed: { verified: string; preferred: boolean },
) {
  const all = readSol();
  all[id] = {
    ...getSolicitorState(id, seed),
    status,
    lastVerifiedAt: status === "Verified" ? now() : all[id]?.lastVerifiedAt,
  };
  writeSol(all);
}
export function toggleSolicitorPin(id: string, seed: { verified: string; preferred: boolean }) {
  const all = readSol();
  const cur = getSolicitorState(id, seed);
  all[id] = { ...cur, pinned: !cur.pinned };
  writeSol(all);
}
export function recordSolicitorBankEdit(
  id: string,
  actor: { id: string; name: string; role: PartnerRole },
  seed: { verified: string; preferred: boolean },
) {
  setSolicitorStatus(id, "Pending Verification", seed);
  appendDocAudit({
    caseId: "—",
    docType: "Solicitor payment instruction",
    action: "Bank details edited — re-verification required",
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    meta: { solicitorId: id },
  });
}
export function canRevealSolicitorBank(role: PartnerRole) {
  return role === "partner_admin" || role === "finance_viewer";
}

/* ---------- Commissions ---------- */
export type CommissionStatus =
  | "Estimated"
  | "Pending Approval"
  | "Approved"
  | "Paid"
  | "Withheld"
  | "Cancelled";
export const COMMISSION_STATUSES: CommissionStatus[] = [
  "Estimated",
  "Pending Approval",
  "Approved",
  "Paid",
  "Withheld",
  "Cancelled",
];
export type Commission = {
  id: string;
  caseId: string;
  caseRef: string;
  clientName: string;
  marketerId: string;
  marketerName: string;
  payoutAmount: number; // GBP
  rate: number; // e.g. 0.005 = 0.5%
  estimated: number; // GBP
  approved?: number;
  paid?: number;
  status: CommissionStatus;
  paymentDate?: string;
  createdAt: string;
};
const COMM_KEY = "canta:partner:commissions:v1";
function readComm(): Commission[] {
  if (typeof window === "undefined") return SEED_COMMISSIONS;
  try {
    const raw = window.localStorage.getItem(COMM_KEY);
    return raw ? JSON.parse(raw) : SEED_COMMISSIONS;
  } catch {
    return SEED_COMMISSIONS;
  }
}
function writeComm(list: Commission[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(COMM_KEY, JSON.stringify(list));
  emit();
}
const SEED_COMMISSIONS: Commission[] = [
  {
    id: "CM-001",
    caseId: "CS-1001",
    caseRef: "KPP-2026-1001",
    clientName: "Adekunle Okoye",
    marketerId: "U-MKT-1",
    marketerName: "Sade Ojo",
    payoutAmount: 248_500,
    rate: 0.005,
    estimated: 1242,
    approved: 1242,
    paid: 1242,
    status: "Paid",
    paymentDate: "2026-06-05",
    createdAt: "2026-06-04",
  },
  {
    id: "CM-002",
    caseId: "CS-1002",
    caseRef: "KPP-2026-1002",
    clientName: "Folake Adeyemi",
    marketerId: "U-MKT-2",
    marketerName: "Daniel Reed",
    payoutAmount: 185_000,
    rate: 0.005,
    estimated: 925,
    approved: 925,
    status: "Approved",
    createdAt: "2026-06-02",
  },
  {
    id: "CM-003",
    caseId: "CS-1003",
    caseRef: "KPP-2026-1003",
    clientName: "Ibrahim Sani",
    marketerId: "U-MKT-1",
    marketerName: "Sade Ojo",
    payoutAmount: 612_000,
    rate: 0.005,
    estimated: 3060,
    status: "Pending Approval",
    createdAt: "2026-06-11",
  },
  {
    id: "CM-004",
    caseId: "CS-1004",
    caseRef: "KPP-2026-1004",
    clientName: "Ngozi Eze",
    marketerId: "U-MKT-3",
    marketerName: "Michael Turner",
    payoutAmount: 92_500,
    rate: 0.005,
    estimated: 462,
    status: "Estimated",
    createdAt: "2026-06-12",
  },
];
export function listCommissions(forMarketer?: string): Commission[] {
  const all = readComm();
  return forMarketer ? all.filter((c) => c.marketerId === forMarketer) : all;
}
export function updateCommissionStatus(id: string, status: CommissionStatus) {
  const list = readComm().map((c) =>
    c.id === id
      ? {
          ...c,
          status,
          paymentDate: status === "Paid" ? now().slice(0, 10) : c.paymentDate,
          paid: status === "Paid" ? (c.approved ?? c.estimated) : c.paid,
        }
      : c,
  );
  writeComm(list);
}

/* ---------- Document audit log ---------- */
export type DocAuditAction =
  | "Document uploaded by Kingsbridge Property Partners"
  | "Document uploaded by client"
  | "Document viewed by client"
  | "Document consent completed"
  | "Missing document requested"
  | "Document approved"
  | "Document rejected"
  | "Bank details edited — re-verification required";
export type DocAuditEntry = {
  id: string;
  caseId: string;
  docType: string;
  action: DocAuditAction | string;
  actorId: string;
  actorName: string;
  actorRole: PartnerRole | "client" | "canta_system";
  at: string;
  consent?: boolean;
  meta?: Record<string, string>;
};
const AUD_KEY = "canta:partner:doc-audit:v1";
function readAud(): DocAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(AUD_KEY) || "[]");
  } catch {
    return [];
  }
}
export function appendDocAudit(e: Omit<DocAuditEntry, "id" | "at">) {
  const list = readAud();
  list.unshift({ ...e, id: uid("AUD"), at: now() });
  if (typeof window !== "undefined")
    window.localStorage.setItem(AUD_KEY, JSON.stringify(list.slice(0, 500)));
  emit();
}
export function listDocAudit(caseId?: string) {
  return readAud().filter((e) => !caseId || e.caseId === caseId);
}
