import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Download, ChartBar, Receipt, Wallet } from "lucide-react";
import { toast } from "sonner";
import { REQUESTS, COMPLIANCE_DISCLAIMER } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/reports")({
  head: () => ({ meta: [{ title: "Supplier Reports — Supplier Portal — Canta" }] }),
  component: SupplierReports,
});

function SupplierReports() {
  const totalRmb = REQUESTS.reduce((s, r) => s + r.amountRmb, 0);
  const totalNgn = REQUESTS.reduce((s, r) => s + r.amountNgn, 0);
  const paid = REQUESTS.filter((r) => r.status === "RMB Paid").length;
  const pending = REQUESTS.length - paid;

  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold">Supplier reports — Guangzhou Tech Factory</div>
            <div className="text-xs text-muted-foreground">Owner: Li Wei · Scope: your buyers, your invoices, your RMB settlement only.</div>
          </div>
          <ButtonGroup label="Report actions">
            <Button size="sm" variant="outline" onClick={() => toast.success("Settlement report exported (CSV)")}><Download className="h-4 w-4 mr-2" /> Export settlements</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Buyer statement exported (PDF)")}><Download className="h-4 w-4 mr-2" /> Buyer statement</Button>
          </ButtonGroup>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Wallet className="h-3 w-3" /> Total RMB requested</div><div className="text-lg font-semibold mt-1">¥{totalRmb.toLocaleString()}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Receipt className="h-3 w-3" /> Total NGN collected</div><div className="text-lg font-semibold mt-1">₦{totalNgn.toLocaleString()}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ChartBar className="h-3 w-3" /> Requests settled</div><div className="text-lg font-semibold mt-1">{paid}</div></Card>
        <Card className="p-4"><div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><ChartBar className="h-3 w-3" /> Requests in progress</div><div className="text-lg font-semibold mt-1">{pending}</div></Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-3 text-sm font-semibold border-b">Settlement history</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Request Ref</th>
                <th className="text-left py-2 px-3">Buyer</th>
                <th className="text-left py-2 px-3">Invoice Ref</th>
                <th className="text-right py-2 px-3">NGN</th>
                <th className="text-right py-2 px-3">RMB</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 px-3 font-mono text-xs">{r.id}</td>
                  <td className="py-2 px-3">{r.buyer}</td>
                  <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                  <td className="py-2 px-3 text-right tabular-nums">₦{r.amountNgn.toLocaleString()}</td>
                  <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()}</td>
                  <td className="py-2 px-3"><Badge variant="secondary">{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>
      <div className="text-xs text-muted-foreground">Need something else? <Link className="underline" to="/supplier-portal/support">Contact supplier support</Link>.</div>
    </div>
  );
}
