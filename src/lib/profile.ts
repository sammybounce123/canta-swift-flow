// Lightweight mock "user profile" stored in localStorage.
// Keeps onboarding/login routing self-contained while the app has no backend.

export type WorkspaceType =
  | "enterprise_treasury"
  | "importer_portal"
  | "freight_workspace"
  | "global_collections"
  | "supplier_dashboard"
  | "global_spend_cards"
  | "partner_property";

export type Segment = {
  id: WorkspaceType;
  label: string;
  shortLabel: string;
  accountType: "business" | "individual" | "internal";
  customerSegment: string;
  primaryUseCase: string;
  defaultRole: string;
  defaultPermissions: string[];
  route: string;
  welcome: string;
  tagline: string;
};

export const SEGMENTS: Segment[] = [
  {
    id: "enterprise_treasury",
    label: "Enterprise / Corporate",
    shortLabel: "Enterprise",
    accountType: "business",
    customerSegment: "enterprise",
    primaryUseCase: "FX, treasury, wallets, approvals, staff cards",
    defaultRole: "Enterprise Owner",
    defaultPermissions: ["view dashboard", "view wallet balances", "approve payment", "create FX conversion", "create staff card"],
    route: "/treasury",
    welcome: "Manage FX, wallets, beneficiaries, approvals, cards, and global treasury.",
    tagline: "Multinationals, corporates, oil & gas, SMEs",
  },
  {
    id: "importer_portal",
    label: "Importer",
    shortLabel: "Importer",
    accountType: "business",
    customerSegment: "importer",
    primaryUseCase: "Trade files, shipments, suppliers, landed cost",
    defaultRole: "Importer Owner",
    defaultPermissions: ["view dashboard", "create trade file", "view shipment", "manage suppliers", "view landed cost"],
    route: "/importer",
    welcome: "Track shipments, organize documents, calculate landed cost, manage suppliers, and control trade expenses.",
    tagline: "Buyers importing from China, UAE, Turkey, India and beyond",
  },
  {
    id: "freight_workspace",
    label: "Freight Forwarder / Clearing Agent",
    shortLabel: "Freight",
    accountType: "business",
    customerSegment: "freight",
    primaryUseCase: "Shipments, customers, invoices, port expenses",
    defaultRole: "Freight Owner",
    defaultPermissions: ["view dashboard", "create customer", "create shipment", "send WhatsApp update", "create freight invoice"],
    route: "/freight",
    welcome: "Manage customers, shipments, documents, invoices, cards, and WhatsApp updates.",
    tagline: "Freight forwarders, clearing agents, logistics operators",
  },
  {
    id: "global_collections",
    label: "University / Global Merchant",
    shortLabel: "Global Merchant",
    accountType: "business",
    customerSegment: "merchant",
    primaryUseCase: "Local collections, reconciliation, global settlement",
    defaultRole: "Merchant Owner",
    defaultPermissions: ["view dashboard", "create payment link", "view collections", "approve settlement"],
    route: "/collections",
    welcome: "Collect locally from African customers, reconcile payments, settle globally, and manage staff cards.",
    tagline: "Universities, hospitals, airlines, travel, e-commerce",
  },
  {
    id: "supplier_dashboard",
    label: "Supplier / Exporter",
    shortLabel: "Supplier",
    accountType: "business",
    customerSegment: "supplier",
    primaryUseCase: "Invoice African buyers, escrow, global settlement",
    defaultRole: "Supplier Owner",
    defaultPermissions: ["view dashboard", "create buyer record", "create invoice", "view settlement status"],
    route: "/suppliers",
    welcome: "Invoice African buyers, confirm funds, manage escrow, and receive settlement.",
    tagline: "Exporters in China, UAE, Turkey, India, Europe",
  },
  {
    id: "partner_property",
    label: "Property Partner",
    shortLabel: "Baron & Cabot",
    accountType: "business",
    customerSegment: "partner_property",
    primaryUseCase: "Refer clients for FX & solicitor payouts",
    defaultRole: "Partner Admin",
    defaultPermissions: ["create referral", "view all cases", "view solicitor details", "add solicitor", "view payouts", "download receipts", "export reports", "manage team"],
    route: "/partner",
    welcome: "Refer property clients, track FX conversions and solicitor payouts end-to-end.",
    tagline: "Baron & Cabot and property partners referring clients to Canta",
  },
  {
    id: "global_spend_cards",
    label: "Card User",
    shortLabel: "Cards",
    accountType: "individual",
    customerSegment: "card_user",
    primaryUseCase: "Travel, student, ads, personal global spend",
    defaultRole: "Card Owner",
    defaultPermissions: ["view dashboard", "create personal card", "view transactions", "upload receipt"],
    route: "/cards",
    welcome: "Create and manage purpose-built cards for travel, business, students, ads, and global spending.",
    tagline: "Individuals & small businesses using cards globally",
  },
];

export type FeatureFlags = {
  trade_module_enabled: boolean;
  freight_module_enabled: boolean;
  supplier_module_enabled: boolean;
  collections_module_enabled: boolean;
  cards_module_enabled: boolean;
  treasury_module_enabled: boolean;
  compliance_module_enabled: boolean;
};

export type Profile = {
  account_type: Segment["accountType"];
  workspace_type: WorkspaceType;
  customer_segment: string;
  primary_use_case: string;
  organization_id: string;
  role: string;
  permissions: string[];
  welcome_message: string;
  created_at: string;
  feature_flags: FeatureFlags;
};

const KEY = "canta:profile";
const FLAGS_KEY = "canta:feature_flags";

const ALL_OFF: FeatureFlags = {
  trade_module_enabled: false,
  freight_module_enabled: false,
  supplier_module_enabled: false,
  collections_module_enabled: false,
  cards_module_enabled: false,
  treasury_module_enabled: false,
  compliance_module_enabled: false,
};

const ALL_ON: FeatureFlags = {
  trade_module_enabled: true,
  freight_module_enabled: true,
  supplier_module_enabled: true,
  collections_module_enabled: true,
  cards_module_enabled: true,
  treasury_module_enabled: true,
  compliance_module_enabled: true,
};

export function defaultFlagsFor(workspace: WorkspaceType): FeatureFlags {
  switch (workspace) {
    case "enterprise_treasury":
      return { ...ALL_OFF, treasury_module_enabled: true, cards_module_enabled: true, compliance_module_enabled: true };
    case "importer_portal":
      return { ...ALL_OFF, trade_module_enabled: true, cards_module_enabled: true };
    case "freight_workspace":
      return { ...ALL_OFF, freight_module_enabled: true, cards_module_enabled: true };
    case "supplier_dashboard":
      return { ...ALL_OFF, supplier_module_enabled: true };
    case "global_collections":
      return { ...ALL_OFF, collections_module_enabled: true, cards_module_enabled: true, compliance_module_enabled: true };
    case "global_spend_cards":
      return { ...ALL_OFF, cards_module_enabled: true };
    case "partner_property":
      return { ...ALL_OFF, compliance_module_enabled: true };
  }
}
// Silence unused-export warning for ALL_ON (retained for future use)
export const _ALL_ON_FLAGS = ALL_ON;

export function loadFlags(workspace?: WorkspaceType): FeatureFlags {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(FLAGS_KEY);
      if (raw) return { ...defaultFlagsFor(workspace ?? "enterprise_treasury"), ...JSON.parse(raw) };
    } catch {}
  }
  return defaultFlagsFor(workspace ?? "enterprise_treasury");
}

export function saveFlags(flags: FeatureFlags) {
  if (typeof window !== "undefined") window.localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
}

// Routes always visible regardless of workspace
const COMMON_ROUTES = ["/dashboard", "/settings", "/team", "/partner"];

export type SidebarItem = {
  to: string;
  label: string;
  iconKey: string;
  group: string;
  exact?: boolean;
};

/** Exact per-workspace sidebar. Each workspace sees ONLY its own menus. */
export function getSidebarForWorkspace(workspace: WorkspaceType, _flags: FeatureFlags): SidebarItem[] {
  const D: SidebarItem = { to: "/dashboard", label: "Dashboard", iconKey: "dashboard", group: "Overview", exact: true };
  const Settings: SidebarItem = { to: "/settings", label: "Settings", iconKey: "settings", group: "Workspace" };
  const Team: SidebarItem = { to: "/team", label: "Team", iconKey: "team", group: "Workspace" };

  switch (workspace) {
    case "importer_portal":
      return [
        D,
        { to: "/importer", label: "Importer Portal", iconKey: "importer", group: "My Workspace" },
        { to: "/trade-desk", label: "Trade Desk", iconKey: "trade", group: "Move Goods" },
        { to: "/shipments", label: "Shipments", iconKey: "ship", group: "Move Goods" },
        { to: "/trade-network", label: "Trade Network", iconKey: "globe", group: "Trade Network" },
        { to: "/verified-suppliers", label: "Verified Suppliers", iconKey: "shield-check", group: "Trade Network" },
        { to: "/my-suppliers", label: "My Suppliers", iconKey: "factory", group: "Trade Network" },
        { to: "/documents", label: "Documents", iconKey: "file", group: "Trade Ops" },
        { to: "/landed-cost", label: "Landed Cost", iconKey: "calculator", group: "Trade Ops" },
        { to: "/ai-document-extraction", label: "AI Doc Extraction", iconKey: "brain", group: "Trade Ops" },
        { to: "/payments", label: "Payments", iconKey: "receipt", group: "Money" },
        { to: "/importer/cards", label: "Importer Cards", iconKey: "card", group: "Money" },
        { to: "/whatsapp", label: "WhatsApp Updates", iconKey: "whatsapp", group: "Updates" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        { to: "/audit-logs", label: "Audit Logs", iconKey: "shield", group: "Governance" },
        Team, Settings,
      ];
    case "freight_workspace":
      return [
        D,
        { to: "/freight", label: "Freight Workspace", iconKey: "freight", group: "My Workspace" },
        { to: "/customers", label: "Customers", iconKey: "users", group: "Operations" },
        { to: "/shipments", label: "Shipments", iconKey: "ship", group: "Operations" },
        { to: "/documents", label: "Documents", iconKey: "file", group: "Operations" },
        { to: "/freight-invoices", label: "Freight Invoices", iconKey: "receipt", group: "Money" },
        { to: "/freight/cards", label: "Freight Cards", iconKey: "card", group: "Money" },
        { to: "/whatsapp", label: "WhatsApp Updates", iconKey: "whatsapp", group: "Updates" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        { to: "/audit-logs", label: "Audit Logs", iconKey: "shield", group: "Governance" },
        Team, Settings,
      ];
    case "supplier_dashboard":
      return [
        D,
        { to: "/suppliers", label: "Supplier Dashboard", iconKey: "factory", group: "My Workspace" },
        { to: "/trade-network", label: "Trade Network", iconKey: "globe", group: "Trade Network" },
        { to: "/verified-buyers", label: "Verified Buyers", iconKey: "shield-check", group: "Trade Network" },
        { to: "/buyers", label: "Buyers", iconKey: "users", group: "Trade Network" },
        { to: "/invoices", label: "Invoices", iconKey: "receipt", group: "Money" },
        { to: "/escrow", label: "Escrow", iconKey: "shield", group: "Money" },
        { to: "/collections", label: "Settlements", iconKey: "globe", group: "Money" },
        { to: "/documents", label: "Documents", iconKey: "file", group: "Operations" },
        { to: "/ai-document-extraction", label: "AI Doc Extraction", iconKey: "brain", group: "Operations" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        { to: "/audit-logs", label: "Audit Logs", iconKey: "shield", group: "Governance" },
        Team, Settings,
      ];
    case "global_collections":
      return [
        D,
        { to: "/collections", label: "Global Collections", iconKey: "globe", group: "My Workspace" },
        { to: "/collections/new", label: "New Collection", iconKey: "sparkles", group: "Collect" },
        { to: "/payment-links", label: "Payment Links", iconKey: "link", group: "Collect" },
        { to: "/invoices", label: "Invoices", iconKey: "receipt", group: "Collect" },
        { to: "/payers", label: "Payers", iconKey: "users", group: "Collect" },
        { to: "/reconciliation", label: "Reconciliation", iconKey: "check", group: "Money" },
        { to: "/transactions", label: "Transactions", iconKey: "receipt", group: "Money" },
        { to: "/approvals", label: "Settlement Approvals", iconKey: "check", group: "Money" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        { to: "/cards", label: "Staff Cards", iconKey: "card", group: "Spend" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        { to: "/compliance", label: "Compliance Pack", iconKey: "shield", group: "Governance" },
        { to: "/audit-logs", label: "Audit Logs", iconKey: "shield", group: "Governance" },
        Team, Settings,
      ];
    case "enterprise_treasury":
      return [
        D,
        { to: "/treasury", label: "Enterprise Treasury", iconKey: "building", group: "My Workspace" },
        { to: "/wallets", label: "Wallets", iconKey: "wallet", group: "Move Money" },
        { to: "/fx", label: "FX Conversion", iconKey: "fx", group: "Move Money" },
        { to: "/beneficiaries", label: "Beneficiaries", iconKey: "users", group: "Move Money" },
        { to: "/transactions", label: "Transactions", iconKey: "receipt", group: "Move Money" },
        { to: "/approvals", label: "Approvals", iconKey: "check", group: "Governance" },
        { to: "/treasury/cards", label: "Company Cards", iconKey: "card", group: "Spend" },
        { to: "/compliance", label: "Compliance Pack", iconKey: "shield", group: "Governance" },
        { to: "/audit-logs", label: "Audit Logs", iconKey: "shield", group: "Governance" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        Team, Settings,
      ];
    case "global_spend_cards":
      return [
        D,
        { to: "/cards", label: "Global Spend Cards", iconKey: "card", group: "My Workspace" },
        { to: "/transactions", label: "Transactions", iconKey: "receipt", group: "Activity" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        Settings,
      ];
    case "partner_property": {
      // Lazy import to avoid SSR cycles; settings stored in localStorage.
      let commissionsEnabled = true;
      if (typeof window !== "undefined") {
        try { const raw = window.localStorage.getItem("canta:partner:settings:v1"); if (raw) commissionsEnabled = JSON.parse(raw).commissionsEnabled !== false; } catch { /* keep default */ }
      }
      const items: SidebarItem[] = [
        { to: "/partner", label: "Dashboard", iconKey: "dashboard", group: "Overview", exact: true },
        { to: "/partner/leads", label: "Referral Leads", iconKey: "sparkles", group: "Referrals" },
        { to: "/partner/cases", label: "Client Payment Cases", iconKey: "file", group: "Referrals" },
        { to: "/partner/new-referral", label: "New Payment Case", iconKey: "sparkles", group: "Referrals" },
        { to: "/partner/fx-quotes", label: "FX Quotes", iconKey: "fx", group: "Money" },
        { to: "/partner/payment-links", label: "Payment Links", iconKey: "link", group: "Money" },
        { to: "/partner/payouts", label: "Solicitor Payouts", iconKey: "receipt", group: "Money" },
        { to: "/partner/solicitors", label: "Solicitors", iconKey: "shield-check", group: "Beneficiaries" },
        { to: "/partner/documents", label: "Documents", iconKey: "file", group: "Operations" },
        { to: "/partner/marketers", label: "Marketer Performance", iconKey: "users", group: "Insights" },
        ...(commissionsEnabled ? [{ to: "/partner/commissions", label: "Commissions", iconKey: "receipt", group: "Insights" } as SidebarItem] : []),
        { to: "/partner/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        { to: "/audit-logs", label: "Audit Logs", iconKey: "shield", group: "Governance" },
        { to: "/partner/team", label: "Team", iconKey: "team", group: "Workspace" },
        { to: "/partner/settings", label: "Settings", iconKey: "settings", group: "Workspace" },
      ];
      return items;
    }
  }
}



export function getAllowedRoutes(workspace: WorkspaceType, flags: FeatureFlags): Set<string> {
  const allow = new Set<string>(COMMON_ROUTES);
  getSidebarForWorkspace(workspace, flags).forEach((i) => allow.add(i.to));
  return allow;
}

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(segment: Segment): Profile {
  const profile: Profile = {
    account_type: segment.accountType,
    workspace_type: segment.id,
    customer_segment: segment.customerSegment,
    primary_use_case: segment.primaryUseCase,
    organization_id: `ORG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    role: segment.defaultRole,
    permissions: segment.defaultPermissions,
    welcome_message: segment.welcome,
    created_at: new Date().toISOString(),
    feature_flags: defaultFlagsFor(segment.id),
  };
  if (typeof window !== "undefined") saveFlags(profile.feature_flags);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(profile));
  }
  return profile;
}

export function getSegment(id: WorkspaceType): Segment | undefined {
  return SEGMENTS.find((s) => s.id === id);
}

const WELCOME_DISMISS_KEY = "canta:welcome-dismissed";

export function isWelcomeDismissed(workspace: WorkspaceType): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(WELCOME_DISMISS_KEY);
    const list = raw ? (JSON.parse(raw) as WorkspaceType[]) : [];
    return list.includes(workspace);
  } catch {
    return false;
  }
}

export function dismissWelcome(workspace: WorkspaceType) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(WELCOME_DISMISS_KEY);
    const list = raw ? (JSON.parse(raw) as WorkspaceType[]) : [];
    if (!list.includes(workspace)) list.push(workspace);
    window.localStorage.setItem(WELCOME_DISMISS_KEY, JSON.stringify(list));
  } catch {}
}
