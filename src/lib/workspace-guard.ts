import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useMode, type Mode } from "@/components/ModeProvider";
import { loadProfile, type WorkspaceType } from "@/lib/profile";

const MODE_TO_WORKSPACE: Record<Mode, WorkspaceType> = {
  "Enterprise Treasury": "enterprise_treasury",
  "Importer": "importer_portal",
  "Freight Forwarder": "freight_workspace",
  "Supplier": "supplier_dashboard",
  "Global Merchant": "global_collections",
  "Partner Property": "partner_property",
  "Canta Ops": "canta_ops",
};

const WORKSPACE_TO_MODE: Record<WorkspaceType, Mode> = {
  enterprise_treasury: "Enterprise Treasury",
  importer_portal: "Importer",
  freight_workspace: "Freight Forwarder",
  supplier_dashboard: "Supplier",
  global_collections: "Global Merchant",
  global_spend_cards: "Enterprise Treasury",
  partner_property: "Partner Property",
  canta_ops: "Enterprise Treasury",
};

const ACTIVE_WORKSPACE_KEY = "canta:active_workspace";

const SHARED_WORKSPACE_PATHS = new Set([
  "/shipments",
  "/documents",
  "/payments",
  "/reports",
  "/support",
  "/whatsapp",
  "/team",
  "/settings",
  "/invoices",
  "/messages",
  "/audit-logs",
  "/verification",
]);

const VALID_CUSTOMER_WORKSPACES = new Set<WorkspaceType>([
  "enterprise_treasury",
  "importer_portal",
  "freight_workspace",
  "supplier_dashboard",
  "global_collections",
  "partner_property",
]);

function normalizeMode(value?: string | null): Mode | null {
  switch ((value ?? "").trim()) {
    case "Enterprise Treasury":
    case "Enterprise Treasury Mode":
    case "Enterprise":
      return "Enterprise Treasury";
    case "Importer":
    case "Importer Mode":
    case "Importer Trade Desk":
    case "Importer Trade Desk Mode":
      return "Importer";
    case "Freight Forwarder":
    case "Clearing Agent":
    case "Clearing Agent Mode":
      return "Freight Forwarder";
    case "Supplier":
    case "Supplier Mode":
    case "Supplier Portal":
    case "Supplier Portal Mode":
    case "Chinese Supplier Portal":
      return "Supplier";
    case "Global Merchant":
    case "Global Merchant Mode":
      return "Global Merchant";
    case "Partner Property":
    case "Partner":
    case "Partner Mode":
      return "Partner Property";
    case "Canta Ops":
    case "Canta Ops Mode":
      return "Canta Ops";
    default:
      return null;
  }
}

function normalizeWorkspace(value?: string | null): WorkspaceType | null {
  if (VALID_CUSTOMER_WORKSPACES.has(value as WorkspaceType)) return value as WorkspaceType;
  const mode = normalizeMode(value);
  return mode ? MODE_TO_WORKSPACE[mode] : null;
}

const PROFILES: Record<WorkspaceType, { name: string; title: string; badge: string; workspaceLabel: string }> = {
  enterprise_treasury: { name: "Adaeze Okonkwo", title: "Treasury Admin",  badge: "Enterprise Treasury Mode", workspaceLabel: "Enterprise Treasury" },
  importer_portal:     { name: "Tunde Bakare",   title: "Importer Owner",  badge: "Importer Mode",            workspaceLabel: "Importer" },
  freight_workspace:   { name: "Chinedu Okafor", title: "Clearing Agent",  badge: "Invite-only Clearing Agent Mode", workspaceLabel: "Clearing Agent" },
  global_collections:  { name: "Amaka Bello",    title: "Merchant Owner",  badge: "Global Collections Mode",  workspaceLabel: "Global Merchant" },
  supplier_dashboard:  { name: "Li Wei",         title: "Supplier Admin",  badge: "Supplier Mode",            workspaceLabel: "Supplier" },
  partner_property:    { name: "Charlotte Baron", title: "Partner Admin",   badge: "Partner Mode",             workspaceLabel: "Partner Mode" },
  global_spend_cards:  { name: "Adaeze Okonkwo", title: "Treasury Admin",  badge: "Enterprise Treasury Mode", workspaceLabel: "Enterprise Treasury" },
  canta_ops:           { name: "Adaeze Okonkwo", title: "Treasury Admin",  badge: "Enterprise Treasury Mode", workspaceLabel: "Enterprise Treasury" },
};

export function isSharedWorkspacePath(pathname: string) {
  return SHARED_WORKSPACE_PATHS.has(pathname) || Array.from(SHARED_WORKSPACE_PATHS).some((path) => pathname.startsWith(`${path}/`));
}

export function workspaceFromPath(pathname: string): WorkspaceType | null {
  if (pathname.startsWith("/partner")) return "partner_property";
  if (pathname.startsWith("/collections") || pathname.startsWith("/merchant") || pathname.startsWith("/payment-links") || pathname.startsWith("/payers") || pathname.startsWith("/reconciliation")) return "global_collections";
  if (pathname.startsWith("/supplier-portal")) return "supplier_dashboard";
  if (pathname.startsWith("/importer") || pathname.startsWith("/trade-desk") || pathname.startsWith("/my-suppliers") || pathname.startsWith("/landed-cost") || pathname.startsWith("/clearing-quotes") || pathname.startsWith("/shipments")) return "importer_portal";
  if (pathname.startsWith("/freight") || pathname.startsWith("/customers")) return "freight_workspace";
  if (pathname.startsWith("/suppliers") || pathname.startsWith("/buyers") || pathname.startsWith("/verified-buyers") || pathname.startsWith("/escrow")) return "supplier_dashboard";
  if (pathname === "/cards" || pathname.startsWith("/cards/")) return null;
  if (pathname.startsWith("/treasury") || pathname.startsWith("/wallets") || pathname.startsWith("/fx") || pathname.startsWith("/beneficiaries")) return "enterprise_treasury";
  return null;
}


function isCustomerWorkspace(workspace?: WorkspaceType | null): workspace is WorkspaceType {
  return VALID_CUSTOMER_WORKSPACES.has(workspace as WorkspaceType);
}

export function saveActiveWorkspace(workspace: WorkspaceType) {
  if (typeof window === "undefined" || !isCustomerWorkspace(workspace)) return;
  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace);
  window.localStorage.setItem("canta:mode", WORKSPACE_TO_MODE[workspace]);
  window.dispatchEvent(new Event("canta:mode-change"));
}

export function getSavedCustomerWorkspace(): WorkspaceType | null {
  if (typeof window === "undefined") return null;
  const rawWorkspace = window.localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  const rawMode = window.localStorage.getItem("canta:mode");
  const savedWorkspace = normalizeWorkspace(rawWorkspace);
  const savedMode = normalizeMode(rawMode);
  const savedModeWorkspace = savedMode ? MODE_TO_WORKSPACE[savedMode] : null;

  if (savedMode && rawMode !== savedMode) {
    window.localStorage.setItem("canta:mode", savedMode);
  }
  if (savedWorkspace && rawWorkspace !== savedWorkspace) {
    window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, savedWorkspace);
  }

  // Repair mismatches between the active workspace key and legacy mode key.
  // Prefer the non-Enterprise value when one side is stale so shared routes do
  // not leak Enterprise identity after a user has selected Importer/Supplier/Partner.
  if (isCustomerWorkspace(savedWorkspace) && isCustomerWorkspace(savedModeWorkspace) && savedWorkspace !== savedModeWorkspace) {
    const repaired = savedModeWorkspace !== "enterprise_treasury"
      ? savedModeWorkspace
      : savedWorkspace !== "enterprise_treasury"
        ? savedWorkspace
        : savedModeWorkspace;
    window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, repaired);
    window.localStorage.setItem("canta:mode", WORKSPACE_TO_MODE[repaired]);
    return repaired;
  }

  if (savedModeWorkspace && savedWorkspace !== savedModeWorkspace && isCustomerWorkspace(savedModeWorkspace)) {
    window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, savedModeWorkspace);
    return savedModeWorkspace;
  }

  if (isCustomerWorkspace(savedWorkspace)) {
    window.localStorage.setItem("canta:mode", WORKSPACE_TO_MODE[savedWorkspace]);
    return savedWorkspace;
  }

  if (isCustomerWorkspace(savedModeWorkspace)) {
    window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, savedModeWorkspace);
    return savedModeWorkspace;
  }

  return null;
}

export function resolveActiveWorkspace(pathname: string, mode: Mode): WorkspaceType | null {
  const pathWorkspace = workspaceFromPath(pathname);
  if (pathWorkspace) return pathWorkspace;
  const modeWorkspace = MODE_TO_WORKSPACE[mode];
  const savedWorkspace = getSavedCustomerWorkspace();
  if (isSharedWorkspacePath(pathname)) {
    if (savedWorkspace) return savedWorkspace;
    return isCustomerWorkspace(modeWorkspace) ? modeWorkspace : null;
  }
  if (savedWorkspace) return savedWorkspace;
  return isCustomerWorkspace(modeWorkspace) ? modeWorkspace : null;
}

/**
 * Customer-facing routes that should never default to "Canta Ops" or any
 * internal workspace. When the user has no saved workspace, send them to
 * /welcome to pick one.
 */
export function useRequireWorkspace() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!getSavedCustomerWorkspace()) navigate({ to: "/welcome", replace: true });
  }, [navigate]);
}

export function useActiveWorkspace() {
  const { mode } = useMode();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathWorkspace = workspaceFromPath(pathname);

  const resolveWorkspace = () =>
    resolveActiveWorkspace(pathname, mode) ??
    "importer_portal";

  const [workspace, setWorkspace] = useState<WorkspaceType>(resolveWorkspace);

  useEffect(() => {
    if (pathWorkspace) saveActiveWorkspace(pathWorkspace);
    setWorkspace(resolveWorkspace());
  }, [pathWorkspace, mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncWorkspace = () => setWorkspace(resolveWorkspace());
    window.addEventListener("canta:mode-change", syncWorkspace);
    window.addEventListener("storage", syncWorkspace);
    return () => {
      window.removeEventListener("canta:mode-change", syncWorkspace);
      window.removeEventListener("storage", syncWorkspace);
    };
  }, [pathWorkspace, mode]);

  return { workspace, ...PROFILES[workspace] };
}
