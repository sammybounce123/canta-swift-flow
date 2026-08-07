import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Trash2, AlertTriangle, ArrowRight, ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { wallets, fmtMoney } from "@/lib/mock";
import { addTransaction } from "@/lib/tx-store";
import { getBeneficiaries, subscribeBeneficiaries, findBeneficiary } from "@/lib/beneficiary-store";
import {
  addBatch,
  emptyRow,
  feeFor,
  parseCsv,
  totalOf,
  validateRows,
  csvTemplateFor,
  type BulkRow,
} from "@/lib/bulk-payout-store";

export function BulkPayoutForm({
  onClose,
  onConvertAndSend,
  onAddBeneficiary,
}: {
  onClose: () => void;
  onConvertAndSend: () => void;
  onAddBeneficiary?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [walletCcy, setWalletCcy] = useState(wallets[1]?.ccy ?? "USD");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const all = useSyncExternalStore(subscribeBeneficiaries, getBeneficiaries, getBeneficiaries);

  const wallet = wallets.find((w) => w.ccy === walletCcy);
  const matching = all.filter((b) => b.ccy.toUpperCase() === walletCcy.toUpperCase());
  const { errors, mismatchedCurrencies: mismatches } = useMemo(
    () => validateRows(rows, walletCcy, wallet?.balance),
    [rows, walletCcy, wallet?.balance],
  );
  const badRowIds = new Set(errors.map((e) => e.rowId));
  const total = totalOf(rows);
  const fee = feeFor(walletCcy, rows.length);

  const update = (rowId: string, patch: Partial<BulkRow>) =>
    setRows((r) => r.map((x) => (x.rowId === rowId ? { ...x, ...patch } : x)));

  const toggle = (id: string, on: boolean) =>
    setRows((r) => (on ? [...r, emptyRow(id)] : r.filter((x) => x.beneficiaryId !== id)));

  function onFile(file: File) {
    file.text().then((text) => {
      const { rows: parsed, missingColumns, forbiddenColumns, unknown } = parseCsv(text);
      if (missingColumns.length) {
        toast.error("CSV is missing required columns", { description: missingColumns.join(", ") });
        return;
      }
      if (forbiddenColumns.length) {
        toast.error("Bank details are not accepted in Bulk Payout CSV", {
          description: `Remove ${forbiddenColumns.join(", ")} — Bulk Payout pays saved beneficiaries only.`,
        });
        return;
      }
      if (!parsed.length) {
        toast.error("No data rows found in CSV");
        return;
      }
      setRows(parsed);
      if (unknown.length) {
        toast.error("Beneficiary not found", {
          description: `${unknown.join(", ")} — add these beneficiaries before using Bulk Payout.`,
        });
      } else {
        toast.success(`${parsed.length} saved beneficiaries loaded`);
      }
    });
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([csvTemplateFor(walletCcy)], { type: "text/csv" }));
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
      desc: `Bulk payout · ${rows.length} saved ${walletCcy} beneficiaries`,
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
        {["Source wallet", "Saved beneficiaries", "Review"].map((s, i) => (
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
                setRows([]);
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
              Bulk Payout uses saved beneficiaries only. The beneficiary currency must match the
              source wallet currency.
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

          {matching.length === 0 ? (
            <Card className="p-4 text-center space-y-2 border-dashed">
              <div className="text-sm font-medium">
                No saved {walletCcy} beneficiaries found. Add a {walletCcy} beneficiary before
                creating a bulk payout.
              </div>
              <div className="flex justify-center gap-2">
                {onAddBeneficiary && (
                  <Button size="sm" onClick={onAddBeneficiary}>
                    <UserPlus className="h-3.5 w-3.5 mr-1" /> Add Beneficiary
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setStep(1)}>
                  Change source wallet
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
              {matching.map((b) => {
                const row = rows.find((r) => r.beneficiaryId === b.id);
                const selectable = b.status === "Verified";
                const bad = row ? badRowIds.has(row.rowId) : false;
                return (
                  <Card
                    key={b.id}
                    className={`p-3 ${bad ? "border-destructive bg-destructive/5" : "border-dashed"} ${
                      selectable ? "" : "opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={!!row}
                        disabled={!selectable}
                        aria-label={`Select ${b.name}`}
                        onCheckedChange={(v) => toggle(b.id, !!v)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{b.name}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {b.id}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {b.ccy}
                          </Badge>
                          <Badge
                            variant={b.status === "Verified" ? "secondary" : "outline"}
                            className="text-[10px]"
                          >
                            {b.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {b.bank} · {b.account} · {b.country} · Last payout:{" "}
                          {b.lastPayout ?? "None"}
                        </div>
                        {row && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <Input
                              value={row.amount}
                              onChange={(e) =>
                                update(row.rowId, {
                                  amount: e.target.value.replace(/[^0-9.]/g, ""),
                                })
                              }
                              placeholder={`Amount to send (${b.ccy}) *`}
                            />
                            <Input
                              value={row.purpose}
                              onChange={(e) => update(row.rowId, { purpose: e.target.value })}
                              placeholder="Purpose / reference *"
                            />
                          </div>
                        )}
                        {!selectable && (
                          <div className="text-[11px] text-destructive mt-1">
                            Beneficiary not verified. Verify beneficiary before payout.
                          </div>
                        )}
                      </div>
                      {row && (
                        <Button size="sm" variant="ghost" onClick={() => toggle(b.id, false)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {onAddBeneficiary && matching.length > 0 && (
              <Button size="sm" variant="outline" onClick={onAddBeneficiary}>
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Add Beneficiary
              </Button>
            )}
            <span className="text-[11px] text-muted-foreground">
              Only saved {walletCcy} beneficiaries can be paid in this batch.
            </span>
          </div>

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
            <Line k="Saved beneficiaries" v={String(rows.length)} />
            <Line k="Total payout amount" v={fmtMoney(total, walletCcy)} />
            <Line k="Same-currency payout fee" v={fmtMoney(fee, walletCcy)} />
            <Line k="Approval status" v="Pending approval" />
            <Line k="Payout status" v="Queued" />
          </Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-muted-foreground text-left">
                <tr>
                  {["Beneficiary", "ID", "Bank", "Currency", "Amount", "Purpose", "Status"].map(
                    (h) => (
                      <th key={h} className="font-medium py-1 pr-3 whitespace-nowrap">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const b = findBeneficiary(r.beneficiaryId);
                  return (
                    <tr key={r.rowId} className="border-t border-border">
                      <td className="py-1 pr-3 whitespace-nowrap">{b?.name}</td>
                      <td className="py-1 pr-3">{b?.id}</td>
                      <td className="py-1 pr-3 whitespace-nowrap">{b?.bank}</td>
                      <td className="py-1 pr-3">{b?.ccy}</td>
                      <td className="py-1 pr-3 tabular-nums whitespace-nowrap">
                        {fmtMoney(Number(r.amount) || 0, walletCcy)}
                      </td>
                      <td className="py-1 pr-3">{r.purpose}</td>
                      <td className="py-1 pr-3">{b?.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Same-currency payout to saved beneficiaries. No conversion is performed and receipts are
            issued only after provider confirmation.
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
          Bulk Payout can only be sent to saved beneficiaries in the same currency as the selected
          wallet.
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
              {e.rowNumber > 0 && (
                <Badge variant="outline" className="text-[10px]">
                  Row {e.rowNumber}
                </Badge>
              )}
              <span className="font-medium">{e.name}</span>
              <span className="text-muted-foreground">
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
