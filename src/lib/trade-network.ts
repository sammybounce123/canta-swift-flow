// Canta Trade Network — mock directory for verified suppliers & buyers
export type VerificationStatus =
  | "Unverified"
  | "Basic Verified"
  | "Business Verified"
  | "Bank Verified"
  | "Trade Verified"
  | "Premium Verified"
  | "Suspended";

export type SupplierBadge =
  | "Business Verified"
  | "Factory Address Verified"
  | "Bank Account Verified"
  | "Trade Verified"
  | "Escrow Eligible"
  | "High Response Rate"
  | "Low Dispute Record";

export type BuyerBadge =
  | "KYB Verified"
  | "Payment Reliable"
  | "Trade Active"
  | "Escrow Ready"
  | "High-Volume Buyer"
  | "Low Dispute Record";

export type Supplier = {
  id: string;
  company: string;
  country: string;
  city: string;
  categories: string[];
  status: VerificationStatus;
  badges: SupplierBadge[];
  registration: "Verified" | "Pending" | "Unverified";
  addressVerified: boolean;
  bankVerified: boolean;
  completedTx: number;
  responseTimeHrs: number;
  disputes: number;
  rating: number; // 0-5
  documents: number;
  currencies: string[];
  minOrderUsd: number;
  escrowEligible: boolean;
  discoverable: boolean;
};

export type Buyer = {
  id: string;
  name: string;
  country: string;
  city: string;
  interests: string[];
  status: VerificationStatus;
  badges: BuyerBadge[];
  tradeHistory: number;
  paymentScore: number; // 0-100
  completedTx: number;
  avgOrderUsd: [number, number];
  corridors: string[];
  escrowHistory: number;
  disputes: number;
  discoverable: boolean;
  lastActive: string;
};


export type VerificationRequest = {
  id: string;
  kind: "supplier" | "buyer";
  name: string;
  country: string;
  submittedAt: string;
  checksPassed: number;
  checksTotal: number;
  risk: "Low" | "Medium" | "High";
};

export const SUPPLIER_CHECKS = [
  "Business registration",
  "Ownership / directors",
  "Office/factory/warehouse address",
  "Bank account verification",
  "Product category confirmation",
  "Trade references",
  "Sanctions screening",
  "PEP screening",
  "Adverse media",
  "Past transaction behavior",
];

export const BUYER_CHECKS = [
  "KYC / KYB",
  "Business type",
  "Trade category",
  "Purchase history",
  "Payment behavior",
  "Source of funds",
  "Sanctions screening",
  "PEP screening",
  "Adverse media",
  "Dispute history",
];

export const STATUS_TONE: Record<VerificationStatus, string> = {
  "Unverified": "bg-muted text-muted-foreground",
  "Basic Verified": "bg-secondary text-foreground",
  "Business Verified": "bg-primary/10 text-primary",
  "Bank Verified": "bg-accent/15 text-accent",
  "Trade Verified": "bg-success/15 text-success",
  "Premium Verified": "bg-amber-500/15 text-amber-700",
  "Suspended": "bg-destructive/10 text-destructive",
};

export const SUPPLIERS: Supplier[] = [
  {
    id: "SUP-1001", company: "Shenzhen BrightLED Co.", country: "China", city: "Shenzhen",
    categories: ["Electronics", "Lighting"], status: "Premium Verified",
    badges: ["Business Verified","Factory Address Verified","Bank Account Verified","Trade Verified","Escrow Eligible","High Response Rate","Low Dispute Record"],
    registration: "Verified", addressVerified: true, bankVerified: true,
    completedTx: 184, responseTimeHrs: 2, disputes: 1, rating: 4.9, documents: 12,
    currencies: ["USD","CNY","EUR"], minOrderUsd: 5000, escrowEligible: true, discoverable: true,
  },
  {
    id: "SUP-1002", company: "Istanbul Textile Group", country: "Turkey", city: "Istanbul",
    categories: ["Textiles","Apparel"], status: "Trade Verified",
    badges: ["Business Verified","Bank Account Verified","Trade Verified","Escrow Eligible","Low Dispute Record"],
    registration: "Verified", addressVerified: true, bankVerified: true,
    completedTx: 96, responseTimeHrs: 4, disputes: 0, rating: 4.8, documents: 9,
    currencies: ["USD","EUR","TRY"], minOrderUsd: 3000, escrowEligible: true, discoverable: true,
  },
  {
    id: "SUP-1003", company: "Dubai Auto Parts FZE", country: "UAE", city: "Dubai",
    categories: ["Automotive","Spare Parts"], status: "Business Verified",
    badges: ["Business Verified","Bank Account Verified","High Response Rate"],
    registration: "Verified", addressVerified: false, bankVerified: true,
    completedTx: 41, responseTimeHrs: 6, disputes: 2, rating: 4.4, documents: 6,
    currencies: ["USD","AED"], minOrderUsd: 1500, escrowEligible: false, discoverable: true,
  },
  {
    id: "SUP-1004", company: "Mumbai PharmaChem Ltd", country: "India", city: "Mumbai",
    categories: ["Pharma","Chemicals"], status: "Trade Verified",
    badges: ["Business Verified","Factory Address Verified","Bank Account Verified","Trade Verified","Escrow Eligible"],
    registration: "Verified", addressVerified: true, bankVerified: true,
    completedTx: 72, responseTimeHrs: 5, disputes: 1, rating: 4.7, documents: 14,
    currencies: ["USD","INR","EUR"], minOrderUsd: 8000, escrowEligible: true, discoverable: true,
  },
  {
    id: "SUP-1005", company: "Guangzhou Machinery Works", country: "China", city: "Guangzhou",
    categories: ["Industrial","Machinery"], status: "Premium Verified",
    badges: ["Business Verified","Factory Address Verified","Bank Account Verified","Trade Verified","Escrow Eligible","Low Dispute Record"],
    registration: "Verified", addressVerified: true, bankVerified: true,
    completedTx: 213, responseTimeHrs: 3, disputes: 1, rating: 4.9, documents: 18,
    currencies: ["USD","CNY"], minOrderUsd: 12000, escrowEligible: true, discoverable: true,
  },
  {
    id: "SUP-1006", company: "Bursa Steel & Iron", country: "Turkey", city: "Bursa",
    categories: ["Metals","Construction"], status: "Basic Verified",
    badges: ["Business Verified"],
    registration: "Pending", addressVerified: false, bankVerified: false,
    completedTx: 7, responseTimeHrs: 12, disputes: 0, rating: 4.1, documents: 3,
    currencies: ["USD","EUR","TRY"], minOrderUsd: 20000, escrowEligible: false, discoverable: true,
  },
];

export const BUYERS: Buyer[] = [
  {
    id: "BUY-2001", name: "Lagos Global Imports Ltd", country: "Nigeria", city: "Lagos",
    interests: ["Electronics","Auto Parts"], status: "Premium Verified",
    badges: ["KYB Verified","Payment Reliable","Trade Active","Escrow Ready","High-Volume Buyer","Low Dispute Record"],
    tradeHistory: 142, paymentScore: 96, completedTx: 138,
    avgOrderUsd: [15000, 60000], corridors: ["China→Nigeria","UAE→Nigeria"],
    escrowHistory: 41, disputes: 1, discoverable: true,
  },
  {
    id: "BUY-2002", name: "Accra MedSupply Co.", country: "Ghana", city: "Accra",
    interests: ["Pharma","Medical Devices"], status: "Trade Verified",
    badges: ["KYB Verified","Payment Reliable","Trade Active","Escrow Ready"],
    tradeHistory: 58, paymentScore: 91, completedTx: 54,
    avgOrderUsd: [8000, 30000], corridors: ["India→Ghana","Turkey→Ghana"],
    escrowHistory: 19, disputes: 0, discoverable: true,
  },
  {
    id: "BUY-2003", name: "Nairobi Textiles East Africa", country: "Kenya", city: "Nairobi",
    interests: ["Textiles","Apparel"], status: "Business Verified",
    badges: ["KYB Verified","Trade Active"],
    tradeHistory: 27, paymentScore: 83, completedTx: 24,
    avgOrderUsd: [5000, 18000], corridors: ["Turkey→Kenya","China→Kenya"],
    escrowHistory: 7, disputes: 2, discoverable: true,
  },
  {
    id: "BUY-2004", name: "Abidjan Industrial Group", country: "Côte d'Ivoire", city: "Abidjan",
    interests: ["Machinery","Construction"], status: "Trade Verified",
    badges: ["KYB Verified","Payment Reliable","High-Volume Buyer"],
    tradeHistory: 89, paymentScore: 94, completedTx: 81,
    avgOrderUsd: [25000, 90000], corridors: ["China→CIV","UAE→CIV"],
    escrowHistory: 28, disputes: 1, discoverable: true,
  },
  {
    id: "BUY-2005", name: "Cairo TradeHub LLC", country: "Egypt", city: "Cairo",
    interests: ["Chemicals","Pharma"], status: "Basic Verified",
    badges: ["KYB Verified"],
    tradeHistory: 11, paymentScore: 74, completedTx: 9,
    avgOrderUsd: [3000, 12000], corridors: ["India→Egypt","Turkey→Egypt"],
    escrowHistory: 2, disputes: 0, discoverable: true,
  },
];

export const VERIFICATION_REQUESTS: VerificationRequest[] = [
  { id: "VR-501", kind: "supplier", name: "Yiwu Smart Goods Co.", country: "China", submittedAt: "2 hours ago", checksPassed: 6, checksTotal: 10, risk: "Low" },
  { id: "VR-502", kind: "supplier", name: "Ankara Cosmetics", country: "Turkey", submittedAt: "1 day ago", checksPassed: 4, checksTotal: 10, risk: "Medium" },
  { id: "VR-503", kind: "buyer", name: "Kampala Trade House", country: "Uganda", submittedAt: "3 hours ago", checksPassed: 7, checksTotal: 10, risk: "Low" },
  { id: "VR-504", kind: "buyer", name: "Dakar Imports SARL", country: "Senegal", submittedAt: "5 hours ago", checksPassed: 3, checksTotal: 10, risk: "High" },
  { id: "VR-505", kind: "supplier", name: "Chennai Spice Exporters", country: "India", submittedAt: "2 days ago", checksPassed: 8, checksTotal: 10, risk: "Low" },
];

export const COUNTRIES_SUPPLIER = ["All","China","Turkey","UAE","India"];
export const COUNTRIES_BUYER = ["All","Nigeria","Ghana","Kenya","Côte d'Ivoire","Egypt"];
export const CATEGORIES = ["All","Electronics","Textiles","Apparel","Automotive","Spare Parts","Pharma","Chemicals","Industrial","Machinery","Metals","Construction","Lighting","Medical Devices"];
export const VERIFICATION_LEVELS: VerificationStatus[] = ["Basic Verified","Business Verified","Bank Verified","Trade Verified","Premium Verified"];
