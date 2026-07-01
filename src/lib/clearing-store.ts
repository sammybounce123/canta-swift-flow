// Clearing Quote Marketplace — local store
// Canta does not own, guarantee, or directly quote clearing fees.
// All bids come from verified clearing agents.

export type ServiceScope =
  | "Clearing only"
  | "Clearing + delivery"
  | "Duty/charges advisory"
  | "Warehousing"
  | "Inspection support"
  | "Full logistics support";

export type RequestStatus =
  | "Quote Request Sent"
  | "Bids Received"
  | "Agent Selected"
  | "In Workflow"
  | "Completed"
  | "Cancelled";

export type BidStatus =
  | "Pending"
  | "Submitted"
  | "Shortlisted"
  | "Accepted"
  | "Declined"
  | "Not Selected"
  | "Expired"
  | "Withdrawn";

export type WorkflowStatus =
  | "Agent Selected"
  | "Documents Requested"
  | "Documents Submitted"
  | "Clearing Started"
  | "Duty/Charges Confirmed"
  | "Awaiting Importer Approval"
  | "Cleared"
  | "Delivery Arranged"
  | "Delivered"
  | "Completed"
  | "Disputed"
  | "Cancelled";

export type ClearingBid = {
  id: string;
  requestId: string;
  agentName: string;
  verified: boolean;
  rating: number; // 0..5
  completedJobs: number;
  responseTimeHrs: number;
  disputeRatePct?: number;
  clearingFee: number; // USD
  dutyEstimate?: number; // USD, optional
  serviceScope: ServiceScope;
  timelineDays: number;
  requiredDocs: string[];
  terms: string;
  notes?: string;
  expiresAt: string; // ISO
  status: BidStatus;
  portCoverage?: string;
};

export type ClearingRequest = {
  id: string;
  tradeFileId?: string;
  blNumber?: string;
  containerNumber?: string;
  portOfArrival: string;
  goodsCategory: string;
  goodsDescription: string;
  invoiceValue: number;
  currency: string;
  packages?: string;
  weight?: string;
  cbm?: string;
  serviceRequired: ServiceScope;
  preferredTimeline?: string;
  notes?: string;
  documents: string[];
  status: RequestStatus;
  createdAt: string;
  selectedBidId?: string;
  workflow: { status: WorkflowStatus; at: string; note?: string; actor?: string }[];
};

const LS_REQUESTS = "canta:clearing:requests";
const LS_BIDS = "canta:clearing:bids";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// Fixed 2026 timestamps so demo data never renders as 1969/1970 even if
// Date.now() returns 0 in a snapshot / SSR edge case.
const T0 = new Date("2026-08-14T09:00:00Z").getTime();
const iso = (offsetHrs: number) => new Date(T0 + offsetHrs * 3600_000).toISOString();

const SEED_REQUESTS: ClearingRequest[] = [
  {
    id: "CQR-2031",
    tradeFileId: "TF-2026-0214",
    blNumber: "MAEU-447120",
    containerNumber: "MSKU-9912034",
    portOfArrival: "Apapa, Lagos",
    goodsCategory: "Consumer Electronics",
    goodsDescription: "240 cartons Bluetooth speakers and accessories",
    invoiceValue: 184000,
    currency: "USD",
    packages: "240 cartons",
    weight: "3,200 kg",
    cbm: "32",
    serviceRequired: "Full logistics support",
    preferredTimeline: "Within 7 days of arrival",
    notes: "Need PAAR support and warehouse drop in Ikeja.",
    documents: ["Supplier invoice", "Packing list", "Bill of lading", "Form M"],
    status: "In Workflow",
    createdAt: iso(-36),
    selectedBidId: "BID-7703",
    workflow: [
      { status: "Agent Selected", at: iso(-30), actor: "Importer", note: "Importer accepted Harbour Trust Logistics bid and authorised clearing." },
      { status: "Documents Requested", at: iso(-28), actor: "Agent", note: "Form M, PAAR, SONCAP, and insurance certificate requested." },
      { status: "Documents Submitted", at: iso(-24), actor: "Importer" },
      { status: "Clearing Started", at: iso(-18), actor: "Agent", note: "Filing lodged at Apapa command." },
    ],
  },
  {
    id: "CQR-2030",
    tradeFileId: "TF-2026-0218",
    blNumber: "CMAU-228814",
    portOfArrival: "Tin Can, Lagos",
    goodsCategory: "Industrial Machinery",
    goodsDescription: "1 x 40HC packaging line + spares",
    invoiceValue: 92500,
    currency: "USD",
    packages: "1 x 40HC",
    weight: "11,400 kg",
    cbm: "58",
    serviceRequired: "Clearing only",
    preferredTimeline: "Standard",
    documents: ["Supplier invoice", "Packing list", "Bill of lading"],
    status: "Bids Received",
    createdAt: iso(-10),
    workflow: [],
  },
];

const SEED_BIDS: ClearingBid[] = [
  {
    id: "BID-7701",
    requestId: "CQR-2031",
    agentName: "Apapa Prime Clearing Ltd",
    verified: true,
    rating: 4.8,
    completedJobs: 312,
    responseTimeHrs: 4,
    disputeRatePct: 0.6,
    clearingFee: 2400,
    dutyEstimate: 33120,
    serviceScope: "Clearing + delivery",
    timelineDays: 6,
    requiredDocs: ["Form M", "PAAR", "SONCAP"],
    terms: "50% upfront, 50% on release. Demurrage billed at cost.",
    notes: "Strong on Apapa. Can drop at Ikeja warehouse.",
    expiresAt: iso(72),
    status: "Not Selected",
    portCoverage: "Apapa, Tin Can",
  },
  {
    id: "BID-7702",
    requestId: "CQR-2031",
    agentName: "Tin Can Express Brokers",
    verified: true,
    rating: 4.6,
    completedJobs: 540,
    responseTimeHrs: 2,
    disputeRatePct: 1.1,
    clearingFee: 2100,
    dutyEstimate: 33800,
    serviceScope: "Clearing only",
    timelineDays: 5,
    requiredDocs: ["Form M", "PAAR"],
    terms: "Full payment on PAAR issuance.",
    notes: "Lowest fee. Delivery not included.",
    expiresAt: iso(48),
    status: "Not Selected",
    portCoverage: "Apapa, Tin Can, Onne",
  },
  {
    id: "BID-7703",
    requestId: "CQR-2031",
    agentName: "Harbour Trust Logistics",
    verified: true,
    rating: 4.9,
    completedJobs: 198,
    responseTimeHrs: 6,
    disputeRatePct: 0.3,
    clearingFee: 2750,
    dutyEstimate: 33000,
    serviceScope: "Full logistics support",
    timelineDays: 7,
    requiredDocs: ["Form M", "PAAR", "SONCAP", "Insurance certificate"],
    terms: "30% upfront, milestones at PAAR, release, and delivery.",
    notes: "Premium service, top rated. Includes inspection support.",
    expiresAt: iso(96),
    status: "Accepted",
    portCoverage: "Apapa, Tin Can, Onne, Port Harcourt",
  },
];

const LS_SEED_VERSION = "canta:clearing:seedVersion";
const SEED_VERSION = "6";

const SEED_REQUEST_IDS = new Set(SEED_REQUESTS.map((r) => r.id));
const SEED_BID_IDS = new Set(SEED_BIDS.map((b) => b.id));

function withDefaultDemoRequests(current: ClearingRequest[] = []) {
  return [...SEED_REQUESTS, ...current.filter((r) => !SEED_REQUEST_IDS.has(r.id))];
}

function withDefaultDemoBids(current: ClearingBid[] = []) {
  return [...SEED_BIDS, ...current.filter((b) => !SEED_BID_IDS.has(b.id))];
}

function ensureSeed() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(LS_SEED_VERSION) !== SEED_VERSION) {
    write(LS_REQUESTS, withDefaultDemoRequests(read<ClearingRequest[]>(LS_REQUESTS, [])));
    write(LS_BIDS, withDefaultDemoBids(read<ClearingBid[]>(LS_BIDS, [])));
    window.localStorage.setItem(LS_SEED_VERSION, SEED_VERSION);
  }
}

export function getRequests(): ClearingRequest[] {
  ensureSeed();
  const stored = read<ClearingRequest[] | null>(LS_REQUESTS, null);
  const normalized = withDefaultDemoRequests(stored ?? []);
  const demoReady = normalized[0]?.id === "CQR-2031" && normalized[0]?.selectedBidId === "BID-7703" && normalized[0]?.workflow.length >= 4;
  if (!stored || !demoReady || stored[0]?.id !== "CQR-2031") write(LS_REQUESTS, normalized);
  return normalized;
}
export function loadDemoData() {
  write(LS_REQUESTS, withDefaultDemoRequests(read<ClearingRequest[]>(LS_REQUESTS, [])));
  write(LS_BIDS, withDefaultDemoBids(read<ClearingBid[]>(LS_BIDS, [])));
  if (typeof window !== "undefined") window.localStorage.setItem(LS_SEED_VERSION, SEED_VERSION);
}
export function saveRequests(rs: ClearingRequest[]) {
  write(LS_REQUESTS, rs);
}
export function getBids(): ClearingBid[] {
  ensureSeed();
  const stored = read<ClearingBid[] | null>(LS_BIDS, null);
  const normalized = withDefaultDemoBids(stored ?? []);
  const demoBids = normalized.filter((b) => b.requestId === "CQR-2031");
  const demoReady = demoBids.length >= 3 && demoBids.some((b) => b.id === "BID-7703" && b.status === "Accepted");
  if (!stored || !demoReady || stored[0]?.requestId !== "CQR-2031") write(LS_BIDS, normalized);
  return normalized;
}
export function saveBids(bs: ClearingBid[]) {
  write(LS_BIDS, bs);
}

export function getBidsForRequest(requestId: string) {
  return getBids().filter((b) => b.requestId === requestId);
}

export function createRequest(input: Omit<ClearingRequest, "id" | "status" | "createdAt" | "workflow">) {
  const id = `CQR-${Math.floor(2100 + Math.random() * 8999)}`;
  const req: ClearingRequest = {
    ...input,
    id,
    status: "Quote Request Sent",
    createdAt: new Date().toISOString(),
    workflow: [],
  };
  const rs = getRequests();
  saveRequests([req, ...rs]);
  return req;
}

export function acceptBid(requestId: string, bidId: string) {
  const bids = getBids().map((b) => {
    if (b.requestId !== requestId) return b;
    if (b.id === bidId) return { ...b, status: "Accepted" as BidStatus };
    return { ...b, status: "Not Selected" as BidStatus };
  });
  saveBids(bids);
  const rs = getRequests().map((r) =>
    r.id === requestId
      ? {
          ...r,
          status: "In Workflow" as RequestStatus,
          selectedBidId: bidId,
          workflow: [{ status: "Agent Selected" as WorkflowStatus, at: new Date().toISOString(), actor: "Importer", note: "Importer accepted bid and authorised the agent to begin clearing." }],
        }
      : r,
  );
  saveRequests(rs);
}

export function cancelRequest(requestId: string, reason?: string) {
  saveRequests(getRequests().map((r) => r.id === requestId ? { ...r, status: "Cancelled" as RequestStatus, workflow: [...r.workflow, { status: "Cancelled" as WorkflowStatus, at: new Date().toISOString(), actor: "Importer", note: reason || "Quote request cancelled by importer." }] } : r));
}

export function reportIssue(requestId: string, note: string) {
  saveRequests(getRequests().map((r) => r.id === requestId ? { ...r, workflow: [...r.workflow, { status: "Disputed" as WorkflowStatus, at: new Date().toISOString(), actor: "Importer", note }] } : r));
}

export function withdrawBid(bidId: string) {
  saveBids(getBids().map((b) => b.id === bidId ? { ...b, status: "Withdrawn" as BidStatus } : b));
}

export function markUnableToProceed(requestId: string, bidId: string, reason: string) {
  saveBids(getBids().map((b) => b.id === bidId ? { ...b, status: "Declined" as BidStatus } : b));
  saveRequests(getRequests().map((r) => r.id === requestId ? { ...r, workflow: [...r.workflow, { status: "Disputed" as WorkflowStatus, at: new Date().toISOString(), actor: "Agent", note: `Unable to proceed: ${reason}` }] } : r));
}

export function advanceWorkflow(requestId: string, status: WorkflowStatus, actor: string, note?: string) {
  saveRequests(getRequests().map((r) => r.id === requestId ? { ...r, workflow: [...r.workflow, { status, at: new Date().toISOString(), actor, note }] } : r));
}

export function submitBid(input: Omit<ClearingBid, "id" | "status">) {
  const id = `BID-${Math.floor(7700 + Math.random() * 999)}`;
  const bid: ClearingBid = { ...input, id, status: "Submitted" };
  saveBids([bid, ...getBids()]);
  const rs = getRequests().map((r) => r.id === input.requestId && r.status === "Quote Request Sent" ? { ...r, status: "Bids Received" as RequestStatus } : r);
  saveRequests(rs);
  return bid;
}

export function getAcceptedBid(requestId?: string): ClearingBid | undefined {
  const bs = getBids().filter((b) => b.status === "Accepted");
  if (requestId) return bs.find((b) => b.requestId === requestId);
  return bs[0];
}

// Agent verification (demo state — toggled in Freight workspace)
const LS_AGENT_VERIFIED = "canta:clearing:agentVerified";
export function getAgentVerified(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(LS_AGENT_VERIFIED);
  return v === null ? true : v === "true";
}
export function setAgentVerified(v: boolean) {
  if (typeof window !== "undefined") window.localStorage.setItem(LS_AGENT_VERIFIED, String(v));
}

export const WORKFLOW_STAGES: WorkflowStatus[] = [
  "Agent Selected",
  "Documents Requested",
  "Documents Submitted",
  "Clearing Started",
  "Duty/Charges Confirmed",
  "Awaiting Importer Approval",
  "Cleared",
  "Delivery Arranged",
  "Delivered",
  "Completed",
];

export const SERVICE_SCOPES: ServiceScope[] = [
  "Clearing only",
  "Clearing + delivery",
  "Duty/charges advisory",
  "Warehousing",
  "Inspection support",
  "Full logistics support",
];

export const CLEARING_DISCLAIMER =
  "Canta connects importers with verified clearing agents. Clearing fees, timelines, duty estimates, and service delivery are provided by the clearing agent.";
