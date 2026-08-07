// Mock data + helpers for the Kingsbridge Property Partners Partner Property Payments workspace.
// Pure presentation data; no backend.

export type CaseStatus =
  | "Draft"
  | "Referred"
  | "Referral Created"
  | "KYC Pending"
  | "KYC Documents Uploaded"
  | "Awaiting FX Quote"
  | "FX Quote Generated"
  | "Payment Link Generated"
  | "Payment Link Sent"
  | "Client Verification Pending"
  | "BVN Pending"
  | "BVN Submitted"
  | "Client Consent Completed"
  | "Awaiting Client Funding"
  | "Funding Received"
  | "Funding Review"
  | "FX Quote Sent"
  | "FX Accepted"
  | "FX Converted"
  | "Payout Processing"
  | "Paid to Solicitor"
  | "Receipt Uploaded"
  | "Client Invited to Canta"
  | "Completed"
  | "Failed / Returned"
  | "Cancelled"
  | "Expired Quote";

export const CASE_STATUSES: CaseStatus[] = [
  "Draft",
  "Referred",
  "Referral Created",
  "KYC Pending",
  "KYC Documents Uploaded",
  "Awaiting FX Quote",
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
  "Cancelled",
  "Expired Quote",
];

export function statusTone(s: CaseStatus): string {
  switch (s) {
    case "Paid to Solicitor":
    case "Receipt Uploaded":
    case "Completed":
    case "Client Invited to Canta":
      return "bg-success/15 text-success border-success/30";
    case "Failed / Returned":
    case "Cancelled":
    case "Expired Quote":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Payout Processing":
    case "FX Converted":
    case "FX Accepted":
    case "FX Quote Generated":
    case "Payment Link Generated":
    case "Payment Link Sent":
      return "bg-primary/15 text-primary border-primary/30";
    case "Funding Received":
    case "Funding Review":
    case "FX Quote Sent":
    case "BVN Submitted":
    case "Client Consent Completed":
      return "bg-accent/15 text-accent border-accent/30";
    default:
      return "bg-warning/15 text-warning border-warning/30";
  }
}

/* ---------------- Roles & users (Kingsbridge Property Partners partner org) ---------------- */

export type PartnerRole =
  | "partner_admin"
  | "partner_manager"
  | "marketer"
  | "finance_viewer"
  | "viewer";

export const PARTNER_ROLES: { id: PartnerRole; label: string; blurb: string }[] = [
  {
    id: "partner_admin",
    label: "Partner Admin",
    blurb: "Full access across Kingsbridge Property Partners.",
  },
  {
    id: "partner_manager",
    label: "Partner Manager",
    blurb: "Assigned marketers, their clients & performance.",
  },
  {
    id: "marketer",
    label: "Marketer / Sales Agent",
    blurb: "Only my referrals, leads, cases and payouts.",
  },
  { id: "finance_viewer", label: "Finance Viewer", blurb: "Payouts, receipts and reports." },
  { id: "viewer", label: "Viewer", blurb: "Read-only access." },
];

export type Marketer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: PartnerRole;
  managerId?: string; // for marketers managed by a Partner Manager
  region: string;
  avatarInitials: string;
  joined: string;
  status: "Active" | "Inactive";
  lastActivity: string;
};

export const PARTNER_ORG = {
  id: "ORG-KINGSBRIDGE",
  name: "Kingsbridge Property Partners",
  type: "Property Partner",
  country: "United Kingdom",
};

export const MARKETERS: Marketer[] = [
  {
    id: "U-ADMIN",
    name: "Charlotte Hayes",
    email: "charlotte@kingsbridgepartners.co.uk",
    phone: "+44 20 7946 1100",
    role: "partner_admin",
    region: "HQ — London",
    avatarInitials: "CB",
    joined: "2024-02-12",
    status: "Active",
    lastActivity: "2026-06-10",
  },
  {
    id: "U-MGR-1",
    name: "Marcus Whitfield",
    email: "marcus@kingsbridgepartners.co.uk",
    phone: "+44 20 7946 1101",
    role: "partner_manager",
    region: "UK & Europe",
    avatarInitials: "MC",
    joined: "2024-03-04",
    status: "Active",
    lastActivity: "2026-06-10",
  },
  {
    id: "U-MGR-2",
    name: "Priya Shah",
    email: "priya@kingsbridgepartners.co.uk",
    phone: "+44 20 7946 1102",
    role: "partner_manager",
    region: "Middle East & Africa",
    avatarInitials: "PS",
    joined: "2024-05-18",
    status: "Active",
    lastActivity: "2026-06-09",
  },
  {
    id: "U-MKT-1",
    name: "Sade Ojo",
    email: "sade@kingsbridgepartners.co.uk",
    phone: "+234 802 555 1011",
    role: "marketer",
    managerId: "U-MGR-2",
    region: "Lagos, Nigeria",
    avatarInitials: "SO",
    joined: "2024-06-01",
    status: "Active",
    lastActivity: "2026-06-10",
  },
  {
    id: "U-MKT-2",
    name: "Daniel Reed",
    email: "daniel@kingsbridgepartners.co.uk",
    phone: "+234 803 555 1022",
    role: "marketer",
    managerId: "U-MGR-2",
    region: "Abuja, Nigeria",
    avatarInitials: "DR",
    joined: "2024-08-12",
    status: "Active",
    lastActivity: "2026-06-09",
  },
  {
    id: "U-MKT-3",
    name: "Michael Turner",
    email: "michael@kingsbridgepartners.co.uk",
    phone: "+234 805 555 1033",
    role: "marketer",
    managerId: "U-MGR-1",
    region: "London, UK",
    avatarInitials: "MT",
    joined: "2024-09-20",
    status: "Active",
    lastActivity: "2026-06-08",
  },
  {
    id: "U-MKT-4",
    name: "Sarah Quinn",
    email: "sarah@kingsbridgepartners.co.uk",
    phone: "+44 161 555 1044",
    role: "marketer",
    managerId: "U-MGR-1",
    region: "Manchester, UK",
    avatarInitials: "SQ",
    joined: "2025-01-09",
    status: "Active",
    lastActivity: "2026-06-07",
  },
  {
    id: "U-FIN-1",
    name: "Amina Yusuf",
    email: "finance@kingsbridgepartners.co.uk",
    phone: "+44 20 7946 1199",
    role: "finance_viewer",
    region: "HQ — London",
    avatarInitials: "AY",
    joined: "2024-04-04",
    status: "Active",
    lastActivity: "2026-06-09",
  },
];

export function getMarketer(id: string) {
  return MARKETERS.find((m) => m.id === id);
}

/* ---------------- Solicitors ---------------- */

export type Solicitor = {
  id: string;
  firm: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  currency: "GBP" | "EUR" | "USD";
  bank: string;
  accountName: string;
  accountNumberMasked: string;
  iban?: string;
  sortCode?: string;
  swift: string;
  verified: "Verified" | "Pending" | "Re-verification";
  preferred: boolean;
  linkedClients: number;
  totalPayouts: number;
  lastPayout: string;
};

export const SOLICITORS: Solicitor[] = [
  {
    id: "SOL-001",
    firm: "Hartwell & Greaves LLP",
    contact: "Olivia Hartwell",
    email: "payments@hartwell-greaves.co.uk",
    phone: "+44 20 7946 0021",
    country: "United Kingdom",
    currency: "GBP",
    bank: "Barclays Bank PLC",
    accountName: "Hartwell & Greaves Client A/C",
    accountNumberMasked: "•••• 4421",
    sortCode: "20-00-00",
    iban: "GB29 BARC 2000 0044 2188 21",
    swift: "BARCGB22",
    verified: "Verified",
    preferred: true,
    linkedClients: 12,
    totalPayouts: 4_812_500,
    lastPayout: "2026-06-04",
  },
  {
    id: "SOL-002",
    firm: "Carter & Linton Solicitors",
    contact: "James Linton",
    email: "client.accounts@carterlinton.co.uk",
    phone: "+44 161 555 0144",
    country: "United Kingdom",
    currency: "GBP",
    bank: "HSBC UK",
    accountName: "Carter & Linton Client Account",
    accountNumberMasked: "•••• 7782",
    sortCode: "40-05-15",
    iban: "GB54 HBUK 4005 1577 8298 11",
    swift: "HBUKGB4B",
    verified: "Verified",
    preferred: false,
    linkedClients: 8,
    totalPayouts: 2_185_000,
    lastPayout: "2026-05-28",
  },
  {
    id: "SOL-003",
    firm: "Marlowe Property Law",
    contact: "Aisha Marlowe",
    email: "completions@marloweproperty.co.uk",
    phone: "+44 121 555 0902",
    country: "United Kingdom",
    currency: "GBP",
    bank: "NatWest",
    accountName: "Marlowe Property Law Client",
    accountNumberMasked: "•••• 9012",
    sortCode: "60-12-04",
    iban: "GB44 NWBK 6012 0490 1281 22",
    swift: "NWBKGB2L",
    verified: "Pending",
    preferred: false,
    linkedClients: 3,
    totalPayouts: 487_200,
    lastPayout: "2026-05-12",
  },
  {
    id: "SOL-004",
    firm: "Whitfield & Co.",
    contact: "Amina Yusuf",
    email: "accounts@whitfieldco.co.uk",
    phone: "+44 113 555 4410",
    country: "United Kingdom",
    currency: "GBP",
    bank: "Lloyds Bank",
    accountName: "Whitfield & Co. Client Account",
    accountNumberMasked: "•••• 3318",
    sortCode: "30-94-21",
    iban: "GB18 LOYD 3094 2133 1844 09",
    swift: "LOYDGB21",
    verified: "Re-verification",
    preferred: false,
    linkedClients: 2,
    totalPayouts: 312_000,
    lastPayout: "2026-04-18",
  },
];

/* ---------------- Payment cases (with marketer attribution) ---------------- */

export type PaymentCase = {
  id: string;
  ref: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  property: string;
  propertyLocation: string;
  amountGBP: number;
  amountNGN?: number;
  currency: "GBP";
  solicitorId: string;
  status: CaseStatus;
  createdAt: string;
  expectedPayout: string;
  officer: string;
  assignedMarketerId: string; // attribution
  partnerCommission?: number; // GBP
  marketerCommission?: number; // GBP
  paymentReference?: string;
  receiptStatus?: "Uploaded" | "Pending";
};

export const CASES: PaymentCase[] = [
  {
    id: "CS-1001",
    ref: "KPP-2026-1001",
    clientName: "Adekunle Okoye",
    clientEmail: "adekunle.okoye@email.com",
    clientPhone: "+234 802 555 0102",
    property: "The Wharf — Apartment 14B",
    propertyLocation: "Manchester, UK",
    amountGBP: 248_500,
    amountNGN: 510_240_000,
    currency: "GBP",
    solicitorId: "SOL-001",
    status: "Paid to Solicitor",
    createdAt: "2026-05-20",
    expectedPayout: "2026-06-04",
    officer: "Sade Ojo",
    assignedMarketerId: "U-MKT-1",
    partnerCommission: 1242,
    marketerCommission: 621,
    paymentReference: "KPP/CS-1001/COMPL",
    receiptStatus: "Uploaded",
  },
  {
    id: "CS-1002",
    ref: "KPP-2026-1002",
    clientName: "Folake Adeyemi",
    clientEmail: "folake.a@email.com",
    clientPhone: "+234 803 555 0144",
    property: "Riverside Heights — 21F",
    propertyLocation: "Liverpool, UK",
    amountGBP: 185_000,
    amountNGN: 380_065_000,
    currency: "GBP",
    solicitorId: "SOL-001",
    status: "Receipt Uploaded",
    createdAt: "2026-05-18",
    expectedPayout: "2026-06-02",
    officer: "Daniel Reed",
    assignedMarketerId: "U-MKT-2",
    partnerCommission: 925,
    marketerCommission: 462,
    paymentReference: "KPP/CS-1002/COMPL",
    receiptStatus: "Uploaded",
  },
  {
    id: "CS-1003",
    ref: "KPP-2026-1003",
    clientName: "Ibrahim Sani",
    clientEmail: "ibrahim.sani@email.com",
    clientPhone: "+234 805 555 0788",
    property: "Kings Cross Residences — 4A",
    propertyLocation: "London, UK",
    amountGBP: 612_000,
    amountNGN: 1_257_240_000,
    currency: "GBP",
    solicitorId: "SOL-002",
    status: "Payout Processing",
    createdAt: "2026-06-01",
    expectedPayout: "2026-06-12",
    officer: "Sade Ojo",
    assignedMarketerId: "U-MKT-1",
    paymentReference: "KPP/CS-1003/COMPL",
  },
  {
    id: "CS-1004",
    ref: "KPP-2026-1004",
    clientName: "Ngozi Eze",
    clientEmail: "ngozi.eze@email.com",
    clientPhone: "+234 806 555 0331",
    property: "Salford Quays — Plot 9",
    propertyLocation: "Salford, UK",
    amountGBP: 92_500,
    amountNGN: 190_037_500,
    currency: "GBP",
    solicitorId: "SOL-003",
    status: "FX Converted",
    createdAt: "2026-06-03",
    expectedPayout: "2026-06-13",
    officer: "Michael Turner",
    assignedMarketerId: "U-MKT-3",
  },
  {
    id: "CS-1005",
    ref: "KPP-2026-1005",
    clientName: "Chidi Nnamdi",
    clientEmail: "chidi.n@email.com",
    clientPhone: "+234 807 555 0980",
    property: "The Atrium — 7C",
    propertyLocation: "Birmingham, UK",
    amountGBP: 318_900,
    amountNGN: 655_320_000,
    currency: "GBP",
    solicitorId: "SOL-001",
    status: "FX Quote Sent",
    createdAt: "2026-06-05",
    expectedPayout: "2026-06-15",
    officer: "Daniel Reed",
    assignedMarketerId: "U-MKT-2",
  },
  {
    id: "CS-1006",
    ref: "KPP-2026-1006",
    clientName: "Bukola Akande",
    clientEmail: "bukola.a@email.com",
    clientPhone: "+234 808 555 1122",
    property: "Greenpark Lofts — 12",
    propertyLocation: "Leeds, UK",
    amountGBP: 142_000,
    amountNGN: 291_710_000,
    currency: "GBP",
    solicitorId: "SOL-002",
    status: "Funding Received",
    createdAt: "2026-06-06",
    expectedPayout: "2026-06-16",
    officer: "Sade Ojo",
    assignedMarketerId: "U-MKT-4",
  },
  {
    id: "CS-1007",
    ref: "KPP-2026-1007",
    clientName: "Emeka Obi",
    clientEmail: "emeka.obi@email.com",
    clientPhone: "+234 809 555 6677",
    property: "Canary View — 18B",
    propertyLocation: "London, UK",
    amountGBP: 425_000,
    amountNGN: 873_375_000,
    currency: "GBP",
    solicitorId: "SOL-001",
    status: "Awaiting Client Funding",
    createdAt: "2026-06-07",
    expectedPayout: "2026-06-20",
    officer: "Michael Turner",
    assignedMarketerId: "U-MKT-3",
  },
  {
    id: "CS-1008",
    ref: "KPP-2026-1008",
    clientName: "Hauwa Bello",
    clientEmail: "hauwa.bello@email.com",
    clientPhone: "+234 810 555 8800",
    property: "Cathedral Square — 3F",
    propertyLocation: "Bristol, UK",
    amountGBP: 78_400,
    amountNGN: 161_140_000,
    currency: "GBP",
    solicitorId: "SOL-004",
    status: "Failed / Returned",
    createdAt: "2026-05-30",
    expectedPayout: "2026-06-06",
    officer: "Daniel Reed",
    assignedMarketerId: "U-MKT-2",
  },
  {
    id: "CS-1009",
    ref: "KPP-2026-1009",
    clientName: "Yetunde Lawal",
    clientEmail: "yetunde.l@email.com",
    clientPhone: "+234 811 555 9100",
    property: "Highgate Mews — 2A",
    propertyLocation: "London, UK",
    amountGBP: 510_000,
    amountNGN: 1_048_050_000,
    currency: "GBP",
    solicitorId: "SOL-001",
    status: "KYC Pending",
    createdAt: "2026-06-08",
    expectedPayout: "2026-06-22",
    officer: "Sade Ojo",
    assignedMarketerId: "U-MKT-1",
  },
  {
    id: "CS-1010",
    ref: "KPP-2026-1010",
    clientName: "Olumide Fashola",
    clientEmail: "olumide.f@email.com",
    clientPhone: "+234 812 555 7733",
    property: "Marina Wharf — 11C",
    propertyLocation: "Glasgow, UK",
    amountGBP: 198_000,
    amountNGN: 406_890_000,
    currency: "GBP",
    solicitorId: "SOL-002",
    status: "Referred",
    createdAt: "2026-06-09",
    expectedPayout: "2026-06-23",
    officer: "Michael Turner",
    assignedMarketerId: "U-MKT-4",
  },
];

export function getCase(id: string) {
  return CASES.find((c) => c.id === id);
}
export function getSolicitor(id: string) {
  return SOLICITORS.find((s) => s.id === id);
}
export function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}
export function formatNGN(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

/* ---------------- Referral leads ---------------- */

export type LeadStatus =
  | "New Lead"
  | "Contacted"
  | "Interested"
  | "Documents Requested"
  | "Awaiting Payment Instruction"
  | "Not Ready"
  | "Lost"
  | "Converted to Payment Case";

export const LEAD_STATUSES: LeadStatus[] = [
  "New Lead",
  "Contacted",
  "Interested",
  "Documents Requested",
  "Awaiting Payment Instruction",
  "Not Ready",
  "Lost",
  "Converted to Payment Case",
];

export function leadTone(s: LeadStatus): string {
  switch (s) {
    case "Converted to Payment Case":
      return "bg-success/15 text-success border-success/30";
    case "Lost":
    case "Not Ready":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Awaiting Payment Instruction":
    case "Documents Requested":
      return "bg-primary/15 text-primary border-primary/30";
    case "Interested":
      return "bg-accent/15 text-accent border-accent/30";
    default:
      return "bg-warning/15 text-warning border-warning/30";
  }
}

export type Lead = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  property: string;
  propertyLocation: string;
  expectedAmountGBP: number;
  status: LeadStatus;
  assignedMarketerId: string;
  createdAt: string;
  lastTouch: string;
  notes?: string;
};

export const LEADS: Lead[] = [
  {
    id: "LD-2001",
    clientName: "Kemi Akin",
    clientEmail: "kemi.akin@email.com",
    clientPhone: "+234 802 111 2233",
    property: "Park View Tower — 12A",
    propertyLocation: "London, UK",
    expectedAmountGBP: 295_000,
    status: "Interested",
    assignedMarketerId: "U-MKT-1",
    createdAt: "2026-06-02",
    lastTouch: "2026-06-09",
  },
  {
    id: "LD-2002",
    clientName: "Zainab Yusuf",
    clientEmail: "zainab.y@email.com",
    clientPhone: "+234 803 222 3344",
    property: "Salford Quays — Plot 14",
    propertyLocation: "Salford, UK",
    expectedAmountGBP: 110_000,
    status: "Documents Requested",
    assignedMarketerId: "U-MKT-2",
    createdAt: "2026-06-03",
    lastTouch: "2026-06-10",
  },
  {
    id: "LD-2003",
    clientName: "Olu Adesanya",
    clientEmail: "olu.a@email.com",
    clientPhone: "+234 805 333 4455",
    property: "Canary View — 5C",
    propertyLocation: "London, UK",
    expectedAmountGBP: 450_000,
    status: "Awaiting Payment Instruction",
    assignedMarketerId: "U-MKT-1",
    createdAt: "2026-06-04",
    lastTouch: "2026-06-10",
  },
  {
    id: "LD-2004",
    clientName: "Halima Bello",
    clientEmail: "halima.b@email.com",
    clientPhone: "+234 806 444 5566",
    property: "Greenpark Lofts — 7",
    propertyLocation: "Leeds, UK",
    expectedAmountGBP: 155_000,
    status: "New Lead",
    assignedMarketerId: "U-MKT-4",
    createdAt: "2026-06-09",
    lastTouch: "2026-06-09",
  },
  {
    id: "LD-2005",
    clientName: "Ade Williams",
    clientEmail: "ade.w@email.com",
    clientPhone: "+234 807 555 6677",
    property: "Marina Wharf — 8B",
    propertyLocation: "Glasgow, UK",
    expectedAmountGBP: 198_000,
    status: "Contacted",
    assignedMarketerId: "U-MKT-3",
    createdAt: "2026-06-06",
    lastTouch: "2026-06-08",
  },
  {
    id: "LD-2006",
    clientName: "Tope Salami",
    clientEmail: "tope.s@email.com",
    clientPhone: "+234 808 666 7788",
    property: "Kings Cross — 9D",
    propertyLocation: "London, UK",
    expectedAmountGBP: 380_000,
    status: "Not Ready",
    assignedMarketerId: "U-MKT-2",
    createdAt: "2026-05-25",
    lastTouch: "2026-06-01",
  },
  {
    id: "LD-2007",
    clientName: "Funmi Ojo",
    clientEmail: "funmi.o@email.com",
    clientPhone: "+234 809 777 8899",
    property: "Highgate Mews — 1A",
    propertyLocation: "London, UK",
    expectedAmountGBP: 525_000,
    status: "Converted to Payment Case",
    assignedMarketerId: "U-MKT-1",
    createdAt: "2026-05-15",
    lastTouch: "2026-06-08",
  },
  {
    id: "LD-2008",
    clientName: "Bayo Adigun",
    clientEmail: "bayo.a@email.com",
    clientPhone: "+234 810 888 9900",
    property: "Riverside — 11F",
    propertyLocation: "Liverpool, UK",
    expectedAmountGBP: 220_000,
    status: "Lost",
    assignedMarketerId: "U-MKT-4",
    createdAt: "2026-05-12",
    lastTouch: "2026-05-28",
  },
];

/* ---------------- Current partner user (mock) ---------------- */

const ROLE_KEY = "canta:partner_role";
const USER_KEY = "canta:partner_user_id";

export function getActivePartnerUserId(): string {
  if (typeof window === "undefined") return "U-ADMIN";
  return window.localStorage.getItem(USER_KEY) || "U-ADMIN";
}
export function getActivePartnerRole(): PartnerRole {
  if (typeof window === "undefined") return "partner_admin";
  return (window.localStorage.getItem(ROLE_KEY) as PartnerRole) || "partner_admin";
}
export function setActivePartnerUser(id: string) {
  const m = getMarketer(id);
  if (!m) return;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USER_KEY, id);
  window.localStorage.setItem(ROLE_KEY, m.role);
  window.dispatchEvent(new Event("partner-role-change"));
}

/* ---------------- Visibility helpers ---------------- */

export function visibleCases(userId: string, role: PartnerRole): PaymentCase[] {
  if (role === "marketer") return CASES.filter((c) => c.assignedMarketerId === userId);
  if (role === "partner_manager") {
    const teamIds = MARKETERS.filter((m) => m.managerId === userId).map((m) => m.id);
    return CASES.filter((c) => teamIds.includes(c.assignedMarketerId));
  }
  return CASES;
}

export function visibleLeads(userId: string, role: PartnerRole): Lead[] {
  if (role === "marketer") return LEADS.filter((l) => l.assignedMarketerId === userId);
  if (role === "partner_manager") {
    const teamIds = MARKETERS.filter((m) => m.managerId === userId).map((m) => m.id);
    return LEADS.filter((l) => teamIds.includes(l.assignedMarketerId));
  }
  return LEADS;
}

export function canSeeSolicitorBankDetails(role: PartnerRole): boolean {
  return role === "partner_admin" || role === "finance_viewer";
}
export function canReassign(role: PartnerRole): boolean {
  return role === "partner_admin";
}
export function canSeeAllMarketers(role: PartnerRole): boolean {
  return role === "partner_admin" || role === "partner_manager";
}
export function canSeePartnerReports(role: PartnerRole): boolean {
  return role === "partner_admin" || role === "finance_viewer";
}

/* ---------------- Performance calc ---------------- */

export type MarketerPerformance = {
  marketer: Marketer;
  clientsReferred: number;
  activeLeads: number;
  activeCases: number;
  successfulPayouts: number;
  totalPaidGBP: number;
  averageTicketGBP: number;
  conversionRate: number; // 0..1
  pendingPayouts: number;
  failedPayouts: number;
  lastActivity: string;
};

export function marketerPerformance(): MarketerPerformance[] {
  return MARKETERS.filter((m) => m.role === "marketer").map((m) => {
    const cases = CASES.filter((c) => c.assignedMarketerId === m.id);
    const leads = LEADS.filter((l) => l.assignedMarketerId === m.id);
    const successful = cases.filter((c) =>
      ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status),
    );
    const active = cases.filter(
      (c) =>
        !["Paid to Solicitor", "Receipt Uploaded", "Failed / Returned", "Cancelled"].includes(
          c.status,
        ),
    );
    const activeLeads = leads.filter(
      (l) => !["Lost", "Not Ready", "Converted to Payment Case"].includes(l.status),
    );
    const paid = successful.reduce((s, c) => s + c.amountGBP, 0);
    const pending = cases.filter((c) =>
      ["Payout Processing", "FX Converted"].includes(c.status),
    ).length;
    const failed = cases.filter((c) => c.status === "Failed / Returned").length;
    const referrals = cases.length + leads.length;
    return {
      marketer: m,
      clientsReferred: referrals,
      activeLeads: activeLeads.length,
      activeCases: active.length,
      successfulPayouts: successful.length,
      totalPaidGBP: paid,
      averageTicketGBP: successful.length ? Math.round(paid / successful.length) : 0,
      conversionRate: referrals ? successful.length / referrals : 0,
      pendingPayouts: pending,
      failedPayouts: failed,
      lastActivity: m.lastActivity,
    };
  });
}
