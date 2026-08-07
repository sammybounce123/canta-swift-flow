import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useRmbBanks,
  useSimpleInvoices,
  simpleInvoiceStore,
  SETTLEMENT_NEXT_LABEL,
  ngnSummary,
  maskAccount,
  type SimpleInvoice,
} from "@/lib/supplier-simple";

export const Route = createFileRoute("/supplier-portal/settlements")({
  head: () => ({
    meta: [
      { title: "Settlements — Supplier Portal — Canta" },
      {
        name: "description",
        content: "RMB paid and pending, your settlement bank account, expected dates and receipts.",
      },
    ],
  }),
  component: SettlementsPage,
});

const STEPS = [
  "Buyer paid NGN",
  "Payment matched to invoice",
  "Compliance review completed",
  "NGN converted to RMB",
  "RMB payout initiated",
  "RMB paid to bank",
  "Receipt available",
];

function stepIndex(inv: SimpleInvoice) {
  switch (inv.status) {
    case "NGN Received":
      return 1;
    case "Compliance Review":
      return 2;
    case "Auto-Converting":
      return 3;
    case "RMB Settlement Pending":
      return 4;
    case "RMB Paid":
      return 6;
    default:
      return 0;
  }
}

function SettlementsPage() {
  const invoices = useSimpleInvoices();
  const banks = useRmbBanks();
  const s = ngnSummary(invoices);
  const dest = banks.find((b) => b.isSettlementDestination);

  const rows = invoices.filter((i) =>
    [
      "NGN Received",
      "Compliance Review",
      "Auto-Converting",
      "RMB Settlement Pending",
      "RMB Paid",
    ].includes(i.status),
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="RMB paid" value={`¥${s.rmbPaid.toLocaleString()}`} />
        <Stat label="RMB pending" value={`¥${s.rmbPending.toLocaleString()}`} />
        <Stat
          label="Settlement bank account"
          value={
            dest
              ? `${dest.bankName.split("—")[0].trim()} ${maskAccount(dest.accountNumber)}`
              : "Not set"
          }
        />
        <Stat
          label="Expected settlement"
          value={s.rmbPending > 0 ? "1–2 business days after compliance" : "—"}
        />
      </div>

      {!dest && (
        <Card className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Add and verify an RMB bank account before settlement can be paid.{" "}
          <Link to="/supplier-portal/rmb-bank-account" className="underline">
            Add RMB bank account
          </Link>
        </Card>
      )}

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Settlement timeline</div>
        <div className="space-y-4">
          {rows.map((inv) => {
            const idx = stepIndex(inv);
            return (
              <div key={inv.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-xs">
                      {inv.invoiceNumber} · {inv.paymentRequestId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inv.buyerCompany} · ¥{inv.amountRmb.toLocaleString()} · ₦
                      {inv.amountNgn.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {inv.status}
                    </Badge>
                    {SETTLEMENT_NEXT_LABEL[inv.status] && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => {
                          const res = simpleInvoiceStore.advanceSettlement(inv.id);
                          if (res.ok)
                            toast.success(
                              res.status === "RMB Paid"
                                ? "Provider confirmed payout — receipt available"
                                : `Moved to ${res.status}`,
                            );
                          else toast.error(res.error ?? "Could not advance settlement");
                        }}
                      >
                        {SETTLEMENT_NEXT_LABEL[inv.status]}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={!inv.providerConfirmed}
                      onClick={() =>
                        toast.success(`Settlement receipt ${inv.receiptId ?? ""} downloaded`)
                      }
                    >
                      Receipt
                    </Button>
                  </div>
                </div>

                <ol className="mt-3 grid gap-2 text-xs sm:grid-cols-4 xl:grid-cols-7">
                  {STEPS.map((st, i) => (
                    <li
                      key={st}
                      className={`rounded-md border p-2 ${i === idx ? "border-primary bg-primary/5" : i < idx ? "border-emerald-300 bg-emerald-50" : "border-border"}`}
                    >
                      <div className="text-[10px] text-muted-foreground">{i + 1}</div>
                      <div className="font-medium">{st}</div>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div className="text-xs text-muted-foreground">No settlements in progress yet.</div>
          )}
        </div>
      </Card>

      <Card className="p-3 text-[11px] italic text-muted-foreground">
        Settlement is never marked RMB Paid without payout provider confirmation, and is only ever
        paid to a verified bank account owned by your business.
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </Card>
  );
}
