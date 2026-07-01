import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Landmark, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import { REQUESTS, STATUS_TONE, type SettlementStatus } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/settlement")({
  head: () => ({ meta: [{ title: "RMB / USD Settlement — Supplier Portal — Canta" }] }),
  component: SettlementPanel,
});

function SettlementPanel() {
  return (
    <div className="space-y-3">
      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">RMB settlement statuses</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {(Object.keys(STATUS_TONE) as SettlementStatus[]).map((s) => (
            <Badge key={s} className={STATUS_TONE[s]}>{s}</Badge>
          ))}
        </div>
        <div className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
          RMB settlement is processed after NGN payment confirmation, compliance checks, FX availability, and payout approval. Settlement is inbound only — suppliers <strong>receive</strong> RMB/USD, they do not send.
        </div>
        <ButtonGroup label="Settlement actions">
          <Button size="sm" variant="outline" onClick={() => toast.success("RMB payout bank details saved")}><Landmark className="h-4 w-4 mr-2" /> Add RMB payout bank details</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Settlement receipt downloaded")}><Download className="h-4 w-4 mr-2" /> Download settlement receipt</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Settlement tracker opened")}><Clock className="h-4 w-4 mr-2" /> Track RMB settlement</Button>
        </ButtonGroup>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Buyer</th>
                <th className="text-left py-2 px-3">Invoice #</th>
                <th className="text-right py-2 px-3">NGN paid</th>
                <th className="text-right py-2 px-3">Expected RMB</th>
                <th className="text-right py-2 px-3">Rate</th>
                <th className="text-right py-2 px-3">Fee (₦)</th>
                <th className="text-left py-2 px-3">Payout bank</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Compliance</th>
                <th className="text-left py-2 px-3">Payout ref</th>
                <th className="text-left py-2 px-3">Date paid</th>
                <th className="text-right py-2 px-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 px-3">{r.buyer}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{["NGN Received","Compliance Review","FX Processing","RMB Payout Initiated","RMB Paid"].includes(r.status) ? `₦${r.amountNgn.toLocaleString()}` : "—"}</td>
                  <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">{r.rate.toFixed(2)}</td>
                  <td className="py-2 px-3 text-right tabular-nums text-xs">₦{r.fee.toLocaleString()}</td>
                  <td className="py-2 px-3 text-xs">ICBC · ****4821</td>
                  <td className="py-2 px-3"><Badge className={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                  <td className="py-2 px-3 text-xs">{r.status === "Compliance Review" ? "In review" : r.status === "Awaiting Buyer Payment" ? "Not started" : "Cleared"}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.payoutRef ?? "—"}</td>
                  <td className="py-2 px-3 text-xs">{r.paidDate ?? "—"}</td>
                  <td className="py-2 px-3 text-right">
                    {r.status === "RMB Paid"
                      ? <Button size="sm" variant="outline" onClick={() => toast.success(`Receipt ${r.payoutRef} downloaded`)}><Download className="h-3.5 w-3.5 mr-1" /> Receipt</Button>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
