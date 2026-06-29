import { useEffect } from "react";
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

function workspaceFromPath(pathname: string): WorkspaceType | null {
  if (pathname.startsWith("/partner")) return "partner_property";
  if (pathname.startsWith("/collections") || pathname.startsWith("/merchant") || pathname.startsWith("/payment-links") || pathname.startsWith("/payers") || pathname.startsWith("/reconciliation")) return "global_collections";
  if (pathname.startsWith("/supplier-portal")) return "supplier_dashboard";
  if (pathname.startsWith("/importer") || pathname.startsWith("/trade-desk") || pathname.startsWith("/my-suppliers") || pathname.startsWith("/landed-cost") || pathname.startsWith("/clearing-quotes")) return "importer_portal";
  if (pathname.startsWith("/freight") || pathname.startsWith("/customers")) return "freight_workspace";
  if (pathname.startsWith("/suppliers") || pathname.startsWith("/buyers") || pathname.startsWith("/verified-buyers") || pathname.startsWith("/escrow")) return "supplier_dashboard";
  if (pathname === "/cards" || pathname.startsWith("/cards/")) return null;
  if (pathname.startsWith("/treasury") || pathname.startsWith("/wallets") || pathname.startsWith("/fx") || pathname.startsWith("/beneficiaries")) return "enterprise_treasury";
  return null;
}


function isCustomerWorkspace(workspace?: WorkspaceType | null): workspace is WorkspaceType {
  return Boolean(workspace && workspace !== "canta_ops" && workspace !== "global_spend_cards");
}

export function saveActiveWorkspace(workspace: WorkspaceType) {
  if (typeof window === "undefined" || !isCustomerWorkspace(workspace)) return;
  window.localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace);
  window.localStorage.setItem("canta:mode", WORKSPACE_TO_MODE[workspace]);
  window.dispatchEvent(new Event("canta:mode-change"));
}

export function getSavedCustomerWorkspace(): WorkspaceType | null {
  if (typeof window === "undefined") return null;
  const savedWorkspace = window.localStorage.getItem(ACTIVE_WORKSPACE_KEY) as WorkspaceType | null;
  const savedMode = window.localStorage.getItem("canta:mode") as Mode | null;
  const savedModeWorkspace = savedMode ? MODE_TO_WORKSPACE[savedMode] : null;

  // Trust the explicit active mode and repair any stale workspace key so shared
  // routes (/reports, /support, /whatsapp) do not leak another workspace's identity.
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

  const profileWorkspace = loadProfile()?.workspace_type;
  if (isCustomerWorkspace(profileWorkspace)) return profileWorkspace;
  return null;
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
  const modeWorkspace = MODE_TO_WORKSPACE[mode];
  const pathWorkspace = workspaceFromPath(pathname);
  useEffect(() => {
    if (pathWorkspace) saveActiveWorkspace(pathWorkspace);
  }, [pathWorkspace]);
  const ws = pathWorkspace ?? getSavedCustomerWorkspace() ?? (isCustomerWorkspace(modeWorkspace) ? modeWorkspace : "enterprise_treasury");
  return { workspace: ws, ...PROFILES[ws] };
}
