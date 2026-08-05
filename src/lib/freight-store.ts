import { useSyncExternalStore } from "react";

// ---------------------------------------------------------------------------
// Canta Freight Forwarder / Clearing Agent workspace — shared demo data store
// All data below is mock/demo data for investor previews. Persisted to
// localStorage so edits made in one part of the workspace show up everywhere.
// ---------------------------------------------------------------------------

export type ShipmentStatus = "New" | "In Transit" | "Arriving" | "Delivered" | "Exception";
export type FreightInvoiceStatus = "Unpaid" | "Paid";
export type Currency = "USD" | "NGN";

export type FreightCustomer = {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  route: string; // e.g. "Guangzhou → Lagos"
  createdAt: string;
};

export type FreightShipment = {
  id: string;
  shipmentNumber: string;
  customerId: string;
  route: string;
  goods: string;
  status: ShipmentStatus;
  eta: string; // ISO date
  staff: string;
  valueUsd: number;
};

export type FreightInvoiceLineItem = {
  id: string;
  description: string;
  amount: number;
};

export type FreightInvoiceRecord = {
  id: string;
  invoiceNumber: string;
  customerId: string;
  shipmentId: string | null;
  lineItems: FreightInvoiceLineItem[];
  amount: number;
  currency: Currency;
  dueDate: string;
  status: FreightInvoiceStatus;
  createdAt: string;
};

export const FREIGHT_STAFF = ["Femi Adeyemi", "Adaeze Okonkwo", "James Obi", "Aisha Bello"];

type FreightState = {
  customers: FreightCustomer[];
  shipments: FreightShipment[];
  invoices: FreightInvoiceRecord[];
};

const STORAGE_KEY = "canta_freight_store_v1";

function seed(): FreightState {
  const customers: FreightCustomer[] = [
    { id: "cust_1", company: "ABC Electronics Ltd", contact: "Chinedu Okafor", email: "chinedu@abcelectronics.ng", phone: "+234 801 234 5566", route: "Guangzhou → Lagos", createdAt: "2026-01-12T00:00:00.000Z" },
    { id: "cust_2", company: "Balogun Trade Hub", contact: "Fatima Balogun", email: "fatima@balogunhub.ng", phone: "+234 803 442 7765", route: "Yiwu → Apapa", createdAt: "2026-02-03T00:00:00.000Z" },
    { id: "cust_3", company: "Dav Excel Autos", contact: "David Nwachukwu", email: "david@davexcel.ng", phone: "+234 806 700 4423", route: "Shenzhen → Tin Can", createdAt: "2026-02-20T00:00:00.000Z" },
    { id: "cust_4", company: "Trade Fair Imports", contact: "Ngozi Umeh", email: "ngozi@tradefairimports.ng", phone: "+234 805 119 2230", route: "Guangzhou → Onne", createdAt: "2026-03-01T00:00:00.000Z" },
    { id: "cust_5", company: "Billion Trend Autos", contact: "Emeka Eze", email: "emeka@billiontrend.ng", phone: "+234 807 552 1190", route: "Shanghai → Lagos", createdAt: "2026-03-15T00:00:00.000Z" },
  ];

  const shipments: FreightShipment[] = [
    { id: "ship_1", shipmentNumber: "SHP-10421", customerId: "cust_1", route: "Guangzhou → Lagos", goods: "Consumer electronics", status: "In Transit", eta: futureDate(9), staff: FREIGHT_STAFF[0], valueUsd: 42000 },
    { id: "ship_2", shipmentNumber: "SHP-10422", customerId: "cust_2", route: "Yiwu → Apapa", goods: "Household goods", status: "Arriving", eta: futureDate(2), staff: FREIGHT_STAFF[1], valueUsd: 18500 },
    { id: "ship_3", shipmentNumber: "SHP-10423", customerId: "cust_3", route: "Shenzhen → Tin Can", goods: "Auto parts", status: "Arriving", eta: futureDate(4), staff: FREIGHT_STAFF[2], valueUsd: 63000 },
    { id: "ship_4", shipmentNumber: "SHP-10424", customerId: "cust_4", route: "Guangzhou → Onne", goods: "Building materials", status: "New", eta: futureDate(21), staff: FREIGHT_STAFF[3], valueUsd: 27500 },
    { id: "ship_5", shipmentNumber: "SHP-10425", customerId: "cust_5", route: "Shanghai → Lagos", goods: "Motor vehicles", status: "Delivered", eta: futureDate(-3), staff: FREIGHT_STAFF[0], valueUsd: 91000 },
    { id: "ship_6", shipmentNumber: "SHP-10426", customerId: "cust_1", route: "Guangzhou → Lagos", goods: "Solar equipment", status: "Exception", eta: futureDate(1), staff: FREIGHT_STAFF[1], valueUsd: 35800 },
  ];

  const invoices: FreightInvoiceRecord[] = [
    { id: "finv_1", invoiceNumber: "FRT-2026-0001", customerId: "cust_1", shipmentId: "ship_1", lineItems: [{ id: "li1", description: "Freight & clearing fee", amount: 1800 }], amount: 1800, currency: "USD", dueDate: futureDate(10), status: "Unpaid", createdAt: "2026-05-01T00:00:00.000Z" },
    { id: "finv_2", invoiceNumber: "FRT-2026-0002", customerId: "cust_2", shipmentId: "ship_2", lineItems: [{ id: "li2", description: "Ocean freight", amount: 950000 }], amount: 950000, currency: "NGN", dueDate: futureDate(5), status: "Paid", createdAt: "2026-05-04T00:00:00.000Z" },
    { id: "finv_3", invoiceNumber: "FRT-2026-0003", customerId: "cust_3", shipmentId: "ship_3", lineItems: [{ id: "li3", description: "Customs duty + clearing", amount: 3200 }], amount: 3200, currency: "USD", dueDate: futureDate(-2), status: "Unpaid", createdAt: "2026-05-08T00:00:00.000Z" },
    { id: "finv_4", invoiceNumber: "FRT-2026-0004", customerId: "cust_5", shipmentId: "ship_5", lineItems: [{ id: "li4", description: "Freight, insurance & clearing", amount: 4600 }], amount: 4600, currency: "USD", dueDate: futureDate(-15), status: "Paid", createdAt: "2026-04-20T00:00:00.000Z" },
  ];

  return { customers, shipments, invoices };
}

function futureDate(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

function load(): FreightState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as FreightState;
  } catch {
    return seed();
  }
}

let state: FreightState = load();
let version = 0;
const subs = new Set<() => void>();

function persist() {
  version++;
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }
  subs.forEach((f) => f());
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const freightStore = {
  getState: () => state,
  subscribe: (f: () => void) => { subs.add(f); return () => subs.delete(f); },
  getVersion: () => version,

  // Customers
  addCustomer: (input: Omit<FreightCustomer, "id" | "createdAt">) => {
    const rec: FreightCustomer = { ...input, id: genId("cust"), createdAt: new Date().toISOString() };
    state = { ...state, customers: [rec, ...state.customers] };
    persist();
    return rec;
  },
  updateCustomer: (id: string, patch: Partial<FreightCustomer>) => {
    state = { ...state, customers: state.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) };
    persist();
  },
  removeCustomer: (id: string) => {
    state = {
      ...state,
      customers: state.customers.filter((c) => c.id !== id),
      shipments: state.shipments.filter((s) => s.customerId !== id),
      invoices: state.invoices.filter((i) => i.customerId !== id),
    };
    persist();
  },

  // Shipments
  addShipment: (input: Omit<FreightShipment, "id">) => {
    const rec: FreightShipment = { ...input, id: genId("ship") };
    state = { ...state, shipments: [rec, ...state.shipments] };
    persist();
    return rec;
  },
  updateShipment: (id: string, patch: Partial<FreightShipment>) => {
    state = { ...state, shipments: state.shipments.map((s) => (s.id === id ? { ...s, ...patch } : s)) };
    persist();
  },
  bulkUpdateShipments: (ids: string[], patch: Partial<FreightShipment>) => {
    const idSet = new Set(ids);
    state = { ...state, shipments: state.shipments.map((s) => (idSet.has(s.id) ? { ...s, ...patch } : s)) };
    persist();
  },

  // Invoices
  addInvoice: (input: Omit<FreightInvoiceRecord, "id" | "invoiceNumber" | "createdAt" | "status"> & Partial<Pick<FreightInvoiceRecord, "status">>) => {
    const number = `FRT-2026-${String(state.invoices.length + 1).padStart(4, "0")}`;
    const rec: FreightInvoiceRecord = {
      ...input,
      id: genId("finv"),
      invoiceNumber: number,
      createdAt: new Date().toISOString(),
      status: input.status ?? "Unpaid",
    };
    state = { ...state, invoices: [rec, ...state.invoices] };
    persist();
    return rec;
  },
  updateInvoiceStatus: (id: string, status: FreightInvoiceStatus) => {
    state = { ...state, invoices: state.invoices.map((i) => (i.id === id ? { ...i, status } : i)) };
    persist();
  },
};

export function useFreightStore() {
  useSyncExternalStore(freightStore.subscribe, freightStore.getVersion, freightStore.getVersion);
  return freightStore.getState();
}

export const SHIPMENT_STATUSES: ShipmentStatus[] = ["New", "In Transit", "Arriving", "Delivered", "Exception"];

export function customerOpenShipments(state: FreightState, customerId: string) {
  return state.shipments.filter((s) => s.customerId === customerId && s.status !== "Delivered").length;
}

export function customerOutstandingBalance(state: FreightState, customerId: string, toCcy: Currency = "USD") {
  const NGN_PER_USD = 1612;
  return state.invoices
    .filter((i) => i.customerId === customerId && i.status === "Unpaid")
    .reduce((sum, i) => {
      const usd = i.currency === "USD" ? i.amount : i.amount / NGN_PER_USD;
      return sum + (toCcy === "USD" ? usd : usd * NGN_PER_USD);
    }, 0);
}

export function fmtFreight(amount: number, ccy: Currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 }).format(amount);
}

export function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}
