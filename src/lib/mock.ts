// Shared mock data + helpers
export const fmtNGN = (n: number) =>
  "₦" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
export const fmtUSD = (n: number) =>
  "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtMoney = (n: number, ccy: string) => {
  const sym: Record<string, string> = { NGN: "₦", USD: "$", EUR: "€", GBP: "£", CNY: "¥", AED: "د.إ" };
  return (
    (sym[ccy] ?? "") +
    n.toLocaleString(undefined, {
      minimumFractionDigits: ccy === "NGN" ? 0 : 2,
      maximumFractionDigits: ccy === "NGN" ? 0 : 2,
    })
  );
};

export const wallets = [
  { ccy: "NGN", balance: 1_284_500_000, label: "Naira Wallet", flag: "🇳🇬" },
  { ccy: "USD", balance: 4_820_410.55, label: "Dollar Wallet", flag: "🇺🇸" },
  { ccy: "EUR", balance: 612_300.12, label: "Euro Wallet", flag: "🇪🇺" },
  { ccy: "GBP", balance: 318_750.4, label: "Pound Wallet", flag: "🇬🇧" },
];

export const transactions = [
  { id: "TXN-948213", date: "2026-05-11 09:42", type: "FX Conversion", desc: "USD → NGN", amount: 1_250_000, ccy: "USD", status: "Completed" },
  { id: "TXN-948210", date: "2026-05-11 08:15", type: "Outgoing", desc: "Schlumberger Ltd · Houston", amount: 487_300, ccy: "USD", status: "Completed" },
  { id: "TXN-948205", date: "2026-05-10 17:01", type: "Funding", desc: "GTBank inflow", amount: 850_000_000, ccy: "NGN", status: "Completed" },
  { id: "TXN-948199", date: "2026-05-10 14:22", type: "Outgoing", desc: "Halliburton Energy · UK", amount: 92_400, ccy: "GBP", status: "Pending" },
  { id: "TXN-948188", date: "2026-05-10 11:08", type: "FX Conversion", desc: "EUR → USD", amount: 215_000, ccy: "EUR", status: "Completed" },
  { id: "TXN-948170", date: "2026-05-09 16:45", type: "Outgoing", desc: "Total Energies · Paris", amount: 380_000, ccy: "EUR", status: "Completed" },
  { id: "TXN-948161", date: "2026-05-09 12:30", type: "Funding", desc: "Card · Visa **4421", amount: 50_000_000, ccy: "NGN", status: "Failed" },
  { id: "TXN-948150", date: "2026-05-09 10:12", type: "Outgoing", desc: "Baker Hughes · Aberdeen", amount: 145_200, ccy: "GBP", status: "Completed" },
];

export const cashFlow = [
  { d: "May 5", inflow: 420, outflow: 280 },
  { d: "May 6", inflow: 380, outflow: 310 },
  { d: "May 7", inflow: 510, outflow: 290 },
  { d: "May 8", inflow: 470, outflow: 360 },
  { d: "May 9", inflow: 620, outflow: 410 },
  { d: "May 10", inflow: 850, outflow: 540 },
  { d: "May 11", inflow: 720, outflow: 480 },
];

export const beneficiaries = [
  { name: "Schlumberger Ltd", country: "USA", bank: "JPMorgan Chase", account: "•••• 8821", ccy: "USD" },
  { name: "Halliburton Energy", country: "UK", bank: "Barclays", account: "•••• 4412", ccy: "GBP" },
  { name: "Total Energies", country: "France", bank: "BNP Paribas", account: "•••• 7790", ccy: "EUR" },
  { name: "Baker Hughes", country: "UK", bank: "HSBC", account: "•••• 1230", ccy: "GBP" },
  { name: "ExxonMobil", country: "USA", bank: "Citibank", account: "•••• 5566", ccy: "USD" },
];

export const team = [
  { name: "Adaeze Okafor", email: "adaeze@ndexploration.ng", role: "Admin", status: "Active" },
  { name: "Kunle Adebayo", email: "kunle@ndexploration.ng", role: "Treasury", status: "Active" },
  { name: "Fatima Musa", email: "fatima@ndexploration.ng", role: "Finance", status: "Active" },
  { name: "Chinedu Eze", email: "chinedu@ndexploration.ng", role: "Compliance", status: "Pending" },
  { name: "Tomiwa Lawal", email: "tomiwa@ndexploration.ng", role: "Viewer", status: "Active" },
];

export const fxHistory = [
  { d: "Mon", rate: 1598 },
  { d: "Tue", rate: 1604 },
  { d: "Wed", rate: 1601 },
  { d: "Thu", rate: 1609 },
  { d: "Fri", rate: 1612 },
  { d: "Sat", rate: 1615 },
  { d: "Sun", rate: 1612 },
];

// ---------- Trade & Logistics ----------
export const importers = [
  { name: "ABC Electronics", country: "Nigeria", shipments: 14, outstanding: 24_500, status: "Active" },
  { name: "Global Motors", country: "Nigeria", shipments: 9, outstanding: 0, status: "Active" },
  { name: "Balogun Trade Hub", country: "Nigeria", shipments: 22, outstanding: 8_900, status: "Active" },
  { name: "Trade Fair Imports", country: "Nigeria", shipments: 6, outstanding: 12_000, status: "Pending KYB" },
  { name: "Dav Excel Autos", country: "Nigeria", shipments: 11, outstanding: 3_200, status: "Active" },
  { name: "Billion Trend Autos", country: "Nigeria", shipments: 7, outstanding: 0, status: "Active" },
];

export const suppliers = [
  { name: "Guangzhou Tech Factory", country: "China", category: "Electronics", verified: true, invoices: 18 },
  { name: "Yiwu General Trading", country: "China", category: "Fashion", verified: true, invoices: 27 },
  { name: "Foshan Furniture Works", country: "China", category: "Furniture", verified: true, invoices: 9 },
  { name: "Shenzhen Electronics Co.", country: "China", category: "Electronics", verified: true, invoices: 14 },
  { name: "Dubai Auto Parts Hub", country: "UAE", category: "Auto", verified: false, invoices: 6 },
];

export const freightForwarders = [
  { name: "Dragon Freight Nigeria", routes: 8, activeShipments: 24, rating: 4.8 },
  { name: "Lagos-China Cargo", routes: 5, activeShipments: 17, rating: 4.6 },
  { name: "SwiftPort Logistics", routes: 11, activeShipments: 31, rating: 4.7 },
  { name: "Global Route Freight", routes: 7, activeShipments: 12, rating: 4.4 },
];

export type ShipmentVertical =
  | { kind: "Vehicles"; vin: string; make: string; model: string; year: number; color: string; image: string; source: string; vehicleStatus: string }
  | { kind: "Electronics"; sku: string; cartons: number; units: number; productCategory: string; supplierInvoice: string }
  | { kind: "Fashion"; bales: number; sizeMix: string; productCategory: string }
  | { kind: "Machinery"; serial: string; weightKg: number; installDocs: string; machineCategory: string }
  | { kind: "General"; productCategory: string };

export type Shipment = {
  id: string;
  name: string;
  shipmentNumber: string;
  type: "Container" | "RORO" | "Air Freight" | "Courier" | "Loose Cargo";
  shippingLine: string;
  origin: string;
  destination: string;
  eta: string;
  status: "Booked" | "At Origin" | "Loaded" | "On Vessel" | "Arrived" | "Customs" | "Released" | "Delivered" | "Delayed";
  importer: string;
  supplier: string;
  forwarder: string;
  container?: string;
  bl?: string;
  vessel?: string;
  category: string;
  value: number;
  ccy: string;
  documents: string[];
  notes: string;
  vertical: ShipmentVertical;
};

export const shippingLines = ["MSC", "Maersk", "CMA CGM", "COSCO", "OOCL", "Grimaldi", "Hapag-Lloyd", "Evergreen", "Emirates SkyCargo", "DHL"];

export const shipments: Shipment[] = [
  { id: "SHP-10421", name: "Guangzhou → Lagos electronics", shipmentNumber: "CNT-2026-0421", type: "Container", shippingLine: "MSC", origin: "Guangzhou, CN", destination: "Apapa, LOS", eta: "2026-06-18", status: "On Vessel", importer: "ABC Electronics", supplier: "Guangzhou Tech Factory", forwarder: "Dragon Freight Nigeria", container: "MSCU7762213", bl: "BL-998211", vessel: "MSC ANTONIA", category: "Electronics", value: 184_000, ccy: "USD", documents: ["Commercial Invoice", "Packing List", "BL", "Form M"], notes: "Mixed consumer electronics, 240 cartons.", vertical: { kind: "Electronics", sku: "ELC-MIX-Q2", cartons: 240, units: 6480, productCategory: "Consumer Electronics", supplierInvoice: "INV-GZTF-2241" } },
  { id: "SHP-10422", name: "Yiwu → Lagos fashion bales", shipmentNumber: "CNT-2026-0422", type: "Container", shippingLine: "COSCO", origin: "Yiwu, CN", destination: "Tin Can, LOS", eta: "2026-06-22", status: "Loaded", importer: "Balogun Trade Hub", supplier: "Yiwu General Trading", forwarder: "Lagos-China Cargo", container: "TGHU4421021", bl: "BL-998244", vessel: "COSCO SHIPPING ARIES", category: "Fashion", value: 67_400, ccy: "USD", documents: ["Commercial Invoice", "Packing List", "BL"], notes: "Mixed fashion bales for retail market.", vertical: { kind: "Fashion", bales: 180, sizeMix: "S 25% · M 40% · L 25% · XL 10%", productCategory: "Mixed Apparel" } },
  { id: "SHP-10423", name: "Dubai → Lagos auto spares", shipmentNumber: "CNT-2026-0423", type: "Container", shippingLine: "CMA CGM", origin: "Jebel Ali, AE", destination: "Apapa, LOS", eta: "2026-06-14", status: "Customs", importer: "Dav Excel Autos", supplier: "Dubai Auto Parts Hub", forwarder: "SwiftPort Logistics", container: "DUBU1102234", bl: "BL-998191", vessel: "CMA CGM IVANHOE", category: "Auto Parts", value: 41_900, ccy: "USD", documents: ["Commercial Invoice", "Packing List", "BL", "SONCAP"], notes: "Spare parts mostly for Toyota & Honda.", vertical: { kind: "Electronics", sku: "AUTO-SP-088", cartons: 88, units: 1320, productCategory: "Auto Spare Parts", supplierInvoice: "INV-DAPH-1190" } },
  { id: "SHP-10424", name: "Houston → Lagos vehicles", shipmentNumber: "RORO-2026-0424", type: "RORO", shippingLine: "Grimaldi", origin: "Houston, US", destination: "Tin Can, LOS", eta: "2026-06-29", status: "On Vessel", importer: "Global Motors", supplier: "BidCar Auctions LLC", forwarder: "Global Route Freight", vessel: "GRIMALDI EUROPA", category: "Vehicles", value: 312_500, ccy: "USD", documents: ["Bill of Sale", "Title", "BL"], notes: "12 vehicles, mixed makes from Houston auction.", vertical: { kind: "Vehicles", vin: "1HGCM82633A123456", make: "Toyota", model: "Highlander XLE", year: 2020, color: "Pearl White", image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600", source: "Copart · Houston Lot #88210", vehicleStatus: "Loaded on vessel" } },
  { id: "SHP-10425", name: "Shenzhen → Lagos machinery", shipmentNumber: "CNT-2026-0425", type: "Container", shippingLine: "OOCL", origin: "Shenzhen, CN", destination: "Apapa, LOS", eta: "2026-06-09", status: "Arrived", importer: "Billion Trend Autos", supplier: "Shenzhen Electronics Co.", forwarder: "Dragon Freight Nigeria", container: "OOLU9981122", bl: "BL-998260", vessel: "OOCL HONG KONG", category: "Machinery", value: 96_200, ccy: "USD", documents: ["Commercial Invoice", "Packing List", "BL", "Installation Manual"], notes: "Industrial CNC milling machine.", vertical: { kind: "Machinery", serial: "CNC-9981-22A", weightKg: 4200, installDocs: "Install + commissioning manual + electrical schematics", machineCategory: "CNC Milling" } },
  { id: "SHP-10426", name: "Foshan → Lagos furniture", shipmentNumber: "CNT-2026-0426", type: "Container", shippingLine: "Maersk", origin: "Foshan, CN", destination: "Tin Can, LOS", eta: "2026-07-02", status: "At Origin", importer: "Trade Fair Imports", supplier: "Foshan Furniture Works", forwarder: "Lagos-China Cargo", container: "CCLU3399012", bl: "BL-998270", vessel: "—", category: "Furniture", value: 28_700, ccy: "USD", documents: ["Pro-forma Invoice"], notes: "Awaiting full payment before pickup.", vertical: { kind: "General", productCategory: "Office Furniture" } },
  { id: "SHP-10427", name: "Yiwu → Lagos accessories (Air)", shipmentNumber: "AIR-2026-0427", type: "Air Freight", shippingLine: "Emirates SkyCargo", origin: "Yiwu, CN", destination: "MMIA Lagos", eta: "2026-06-12", status: "Delayed", importer: "ABC Electronics", supplier: "Yiwu General Trading", forwarder: "SwiftPort Logistics", category: "Accessories", value: 9_400, ccy: "USD", documents: ["Commercial Invoice", "AWB"], notes: "Delay at Dubai hub — rebooked to next flight.", vertical: { kind: "Electronics", sku: "ACC-PHONE-K12", cartons: 14, units: 1680, productCategory: "Phone Accessories", supplierInvoice: "INV-YWGT-3382" } },
  { id: "SHP-10428", name: "Long Beach → Lagos vehicles", shipmentNumber: "RORO-2026-0428", type: "RORO", shippingLine: "Grimaldi", origin: "Long Beach, US", destination: "Tin Can, LOS", eta: "2026-07-11", status: "Booked", importer: "Dav Excel Autos", supplier: "Manheim Auctions", forwarder: "Global Route Freight", vessel: "GRANDE LAGOS", category: "Vehicles", value: 28_400, ccy: "USD", documents: ["Bill of Sale", "Title"], notes: "Single vehicle — Lexus RX350.", vertical: { kind: "Vehicles", vin: "2T2HK31U68C083421", make: "Lexus", model: "RX 350", year: 2019, color: "Obsidian Black", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600", source: "Manheim · Long Beach Lot #44120", vehicleStatus: "Awaiting loading" } },
  { id: "SHP-10429", name: "Hamburg → Lagos courier parcels", shipmentNumber: "CUR-2026-0429", type: "Courier", shippingLine: "DHL", origin: "Hamburg, DE", destination: "MMIA Lagos", eta: "2026-06-10", status: "Released", importer: "ABC Electronics", supplier: "Berlin Tech Supply", forwarder: "SwiftPort Logistics", category: "Samples", value: 1_240, ccy: "EUR", documents: ["AWB", "Commercial Invoice"], notes: "Sample units for QA before bulk order.", vertical: { kind: "General", productCategory: "Samples" } },
];

export type TradeFile = {
  id: string;
  name: string;
  importer: string;
  supplier: string;
  forwarder: string;
  origin: string;
  destination: string;
  goods: string;
  invoiceValue: number;
  ccy: string;
  status: "Drafting" | "In Transit" | "Arrived" | "Cleared" | "Delivered";
  eta: string;
  risk: "Low" | "Medium" | "High";
  paymentStatus: "Pending" | "Partial" | "Paid";
  escrow: "Inactive" | "Held" | "Released";
};

export const tradeFiles: TradeFile[] = [
  { id: "TF-2026-0214", name: "ABC Electronics · GZ container Q2", importer: "ABC Electronics", supplier: "Guangzhou Tech Factory", forwarder: "Dragon Freight Nigeria", origin: "Guangzhou, CN", destination: "Lagos, NG", goods: "Mixed consumer electronics, 240 cartons", invoiceValue: 184_000, ccy: "USD", status: "In Transit", eta: "2026-06-18", risk: "Low", paymentStatus: "Partial", escrow: "Held" },
  { id: "TF-2026-0218", name: "Balogun Trade · fashion bales", importer: "Balogun Trade Hub", supplier: "Yiwu General Trading", forwarder: "Lagos-China Cargo", origin: "Yiwu, CN", destination: "Lagos, NG", goods: "Mixed fashion bales, 180 bales", invoiceValue: 67_400, ccy: "USD", status: "In Transit", eta: "2026-06-22", risk: "Low", paymentStatus: "Paid", escrow: "Released" },
  { id: "TF-2026-0221", name: "Dav Excel · Dubai spares", importer: "Dav Excel Autos", supplier: "Dubai Auto Parts Hub", forwarder: "SwiftPort Logistics", origin: "Dubai, AE", destination: "Lagos, NG", goods: "Auto spare parts, 88 cartons", invoiceValue: 41_900, ccy: "USD", status: "Arrived", eta: "2026-06-14", risk: "Medium", paymentStatus: "Paid", escrow: "Released" },
  { id: "TF-2026-0224", name: "Global Motors · US auctions", importer: "Global Motors", supplier: "BidCar Auctions LLC", forwarder: "Global Route Freight", origin: "Houston, US", destination: "Lagos, NG", goods: "12 vehicles, mixed makes", invoiceValue: 312_500, ccy: "USD", status: "In Transit", eta: "2026-06-29", risk: "Medium", paymentStatus: "Partial", escrow: "Held" },
  { id: "TF-2026-0229", name: "Trade Fair · furniture lot", importer: "Trade Fair Imports", supplier: "Foshan Furniture Works", forwarder: "Lagos-China Cargo", origin: "Foshan, CN", destination: "Lagos, NG", goods: "Office furniture, 60 cartons", invoiceValue: 28_700, ccy: "USD", status: "Drafting", eta: "2026-07-02", risk: "Low", paymentStatus: "Pending", escrow: "Inactive" },
];

export const shipmentMilestones = [
  "Invoice received", "Supplier confirmed", "Goods picked up", "At origin warehouse",
  "Container loaded", "On vessel", "Transshipment", "Arrived at port",
  "Customs clearance", "Released", "Delivered",
];

// ---------- Cards ----------
export type Card = {
  id: string;
  label: string;
  type: "Business" | "Travel" | "Importer" | "Student" | "Ad Spend" | "Team";
  last4: string;
  balance: number;
  monthlySpend: number;
  limit: number;
  status: "Active" | "Frozen" | "Expired";
  holder: string;
};

export const cards: Card[] = [
  { id: "CRD-001", label: "Treasury Ops Card", type: "Business", last4: "4421", balance: 18_400, monthlySpend: 12_320, limit: 50_000, status: "Active", holder: "Adaeze Okonkwo" },
  { id: "CRD-002", label: "Lagos→Dubai Sourcing Trip", type: "Travel", last4: "8810", balance: 4_200, monthlySpend: 3_870, limit: 6_000, status: "Active", holder: "Tunde Bakare" },
  { id: "CRD-003", label: "Trade Expenses · Guangzhou Q2", type: "Importer", last4: "9921", balance: 7_800, monthlySpend: 5_400, limit: 20_000, status: "Active", holder: "Ops Team" },
  { id: "CRD-004", label: "Meta Ads — Brand", type: "Ad Spend", last4: "3145", balance: 1_900, monthlySpend: 8_700, limit: 10_000, status: "Active", holder: "Growth Team" },
  { id: "CRD-005", label: "Student Allowance · Aisha", type: "Student", last4: "2210", balance: 920, monthlySpend: 1_100, limit: 1_500, status: "Active", holder: "Aisha Bello" },
  { id: "CRD-006", label: "Sales Team Card", type: "Team", last4: "7782", balance: 6_400, monthlySpend: 4_120, limit: 15_000, status: "Frozen", holder: "Sales Team" },
];

// ---------- AI Growth ----------
export const leads = [
  { id: "L-401", name: "Mega Plaza Imports", segment: "Importer", country: "Nigeria", score: 92, value: 280_000, stage: "Hot", note: "Imports electronics monthly from Shenzhen." },
  { id: "L-402", name: "Africa Cargo Express", segment: "Freight Forwarder", country: "Nigeria", score: 81, value: 140_000, stage: "Warm", note: "Looking to digitize shipment updates." },
  { id: "L-403", name: "Hangzhou Apparel Group", segment: "Supplier", country: "China", score: 76, value: 95_000, stage: "Warm", note: "Wants stable NGN→CNY settlement." },
  { id: "L-404", name: "Pan-African University", segment: "Global Merchant", country: "UK", score: 88, value: 410_000, stage: "Hot", note: "Tuition collections from 4 African countries." },
  { id: "L-405", name: "Royal Dubai Motors", segment: "Supplier", country: "UAE", score: 67, value: 60_000, stage: "Cold", note: "Sells used vehicles to Lagos buyers." },
];

// ---------- Global Collections ----------
export const collections = [
  { id: "COL-2031", payer: "Adekunle Adebanjo", purpose: "Tuition · Pan-African University", amount: 12_500, ccy: "GBP", status: "Settled", date: "2026-06-04" },
  { id: "COL-2032", payer: "Helena Owusu", purpose: "Property deposit · Coastal Estates", amount: 28_000, ccy: "USD", status: "Pending", date: "2026-06-05" },
  { id: "COL-2033", payer: "Bola Ahmed", purpose: "Medical bill · St. Thomas Hospital", amount: 4_800, ccy: "USD", status: "Settled", date: "2026-06-06" },
  { id: "COL-2034", payer: "Chinwe Iroka", purpose: "Travel · KLM Flights", amount: 2_100, ccy: "EUR", status: "Settled", date: "2026-06-07" },
  { id: "COL-2035", payer: "Femi Adeyemi", purpose: "E-commerce · Order #88210", amount: 340, ccy: "USD", status: "Failed", date: "2026-06-07" },
];

// ---------- Integrations ----------
export const integrations = [
  { name: "Vizion", category: "Shipment Tracking", connected: true, desc: "Container visibility across 100+ carriers." },
  { name: "Shipsgo", category: "Shipment Tracking", connected: false, desc: "Container & BL tracking API." },
  { name: "SeaRates", category: "Shipment Tracking", connected: false, desc: "Live freight rates & schedules." },
  { name: "Maersk", category: "Shipment Tracking", connected: true, desc: "Direct Maersk container milestones." },
  { name: "Flutterwave", category: "Payments", connected: true, desc: "NGN collection & payouts." },
  { name: "Paystack", category: "Payments", connected: true, desc: "Local card & bank collection." },
  { name: "Monnify", category: "Payments", connected: false, desc: "Dedicated NUBAN accounts." },
  { name: "Fincra", category: "Payments", connected: false, desc: "Cross-border settlement rails." },
  { name: "WhatsApp Business API", category: "Messaging", connected: true, desc: "Customer updates & onboarding." },
  { name: "SMS Gateway", category: "Messaging", connected: true, desc: "Transactional SMS alerts." },
  { name: "Smile Identity", category: "Compliance", connected: true, desc: "KYC, KYB, ID verification." },
  { name: "ComplyAdvantage", category: "Compliance", connected: false, desc: "Sanctions & PEP screening." },
  { name: "Marqeta", category: "Cards", connected: true, desc: "Card issuing platform." },
  { name: "Apple Pay", category: "Cards", connected: false, desc: "Mobile wallet readiness." },
  { name: "Cloudflare R2", category: "Storage", connected: true, desc: "Document storage." },
  { name: "QuickBooks", category: "Accounting", connected: false, desc: "Sync ledger & invoices." },
  { name: "Xero", category: "Accounting", connected: false, desc: "Two-way ledger sync." },
];

// ---------- Compliance ----------
export const complianceItems = [
  { id: "CMP-001", entity: "Niger Delta Exploration", type: "KYB", status: "Verified", owner: "Chiamaka Eze", updated: "2026-05-30" },
  { id: "CMP-002", entity: "ABC Electronics", type: "KYB", status: "In Review", owner: "Chiamaka Eze", updated: "2026-06-02" },
  { id: "CMP-003", entity: "Guangzhou Tech Factory", type: "Supplier Verification", status: "Verified", owner: "Trade Officer", updated: "2026-05-28" },
  { id: "CMP-004", entity: "Trade Fair Imports", type: "KYB", status: "Enhanced DD", owner: "Chiamaka Eze", updated: "2026-06-05" },
  { id: "CMP-005", entity: "Dubai Auto Parts Hub", type: "Sanctions Screen", status: "Verified", owner: "AutoScreen", updated: "2026-06-04" },
  { id: "CMP-006", entity: "Royal Dubai Motors", type: "KYB", status: "Not Started", owner: "—", updated: "—" },
];

// ---------- WhatsApp ----------
export const whatsappThreads = [
  { id: "WA-01", from: "ABC Electronics · Tunde", last: "Sent BL for SHP-10421", time: "2m ago", unread: 1 },
  { id: "WA-02", from: "Balogun Trade · Risikat", last: "When will my goods arrive?", time: "11m ago", unread: 2 },
  { id: "WA-03", from: "Dav Excel · Bayo", last: "Uploaded packing list", time: "1h ago", unread: 0 },
  { id: "WA-04", from: "Global Motors · Ngozi", last: "Need landed cost estimate", time: "3h ago", unread: 1 },
];
