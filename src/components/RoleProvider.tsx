import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Role = "Admin" | "Treasury" | "Finance" | "Compliance" | "Viewer";

export type Permission =
  | "view_dashboard"
  | "view_wallets"
  | "view_fx"
  | "view_transactions"
  | "view_beneficiaries"
  | "view_treasury"
  | "view_ai"
  | "view_team"
  | "view_settings"
  | "view_trade"
  | "view_shipments"
  | "view_freight"
  | "view_importer"
  | "view_suppliers"
  | "view_collections"
  | "view_cards"
  | "view_ai_growth"
  | "view_compliance"
  | "view_integrations"
  | "view_whatsapp"
  | "initiate_tx"
  | "approve_tx"
  | "manage_beneficiaries"
  | "manage_team"
  | "export_reports"
  | "view_balances";

const PLATFORM: Permission[] = [
  "view_trade","view_shipments","view_freight","view_importer","view_suppliers",
  "view_collections","view_cards","view_ai_growth","view_compliance","view_integrations","view_whatsapp",
];

const matrix: Record<Role, Permission[]> = {
  Admin: [
    "view_dashboard","view_wallets","view_fx","view_transactions","view_beneficiaries",
    "view_treasury","view_ai","view_team","view_settings",
    "initiate_tx","approve_tx","manage_beneficiaries","manage_team","export_reports","view_balances",
    ...PLATFORM,
  ],
  Treasury: [
    "view_dashboard","view_wallets","view_fx","view_transactions","view_beneficiaries",
    "view_treasury","view_ai","view_settings",
    "initiate_tx","approve_tx","manage_beneficiaries","export_reports","view_balances",
    ...PLATFORM,
  ],
  Finance: [
    "view_dashboard","view_wallets","view_transactions","view_beneficiaries","view_settings",
    "initiate_tx","manage_beneficiaries","export_reports","view_balances",
    ...PLATFORM,
  ],
  Compliance: [
    "view_dashboard","view_transactions","view_team","view_ai","view_settings",
    "approve_tx","export_reports","view_balances",
    ...PLATFORM,
  ],
  Viewer: ["view_dashboard","view_transactions","view_settings","export_reports", ...PLATFORM],
};

export const ROLE_PROFILES: Record<Role, { name: string; initials: string; title: string; email: string }> = {
  Admin:      { name: "Adaeze Okonkwo",  initials: "AO", title: "Treasury Admin",      email: "adaeze@nigerdelta.ng" },
  Treasury:   { name: "Tunde Bakare",    initials: "TB", title: "Treasury Manager",    email: "tunde@nigerdelta.ng" },
  Finance:    { name: "Femi Adeyemi",    initials: "FA", title: "Finance Officer",     email: "femi@nigerdelta.ng" },
  Compliance: { name: "Chiamaka Eze",    initials: "CE", title: "Compliance Officer",  email: "chiamaka@nigerdelta.ng" },
  Viewer:     { name: "Ibrahim Lawal",   initials: "IL", title: "Auditor (View only)", email: "ibrahim@nigerdelta.ng" },
};

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  can: (p: Permission) => boolean;
  profile: typeof ROLE_PROFILES[Role];
};

const RoleCtx = createContext<Ctx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("Admin");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("canta:role") as Role | null) : null;
    if (saved && matrix[saved]) setRoleState(saved);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("canta:role", r);
  };

  const can = (p: Permission) => matrix[role].includes(p);

  return (
    <RoleCtx.Provider value={{ role, setRole, can, profile: ROLE_PROFILES[role] }}>
      {children}
    </RoleCtx.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}

export const ALL_ROLES: Role[] = ["Admin", "Treasury", "Finance", "Compliance", "Viewer"];
