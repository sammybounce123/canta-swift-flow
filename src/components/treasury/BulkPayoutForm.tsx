import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, Trash2, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { wallets, fmtMoney } from "@/lib/mock";
import { addTransaction } from "@/lib/tx-store";
import {
  addBatch,
  emptyRecipient,
  feeFor,
  mismatchedCurrencies,
  parseCsv,
  totalOf,
  validateRows,
  CSV_TEMPLATE,
  type BulkRecipient,
} from "@/lib/bulk-payout-store";

export function BulkPayoutForm({
  onClose,
  onConvertAndSend,
}: {
  onClose: () => void;
  onConvertAndSend: () => void;
}) {
  const [step, setStep] = useState(1);
  const [walletCcy, setWalletCcy] = useState(wallets[1]?.ccy ?? "USD");
  const [rows, setRows] = useState<BulkRecipient[]>([emptyRecipient(wallets[1]?.ccy ?? "USD")]);
  const fileRef = useRef<HTMLInputElement>(null);

  const wallet = wallets.find((w) => w.ccy === walletCcy);
  const errors = useMemo(() => validateRows(rows, walletCcy), [rows, walletCcy]);
  const badRowIds = new Set(errors.map((e) => e.rowId));
  const mismatches = mismatchedCurrencies(rows, walletCcy);
  const total = totalOf(rows);
  const fee = feeFor(walletCcy, rows.length);

  const update = (rowId: string, patch: Partial<BulkRecipient>) =>
    setRows((r) => r.map((x) => (x.rowId === rowId ? { ...x, ...patch } : x)));

  function onFile(file: File) {
    file.text().then((text) => {
      const { rows: parsed, missingColumns } = parseCsv(text);
      if (missingColumns.length) {
        toast.error("CSV is missing required columns", {
          description: missingColumns.join(", "),
        });
        return;
      }
      if (!parsed.length) {
        toast.error("No data rows found in CSV");
        return;
      }
      setRows(parsed);
      const mixed = mismatchedCurrencies(parsed, walletCcy);
      if (mixed.length) {
        toast.error("Mixed currencies detected", {
          description:
            "Bulk payout only supports one currency per batch. Create separate batches or use Convert & Send for cross-currency payouts.",
        });
      } else {
        toast.success(`${parsed.length} recipients loaded`);
      }
    });
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-payout-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function submit() {
    if (errors.length) return;
    addBatch({
      sourceWallet: wallet?.label ?? `${walletCcy} Wallet`,
      currency: walletCcy,
      recipients: rows.length,
      total,
      fee,
      approval: "Pending approval",
      payout: "Queued",
    });
    addTransaction({
      type: "Outgoing",
      desc: `Bulk payout · ${rows.length} ${walletCcy} recipients`,
      amount: total,
      ccy: walletCcy,
      status: "Pending",
    });
    toast.success("Batch submitted for approval", {
      description: `${rows.length} same-currency ${walletCcy} payouts. Receipts are issued after provider confirmation.`,
    });
    onClose();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px]">
        {["Source wallet", "Recipients", "Review"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full ${
                step === i + 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}. {s}
            </span>
            {i < 2 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium mb-1">Source wallet</div>
            <Select
              value={walletCcy}
              onValueChange={(v) => {
                setWalletCcy(v);
                setRows((r) => r.map((x) => ({ ...x, currency: v })));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((w) => (
                  <SelectItem key={w.ccy} value={w.ccy}>
                    {w.label} · {fmtMoney(w.balance, w.ccy)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Bulk payout only supports same-currency payouts. The source wallet currency must match
              every recipient&apos;s receiving currency.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>
              Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs">
              Batch currency: <b>{walletCcy}</b> · Source: <b>{wallet?.label}</b>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" variant="ghost" onClick={downloadTemplate}>
                CSV template
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Upload CSV
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
            {rows.map((r, i) => {
              const bad = badRowIds.has(r.rowId);
              return (
                <Card
                  key={r.rowId}
                  className={`p-3 ${bad ? "border-destructive bg-destructive/5" : "border-dashed"}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-muted-foreground">Row {i + 1}</div>
                    {rows.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRows((x) => x.filter((y) => y.rowId !== r.rowId))}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Input
                      value={r.name}
                      onChange={(e) => update(r.rowId, { name: e.target.value })}
                      placeholder="Beneficiary name *"
                    />
                    <Input
                      value={r.bank}
                      onChange={(e) => update(r.rowId, { bank: e.target.value })}
                      placeholder="Bank name *"
                    />
                    <Input
                      value={r.account}
                      onChange={(e) => update(r.rowId, { account: e.target.value })}
                      placeholder="Account number / IBAN *"
                    />
                    <Input
                      value={r.currency}
                      onChange={(e) =>
                        update(r.rowId, { currency: e.target.value.toUpperCase().slice(0, 5) })
                      }
                      placeholder="Receiving currency *"
                      className={
                        r.currency && r.currency !== walletCcy ? "border-destructive" : undefined
                      }
                    />
                    <Input
                      value={r.amount}
                      onChange={(e) =>
                        update(r.rowId, { amount: e.target.value.replace(/[^0-9.]/g, "") })
                      }
                      placeholder="Amount *"
                    />
                    <Input
                      value={r.purpose}
                      onChange={(e) => update(r.rowId, { purpose: e.target.value })}
                      placeholder="Purpose / reference *"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRows((r) => [...r, emptyRecipient(walletCcy)])}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add recipient
          </Button>

          {errors.length > 0 && <ErrorPanel />}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <Button disabled={errors.length > 0} onClick={() => setStep(3)}>
              Review batch
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <Card className="p-4 text-sm space-y-1.5">
            <Line k="Source wallet" v={wallet?.label ?? walletCcy} />
            <Line k="Batch currency" v={walletCcy} />
            <Line k="Recipients" v={String(rows.length)} />
            <Line k="Total amount" v={fmtMoney(total, walletCcy)} />
            <Line k="Payout fee" v={fmtMoney(fee, walletCcy)} />
            <Line k="Approval status" v="Pending approval" />
            <Line k="Payout status" v="Queued" />
          </Card>
          <p className="text-[11px] text-muted-foreground">
            Same-currency payout. No conversion is performed and receipts are issued only after
            provider confirmation.
          </p>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
            <Button disabled={errors.length > 0} onClick={submit}>
              Submit for approval
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  function ErrorPanel() {
    return (
      <Card className="p-3 border-destructive/40 bg-destructive/5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {mismatches.length > 0
            ? `Bulk payout only supports same-currency payouts. Change recipient currency to ${walletCcy} or use Convert & Send.`
            : "Fix the highlighted rows to continue."}
        </div>
        {mismatches.length > 1 && (
          <div className="text-[11px] text-muted-foreground">
            Create separate same-currency batches, or use Convert &amp; Send for each cross-currency
            payout.
          </div>
        )}
        <div className="max-h-32 overflow-y-auto space-y-1">
          {errors.slice(0, 12).map((e, i) => (
            <div key={i} className="text-[11px] flex flex-wrap gap-x-2">
              <Badge variant="outline" className="text-[10px]">
                Row {e.rowNumber}
              </Badge>
              <span className="font-medium">{e.name}</span>
              <span className="text-muted-foreground">
                {e.uploaded !== "—" && `${e.uploaded} → expected ${e.expected} · `}
                {e.reason} · {e.suggestion}
              </span>
            </div>
          ))}
        </div>
        {mismatches.length > 0 && (
          <div className="pt-1">
            <Button size="sm" variant="outline" onClick={onConvertAndSend}>
              Use Convert &amp; Send
            </Button>
            <p className="text-[11px] text-muted-foreground mt-1">
              Convert &amp; Send lets you convert funds and pay a beneficiary in another currency.
            </p>
          </div>
        )}
      </Card>
    );
  }
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground text-xs">{k}</span>
      <span className="font-medium text-xs text-right">{v}</span>
    </div>
  );
}
