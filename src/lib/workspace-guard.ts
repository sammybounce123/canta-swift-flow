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
  "Global Spend Cards": "global_spend_cards",
  "Partner Property": "partner_property",
  "Canta Ops": "canta_ops",
};

const PROFILES: Record<WorkspaceType, { name: string; title: string; badge: string; workspaceLabel: string }> = {
  enterprise_treasury: { name: "Adaeze Okonkwo", title: "Treasury Admin",  badge: "Enterprise Treasury Mode", workspaceLabel: "Enterprise Treasury" },
  importer_portal:     { name: "Tunde Bakare",   title: "Importer Owner",  badge: "Importer Mode",            workspaceLabel: "Importer" },
  freight_workspace:   { name: "Chinedu Okafor", title: "Freight Owner",   badge: "Freight Workspace Mode",   workspaceLabel: "Freight" },
  global_collections:  { name: "Amaka Bello",    title: "Merchant Owner",  badge: "Global Collections Mode",  workspaceLabel: "Global Merchant" },
  supplier_dashboard:  { name: "Li Wei",         title: "Supplier Admin",  badge: "Supplier Mode",            workspaceLabel: "Supplier" },
  partner_property:    { name: "Sarah Adeyemi",  title: "Partner Admin",   badge: "Partner Property Mode",    workspaceLabel: "Partner Property" },
  global_spend_cards:  { name: "James Okoro",    title: "Card Owner",      badge: "Global Spend Cards Mode",  workspaceLabel: "Global Spend Cards" },
  canta_ops:           { name: "Adaeze Okonkwo", title: "Treasury Admin",  badge: "Enterprise Treasury Mode", workspaceLabel: "Enterprise Treasury" },
};

function workspaceFromPath(pathname: string): WorkspaceType | null {
  if (pathname.startsWith("/partner")) return "partner_property";
  if (pathname.startsWith("/collections") || pathname.startsWith("/merchant") || pathname.startsWith("/payment-links") || pathname.startsWith("/payers") || pathname.startsWith("/reconciliation")) return "global_collections";
  if (pathname.startsWith("/importer") || pathname.startsWith("/trade-desk") || pathname.startsWith("/my-suppliers") || pathname.startsWith("/verified-suppliers") || pathname.startsWith("/landed-cost")) return "importer_portal";
  if (pathname.startsWith("/freight") || pathname.startsWith("/customers")) return "freight_workspace";
  if (pathname.startsWith("/suppliers") || pathname.startsWith("/buyers") || pathname.startsWith("/verified-buyers") || pathname.startsWith("/escrow")) return "supplier_dashboard";
  if (pathname === "/cards" || pathname.startsWith("/cards/")) return "global_spend_cards";
  if (pathname.startsWith("/treasury") || pathname.startsWith("/wallets") || pathname.startsWith("/fx") || pathname.startsWith("/beneficiaries")) return "enterprise_treasury";
  return null;
}

function isCustomerWorkspace(workspace?: WorkspaceType | null): workspace is WorkspaceType {
  return Boolean(workspace && workspace !== "canta_ops");
}

export function getSavedCustomerWorkspace(): WorkspaceType | null {
  if (typeof window === "undefined") return null;
  const savedMode = window.localStorage.getItem("canta:mode") as Mode | null;
  const savedModeWorkspace = savedMode ? MODE_TO_WORKSPACE[savedMode] : null;
  if (isCustomerWorkspace(savedModeWorkspace)) return savedModeWorkspace;

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
  const ws = workspaceFromPath(pathname) ?? getSavedCustomerWorkspace() ?? (isCustomerWorkspace(modeWorkspace) ? modeWorkspace : "enterprise_treasury");
  return { workspace: ws, ...PROFILES[ws] };
}
