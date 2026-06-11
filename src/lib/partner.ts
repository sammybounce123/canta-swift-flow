// Mock data + helpers for the Baron & Cabot Partner Property Payments workspace.
// Pure presentation data; no backend.

export type CaseStatus =
  | "Referred"
  | "KYC Pending"
  | "Awaiting Client Funding"
  | "Funding Received"
  | "FX Quote Sent"
  | "FX Accepted"
  | "FX Converted"
  | "Payout Processing"
  | "Paid to Solicitor"
  | "Receipt Uploaded"
  | "Failed / Returned"
  | "Cancelled";

export const CASE_STATUSES: CaseStatus[] = [
  "Referred",
  "KYC Pending",
  "Awaiting Client Funding",
  "Funding Received",
  "FX Quote Sent",
  "FX Accepted",
  "FX Converted",
  "Payout Processing",
  "Paid to Solicitor",
  "Receipt Uploaded",
  "Failed / Returned",
  "Cancelled",
];

export function statusTone(s: CaseStatus): string {
  switch (s) {
    case "Paid to Solicitor":
    case "Receipt Uploaded":
      return "bg-success/15 text-success border-success/30";
    case "Failed / Returned":
    case "Cancelled":
      return "bg-destructive/15 text-destructive border-destructive/30";
    case "Payout Processing":
    case "FX Converted":
    case "FX Accepted":
      return "bg-primary/15 text-primary border-primary/30";
    case "Funding Received":
    case "FX Quote Sent":
      return "bg-accent/15 text-accent border-accent/30";
    case "Referred":
    case "KYC Pending":
    case "Awaiting Client Funding":
    default:
      return "bg-warning/15 text-warning border-warning/30";
  }
}

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
  totalPayouts: number; // GBP
  lastPayout: string;
};

export const SOLICITORS: Solicitor[] = [
  {
    id: "SOL-001", firm: "Hartwell & Greaves LLP", contact: "Olivia Hartwell",
    email: "payments@hartwell-greaves.co.uk", phone: "+44 20 7946 0021",
    country: "United Kingdom", currency: "GBP", bank: "Barclays Bank PLC",
    accountName: "Hartwell & Greaves Client A/C",
    accountNumberMasked: "•••• 4421", sortCode: "20-00-00",
    iban: "GB29 BARC 2000 0044 2188 21", swift: "BARCGB22",
    verified: "Verified", preferred: true,
    linkedClients: 12, totalPayouts: 4_812_500, lastPayout: "2026-06-04",
  },
  {
    id: "SOL-002", firm: "Carter & Linton Solicitors", contact: "James Linton",
    email: "client.accounts@carterlinton.co.uk", phone: "+44 161 555 0144",
    country: "United Kingdom", currency: "GBP", bank: "HSBC UK",
    accountName: "Carter & Linton Client Account",
    accountNumberMasked: "•••• 7782", sortCode: "40-05-15",
    iban: "GB54 HBUK 4005 1577 8298 11", swift: "HBUKGB4B",
    verified: "Verified", preferred: false,
    linkedClients: 8, totalPayouts: 2_185_000, lastPayout: "2026-05-28",
  },
  {
    id: "SOL-003", firm: "Marlowe Property Law", contact: "Aisha Marlowe",
    email: "completions@marloweproperty.co.uk", phone: "+44 121 555 0902",
    country: "United Kingdom", currency: "GBP", bank: "NatWest",
    accountName: "Marlowe Property Law Client",
    accountNumberMasked: "•••• 9012", sortCode: "60-12-04",
    iban: "GB44 NWBK 6012 0490 1281 22", swift: "NWBKGB2L",
    verified: "Pending", preferred: false,
    linkedClients: 3, totalPayouts: 487_200, lastPayout: "2026-05-12",
  },
  {
    id: "SOL-004", firm: "Whitfield & Co.", contact: "Daniel Whitfield",
    email: "accounts@whitfieldco.co.uk", phone: "+44 113 555 4410",
    country: "United Kingdom", currency: "GBP", bank: "Lloyds Bank",
    accountName: "Whitfield & Co. Client Account",
    accountNumberMasked: "•••• 3318", sortCode: "30-94-21",
    iban: "GB18 LOYD 3094 2133 1844 09", swift: "LOYDGB21",
    verified: "Re-verification", preferred: false,
    linkedClients: 2, totalPayouts: 312_000, lastPayout: "2026-04-18",
  },
];

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
};

export const CASES: PaymentCase[] = [
  {
    id: "CS-1001", ref: "BC-2026-1001",
    clientName: "Adekunle Okoye", clientEmail: "adekunle.okoye@email.com", clientPhone: "+234 802 555 0102",
    property: "The Wharf — Apartment 14B", propertyLocation: "Manchester, UK",
    amountGBP: 248_500, amountNGN: 510_240_000, currency: "GBP",
    solicitorId: "SOL-001", status: "Paid to Solicitor",
    createdAt: "2026-05-20", expectedPayout: "2026-06-04", officer: "Tunde Bakare",
  },
  {
    id: "CS-1002", ref: "BC-2026-1002",
    clientName: "Folake Adeyemi", clientEmail: "folake.a@email.com", clientPhone: "+234 803 555 0144",
    property: "Riverside Heights — 21F", propertyLocation: "Liverpool, UK",
    amountGBP: 185_000, amountNGN: 380_065_000, currency: "GBP",
    solicitorId: "SOL-001", status: "Receipt Uploaded",
    createdAt: "2026-05-18", expectedPayout: "2026-06-02", officer: "Adaeze Okonkwo",
  },
  {
    id: "CS-1003", ref: "BC-2026-1003",
    clientName: "Ibrahim Sani", clientEmail: "ibrahim.sani@email.com", clientPhone: "+234 805 555 0788",
    property: "Kings Cross Residences — 4A", propertyLocation: "London, UK",
    amountGBP: 612_000, amountNGN: 1_257_240_000, currency: "GBP",
    solicitorId: "SOL-002", status: "Payout Processing",
    createdAt: "2026-06-01", expectedPayout: "2026-06-12", officer: "Tunde Bakare",
  },
  {
    id: "CS-1004", ref: "BC-2026-1004",
    clientName: "Ngozi Eze", clientEmail: "ngozi.eze@email.com", clientPhone: "+234 806 555 0331",
    property: "Salford Quays — Plot 9", propertyLocation: "Salford, UK",
    amountGBP: 92_500, amountNGN: 190_037_500, currency: "GBP",
    solicitorId: "SOL-003", status: "FX Converted",
    createdAt: "2026-06-03", expectedPayout: "2026-06-13", officer: "Femi Adeyemi",
  },
  {
    id: "CS-1005", ref: "BC-2026-1005",
    clientName: "Chidi Nnamdi", clientEmail: "chidi.n@email.com", clientPhone: "+234 807 555 0980",
    property: "The Atrium — 7C", propertyLocation: "Birmingham, UK",
    amountGBP: 318_900, amountNGN: 655_320_000, currency: "GBP",
    solicitorId: "SOL-001", status: "FX Quote Sent",
    createdAt: "2026-06-05", expectedPayout: "2026-06-15", officer: "Adaeze Okonkwo",
  },
  {
    id: "CS-1006", ref: "BC-2026-1006",
    clientName: "Bukola Akande", clientEmail: "bukola.a@email.com", clientPhone: "+234 808 555 1122",
    property: "Greenpark Lofts — 12", propertyLocation: "Leeds, UK",
    amountGBP: 142_000, amountNGN: 291_710_000, currency: "GBP",
    solicitorId: "SOL-002", status: "Funding Received",
    createdAt: "2026-06-06", expectedPayout: "2026-06-16", officer: "Tunde Bakare",
  },
  {
    id: "CS-1007", ref: "BC-2026-1007",
    clientName: "Emeka Obi", clientEmail: "emeka.obi@email.com", clientPhone: "+234 809 555 6677",
    property: "Canary View — 18B", propertyLocation: "London, UK",
    amountGBP: 425_000, amountNGN: 873_375_000, currency: "GBP",
    solicitorId: "SOL-001", status: "Awaiting Client Funding",
    createdAt: "2026-06-07", expectedPayout: "2026-06-20", officer: "Femi Adeyemi",
  },
  {
    id: "CS-1008", ref: "BC-2026-1008",
    clientName: "Hauwa Bello", clientEmail: "hauwa.bello@email.com", clientPhone: "+234 810 555 8800",
    property: "Cathedral Square — 3F", propertyLocation: "Bristol, UK",
    amountGBP: 78_400, amountNGN: 161_140_000, currency: "GBP",
    solicitorId: "SOL-004", status: "Failed / Returned",
    createdAt: "2026-05-30", expectedPayout: "2026-06-06", officer: "Adaeze Okonkwo",
  },
  {
    id: "CS-1009", ref: "BC-2026-1009",
    clientName: "Yetunde Lawal", clientEmail: "yetunde.l@email.com", clientPhone: "+234 811 555 9100",
    property: "Highgate Mews — 2A", propertyLocation: "London, UK",
    amountGBP: 510_000, amountNGN: 1_048_050_000, currency: "GBP",
    solicitorId: "SOL-001", status: "KYC Pending",
    createdAt: "2026-06-08", expectedPayout: "2026-06-22", officer: "Tunde Bakare",
  },
  {
    id: "CS-1010", ref: "BC-2026-1010",
    clientName: "Olumide Fashola", clientEmail: "olumide.f@email.com", clientPhone: "+234 812 555 7733",
    property: "Marina Wharf — 11C", propertyLocation: "Glasgow, UK",
    amountGBP: 198_000, amountNGN: 406_890_000, currency: "GBP",
    solicitorId: "SOL-002", status: "Referred",
    createdAt: "2026-06-09", expectedPayout: "2026-06-23", officer: "Femi Adeyemi",
  },
];

export function getCase(id: string) {
  return CASES.find((c) => c.id === id);
}
export function getSolicitor(id: string) {
  return SOLICITORS.find((s) => s.id === id);
}
export function formatGBP(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}
export function formatNGN(n: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}
