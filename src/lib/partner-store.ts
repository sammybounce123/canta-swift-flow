// Client-side mock live store for partner cases, FX quotes, payment links,
// client verification, funding, payouts and audit trail.
//
// Reads seed data from `partner.ts` and persists mutations to localStorage so
// the flow survives reloads. Subscribers receive a "partner-data-change" event.

import {
  CASES,
  type PaymentCase,
  type CaseStatus,
  getCase as getSeedCase,
  PARTNER_ORG,
  getMarketer,
  type PartnerRole,
  MARKETERS,
} from "./partner";

export type CaseDocument = {
  id: string;
  type:
    | "International passport"
    | "National ID"
    | "Driver's license"
    | "Proof of address"
    | "Proof of funds"
    | "Property payment instruction"
    | "Solicitor payment instruction"
    | "Source of funds"
    | "Other";
  name: string;
  uploadedBy: string; // user id
  uploadedByName: string;
  uploadedByRole: PartnerRole | "client";
  uploadedAt: string;
  clientConsent?: boolean;
};

export type FxQuote = {
  id: string;
  caseId: string;
  gbpAmount: number;
  rate: number; // 1 GBP = X NGN
  feeGBP: number;
  ngnTotal: number; // amount client pays
  reference: string;
  generatedBy: string;
  generatedByName: string;
  generatedAt: string;
  expiresAt: string;
  validity: "30m" | "1h" | "same_day" | "custom";
  status: "Active" | "Expired" | "Used" | "Replaced";
  solicitorId: string;
};

export type PaymentLink = {
  id: string;
  caseId: string;
  quoteId: string;
  url: string; // /pay/<id>
  status: "Active" | "Sent" | "Opened" | "Verified" | "Funded" | "Completed" | "Expired";
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
};

export type ClientVerification = {
  bvnMasked?: string; // we store only the masked form
  bvnStatus: "Pending" | "Submitted" | "Verified" | "Failed";
  dob?: string;
  fullNameConfirmed?: boolean;
  sourceOfFunds?: string;
  consent: {
    propertyPurpose?: boolean;
    canta?: boolean;
    sharedDocs?: boolean;
    terms?: boolean;
    privacy?: boolean;
  };
  submittedAt?: string;
};

export type FundingRecord = {
  expectedNGN: number;
  receivedNGN?: number;
  payerName?: string;
  reference?: string;
  receivedAt?: string;
  reviewStatus?:
    | "Pending"
    | "Amount Mismatch"
    | "Name Mismatch"
    | "Reference Missing"
    | "Ready for FX";
};

export type PayoutRecord = {
  status:
    | "Pending"
    | "Processing"
    | "Paid to Solicitor"
    | "Failed"
    | "Returned"
    | "Receipt Uploaded";
  payoutAt?: string;
  reference?: string;
  receiptUrl?: string;
};

export type ActivationRecord = {
  invitedAt?: string;
  activated?: boolean;
  activatedAt?: string;
};

export type ActivityEntry = {
  id: string;
  caseId: string;
  action: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: PartnerRole | "client" | "canta_system";
  fromStatus?: CaseStatus;
  toStatus?: CaseStatus;
  notes?: string;
};

export type ExtendedCase = PaymentCase & {
  paymentPurpose?: string;
  paymentDeadline?: string;
  createdBy?: string;
  clientSource: "Partner Referral";
  documents: CaseDocument[];
  quotes: FxQuote[];
  activeQuoteId?: string;
  paymentLink?: PaymentLink;
  verification?: ClientVerification;
  funding?: FundingRecord;
  payout?: PayoutRecord;
  activation?: ActivationRecord;
  activity: ActivityEntry[];
};

const STORE_KEY = "canta:partner:cases:v2";
const CHANGE_EVENT = "partner-data-change";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function nowISO() {
  return new Date().toISOString();
}

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Statuses that imply an FX quote already exists on the case.
const QUOTE_STATUSES: CaseStatus[] = [
  "FX Quote Generated",
  "Payment Link Generated",
  "Payment Link Sent",
  "Client Verification Pending",
  "BVN Pending",
  "BVN Submitted",
  "Client Consent Completed",
  "Awaiting Client Funding",
  "Funding Received",
  "Funding Review",
  "FX Quote Sent",
  "FX Accepted",
  "FX Converted",
  "Payout Processing",
  "Paid to Solicitor",
  "Receipt Uploaded",
  "Client Invited to Canta",
  "Completed",
  "Failed / Returned",
  "Expired Quote",
];

// Statuses that imply a payment link already exists on the case.
const LINK_STATUSES: CaseStatus[] = QUOTE_STATUSES.filter(
  (s) => s !== "FX Quote Generated" && s !== "Expired Quote",
);

const FUNDED_STATUSES: CaseStatus[] = [
  "Funding Received",
  "Funding Review",
  "FX Accepted",
  "FX Converted",
  "Payout Processing",
  "Paid to Solicitor",
  "Receipt Uploaded",
  "Client Invited to Canta",
  "Completed",
];

function seedRate(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return 2035 + (h % 40);
}

function seedQuoteFor(c: PaymentCase): FxQuote | undefined {
  if (!QUOTE_STATUSES.includes(c.status)) return undefined;
  const rate = seedRate(c.id);
  const feeGBP = Math.max(20, Math.round(c.amountGBP * 0.0075));
  const generatedAt = `${c.createdAt}T10:15:00.000Z`;
  const expired = c.status === "Expired Quote" || c.status === "Failed / Returned";
  const base = new Date(generatedAt).getTime();
  return {
    id: `FXQ-${c.id.replace("CS-", "")}`,
    caseId: c.id,
    gbpAmount: c.amountGBP,
    rate,
    feeGBP,
    ngnTotal: Math.round((c.amountGBP + feeGBP) * rate),
    reference: `CFX-${c.id.replace("CS-", "")}-${c.ref.slice(-4)}`,
    generatedBy: c.assignedMarketerId,
    generatedByName: getMarketer(c.assignedMarketerId)?.name ?? "Partner user",
    generatedAt,
    expiresAt: new Date(
      expired ? base + 60 * 60 * 1000 : Date.now() + 45 * 60 * 1000,
    ).toISOString(),
    validity: "1h",
    status: expired ? "Expired" : FUNDED_STATUSES.includes(c.status) ? "Used" : "Active",
    solicitorId: c.solicitorId,
  };
}

function seedLinkFor(c: PaymentCase, quote?: FxQuote): PaymentLink | undefined {
  if (!quote || !LINK_STATUSES.includes(c.status)) return undefined;
  const createdAt = `${c.createdAt}T10:20:00.000Z`;
  const status: PaymentLink["status"] =
    c.status === "Completed" || c.status === "Receipt Uploaded" || c.status === "Paid to Solicitor"
      ? "Completed"
      : FUNDED_STATUSES.includes(c.status)
        ? "Funded"
        : c.status === "Awaiting Client Funding"
          ? "Verified"
          : c.status === "Failed / Returned"
            ? "Expired"
            : c.status === "Payment Link Generated"
              ? "Active"
              : "Sent";
  return {
    id: `PL-${c.id.replace("CS-", "")}`,
    caseId: c.id,
    quoteId: quote.id,
    url: `/pay/PL-${c.id.replace("CS-", "")}`,
    status,
    createdAt,
    sentAt: status === "Active" ? undefined : `${c.createdAt}T10:25:00.000Z`,
    openedAt:
      status === "Active" || status === "Sent" ? undefined : `${c.createdAt}T12:05:00.000Z`,
  };
}

function seedExtended(c: PaymentCase): ExtendedCase {
  const quote = seedQuoteFor(c);
  const link = seedLinkFor(c, quote);
  return {
    ...c,
    clientSource: "Partner Referral",
    paymentPurpose: "Property completion",
    paymentDeadline: c.expectedPayout,
    createdBy: c.assignedMarketerId,
    documents: [],
    quotes: quote ? [quote] : [],
    activeQuoteId: quote?.id,
    paymentLink: link,
    funding: FUNDED_STATUSES.includes(c.status)
      ? {
          expectedNGN: quote?.ngnTotal ?? 0,
          receivedNGN: quote?.ngnTotal ?? 0,
          payerName: c.clientName,
          reference: quote?.reference,
          receivedAt: `${c.createdAt}T15:40:00.000Z`,
          reviewStatus: "Ready for FX",
        }
      : undefined,
    payout: {
      status:
        c.status === "Paid to Solicitor"
          ? "Paid to Solicitor"
          : c.status === "Receipt Uploaded"
            ? "Receipt Uploaded"
            : c.status === "Failed / Returned"
              ? "Failed"
              : c.status === "Payout Processing"
                ? "Processing"
                : "Pending",
      payoutAt: c.expectedPayout,
      reference: c.paymentReference,
    },
    activity: [
      {
        id: uid("ACT"),
        caseId: c.id,
        action: "Case seeded",
        timestamp: c.createdAt + "T09:00:00Z",
        userId: c.assignedMarketerId,
        userName: getMarketer(c.assignedMarketerId)?.name ?? "Unknown",
        userRole: "marketer",
        toStatus: c.status,
      },
    ],
  };
}

let MEMORY_STORE: ExtendedCase[] | null = null;

function readStore(): ExtendedCase[] {
  if (MEMORY_STORE) return MEMORY_STORE;
  if (typeof window === "undefined") {
    MEMORY_STORE = CASES.map(seedExtended);
    return MEMORY_STORE;
  }
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ExtendedCase[];
      // Merge in any new seed cases not yet in store
      const ids = new Set(parsed.map((c) => c.id));
      const merged = [...parsed, ...CASES.filter((c) => !ids.has(c.id)).map(seedExtended)];
      MEMORY_STORE = merged;
      return merged;
    }
  } catch {
    /* ignore */
  }
  MEMORY_STORE = CASES.map(seedExtended);
  return MEMORY_STORE;
}

function writeStore(cases: ExtendedCase[]) {
  MEMORY_STORE = cases;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(cases));
    } catch {
      /* ignore */
    }
  }
  emit();
}

export function listCases(): ExtendedCase[] {
  return readStore();
}

export function getExtendedCase(id: string): ExtendedCase | undefined {
  return (
    readStore().find((c) => c.id === id) ??
    (getSeedCase(id) ? seedExtended(getSeedCase(id)!) : undefined)
  );
}

function updateCase(id: string, mutator: (c: ExtendedCase) => ExtendedCase) {
  const list = readStore();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return;
  const next = [...list];
  next[idx] = mutator({ ...list[idx] });
  writeStore(next);
}

export function appendActivity(
  caseId: string,
  action: string,
  actor: { id: string; name: string; role: PartnerRole | "client" | "canta_system" },
  meta?: { fromStatus?: CaseStatus; toStatus?: CaseStatus; notes?: string },
) {
  updateCase(caseId, (c) => ({
    ...c,
    activity: [
      ...c.activity,
      {
        id: uid("ACT"),
        caseId,
        action,
        timestamp: nowISO(),
        userId: actor.id,
        userName: actor.name,
        userRole: actor.role,
        ...meta,
      },
    ],
  }));
}

export function setStatus(
  caseId: string,
  toStatus: CaseStatus,
  actor: { id: string; name: string; role: PartnerRole | "client" | "canta_system" },
  note?: string,
) {
  let from: CaseStatus | undefined;
  updateCase(caseId, (c) => {
    from = c.status;
    return { ...c, status: toStatus };
  });
  appendActivity(caseId, `Status changed → ${toStatus}`, actor, {
    fromStatus: from,
    toStatus,
    notes: note,
  });
}

/* ------------- New case ------------- */

export function createCase(input: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  property: string;
  propertyLocation: string;
  amountGBP: number;
  solicitorId: string;
  paymentPurpose: string;
  paymentDeadline: string;
  assignedMarketerId: string;
  notes?: string;
  createdBy: string;
  createdByName: string;
}): ExtendedCase {
  const num = 1000 + readStore().length + 1;
  const id = `CS-${num}`;
  const ref = `KPP-2026-${num}`;
  const officer = getMarketer(input.assignedMarketerId)?.name ?? "Unassigned";
  const c: ExtendedCase = {
    id,
    ref,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    clientPhone: input.clientPhone,
    property: input.property,
    propertyLocation: input.propertyLocation,
    amountGBP: input.amountGBP,
    currency: "GBP",
    solicitorId: input.solicitorId,
    status: "Draft",
    createdAt: new Date().toISOString().slice(0, 10),
    expectedPayout: input.paymentDeadline,
    officer,
    assignedMarketerId: input.assignedMarketerId,
    paymentPurpose: input.paymentPurpose,
    paymentDeadline: input.paymentDeadline,
    createdBy: input.createdBy,
    clientSource: "Partner Referral",
    documents: [],
    quotes: [],
    activity: [
      {
        id: uid("ACT"),
        caseId: id,
        action: `Case created by ${input.createdByName} (${PARTNER_ORG.name})`,
        timestamp: nowISO(),
        userId: input.createdBy,
        userName: input.createdByName,
        userRole: "marketer",
        toStatus: "Draft",
        notes: input.notes,
      },
    ],
  };
  writeStore([c, ...readStore()]);
  return c;
}

/* ------------- Documents ------------- */

export function addDocument(caseId: string, doc: Omit<CaseDocument, "id" | "uploadedAt">) {
  updateCase(caseId, (c) => ({
    ...c,
    documents: [...c.documents, { ...doc, id: uid("DOC"), uploadedAt: nowISO() }],
  }));
  appendActivity(caseId, `Document uploaded: ${doc.type}`, {
    id: doc.uploadedBy,
    name: doc.uploadedByName,
    role: doc.uploadedByRole,
  });
  // Move status if currently Draft/Referred
  const c = getExtendedCase(caseId);
  if (c && ["Draft", "Referred", "Referral Created", "KYC Pending"].includes(c.status)) {
    setStatus(caseId, "KYC Documents Uploaded", {
      id: doc.uploadedBy,
      name: doc.uploadedByName,
      role: doc.uploadedByRole,
    });
  }
}

/* ------------- FX Quote ------------- */

function validityMs(v: FxQuote["validity"]): number {
  switch (v) {
    case "30m":
      return 30 * 60 * 1000;
    case "1h":
      return 60 * 60 * 1000;
    case "same_day":
      return 12 * 60 * 60 * 1000;
    case "custom":
      return 4 * 60 * 60 * 1000;
  }
}

export function generateQuote(
  caseId: string,
  validity: FxQuote["validity"],
  actor: { id: string; name: string; role: PartnerRole },
  overrides?: { amountGBP?: number; rate?: number },
): FxQuote | undefined {
  const c = getExtendedCase(caseId);
  if (!c) return;
  const gbpAmount =
    overrides?.amountGBP && overrides.amountGBP > 0 ? overrides.amountGBP : c.amountGBP;
  const rate =
    overrides?.rate && overrides.rate > 0
      ? overrides.rate
      : 2050 + Math.round((Math.random() - 0.5) * 20);
  const feeGBP = Math.max(20, Math.round(gbpAmount * 0.0075));
  const ngnTotal = Math.round((gbpAmount + feeGBP) * rate);
  const quote: FxQuote = {
    id: uid("FXQ"),
    caseId,
    gbpAmount,
    rate,
    feeGBP,
    ngnTotal,
    reference: `CFX-${c.id.replace("CS-", "")}-${Date.now().toString(36).toUpperCase().slice(-4)}`,
    generatedBy: actor.id,
    generatedByName: actor.name,
    generatedAt: nowISO(),
    expiresAt: new Date(Date.now() + validityMs(validity)).toISOString(),
    validity,
    status: "Active",
    solicitorId: c.solicitorId,
  };
  updateCase(caseId, (cc) => ({
    ...cc,
    amountGBP: gbpAmount,
    quotes: cc.quotes
      .map((q) => (q.status === "Active" ? { ...q, status: "Replaced" as const } : q))
      .concat(quote),
    activeQuoteId: quote.id,
  }));
  setStatus(caseId, "FX Quote Generated", actor, `Quote ${quote.reference} valid ${validity}`);
  return quote;
}

export function expireQuoteIfNeeded(caseId: string) {
  const c = getExtendedCase(caseId);
  if (!c?.activeQuoteId) return;
  const q = c.quotes.find((x) => x.id === c.activeQuoteId);
  if (!q || q.status !== "Active") return;
  if (new Date(q.expiresAt).getTime() <= Date.now()) {
    updateCase(caseId, (cc) => ({
      ...cc,
      quotes: cc.quotes.map((x) => (x.id === q.id ? { ...x, status: "Expired" as const } : x)),
      paymentLink: cc.paymentLink
        ? { ...cc.paymentLink, status: "Expired" as const }
        : cc.paymentLink,
    }));
    setStatus(caseId, "Expired Quote", {
      id: "system",
      name: "Canta System",
      role: "canta_system",
    });
  }
}

/* ------------- Payment Link ------------- */

export function generatePaymentLink(
  caseId: string,
  actor: { id: string; name: string; role: PartnerRole },
): PaymentLink | undefined {
  const c = getExtendedCase(caseId);
  if (!c?.activeQuoteId) return;
  const id = uid("PL");
  const link: PaymentLink = {
    id,
    caseId,
    quoteId: c.activeQuoteId,
    url: `/pay/${id}`,
    status: "Active",
    createdAt: nowISO(),
  };
  updateCase(caseId, (cc) => ({ ...cc, paymentLink: link }));
  setStatus(caseId, "Payment Link Generated", actor, `Link ${id}`);
  return link;
}

export function markLinkSent(
  caseId: string,
  actor: { id: string; name: string; role: PartnerRole },
) {
  updateCase(caseId, (cc) => ({
    ...cc,
    paymentLink: cc.paymentLink
      ? { ...cc.paymentLink, status: "Sent" as const, sentAt: nowISO() }
      : cc.paymentLink,
  }));
  setStatus(caseId, "Payment Link Sent", actor);
}

export function findCaseByLinkId(linkId: string): ExtendedCase | undefined {
  return readStore().find((c) => c.paymentLink?.id === linkId);
}

export function markLinkOpened(caseId: string) {
  updateCase(caseId, (cc) => ({
    ...cc,
    paymentLink:
      cc.paymentLink && !cc.paymentLink.openedAt
        ? { ...cc.paymentLink, status: "Opened" as const, openedAt: nowISO() }
        : cc.paymentLink,
  }));
  appendActivity(caseId, "Client opened payment link", {
    id: "client",
    name: "Client",
    role: "client",
  });
}

/* ------------- Verification ------------- */

export function submitVerification(
  caseId: string,
  data: {
    bvn: string;
    dob: string;
    fullNameConfirmed: boolean;
    sourceOfFunds: string;
    consent: ClientVerification["consent"];
  },
) {
  const masked = data.bvn.length >= 4 ? `••••••• ${data.bvn.slice(-4)}` : "•••••••";
  updateCase(caseId, (cc) => ({
    ...cc,
    verification: {
      bvnMasked: masked,
      bvnStatus: "Submitted",
      dob: data.dob,
      fullNameConfirmed: data.fullNameConfirmed,
      sourceOfFunds: data.sourceOfFunds,
      consent: data.consent,
      submittedAt: nowISO(),
    },
  }));
  appendActivity(caseId, "Client submitted BVN", { id: "client", name: "Client", role: "client" });
  appendActivity(caseId, "Client consent completed", {
    id: "client",
    name: "Client",
    role: "client",
  });
  setStatus(caseId, "Client Consent Completed", { id: "client", name: "Client", role: "client" });
  // Move on to awaiting funding
  setStatus(caseId, "Awaiting Client Funding", {
    id: "system",
    name: "Canta System",
    role: "canta_system",
  });
}

/* ------------- Funding ------------- */

export function recordFunding(
  caseId: string,
  payload: { payerName: string; receivedNGN: number; reference: string },
) {
  const c = getExtendedCase(caseId);
  if (!c) return;
  const q = c.quotes.find((x) => x.id === c.activeQuoteId);
  const expected = q?.ngnTotal ?? 0;
  const mismatch = Math.abs(expected - payload.receivedNGN) / Math.max(1, expected) > 0.005;
  const review: FundingRecord["reviewStatus"] = mismatch ? "Amount Mismatch" : "Ready for FX";
  updateCase(caseId, (cc) => ({
    ...cc,
    funding: {
      expectedNGN: expected,
      receivedNGN: payload.receivedNGN,
      payerName: payload.payerName,
      reference: payload.reference,
      receivedAt: nowISO(),
      reviewStatus: review,
    },
  }));
  appendActivity(
    caseId,
    `Funding received: ₦${payload.receivedNGN.toLocaleString()} from ${payload.payerName}`,
    { id: "system", name: "Canta System", role: "canta_system" },
  );
  setStatus(caseId, "Funding Received", {
    id: "system",
    name: "Canta System",
    role: "canta_system",
  });
  if (!mismatch)
    setStatus(
      caseId,
      "Funding Review",
      { id: "system", name: "Canta System", role: "canta_system" },
      "Ready for FX",
    );
}

export function convertFx(
  caseId: string,
  actor: { id: string; name: string; role: PartnerRole | "canta_system" },
) {
  setStatus(caseId, "FX Converted", actor);
  setStatus(caseId, "Payout Processing", actor);
  updateCase(caseId, (cc) => ({
    ...cc,
    payout: { ...(cc.payout ?? { status: "Pending" }), status: "Processing" },
  }));
}

export function markPaidToSolicitor(
  caseId: string,
  actor: { id: string; name: string; role: PartnerRole | "canta_system" },
  reference?: string,
) {
  updateCase(caseId, (cc) => ({
    ...cc,
    payout: {
      ...(cc.payout ?? { status: "Pending" }),
      status: "Paid to Solicitor",
      payoutAt: nowISO(),
      reference: reference ?? cc.payout?.reference ?? `BC/${cc.id}/COMPL`,
    },
  }));
  setStatus(caseId, "Paid to Solicitor", actor);
}

export function uploadReceipt(
  caseId: string,
  actor: { id: string; name: string; role: PartnerRole | "canta_system" },
) {
  updateCase(caseId, (cc) => ({
    ...cc,
    payout: {
      ...(cc.payout ?? { status: "Pending" }),
      status: "Receipt Uploaded",
      receiptUrl: "mock-receipt.pdf",
    },
  }));
  setStatus(caseId, "Receipt Uploaded", actor);
  setStatus(caseId, "Completed", actor);
}

export function inviteToCanta(
  caseId: string,
  actor: { id: string; name: string; role: PartnerRole },
) {
  updateCase(caseId, (cc) => ({
    ...cc,
    activation: { ...(cc.activation ?? {}), invitedAt: nowISO() },
  }));
  setStatus(caseId, "Client Invited to Canta", actor);
}

export function activateClientAccount(caseId: string) {
  updateCase(caseId, (cc) => ({
    ...cc,
    activation: {
      ...(cc.activation ?? {}),
      invitedAt: cc.activation?.invitedAt ?? nowISO(),
      activated: true,
      activatedAt: nowISO(),
    },
  }));
  appendActivity(caseId, "Client activated Canta account", {
    id: "client",
    name: "Client",
    role: "client",
  });
}

/* ------------- Helpers ------------- */

export const DOC_TYPES: CaseDocument["type"][] = [
  "International passport",
  "National ID",
  "Driver's license",
  "Proof of address",
  "Proof of funds",
  "Property payment instruction",
  "Solicitor payment instruction",
  "Source of funds",
  "Other",
];

export function partnerActorFromUser(userId: string): {
  id: string;
  name: string;
  role: PartnerRole;
} {
  const m = MARKETERS.find((x) => x.id === userId);
  return { id: userId, name: m?.name ?? "Partner user", role: m?.role ?? "marketer" };
}

export function subscribe(handler: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
