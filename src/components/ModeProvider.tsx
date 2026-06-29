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
  { id: "Freight Forwarder", tag: "CA", desc: "Clearing agent (invite-only)" },
];

/** Display label override — "Freight Forwarder" mode id renders as "Clearing Agent". */
export const MODE_DISPLAY_LABEL: Record<Mode, string> = {
  "Enterprise Treasury": "Enterprise Treasury",
  "Importer": "Importer Trade Desk",
  "Freight Forwarder": "Clearing Agent",
  "Supplier": "Supplier",
  "Global Merchant": "Global Merchant",
  "Partner Property": "Partner",
  "Canta Ops": "Canta Ops",
};


type Ctx = { mode: Mode; setMode: (m: Mode) => void };
const ModeCtx = createContext<Ctx | null>(null);

/** Imperatively set the active workspace mode from anywhere (homepage CTAs, etc.). */
export function setActiveMode(mode: Mode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("canta:mode", mode);
  window.dispatchEvent(new Event("canta:mode-change"));
}

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("Enterprise Treasury");
  useEffect(() => {
    const sync = () => {
      const saved = typeof window !== "undefined" ? (localStorage.getItem("canta:mode") as Mode | null) : null;
      if (saved && ALL_MODES.find((m) => m.id === saved)) setModeState(saved);
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
      localStorage.setItem("canta:mode", m);
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
