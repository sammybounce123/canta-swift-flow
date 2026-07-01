import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Receipt, Upload, Bell, Clock, Download, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { REQUESTS, STATUS_TONE, SettlementTimeline } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/requests")({
  head: () => ({ meta: [{ title: "Payment Requests — Supplier Portal — Canta" }] }),
  component: RequestsPanel,
});

function RequestsPanel() {
  return (
    <div className="space-y-3">
      <ButtonGroup label="Payment request actions">
        <Button size="sm" onClick={() => toast.success("New payment request drafted")}><Receipt className="h-4 w-4 mr-2" /> Create Payment Request</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload Invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent to buyer")}><Bell className="h-4 w-4 mr-2" /> Send Reminder</Button>
        <Button size="sm" variant="outline" asChild><Link to="/supplier-portal/fx-quotes"><Clock className="h-4 w-4 mr-2" /> View FX Quotes</Link></Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Receipt downloaded")}><Download className="h-4 w-4 mr-2" /> Download Receipt</Button>
      </ButtonGroup>

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">
        Suppliers can only <strong>receive</strong> payments through Canta. If a refund is needed, Canta returns funds only to the same Nigerian buyer bank account that originally sent the NGN payment.
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Invoice #</th>
                <th className="text-left py-2 px-3">Buyer</th>
                <th className="text-right py-2 px-3">Amount</th>
                <th className="text-right py-2 px-3">NGN equiv.</th>
                <th className="text-left py-2 px-3">Due</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-left py-2 px-3">Invoice</th>
                <th className="text-left py-2 px-3">Sender account</th>
                <th className="text-right py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((r) => {
                const canRefund = ["NGN Received","Compliance Review","FX Processing","RMB Paid"].includes(r.status) && !!r.senderAccount;
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                    <td className="py-2 px-3">{r.buyer}</td>
                    <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()} <span className="text-xs text-muted-foreground">{r.invoiceCurrency}</span></td>
                    <td className="py-2 px-3 text-right tabular-nums">₦{r.amountNgn.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs">{r.dueDate}</td>
                    <td className="py-2 px-3"><Badge className={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                    <td className="py-2 px-3 text-xs"><FileText className="h-3 w-3 inline mr-1" />{r.invoiceDoc}</td>
                    <td className="py-2 px-3 text-xs">
                      {r.senderAccount
                        ? <><div>{r.senderAccount.bank}</div><div className="text-muted-foreground">****{r.senderAccount.accountNumber.slice(-4)}</div></>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-2 px-3">
                      <ButtonGroup label={`Actions for ${r.invoiceNumber}`} className="justify-end">
                        <Button size="sm" variant="outline" onClick={() => toast.success(`Timeline for ${r.invoiceNumber}`)}><Clock className="h-3.5 w-3.5 mr-1" /> Timeline</Button>
                        <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent")}><Bell className="h-3.5 w-3.5 mr-1" /> Remind</Button>
                        {r.status === "RMB Paid" && (
                          <Button size="sm" variant="outline" onClick={() => toast.success("Settlement receipt downloaded")}><Download className="h-3.5 w-3.5 mr-1" /> Receipt</Button>
                        )}
                        <Button size="sm" variant="outline" disabled={!canRefund}
                          onClick={() => toast.success(`Refund request submitted — funds will return to ${r.senderAccount?.bank} ****${r.senderAccount?.accountNumber.slice(-4)}`)}>
                          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Refund to sender
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold mb-2">Payment request timeline stages</div>
        <SettlementTimeline currentIndex={5} />
      </Card>
    </div>
  );
}
