export type TicketStatus = "Open" | "Waiting on Customer" | "Waiting on Canta" | "Escalated" | "Resolved" | "Closed";
export const TICKET_STATUSES: TicketStatus[] = ["Open", "Waiting on Customer", "Waiting on Canta", "Escalated", "Resolved", "Closed"];
export type IssueType = "Payment issue" | "Funding mismatch" | "KYC/KYB issue" | "Shipment issue" | "Partner case issue" | "Payout issue" | "Technical issue" | "General enquiry";
export const ISSUE_TYPES: IssueType[] = ["Payment issue", "Funding mismatch", "KYC/KYB issue", "Shipment issue", "Partner case issue", "Payout issue", "Technical issue", "General enquiry"];

export type TicketMessage = { id: string; author: string; role: "customer" | "canta" | "partner"; body: string; at: string };
export type SupportTicket = {
  id: string;
  ref: string;
  customer: string;
  organization: string;
  workspace: string;
  linkedRef?: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status: TicketStatus;
  assigned: string;
  issueType: IssueType;
  messages: TicketMessage[];
  createdAt: string;
  lastUpdate: string;
};

const KEY = "canta:support:tickets:v1";
const EVT = "canta-support-change";
function emit() { if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT)); }
export function subscribeSupport(fn: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}
const SEED: SupportTicket[] = [
  { id: "T-000", ref: "SUP-9000", customer: "Tunde Bakare", organization: "Bakare Imports", workspace: "Importer", linkedRef: "TF-2026-0214", priority: "Normal", status: "Open", assigned: "Canta Support", issueType: "Shipment issue", messages: [{ id: "m1", author: "Tunde", role: "customer", body: "Please help confirm the latest shipment update and linked documents.", at: "2026-06-10T09:00:00Z" }], createdAt: "2026-06-10", lastUpdate: "2026-06-10" },
  { id: "T-001", ref: "SUP-9001", customer: "Adekunle Okoye", organization: "Baron & Cabot client", workspace: "Partner Property", linkedRef: "BC-2026-1001", priority: "High", status: "Waiting on Canta", assigned: "Daniel Whitfield", issueType: "Payout issue", messages: [{ id: "m1", author: "Adekunle", role: "customer", body: "Solicitor hasn't received the payment yet.", at: "2026-06-05T10:00:00Z" }], createdAt: "2026-06-05", lastUpdate: "2026-06-05" },
  { id: "T-002", ref: "SUP-9002", customer: "Lagos Med Clinic", organization: "Lagos Med Clinic", workspace: "Global Merchant", linkedRef: "INV-2034", priority: "Normal", status: "Open", assigned: "Canta Ops", issueType: "Funding mismatch", messages: [{ id: "m1", author: "Tope", role: "customer", body: "Payer sent ₦4,100,000 instead of ₦4,200,000.", at: "2026-06-04T14:00:00Z" }], createdAt: "2026-06-04", lastUpdate: "2026-06-04" },
  { id: "T-003", ref: "SUP-9003", customer: "Bayo Logistics Ltd", organization: "Bayo Logistics", workspace: "Freight", linkedRef: "SHP-10421", priority: "Low", status: "Resolved", assigned: "Canta Ops", issueType: "Shipment issue", messages: [], createdAt: "2026-06-02", lastUpdate: "2026-06-03" },
  { id: "T-004", ref: "SUP-9004", customer: "Sino Trade Co.", organization: "Sino Trade", workspace: "Supplier", linkedRef: "INV-2030", priority: "Urgent", status: "Escalated", assigned: "Compliance", issueType: "KYC/KYB issue", messages: [], createdAt: "2026-06-08", lastUpdate: "2026-06-09" },
  { id: "T-006", ref: "SUP-9006", customer: "Adaeze Okonkwo", organization: "Enterprise Treasury", workspace: "Enterprise Treasury", linkedRef: "PAY-7782", priority: "High", status: "Open", assigned: "Canta Support", issueType: "Payment issue", messages: [{ id: "m1", author: "Adaeze", role: "customer", body: "A beneficiary payout needs a status check.", at: "2026-06-12T08:30:00Z" }], createdAt: "2026-06-12", lastUpdate: "2026-06-12" },
];
function read(): SupportTicket[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    const saved = JSON.parse(raw) as SupportTicket[];
    const savedIds = new Set(saved.map((t) => t.id));
    return [...saved, ...SEED.filter((t) => !savedIds.has(t.id))];
  } catch { return SEED; }
}
function write(list: SupportTicket[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}
export function listTickets(workspace?: string) {
  const all = read();
  if (!workspace) return all;
  const filtered = all.filter((t) => t.workspace === workspace);
  return filtered.length ? filtered : SEED.filter((t) => t.workspace === workspace);
}
export function createTicket(input: Omit<SupportTicket, "id" | "ref" | "messages" | "createdAt" | "lastUpdate" | "status"> & { firstMessage?: string }): SupportTicket {
  const n = read().length + 9001;
  const t: SupportTicket = {
    id: `T-${Date.now().toString(36)}`,
    ref: `SUP-${n}`,
    status: "Open",
    messages: input.firstMessage ? [{ id: "m1", author: input.customer, role: "customer", body: input.firstMessage, at: new Date().toISOString() }] : [],
    createdAt: new Date().toISOString().slice(0, 10),
    lastUpdate: new Date().toISOString().slice(0, 10),
    customer: input.customer, organization: input.organization, workspace: input.workspace,
    linkedRef: input.linkedRef, priority: input.priority, assigned: input.assigned, issueType: input.issueType,
  };
  write([t, ...read()]);
  return t;
}
export function updateTicketStatus(id: string, status: TicketStatus) {
  write(read().map((t) => t.id === id ? { ...t, status, lastUpdate: new Date().toISOString().slice(0, 10) } : t));
}
export function assignTicket(id: string, assigned: string) {
  write(read().map((t) => t.id === id ? { ...t, assigned, lastUpdate: new Date().toISOString().slice(0, 10) } : t));
}
export function appendMessage(id: string, msg: Omit<TicketMessage, "id" | "at">) {
  write(read().map((t) => t.id === id ? { ...t, messages: [...t.messages, { ...msg, id: `m${t.messages.length + 1}`, at: new Date().toISOString() }], lastUpdate: new Date().toISOString().slice(0, 10) } : t));
}
export function getTicket(id: string) {
  return read().find((t) => t.id === id);
}

