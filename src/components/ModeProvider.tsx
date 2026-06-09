import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Mode =
  | "Enterprise Treasury"
  | "Importer"
  | "Freight Forwarder"
  | "Supplier"
  | "Global Merchant"
  | "Canta Admin";

export const ALL_MODES: { id: Mode; tag: string; desc: string }[] = [
  { id: "Enterprise Treasury", tag: "ET", desc: "FX, wallets, settlements" },
  { id: "Importer", tag: "IM", desc: "Shipments, suppliers, landed cost" },
  { id: "Freight Forwarder", tag: "FF", desc: "Operations workspace" },
  { id: "Supplier", tag: "SU", desc: "Invoices & global settlement" },
  { id: "Global Merchant", tag: "GM", desc: "Collections & payment links" },
  { id: "Canta Admin", tag: "CA", desc: "Internal control panel" },
];

type Ctx = { mode: Mode; setMode: (m: Mode) => void };
const ModeCtx = createContext<Ctx | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("Enterprise Treasury");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("canta:mode") as Mode | null) : null;
    if (saved && ALL_MODES.find((m) => m.id === saved)) setModeState(saved);
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
