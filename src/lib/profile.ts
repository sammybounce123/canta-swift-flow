// Lightweight mock "user profile" stored in localStorage.
// Keeps onboarding/login routing self-contained while the app has no backend.

export type WorkspaceType =
  | "enterprise_treasury"
  | "importer_portal"
  | "freight_workspace"
  | "global_collections"
  | "supplier_dashboard"
  | "global_spend_cards"
  | "canta_admin";

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
  {
    id: "canta_admin",
    label: "Canta Internal Staff",
    shortLabel: "Canta Admin",
    accountType: "internal",
    customerSegment: "canta_internal",
    primaryUseCase: "Operations, compliance, support across customers",
    defaultRole: "Canta Super Admin",
    defaultPermissions: ["view dashboard", "view all customers", "approve KYB", "approve settlement"],
    route: "/admin",
    welcome: "Manage customers, trade files, compliance, settlements, WhatsApp onboarding, cards, and support.",
    tagline: "Canta team — operations, trade, compliance, treasury, support",
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
    case "canta_admin":
      return ALL_ON;
  }
}

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
const COMMON_ROUTES = ["/dashboard", "/settings", "/team"];

export function getAllowedRoutes(workspace: WorkspaceType, flags: FeatureFlags): Set<string> {
  const allow = new Set<string>(COMMON_ROUTES);
  const add = (...rs: string[]) => rs.forEach((r) => allow.add(r));

  switch (workspace) {
    case "global_collections":
      add("/collections");
      if (flags.compliance_module_enabled) add("/compliance");
      if (flags.cards_module_enabled) add("/cards");
      if (flags.trade_module_enabled) add("/trade-desk", "/shipments", "/freight", "/importer", "/suppliers");
      break;
    case "importer_portal":
      add("/trade-desk", "/shipments", "/suppliers", "/importer", "/whatsapp");
      if (flags.cards_module_enabled) add("/cards");
      if (flags.freight_module_enabled) add("/freight");
      if (flags.treasury_module_enabled) add("/treasury", "/wallets", "/fx", "/transactions", "/beneficiaries");
      if (flags.compliance_module_enabled) add("/compliance");
      break;
    case "freight_workspace":
      add("/freight", "/shipments", "/whatsapp");
      if (flags.cards_module_enabled) add("/cards");
      if (flags.trade_module_enabled) add("/importer", "/trade-desk");
      if (flags.collections_module_enabled) add("/collections");
      if (flags.treasury_module_enabled) add("/treasury", "/wallets", "/fx", "/transactions", "/beneficiaries");
      break;
    case "supplier_dashboard":
      add("/suppliers");
      if (flags.trade_module_enabled) add("/trade-desk");
      if (flags.collections_module_enabled) add("/collections");
      if (flags.cards_module_enabled) add("/cards");
      break;
    case "enterprise_treasury":
      add("/treasury", "/wallets", "/fx", "/beneficiaries", "/transactions", "/approvals");
      if (flags.cards_module_enabled) add("/cards");
      if (flags.compliance_module_enabled) add("/compliance");
      if (flags.collections_module_enabled) add("/collections");
      if (flags.trade_module_enabled) add("/trade-desk", "/shipments", "/importer", "/suppliers");
      if (flags.freight_module_enabled) add("/freight");
      break;
    case "global_spend_cards":
      add("/cards", "/transactions");
      break;
    case "canta_admin":
      add(
        "/treasury","/wallets","/fx","/transactions","/beneficiaries","/approvals",
        "/trade-desk","/shipments","/freight","/importer","/suppliers",
        "/collections","/cards","/ai-growth","/ai-insights","/whatsapp",
        "/compliance","/integrations","/organization","/admin",
      );
      break;
  }
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
  };
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
