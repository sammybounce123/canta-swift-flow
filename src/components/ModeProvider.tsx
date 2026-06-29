import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Mode =
  | "Enterprise Treasury"
  | "Importer"
  | "Freight Forwarder"
  | "Supplier"
  | "Global Merchant"
  | "Partner Property"
  | "Canta Ops";

export const ALL_MODES: { id: Mode; tag: string; desc: string }[] = [
  { id: "Importer", tag: "IM", desc: "BL, shipments, clearing, landed cost" },
  { id: "Supplier", tag: "SP", desc: "NGN buyer payment, RMB settlement" },
  { id: "Enterprise Treasury", tag: "ET", desc: "FX, balances, payouts, approvals" },
  { id: "Partner Property", tag: "PP", desc: "Property partner client referrals" },
];

/** Display label override — "Freight Forwarder" mode id renders as "Clearing Agent". */
export const MODE_DISPLAY_LABEL: Record<Mode, string> = {
  "Enterprise Treasury": "Enterprise Treasury",
  "Importer": "Importer Trade Desk",
  "Freight Forwarder": "Clearing Agent",
  "Supplier": "Supplier Portal",
  "Global Merchant": "Global Merchant",
  "Partner Property": "Partner",
  "Canta Ops": "Canta Ops",
};

const WORKSPACE_BY_MODE: Partial<Record<Mode, string>> = {
  "Enterprise Treasury": "enterprise_treasury",
  Importer: "importer_portal",
  Supplier: "supplier_dashboard",
  "Partner Property": "partner_property",
};

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

function persistMode(mode: Mode) {
  const workspace = WORKSPACE_BY_MODE[mode];
  if (workspace) window.localStorage.setItem("canta:active_workspace", workspace);
  window.localStorage.setItem("canta:mode", mode);
}


type Ctx = { mode: Mode; setMode: (m: Mode) => void };
const ModeCtx = createContext<Ctx | null>(null);

/** Imperatively set the active workspace mode from anywhere (homepage CTAs, etc.). */
export function setActiveMode(mode: Mode) {
  if (typeof window === "undefined") return;
  persistMode(mode);
  window.dispatchEvent(new Event("canta:mode-change"));
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("Enterprise Treasury");
  useEffect(() => {
    const sync = () => {
      const rawSaved = typeof window !== "undefined" ? localStorage.getItem("canta:mode") : null;
      const saved = normalizeMode(rawSaved);
      if (saved && ALL_MODES.find((m) => m.id === saved)) {
        if (rawSaved !== saved) persistMode(saved);
        setModeState(saved);
      }
    };
    sync();
    window.addEventListener("canta:mode-change", sync);
    return () => {
      window.removeEventListener("canta:mode-change", sync);
    };
  }, []);
  const setMode = (m: Mode) => {
    setModeState(m);
    if (typeof window !== "undefined") {
      persistMode(m);
      window.dispatchEvent(new Event("canta:mode-change"));
    }
  };
  return <ModeCtx.Provider value={{ mode, setMode }}>{children}</ModeCtx.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeCtx);
  if (!ctx) throw new Error("useMode must be used inside ModeProvider");
  return ctx;
}
