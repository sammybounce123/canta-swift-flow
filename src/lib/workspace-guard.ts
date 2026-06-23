import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

/**
 * Customer-facing routes that should never default to "Canta Ops" or any
 * internal workspace. When the user has no saved workspace, send them to
 * /welcome to pick one.
 */
export function useRequireWorkspace() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("canta:mode");
    const profile = window.localStorage.getItem("canta:profile");
    if (!saved && !profile) navigate({ to: "/welcome" });
  }, [navigate]);
}

import { useMode, type Mode } from "@/components/ModeProvider";
import { useRouterState } from "@tanstack/react-router";
import type { WorkspaceType } from "@/lib/profile";

const MODE_TO_WORKSPACE: Record<Mode, WorkspaceType> = {
  "Enterprise Treasury": "enterprise_treasury",
  "Importer": "importer_portal",
  "Freight Forwarder": "freight_workspace",
  "Supplier": "supplier_dashboard",
  "Global Merchant": "global_collections",
  "Global Spend Cards": "global_spend_cards",
  "Partner Property": "partner_property",
  "Canta Ops": "enterprise_treasury",
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

export function useActiveWorkspace() {
  const { mode } = useMode();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  let ws: WorkspaceType = MODE_TO_WORKSPACE[mode] ?? "enterprise_treasury";
  if (pathname.startsWith("/partner")) ws = "partner_property";
  else if (pathname.startsWith("/collections") || pathname.startsWith("/merchant") || pathname.startsWith("/payment-links") || pathname.startsWith("/payers") || pathname.startsWith("/reconciliation")) ws = "global_collections";
  else if (pathname.startsWith("/importer") || pathname.startsWith("/trade-desk") || pathname.startsWith("/my-suppliers") || pathname.startsWith("/landed-cost")) ws = "importer_portal";
  else if (pathname.startsWith("/freight") || pathname.startsWith("/customers")) ws = "freight_workspace";
  else if (pathname.startsWith("/suppliers") || pathname.startsWith("/buyers") || pathname.startsWith("/escrow")) ws = "supplier_dashboard";
  else if (pathname === "/cards" || pathname.startsWith("/cards/")) ws = "global_spend_cards";
  else if (pathname.startsWith("/treasury") || pathname.startsWith("/wallets") || pathname.startsWith("/fx") || pathname.startsWith("/beneficiaries")) ws = "enterprise_treasury";
  return { workspace: ws, ...PROFILES[ws] };
}
