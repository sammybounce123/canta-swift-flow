import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Mode =
  | "Enterprise Treasury"
  | "Importer"
  | "Freight Forwarder"
  | "Supplier"
  | "Global Merchant"
  | "Partner Property";

export const ALL_MODES: { id: Mode; tag: string; desc: string }[] = [
  { id: "Enterprise Treasury", tag: "ET", desc: "FX, wallets, settlements" },
  { id: "Importer", tag: "IM", desc: "Shipments, suppliers, landed cost" },
  { id: "Freight Forwarder", tag: "FF", desc: "Operations workspace" },
  { id: "Supplier", tag: "SU", desc: "Invoices & global settlement" },
  { id: "Global Merchant", tag: "GM", desc: "Collections & payment links" },
  { id: "Partner Property", tag: "PP", desc: "Property partner client referrals" },
];

type Ctx = { mode: Mode; setMode: (m: Mode) => void };
const ModeCtx = createContext<Ctx | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("Enterprise Treasury");
  useEffect(() => {
    const sync = () => {
      const saved = typeof window !== "undefined" ? (localStorage.getItem("canta:mode") as Mode | null) : null;
      if (saved && ALL_MODES.find((m) => m.id === saved)) setModeState(saved);
    };
    sync();
    // Only respond to our own explicit mode-change event. Listening to
    // cross-tab "storage" events caused the mode to appear to switch by
    // itself when other tabs or unrelated localStorage writes fired.
    window.addEventListener("canta:mode-change", sync);
    return () => {
      window.removeEventListener("canta:mode-change", sync);
    };
  }, []);
  const setMode = (m: Mode) => {
    setModeState(m);
    if (typeof window !== "undefined") localStorage.setItem("canta:mode", m);
  };
  return <ModeCtx.Provider value={{ mode, setMode }}>{children}</ModeCtx.Provider>;
}

export function useMode() {
  const ctx = useContext(ModeCtx);
  if (!ctx) throw new Error("useMode must be used inside ModeProvider");
  return ctx;
}
