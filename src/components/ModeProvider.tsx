import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Mode =
  | "Enterprise Treasury"
  | "Importer"
  | "Freight Forwarder"
  | "Supplier"
  | "Global Merchant"
  | "Global Spend Cards"
  | "Partner Property"
  | "Canta Ops";

export const ALL_MODES: { id: Mode; tag: string; desc: string }[] = [
  { id: "Enterprise Treasury", tag: "ET", desc: "FX, wallets, settlements" },
  { id: "Importer", tag: "IM", desc: "Shipments, suppliers, landed cost" },
  { id: "Freight Forwarder", tag: "FF", desc: "Operations workspace" },
  { id: "Supplier", tag: "SU", desc: "Invoices & global settlement" },
  { id: "Global Merchant", tag: "GM", desc: "Collections & payment links" },
  { id: "Global Spend Cards", tag: "GC", desc: "Cards-only spend workspace" },
  { id: "Partner Property", tag: "PP", desc: "Property partner client referrals" },
  { id: "Canta Ops", tag: "OP", desc: "Canta internal operations" },
];

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
