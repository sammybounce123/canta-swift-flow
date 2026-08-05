import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, ShieldCheck, FlaskConical, Info, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { REQUESTS, STATUS_TONE, type SupplierRequest } from "@/lib/supplier-data";
import { usePayoutAccounts, maskAccountNumber, type PayoutAccount } from "@/lib/supplier-payout-accounts";

export const Route = createFileRoute("/supplier-portal/settlement")({
  head: () => ({ meta: [{ title: "Settlement — Supplier Portal — Canta" }] }),
  component: SettlementPanel,
});

// Local, page-scoped confirmation state: whether the payout provider has
// confirmed a given payment request's settlement. Demo-only — resets on reload.
const providerConfirmed = new Set<string>();

function collectedNgn(r: SupplierRequest) {
  return ["NGN Received", "Compliance Review", "FX Processing", "RMB Payout Initiated", "RMB Paid"].includes(r.status)
    ? r.amountNgn
    : 0;
}

function SettlementPanel() {
  const accounts = usePayoutAccounts();
  const rmbAccount = accounts.find((a) => a.currency === "RMB" && a.isDefault) ?? accounts.find((a) => a.currency === "RMB");
  const [detail, setDetail] = useState<SupplierRequest | null>(null);
  const [, force] = useState(0);

  function confirmProvider(r: SupplierRequest) {
    if (!rmbAccount || rmbAccount.status !== "Verified") {
      toast.error("Settlement can only target a verified payout account. Verify an RMB account first.");
      return;
    }
    providerConfirmed.add(r.id);
    force((n) => n + 1);
    toast.success(`Payout provider confirmed settlement for ${r.id}`);
  }

  function markSupplierPaid(r: SupplierRequest) {
    if (!providerConfirmed.has(r.id)) {
      toast.error("Confirm provider settlement before marking this request Supplier Paid.");
      return;
    }
    if (!rmbAccount || rmbAccount.status !== "Verified") {
      toast.error("Settlement can only target a verified payout account.");
      return;
    }
    toast.success(`${r.id} marked Supplier Paid`);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Badge variant="outline" className="text-[10px] inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" /> Demo data</Badge>
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">RMB settlement tracking</div>
        <div className="text-xs text-muted-foreground">
          Settlement tracks every Payment Request from NGN collection through RMB payout to your verified payout account.
        </div>
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2 flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span>A settlement cannot be marked <strong>Supplier Paid</strong> without a provider settlement confirmation step.</span>
          </div>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2 flex items-start gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span>Settlement can only target a <strong>verified</strong> payout account. Current RMB destination: {rmbAccount ? `${rmbAccount.bank} (${rmbAccount.status})` : "none set"}.</span>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Payment Request Ref</th>
                <th className="text-left py-2 px-3">Invoice Ref</th>
                <th className="text-left py-2 px-3">Buyer</th>
                <th className="text-right py-2 px-3">NGN collected</th>
                <th className="text-right py-2 px-3">FX rate</th>
                <th className="text-right py-2 px-3">RMB payable</th>
                <th className="text-left py-2 px-3">Payout account</th>
                <th className="text-left py-2 px-3">Settlement status</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((r) => {
                const ngn = collectedNgn(r);
                const confirmed = providerConfirmed.has(r.id);
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="py-2 px-3 font-mono text-xs">{r.id}</td>
                    <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                    <td className="py-2 px-3">{r.buyer}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{ngn ? `₦${ngn.toLocaleString()}` : "—"}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{r.rate.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs">
                      {rmbAccount ? <>{rmbAccount.bank} · {maskAccountNumber(rmbAccount.accountNumber)}</> : <span className="text-muted-foreground">Not set</span>}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-col gap-1">
                        <Badge className={STATUS_TONE[r.status]}>{r.status}</Badge>
                        {r.status === "RMB Payout Initiated" && (
                          <Badge variant="outline" className="text-[10px] w-fit">{confirmed ? "Provider confirmed" : "Awaiting provider confirmation"}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setDetail(r)}><Eye className="h-3.5 w-3.5 mr-1" /> Details</Button>
                        {r.status === "RMB Payout Initiated" && !confirmed && (
                          <Button size="sm" variant="outline" onClick={() => confirmProvider(r)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm provider settlement</Button>
                        )}
                        {r.status === "RMB Payout Initiated" && confirmed && (
                          <Button size="sm" onClick={() => markSupplierPaid(r)}>Mark Supplier Paid</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-3 text-xs text-muted-foreground flex items-start gap-2 border-dashed">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Escrow milestones are managed from the Importer Trade Desk and are not part of supplier settlement. Suppliers track NGN collection, FX conversion, and RMB payout only.</span>
      </Card>

      <DetailDialog request={detail} account={rmbAccount} onClose={() => setDetail(null)} />
    </div>
  );
}

function DetailDialog({ request, account, onClose }: { request: SupplierRequest | null; account: PayoutAccount | undefined; onClose: () => void }) {
  if (!request) return null;
  const r = request;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Settlement detail — {r.id}</DialogTitle>
          <DialogDescription>Invoice Ref {r.invoiceNumber} · {r.buyer}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Row k="NGN collected" v={collectedNgn(r) ? `₦${collectedNgn(r).toLocaleString()}` : "—"} />
          <Row k="FX rate" v={r.rate.toFixed(2)} />
          <Row k="RMB payable" v={`¥${r.amountRmb.toLocaleString()}`} />
          <Row k="Fee" v={`₦${r.fee.toLocaleString()}`} />
          <Row k="Settlement status" v={r.status} />
          <Row k="Payout account" v={account ? `${account.bank} · ${maskAccountNumber(account.accountNumber)} (${account.status})` : "Not set"} />
          <Row k="Payout ref" v={r.payoutRef ?? "—"} />
          <Row k="Date paid" v={r.paidDate ?? "—"} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className="font-medium break-all">{v}</div>
    </div>
  );
}
