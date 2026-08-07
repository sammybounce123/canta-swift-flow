// Event-driven Trade File creation.
// A draft Trade File is created automatically in response to an upstream
// event (BL upload, invoice, payment request, payment link accepted, staff
// case). Callers get back the assigned reference and route the user to the
// Trade File review screen.

export type TradeFileEvent =
  | "bl_upload"
  | "invoice_upload"
  | "packing_list_upload"
  | "container_document"
  | "supplier_payment_request"
  | "supplier_invoice"
  | "buyer_accepted_payment_link"
  | "staff_case_started"
  | "manual";

type Ctx = {
  name?: string;
  importer?: string;
  supplier?: string;
  origin?: string;
  destination?: string;
  goods?: string;
  invoiceValue?: number;
  ccy?: string;
  forwarder?: string;
  eta?: string;
  // External supplier beneficiary details (supplier never needs a Canta account)
  supplierCountry?: string;
  supplierContact?: string;
  supplierEmail?: string;
  bankName?: string;
  bankAccount?: string;
  swift?: string;
  settlementCcy?: string;
  compliancePurpose?: string;
  notes?: string;
  supplierType?: "External supplier" | "Canta supplier";
};

const LABELS: Record<TradeFileEvent, string> = {
  bl_upload: "Bill of Lading upload",
  invoice_upload: "Invoice upload",
  packing_list_upload: "Packing list upload",
  container_document: "Container document",
  supplier_payment_request: "Supplier payment request",
  supplier_invoice: "Supplier invoice",
  buyer_accepted_payment_link: "Buyer accepted payment link",
  staff_case_started: "Canta staff trade case",
  manual: "Manual draft",
};

export function tradeFileEventLabel(e: TradeFileEvent) {
  return LABELS[e];
}

function newRef() {
  return `TR-${Math.floor(2100 + Math.random() * 9000)}`;
}

export function createDraftTradeFile(event: TradeFileEvent, ctx: Ctx = {}) {
  const id = newRef();
  const draft = {
    id,
    name: ctx.name?.trim() || `${LABELS[event]} — ${id}`,
    importer: ctx.importer || "—",
    supplier: ctx.supplier || "—",
    origin: ctx.origin || "—",
    destination: ctx.destination || "—",
    goods: ctx.goods || "—",
    invoiceValue: Number(ctx.invoiceValue) || 0,
    ccy: ctx.ccy || "USD",
    status: "Drafting",
    paymentStatus: "Pending",
    risk: "Low",
    forwarder: ctx.forwarder || "—",
    eta: ctx.eta || "—",
    createdAt: new Date().toISOString().slice(0, 10),
    sourceEvent: event,
    supplierCountry: ctx.supplierCountry || "—",
    supplierContact: ctx.supplierContact || "—",
    supplierEmail: ctx.supplierEmail || "—",
    bankName: ctx.bankName || "—",
    bankAccount: ctx.bankAccount || "—",
    swift: ctx.swift || "—",
    settlementCcy: ctx.settlementCcy || ctx.ccy || "USD",
    compliancePurpose: ctx.compliancePurpose || "Goods import payment",
    notes: ctx.notes || "",
    supplierType: ctx.supplierType || "External supplier",
  };
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("canta:tradeFiles");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(draft);
      window.localStorage.setItem("canta:tradeFiles", JSON.stringify(arr.slice(0, 100)));
    }
  } catch {
    /* ignore */
  }
  return { id, draft };
}

export function readDraftTradeFiles(): any[] {
  try {
    const raw =
      typeof window !== "undefined" ? window.localStorage.getItem("canta:tradeFiles") : null;
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function findDraftTradeFile(id: string) {
  return readDraftTradeFiles().find((f) => f?.id === id) ?? null;
}
