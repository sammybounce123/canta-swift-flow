// Saved beneficiaries — the single source of truth for payouts.
// Bulk Payout can only pay saved, verified beneficiaries whose receiving
// currency matches the source wallet currency.
//
// A beneficiary account is a high-risk payout object: it starts as
// "Pending Review", becomes payable only when "Verified", and is pushed to
// "Locked After Change" whenever its bank details are edited.

import { logPayoutEvent, maskAccountNumber, payoutReviewQueue } from "@/lib/payout-security";

export type BeneficiaryStatus =
  | "Verified"
  | "Pending Review"
  | "Locked After Change"
  | "Rejected"
  | "Disabled";

export type SavedBeneficiary = {
  id: string;
  name: string;
  country: string;
  bank: string;
  account: string;
  ccy: string;
  status: BeneficiaryStatus;
  lastPayout: string | null;
};


let list: SavedBeneficiary[] = [
  {
    id: "BEN-1001",
    name: "Northwind Trading Co",
    country: "USA",
    bank: "Demo Bank NA",
    account: "•••• 8821",
    ccy: "USD",
    status: "Verified",
    lastPayout: "2026-07-28",
  },
  {
    id: "BEN-1002",
    name: "Meridian Supplies Ltd",
    country: "UK",
    bank: "Demo Bank UK",
    account: "•••• 4412",
    ccy: "GBP",
    status: "Verified",
    lastPayout: "2026-08-04",
  },
  {
    id: "BEN-1003",
    name: "Contoso Industries",
    country: "France",
    bank: "Demo Bank EU",
    account: "•••• 7790",
    ccy: "EUR",
    status: "Verified",
    lastPayout: "2026-06-19",
  },
  {
    id: "BEN-1004",
    name: "Fabrikam Global",
    country: "UK",
    bank: "Demo Bank UK",
    account: "•••• 1230",
    ccy: "GBP",
    status: "Verified",
    lastPayout: null,
  },
  {
    id: "BEN-1005",
    name: "Adventure Works",
    country: "USA",
    bank: "Demo Bank NA",
    account: "•••• 5566",
    ccy: "USD",
    status: "Verified",
    lastPayout: "2026-05-11",
  },
  {
    id: "BEN-1006",
    name: "Tailwind Logistics LLC",
    country: "USA",
    bank: "Demo Bank NA",
    account: "•••• 3391",
    ccy: "USD",
    status: "Pending",
    lastPayout: null,
  },
  {
    id: "BEN-1007",
    name: "Lagos Freight Partners",
    country: "Nigeria",
    bank: "Guaranty Trust Bank",
    account: "•••• 0119",
    ccy: "NGN",
    status: "Verified",
    lastPayout: "2026-07-02",
  },
];

const listeners = new Set<() => void>();
export const subscribeBeneficiaries = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

export const getBeneficiaries = () => list;
export const findBeneficiary = (idOrName: string) => {
  const key = idOrName.trim().toLowerCase();
  return list.find((b) => b.id.toLowerCase() === key || b.name.toLowerCase() === key);
};
export const beneficiariesFor = (ccy: string) =>
  list.filter((b) => b.ccy.toUpperCase() === ccy.toUpperCase());

export function addBeneficiary(
  b: Omit<SavedBeneficiary, "id" | "lastPayout" | "status"> & { status?: BeneficiaryStatus },
) {
  const full: SavedBeneficiary = {
    id: "BEN-" + Math.floor(1000 + Math.random() * 9000),
    lastPayout: null,
    status: b.status ?? "Verified",
    ...b,
  };
  list = [full, ...list];
  emit();
  return full;
}

export function setBeneficiaryStatus(id: string, status: BeneficiaryStatus) {
  list = list.map((b) => (b.id === id ? { ...b, status } : b));
  emit();
}
