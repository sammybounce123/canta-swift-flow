// Bulk Payout is a SAME-CURRENCY payout batch engine over SAVED beneficiaries.
// It never converts, never quotes FX, never mixes currencies, and never accepts
// manually entered bank details. Cross-currency payouts use Convert & Send.

import { findBeneficiary, getBeneficiaries, type SavedBeneficiary } from "@/lib/beneficiary-store";

export type BulkRow = {
  rowId: string;
  beneficiaryId: string;
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

export const emptyRow = (beneficiaryId = ""): BulkRow => ({
  rowId: crypto.randomUUID(),
  beneficiaryId,
  amount: "",
  purpose: "",
});

// Flat same-currency payout fee per beneficiary (no FX, no conversion fee).
export const PAYOUT_FEE_PER_RECIPIENT: Record<string, number> = {
  NGN: 500,
  USD: 4,
  EUR: 4,
  GBP: 3,
  USDT: 1,
};

export const feeFor = (ccy: string, count: number) => (PAYOUT_FEE_PER_RECIPIENT[ccy] ?? 4) * count;

export const totalOf = (rows: BulkRow[]) => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

export function validateRows(
  rows: BulkRow[],
  sourceCcy: string,
  balance?: number,
): { errors: RowError[]; mismatchedCurrencies: string[] } {
  const errors: RowError[] = [];
  const mismatched = new Set<string>();
  const seen = new Map<string, number>();

  rows.forEach((r, i) => {
    const n = i + 1;
    const ben = r.beneficiaryId ? findBeneficiary(r.beneficiaryId) : undefined;
    const base = {
      rowId: r.rowId,
      rowNumber: n,
      name: ben?.name || r.beneficiaryId || `Row ${n}`,
      expected: sourceCcy,
    };
    if (!r.beneficiaryId) {
      errors.push({
        ...base,
        uploaded: "—",
        reason: "No saved beneficiary selected",
        suggestion: "Pick a saved beneficiary or add one first",
      });
    } else if (!ben) {
      errors.push({
        ...base,
        uploaded: "—",
        reason: "Beneficiary not found",
        suggestion: "Add this beneficiary before using Bulk Payout",
      });
    } else {
      if (ben.ccy.toUpperCase() !== sourceCcy.toUpperCase()) {
        mismatched.add(ben.ccy.toUpperCase());
        errors.push({
          ...base,
          uploaded: ben.ccy,
          reason: `Currency mismatch. This beneficiary receives ${ben.ccy}, but the selected wallet is ${sourceCcy}`,
          suggestion: `Select a ${ben.ccy} wallet or use Convert & Send`,
        });
      }
      if (ben.status !== "Verified") {
        errors.push({
          ...base,
          uploaded: ben.ccy,
          reason: "Beneficiary not verified",
          suggestion: "Verify beneficiary before payout",
        });
      }
      const prev = seen.get(ben.id);
      if (prev) {
        errors.push({
          ...base,
          uploaded: ben.ccy,
          reason: `Duplicate beneficiary found (also row ${prev})`,
          suggestion: "Combine amounts or remove duplicate row",
        });
      } else {
        seen.set(ben.id, n);
      }
    }
    if (!r.amount || Number(r.amount) <= 0)
      errors.push({
        ...base,
        uploaded: ben?.ccy ?? "—",
        reason: "Amount must be greater than zero",
        suggestion: "Enter a payout amount",
      });
    if (!r.purpose.trim())
      errors.push({
        ...base,
        uploaded: ben?.ccy ?? "—",
        reason: "Purpose / reference is required",
        suggestion: "Add a payout purpose",
      });
  });

  if (!rows.length) {
    errors.push({
      rowId: "none",
      rowNumber: 0,
      name: "—",
      uploaded: "—",
      expected: sourceCcy,
      reason: "No saved beneficiaries selected",
      suggestion: "Select at least one saved beneficiary",
    });
  }

  const total = totalOf(rows) + feeFor(sourceCcy, rows.length);
  if (typeof balance === "number" && total > balance) {
    errors.push({
      rowId: "balance",
      rowNumber: 0,
      name: "—",
      uploaded: sourceCcy,
      expected: sourceCcy,
      reason: "Insufficient source wallet balance",
      suggestion: "Reduce the batch amount or fund the wallet",
    });
  }

  return { errors, mismatchedCurrencies: Array.from(mismatched) };
}

// ---- CSV: references saved beneficiaries only ---------------------------

export const REQUIRED_CSV_COLUMNS = ["beneficiary_id", "amount", "purpose"];
export const FORBIDDEN_CSV_COLUMNS = [
  "bank_name",
  "bank",
  "account_number",
  "account",
  "iban",
  "swift",
  "bic",
  "currency",
];

export type CsvParseResult = {
  rows: BulkRow[];
  missingColumns: string[];
  forbiddenColumns: string[];
  unknown: string[];
};

export function parseCsv(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length)
    return { rows: [], missingColumns: REQUIRED_CSV_COLUMNS, forbiddenColumns: [], unknown: [] };
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
    ben: idx("beneficiary_id", "beneficiary_name", "beneficiary"),
    amount: idx("amount"),
    purpose: idx("purpose", "reference"),
    memo: idx("memo"),
  };
  const missingColumns: string[] = [];
  if (cols.ben < 0) missingColumns.push("beneficiary_id / beneficiary_name");
  if (cols.amount < 0) missingColumns.push("amount");
  if (cols.purpose < 0) missingColumns.push("purpose");

  const forbiddenColumns = header.filter((h) => FORBIDDEN_CSV_COLUMNS.includes(h));

  const unknown: string[] = [];
  const rows = lines.slice(1).map((l) => {
    const c = split(l);
    const at = (i: number) => (i >= 0 ? (c[i] ?? "") : "");
    const key = at(cols.ben);
    const ben = key ? findBeneficiary(key) : undefined;
    if (key && !ben) unknown.push(key);
    const memo = at(cols.memo);
    return {
      rowId: crypto.randomUUID(),
      beneficiaryId: ben?.id ?? key,
      amount: at(cols.amount).replace(/[^0-9.]/g, ""),
      purpose: [at(cols.purpose), memo].filter(Boolean).join(" · "),
    };
  });
  return { rows, missingColumns, forbiddenColumns, unknown };
}

export function csvTemplateFor(ccy: string) {
  const sample = getBeneficiaries().filter(
    (b) => b.ccy.toUpperCase() === ccy.toUpperCase() && b.status === "Verified",
  );
  const body = (sample.length ? sample : ([] as SavedBeneficiary[]))
    .slice(0, 2)
    .map((b) => `${b.id},10000,Supplier invoice INV-1042`)
    .join("\n");
  return `beneficiary_id,amount,purpose,memo\n${body}\n`;
}

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

const batchListeners = new Set<() => void>();
export const subscribeBatches = (l: () => void) => {
  batchListeners.add(l);
  return () => batchListeners.delete(l);
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
  batchListeners.forEach((l) => l());
  return full;
}
