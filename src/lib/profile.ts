// Lightweight mock "user profile" stored in localStorage.
// Keeps onboarding/login routing self-contained while the app has no backend.

export type WorkspaceType =
  | "enterprise_treasury"
  | "importer_portal"
  | "global_collections"
  | "supplier_dashboard"
  | "global_spend_cards"
  | "partner_property"
  | "canta_ops";

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
    label: "Enterprise Treasury",
    shortLabel: "Enterprise Treasury",
    accountType: "business",
    customerSegment: "enterprise",
    primaryUseCase: "FX, treasury, wallets, approvals",
    defaultRole: "Enterprise Owner",
    defaultPermissions: [
      "view dashboard",
      "view wallet balances",
      "approve payment",
      "create FX conversion",
    ],
    route: "/treasury",
    welcome: "Manage FX, wallets, beneficiaries, approvals, and global treasury.",
    tagline: "Multinationals, corporates, traders and large SMEs",
  },
  {
    id: "importer_portal",
    label: "Importer Mode",
    shortLabel: "Importer",
    accountType: "business",
    customerSegment: "importer",
    primaryUseCase: "Pay suppliers, track shipments, keep receipts",
    defaultRole: "Importer Owner",
    defaultPermissions: [
      "view dashboard",
      "create supplier payment",
      "view shipment",
      "manage suppliers",
      "download receipt",
    ],
    route: "/importer",
    welcome: "Pay suppliers, track shipments, and keep receipts.",
    tagline: "Nigerian importers and businesses paying suppliers anywhere in the world",
  },

  {
    id: "global_collections",
    label: "University / Global Merchant",
    shortLabel: "Global Merchant",
    accountType: "business",
    customerSegment: "merchant",
    primaryUseCase: "Local collections, reconciliation, global settlement",
    defaultRole: "Merchant Owner",
    defaultPermissions: [
      "view dashboard",
      "create payment link",
      "view collections",
      "approve settlement",
    ],
    route: "/collections",
    welcome: "Collect locally from African customers, reconcile payments, and settle globally.",
    tagline: "Universities, hospitals, airlines, travel, e-commerce",
  },
  {
    id: "supplier_dashboard",
    label: "Supplier Portal",
    shortLabel: "Supplier Portal",
    accountType: "business",
    customerSegment: "supplier",
    primaryUseCase:
      "Chinese suppliers receiving RMB settlement after Nigerian buyers pay NGN locally through Canta",
    defaultRole: "Supplier Owner",
    defaultPermissions: [
      "view dashboard",
      "create buyer record",
      "create invoice",
      "view settlement status",
    ],
    route: "/supplier-portal",
    welcome:
      "Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta.",
    tagline: "Chinese suppliers receiving RMB settlement after Nigerian buyer payments",
  },
  {
    id: "partner_property",
    label: "Partner Mode",
    shortLabel: "Partner Mode",
    accountType: "business",
    customerSegment: "partner_property",
    primaryUseCase: "Refer clients for FX & solicitor payouts",
    defaultRole: "Partner Admin",
    defaultPermissions: [
      "create referral",
      "view all cases",
      "view solicitor details",
      "add solicitor",
      "view payouts",
      "download receipts",
      "export reports",
      "manage team",
    ],
    route: "/partner",
    welcome: "Refer property clients, track FX conversions and solicitor payouts end-to-end.",
    tagline: "Kingsbridge Property Partners and property partners referring clients to Canta",
  },
  {
    id: "global_spend_cards",
    label: "Unavailable Demo Workspace",
    shortLabel: "Unavailable",
    accountType: "individual",
    customerSegment: "unavailable_demo_workspace",
    primaryUseCase: "Feature not available in this focused demo",
    defaultRole: "Viewer",
    defaultPermissions: ["view dashboard"],
    route: "/welcome",
    welcome: "This feature is not available in this demo.",
    tagline: "Unavailable in the focused trade and treasury demo",
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
      return { ...ALL_OFF, treasury_module_enabled: true, compliance_module_enabled: true };
    case "importer_portal":
      return { ...ALL_OFF, trade_module_enabled: true };
    case "supplier_dashboard":
      return { ...ALL_OFF, supplier_module_enabled: true };
    case "global_collections":
      return { ...ALL_OFF, collections_module_enabled: true, compliance_module_enabled: true };
    case "global_spend_cards":
      return { ...ALL_OFF };
    case "partner_property":
      return { ...ALL_OFF, compliance_module_enabled: true };
    case "canta_ops":
      return { ...ALL_ON };
  }
}
// Silence unused-export warning for ALL_ON (retained for future use)
export const _ALL_ON_FLAGS = ALL_ON;

export function loadFlags(workspace?: WorkspaceType): FeatureFlags {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(FLAGS_KEY);
      if (raw)
        return { ...defaultFlagsFor(workspace ?? "enterprise_treasury"), ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
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
  search?: Record<string, string>;
};

export function getSidebarForWorkspace(
  workspace: WorkspaceType,
  _flags: FeatureFlags,
): SidebarItem[] {
  const D: SidebarItem = {
    to: "/dashboard",
    label: "Dashboard",
    iconKey: "dashboard",
    group: "Overview",
    exact: true,
  };
  const Settings: SidebarItem = {
    to: "/settings",
    label: "Settings",
    iconKey: "settings",
    group: "Workspace",
  };
  const Team: SidebarItem = { to: "/team", label: "Team", iconKey: "team", group: "Workspace" };

  switch (workspace) {
    case "importer_portal":
      return [
        {
          to: "/importer",
          label: "Dashboard",
          iconKey: "importer",
          group: "My Workspace",
          exact: true,
        },
        { to: "/importer/balance", label: "Balance", iconKey: "wallet", group: "Money" },
        { to: "/importer/suppliers", label: "Suppliers", iconKey: "factory", group: "Money" },
        { to: "/importer/payments", label: "Payments", iconKey: "receipt", group: "Money" },
        { to: "/importer/shipments", label: "Shipments", iconKey: "ship", group: "Move Goods" },
        { to: "/importer/documents", label: "Documents", iconKey: "file", group: "Move Goods" },
        { to: "/importer/support", label: "Support", iconKey: "users", group: "Help" },
        { to: "/importer/settings", label: "Settings", iconKey: "settings", group: "Workspace" },
      ];

    case "supplier_dashboard":
      return [
        {
          to: "/supplier-portal",
          label: "Dashboard",
          iconKey: "factory",
          group: "Supplier Portal",
          exact: true,
        },
        {
          to: "/supplier-portal/create-invoice",
          label: "Create Invoice",
          iconKey: "receipt",
          group: "Supplier Portal",
        },
        {
          to: "/supplier-portal/ngn-balance",
          label: "NGN Balance",
          iconKey: "wallet",
          group: "Money",
        },
        {
          to: "/supplier-portal/rmb-bank-account",
          label: "RMB Bank Account",
          iconKey: "globe",
          group: "Money",
        },
        {
          to: "/supplier-portal/invoices",
          label: "Invoice History",
          iconKey: "file",
          group: "Money",
        },
        {
          to: "/supplier-portal/settlements",
          label: "Settlements",
          iconKey: "check",
          group: "Money",
        },
        {
          to: "/supplier-portal/verification",
          label: "Verification",
          iconKey: "shield-check",
          group: "Account",
        },
        { to: "/supplier-portal/support", label: "Support", iconKey: "users", group: "Account" },
        {
          to: "/supplier-portal/settings",
          label: "Settings",
          iconKey: "settings",
          group: "Account",
        },
      ];

    case "global_collections":
      return [
        D,
        {
          to: "/collections",
          label: "Global Collections",
          iconKey: "globe",
          group: "My Workspace",
        },
        {
          to: "/merchant/profile",
          label: "Merchant Profile",
          iconKey: "building",
          group: "My Workspace",
        },
        {
          to: "/merchant/kyb",
          label: "KYB / Verification",
          iconKey: "shield-check",
          group: "My Workspace",
        },
        { to: "/collections/new", label: "New Collection", iconKey: "sparkles", group: "Collect" },
        { to: "/payment-links", label: "Payment Links", iconKey: "link", group: "Collect" },
        { to: "/invoices", label: "Invoices", iconKey: "receipt", group: "Collect" },
        { to: "/payers", label: "Payers", iconKey: "users", group: "Collect" },
        { to: "/reconciliation", label: "Reconciliation", iconKey: "check", group: "Money" },
        { to: "/transactions", label: "Transactions", iconKey: "receipt", group: "Money" },
        { to: "/approvals", label: "Settlement Approvals", iconKey: "check", group: "Money" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },

        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        { to: "/compliance", label: "Compliance Pack", iconKey: "shield", group: "Governance" },
        { to: "/audit-logs", label: "Activity Log", iconKey: "shield", group: "Governance" },
        Team,
        Settings,
      ];
    case "enterprise_treasury":
      return [
        D,
        {
          to: "/treasury",
          label: "Enterprise Treasury",
          iconKey: "building",
          group: "My Workspace",
        },
        { to: "/wallets", label: "Balances", iconKey: "wallet", group: "Move Money" },
        { to: "/fx", label: "FX Conversion", iconKey: "fx", group: "Move Money" },
        { to: "/payments", label: "Bulk Payouts", iconKey: "receipt", group: "Move Money" },
        { to: "/beneficiaries", label: "Beneficiaries", iconKey: "users", group: "Move Money" },
        { to: "/approvals", label: "Approvals", iconKey: "check", group: "Governance" },
        { to: "/transactions", label: "Transactions", iconKey: "receipt", group: "Money" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        { to: "/audit-logs", label: "Activity Log", iconKey: "shield", group: "Governance" },
        { to: "/support", label: "Support", iconKey: "users", group: "Help" },
        Team,
        Settings,
      ];

    case "global_spend_cards":
      return [
        {
          to: "/welcome",
          label: "Choose Workspace",
          iconKey: "dashboard",
          group: "Overview",
          exact: true,
        },
      ];
    case "partner_property": {
      // Lazy import to avoid SSR cycles; settings stored in localStorage.
      let commissionsEnabled = true;
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("canta:partner:settings:v1");
          if (raw) commissionsEnabled = JSON.parse(raw).commissionsEnabled !== false;
        } catch {
          /* keep default */
        }
      }
      const items: SidebarItem[] = [
        D,
        { to: "/partner/clients", label: "Partner Clients", iconKey: "users", group: "Referrals" },
        { to: "/partner/leads", label: "Referral Leads", iconKey: "sparkles", group: "Referrals" },
        {
          to: "/partner/cases",
          label: "Client Payment Cases",
          iconKey: "file",
          group: "Referrals",
        },
        {
          to: "/partner/new-referral",
          label: "New Payment Case",
          iconKey: "sparkles",
          group: "Referrals",
        },
        { to: "/partner/fx-quotes", label: "FX Quotes", iconKey: "fx", group: "Money" },
        { to: "/partner/payment-links", label: "Payment Links", iconKey: "link", group: "Money" },
        { to: "/partner/payouts", label: "Solicitor Payouts", iconKey: "receipt", group: "Money" },
        {
          to: "/partner/solicitors",
          label: "Solicitors",
          iconKey: "shield-check",
          group: "Beneficiaries",
        },
        { to: "/partner/disputes", label: "Case Disputes", iconKey: "shield", group: "Operations" },
        { to: "/partner/documents", label: "Documents", iconKey: "file", group: "Operations" },
        {
          to: "/partner/marketers",
          label: "Marketer Performance",
          iconKey: "users",
          group: "Insights",
        },
        ...(commissionsEnabled
          ? [
              {
                to: "/partner/commissions",
                label: "Commissions",
                iconKey: "receipt",
                group: "Insights",
              } as SidebarItem,
            ]
          : []),
        { to: "/partner/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        {
          to: "/partner/activity-log",
          label: "Activity Log",
          iconKey: "shield",
          group: "Governance",
        },
        { to: "/partner/team", label: "Team", iconKey: "team", group: "Workspace" },
        { to: "/partner/settings", label: "Settings", iconKey: "settings", group: "Workspace" },
      ];
      return items;
    }
    case "canta_ops":
      return [
        D,
        { to: "/ops", label: "Ops Console", iconKey: "dashboard", group: "Overview" },
        { to: "/whatsapp", label: "WhatsApp Desk", iconKey: "whatsapp", group: "Ops" },
        { to: "/ai-growth", label: "AI Growth", iconKey: "brain", group: "Intelligence" },
        {
          to: "/ai-document-extraction",
          label: "AI Document Extraction",
          iconKey: "sparkles",
          group: "Intelligence",
        },
        { to: "/ai-insights", label: "AI Insights", iconKey: "brain", group: "Intelligence" },
        { to: "/trade-desk", label: "Trade Files", iconKey: "trade", group: "Ops" },
        { to: "/partner/cases", label: "Payment Cases", iconKey: "file", group: "Ops" },
        { to: "/customers", label: "All Customers", iconKey: "users", group: "Ops" },
        { to: "/support", label: "Support Tickets", iconKey: "users", group: "Ops" },
        {
          to: "/verification-center",
          label: "Verification Center",
          iconKey: "shield-check",
          group: "Governance",
        },
        { to: "/compliance", label: "Compliance", iconKey: "shield", group: "Governance" },
        { to: "/audit-logs", label: "Activity Log", iconKey: "shield", group: "Governance" },
        { to: "/integrations", label: "Integrations", iconKey: "plug", group: "Ops" },
        { to: "/reports", label: "Reports", iconKey: "chart", group: "Insights" },
        Settings,
      ];
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

const WORKSPACE_TO_MODE: Record<WorkspaceType, string> = {
  enterprise_treasury: "Enterprise Treasury",
  importer_portal: "Importer",
  supplier_dashboard: "Supplier",
  global_collections: "Global Merchant",
  global_spend_cards: "Enterprise Treasury",
  partner_property: "Partner Property",
  canta_ops: "Canta Ops",
};

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
  if (typeof window !== "undefined") {
    saveFlags(profile.feature_flags);
    window.localStorage.setItem(KEY, JSON.stringify(profile));
    window.localStorage.setItem("canta:active_workspace", segment.id);
    const mode = WORKSPACE_TO_MODE[segment.id];
    if (mode) {
      window.localStorage.setItem("canta:mode", mode);
      window.dispatchEvent(new Event("canta:mode-change"));
    }
  }
  return profile;
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(FLAGS_KEY);
  window.localStorage.removeItem("canta:active_workspace");
}

export function getSegment(workspace: WorkspaceType): Segment | undefined {
  return SEGMENTS.find((s) => s.id === workspace);
}

const WELCOME_KEY = "canta:welcome_dismissed";

function readDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WELCOME_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isWelcomeDismissed(workspace: WorkspaceType): boolean {
  return readDismissed().includes(workspace);
}

export function dismissWelcome(workspace: WorkspaceType) {
  if (typeof window === "undefined") return;
  const list = readDismissed();
  if (!list.includes(workspace)) list.push(workspace);
  window.localStorage.setItem(WELCOME_KEY, JSON.stringify(list));
}
