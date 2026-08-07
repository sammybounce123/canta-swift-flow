import { useSyncExternalStore } from "react";

export type PayoutAccountStatus = "Verified" | "Pending" | "Rejected";
export type PayoutCurrency = "RMB" | "USD";

export type PayoutAccount = {
  id: string;
  bank: string;
  accountName: string;
  accountNumber: string;
  currency: PayoutCurrency;
  status: PayoutAccountStatus;
  isDefault: boolean;
};

function mask(n: string) {
  return n.length <= 4 ? n : `**** **** ${n.slice(-4)}`;
}

let ACCOUNTS: PayoutAccount[] = [
  {
    id: "PA-1001",
    bank: "ICBC — Guangzhou Baiyun Branch",
    accountName: "Guangzhou Tech Factory Co., Ltd",
    accountNumber: "6222000000004821",
    currency: "RMB",
    status: "Verified",
    isDefault: true,
  },
  {
    id: "PA-1002",
    bank: "Bank of China — Guangdong Branch",
    accountName: "Guangzhou Tech Factory Co., Ltd",
    accountNumber: "6217000000009012",
    currency: "USD",
    status: "Pending",
    isDefault: false,
  },
];

let seq = 1003;
const subs = new Set<() => void>();
const notify = () => subs.forEach((f) => f());

export const payoutAccountsStore = {
  list: () => ACCOUNTS,
  getDefault: (currency?: PayoutCurrency) =>
    ACCOUNTS.find((a) => a.isDefault && (!currency || a.currency === currency)) ??
    ACCOUNTS.find((a) => !currency || a.currency === currency),
  add: (a: Omit<PayoutAccount, "id" | "status" | "isDefault">) => {
    const full: PayoutAccount = {
      id: `PA-${seq++}`,
      status: "Pending",
      isDefault: ACCOUNTS.length === 0,
      ...a,
    };
    ACCOUNTS = [...ACCOUNTS, full];
    notify();
    return full;
  },
  setDefault: (id: string): { ok: boolean; error?: string } => {
    const acc = ACCOUNTS.find((a) => a.id === id);
    if (!acc) return { ok: false, error: "Account not found" };
    if (acc.status !== "Verified") {
      return {
        ok: false,
        error: "Only a verified payout account can be set as the settlement destination.",
      };
    }
    ACCOUNTS = ACCOUNTS.map((a) => ({ ...a, isDefault: a.id === id }));
    notify();
    return { ok: true };
  },
  subscribe: (f: () => void) => {
    subs.add(f);
    return () => subs.delete(f);
  },
};

export function useMaskedAccountNumber(n: string) {
  return mask(n);
}
export function maskAccountNumber(n: string) {
  return mask(n);
}

export function usePayoutAccounts() {
  return useSyncExternalStore(
    payoutAccountsStore.subscribe,
    payoutAccountsStore.list,
    payoutAccountsStore.list,
  );
}
