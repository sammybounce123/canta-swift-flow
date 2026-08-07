// Bulk Payout is a SAME-CURRENCY payout batch engine.
// It never converts, never quotes FX and never mixes currencies in one batch.
// Cross-currency payouts must go through Convert & Send.

export const BULK_WALLET_CCYS = ["NGN", "USD", "EUR", "GBP", "USDT"] as const;
export type BulkCcy = (typeof BULK_WALLET_CCYS)[number];

export const KNOWN_CCYS = [
  ...BULK_WALLET_CCYS,
  "ZAR",
  "AED",
  "CNY",
  "RMB",
  "INR",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
] as const;

export type BulkRecipient = {
  rowId: string;
  name: string;
  bank: string;
  account: string;
  currency: string;
  amount: string;
  purpose: string;
};

export type RowError = {
  rowId: string;
  rowNumber: number;
  name: string;
  uploaded: string;
  expected: string;
  reason: string;
  suggestion: string;
};

export const emptyRecipient = (currency: string): BulkRecipient => ({
  rowId: crypto.randomUUID(),
  name: "",
  bank: "",
  account: "",
  currency,
  amount: "",
  purpose: "",
});

// Flat same-currency payout fee per recipient (no FX, no conversion fee).
export const PAYOUT_FEE_PER_RECIPIENT: Record<string, number> = {
  NGN: 500,
  USD: 4,
  EUR: 4,
  GBP: 3,
  USDT: 1,
};

export const feeFor = (ccy: string, count: number) => (PAYOUT_FEE_PER_RECIPIENT[ccy] ?? 4) * count;

export const totalOf = (rows: BulkRecipient[]) =>
  rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

export function validateRows(rows: BulkRecipient[], sourceCcy: string): RowError[] {
  const errs: RowError[] = [];
  rows.forEach((r, i) => {
    const n = i + 1;
    const base = { rowId: r.rowId, rowNumber: n, name: r.name || `Row ${n}`, expected: sourceCcy };
    const cur = r.currency.trim().toUpperCase();
    if (!r.name.trim())
      errs.push({
        ...base,
        uploaded: cur || "—",
        reason: "Recipient name is required",
        suggestion: "Add the recipient name",
      });
    if (!r.account.trim())
      errs.push({
        ...base,
        uploaded: cur || "—",
        reason: "Account number / IBAN is required",
        suggestion: "Add the recipient account number or IBAN",
      });
    if (!r.bank.trim())
      errs.push({
        ...base,
        uploaded: cur || "—",
        reason: "Bank name is required",
        suggestion: "Add the recipient bank name",
      });
    if (!cur)
      errs.push({
        ...base,
        uploaded: "—",
        reason: "Currency is required",
        suggestion: `Set the recipient currency to ${sourceCcy}`,
      });
    else if (!(KNOWN_CCYS as readonly string[]).includes(cur))
      errs.push({
        ...base,
        uploaded: cur,
        reason: "Invalid currency code",
        suggestion: `Use a valid code — this batch pays out in ${sourceCcy}`,
      });
    else if (cur !== sourceCcy)
      errs.push({
        ...base,
        uploaded: cur,
        reason: `Recipient currency differs from the source wallet (${sourceCcy})`,
        suggestion: `Change recipient currency to ${sourceCcy} or use Convert & Send`,
      });
    if (!r.amount || Number(r.amount) <= 0)
      errs.push({
        ...base,
        uploaded: cur || "—",
        reason: "Amount must be greater than zero",
        suggestion: "Enter a payout amount",
      });
    if (!r.purpose.trim())
      errs.push({
        ...base,
        uploaded: cur || "—",
        reason: "Purpose / reference is required",
        suggestion: "Add a payout purpose",
      });
  });
  return errs;
}

export const mismatchedCurrencies = (rows: BulkRecipient[], sourceCcy: string) =>
  Array.from(
    new Set(
      rows
        .map((r) => r.currency.trim().toUpperCase())
        .filter((c) => c && c !== sourceCcy.toUpperCase()),
    ),
  );

export const REQUIRED_CSV_COLUMNS = [
  "recipient_name",
  "account_number",
  "bank_name",
  "currency",
  "amount",
  "purpose",
];

export type CsvParseResult = {
  rows: BulkRecipient[];
  missingColumns: string[];
};

export function parseCsv(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { rows: [], missingColumns: REQUIRED_CSV_COLUMNS };
  const split = (l: string) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const idx = (...names: string[]) => {
    for (const n of names) {
      const i = header.indexOf(n);
      if (i >= 0) return i;
    }
    return -1;
  };
  const cols = {
    name: idx("recipient_name", "name", "beneficiary"),
    account: idx("account_number", "iban", "account"),
    bank: idx("bank_name", "bank"),
    currency: idx("currency", "ccy"),
    amount: idx("amount"),
    purpose: idx("purpose", "reference"),
  };
  const missingColumns: string[] = [];
  if (cols.name < 0) missingColumns.push("recipient_name");
  if (cols.account < 0) missingColumns.push("account_number / iban");
  if (cols.bank < 0) missingColumns.push("bank_name");
  if (cols.currency < 0) missingColumns.push("currency");
  if (cols.amount < 0) missingColumns.push("amount");
  if (cols.purpose < 0) missingColumns.push("purpose");

  const rows = lines.slice(1).map((l) => {
    const c = split(l);
    const at = (i: number) => (i >= 0 ? (c[i] ?? "") : "");
    return {
      rowId: crypto.randomUUID(),
      name: at(cols.name),
      bank: at(cols.bank),
      account: at(cols.account),
      currency: at(cols.currency).toUpperCase(),
      amount: at(cols.amount).replace(/[^0-9.]/g, ""),
      purpose: at(cols.purpose),
    };
  });
  return { rows, missingColumns };
}

export const CSV_TEMPLATE = `recipient_name,account_number,bank_name,currency,amount,purpose\nNorthwind Trading Co,GB29NWBK60161331926819,Demo Bank UK,GBP,12500,Supplier invoice INV-1042\n`;

// ---- Batch records -------------------------------------------------------

export type BulkBatch = {
  id: string;
  sourceWallet: string;
  currency: string;
  recipients: number;
  total: number;
  fee: number;
  approval: "Pending approval" | "Approved";
  payout: "Queued" | "Processing" | "Paid";
  createdBy: string;
  date: string;
};

let batches: BulkBatch[] = [
  {
    id: "BP-4821",
    sourceWallet: "USD Wallet",
    currency: "USD",
    recipients: 5,
    total: 184_200,
    fee: 20,
    approval: "Approved",
    payout: "Paid",
    createdBy: "A. Bello",
    date: "2026-07-28",
  },
  {
    id: "BP-4830",
    sourceWallet: "GBP Wallet",
    currency: "GBP",
    recipients: 3,
    total: 42_600,
    fee: 9,
    approval: "Pending approval",
    payout: "Queued",
    createdBy: "T. Okoro",
    date: "2026-08-04",
  },
];

const listeners = new Set<() => void>();
export const subscribeBatches = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getBatches = () => batches;

export function addBatch(b: Omit<BulkBatch, "id" | "date" | "createdBy"> & { createdBy?: string }) {
  const full: BulkBatch = {
    id: "BP-" + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().slice(0, 10),
    createdBy: b.createdBy ?? "You",
    ...b,
  };
  batches = [full, ...batches];
  listeners.forEach((l) => l());
  return full;
}
