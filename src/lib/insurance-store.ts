// Minimal embedded insurance hooks (placeholder for AXA Mansard etc.)
export type InsuranceStatus = "Not Offered" | "Offered" | "Quote Requested" | "Quote Received" | "Accepted" | "Declined" | "Policy Active";
export type InsuranceRiskType = "Cargo" | "Goods-in-transit" | "Freight liability" | "Travel" | "Property payment protection";
export type InsuranceQuote = {
  id: string;
  customer: string;
  linkedId: string;          // trade file / shipment / card / payment case id
  linkedKind: "trade-file" | "shipment" | "card" | "payment-case";
  insuredAmount: number;
  ccy: string;
  riskType: InsuranceRiskType;
  partner: string;
  quoteStatus: InsuranceStatus;
  policyStatus: InsuranceStatus;
  createdAt: string;
};

const KEY = "canta:insurance:hooks:v1";
const EVT = "canta-insurance-change";
function emit() { if (typeof window !== "undefined") window.dispatchEvent(new Event(EVT)); }
export function subscribeInsurance(fn: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(EVT, fn);
  return () => window.removeEventListener(EVT, fn);
}
function read(): InsuranceQuote[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: InsuranceQuote[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(list));
  emit();
}
export function listHooks(linkedId?: string) {
  const all = read();
  return linkedId ? all.filter((h) => h.linkedId === linkedId) : all;
}
export function createHook(input: Omit<InsuranceQuote, "id" | "createdAt" | "quoteStatus" | "policyStatus"> & { quoteStatus?: InsuranceStatus }): InsuranceQuote {
  const q: InsuranceQuote = {
    id: `INS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    quoteStatus: input.quoteStatus ?? "Quote Requested",
    policyStatus: "Not Offered",
    ...input,
  };
  write([q, ...read()]);
  return q;
}
export function advanceHook(id: string, next: Partial<Pick<InsuranceQuote, "quoteStatus" | "policyStatus">>) {
  write(read().map((h) => h.id === id ? { ...h, ...next } : h));
}

export const INSURANCE_PARTNERS = ["AXA Mansard", "Leadway Assurance", "Old Mutual", "AIICO Insurance"];
