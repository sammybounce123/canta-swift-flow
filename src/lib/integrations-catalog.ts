export type IntegrationCategory =
  | "Payment Collection" | "FX / Settlement / Payout" | "Shipment Tracking Aggregator"
  | "Direct Shipping Lines" | "Card Issuing" | "KYC / KYB" | "Sanctions / PEP / AML"
  | "WhatsApp / Messaging" | "OCR / Document Extraction" | "AI / Automation"
  | "Maps / Address Verification" | "CRM / Support" | "Accounting / ERP" | "Webhooks";

export const CATEGORY_ORDER: IntegrationCategory[] = [
  "Payment Collection", "FX / Settlement / Payout", "Shipment Tracking Aggregator",
  "Direct Shipping Lines", "Card Issuing", "KYC / KYB", "Sanctions / PEP / AML",
  "WhatsApp / Messaging", "OCR / Document Extraction", "AI / Automation",
  "Maps / Address Verification", "CRM / Support", "Accounting / ERP", "Webhooks",
];

export type ConnEnv = "Test" | "Live";
export type ConnStatus = "Connected" | "Not Connected" | "Pending" | "Error";

export type Provider = {
  id: string;
  name: string;
  category: IntegrationCategory;
  modules: string[];
  env: ConnEnv;
  status: ConnStatus;
  lastSync?: string;
  lastWebhook?: string;
  failedWebhooks: number;
  errorReason?: string;
  fallback?: string;
};

const seed = (
  category: IntegrationCategory,
  names: string[],
  modules: string[],
  defaults: Partial<Provider> = {},
): Provider[] =>
  names.map((name, i) => ({
    id: `${category}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name, category, modules,
    env: i % 3 === 0 ? "Live" : "Test",
    status: (["Connected", "Connected", "Not Connected", "Pending", "Error"] as ConnStatus[])[i % 5],
    lastSync: i % 4 === 0 ? "2026-06-15 09:42" : "2026-06-15 11:08",
    lastWebhook: i % 4 === 0 ? "2026-06-15 09:42" : "2026-06-15 11:09",
    failedWebhooks: i % 5 === 0 ? 3 : 0,
    errorReason: i % 5 === 4 ? "401 unauthorized — token expired" : undefined,
    fallback: names[(i + 1) % names.length],
    ...defaults,
  }));

export const PROVIDERS: Provider[] = [
  ...seed("Payment Collection", ["Flutterwave", "Paystack", "Monnify", "Fincra"], ["Global Collections", "Partner Property"]),
  ...seed("FX / Settlement / Payout", ["Banking Partner", "Liquidity Provider", "Stablecoin Rails", "RMB Settlement"], ["Treasury", "FX", "Partner Payouts"]),
  ...seed("Shipment Tracking Aggregator", ["Vizion", "Shipsgo", "SeaRates", "GoComet", "JSONCargo"], ["Importer", "Freight"]),
  ...seed("Direct Shipping Lines", ["Maersk", "MSC", "CMA CGM", "Hapag-Lloyd", "COSCO"], ["Importer", "Freight"]),
  ...seed("Card Issuing", ["Marqeta", "Paymentology", "Thredd", "i2c", "Galileo", "Stripe Issuing", "Local Issuer Partner"], ["Cards", "Treasury", "Importer"]),
  ...seed("KYC / KYB", ["Smile ID", "Sumsub", "Youverify", "Dojah", "Prembly"], ["Verification Center", "Onboarding"]),
  ...seed("Sanctions / PEP / AML", ["ComplyAdvantage", "Refinitiv", "Dow Jones", "Chainalysis"], ["Compliance", "Verification Center"]),
  ...seed("WhatsApp / Messaging", ["WhatsApp Cloud API", "Twilio", "Termii", "Africa's Talking", "Resend", "SendGrid"], ["Freight", "Notifications", "Partner Property"]),
  ...seed("OCR / Document Extraction", ["Google Document AI", "AWS Textract", "Azure Document Intelligence", "OpenAI"], ["AI Doc Extraction", "Importer", "Verification Center"]),
  ...seed("AI / Automation", ["OpenAI", "Anthropic", "Lovable AI Gateway"], ["AI Insights", "AI Growth", "AI Doc Extraction"]),
  ...seed("Maps / Address Verification", ["Google Maps", "Google Places", "Mapbox", "HERE Maps"], ["Onboarding", "Beneficiaries"]),
  ...seed("CRM / Support", ["HubSpot", "Zoho", "Salesforce", "Zendesk", "Intercom", "Freshdesk", "Respond.io", "WATI", "SleekFlow"], ["Support", "Partner Property", "Freight"]),
  ...seed("Accounting / ERP", ["QuickBooks", "Xero", "SAP", "Oracle NetSuite", "Odoo"], ["Treasury", "Global Collections"]),
  ...seed("Webhooks", ["Outbound Webhooks", "Retry Service", "Event Log"], ["Platform-wide"]),
];
