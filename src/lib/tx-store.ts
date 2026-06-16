import { transactions as seedTransactions } from "@/lib/mock";

export type Tx = (typeof seedTransactions)[number];

// Module-level live store. Seeded with mock data and mutated as users
// complete real flows (send, convert, fund). Components subscribe via
// useSyncExternalStore in `useLiveTransactions`.
let live: Tx[] = [...seedTransactions];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const subscribeTx = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const getLiveTransactions = () => live;

export const newTxId = () =>
  "TXN-" + Math.floor(100_000 + Math.random() * 900_000).toString();

export const nowStamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const addTransaction = (tx: Omit<Tx, "id" | "date"> & Partial<Pick<Tx, "id" | "date">>) => {
  const full: Tx = {
    id: tx.id ?? newTxId(),
    date: tx.date ?? nowStamp(),
    type: tx.type,
    desc: tx.desc,
    amount: tx.amount,
    ccy: tx.ccy,
    status: tx.status,
  };
  live = [full, ...live];
  emit();
  return full;
};
