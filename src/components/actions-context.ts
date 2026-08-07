import { createContext, useContext } from "react";

export type ActionsContextValue = {
  openFund: (ccy?: string) => void;
  openConvert: (from?: string, to?: string) => void;
  openSend: (beneficiaryName?: string) => void;
  openAddBeneficiary: () => void;
  openSchedule: () => void;
  openBulk: () => void;
  openInvite: () => void;
};

const CONTEXT_KEY = "__CANTA_ACTIONS_CTX__";
const globalRef = globalThis as unknown as Record<string, unknown>;

export const ActionsContext =
  (globalRef[CONTEXT_KEY] as React.Context<ActionsContextValue | null> | undefined) ??
  ((globalRef[CONTEXT_KEY] = createContext<ActionsContextValue | null>(
    null,
  )) as React.Context<ActionsContextValue | null>);

export function useActions() {
  const context = useContext(ActionsContext);
  if (!context) throw new Error("useActions must be used within ActionsProvider");
  return context;
}
