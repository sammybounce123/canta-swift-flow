import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Upload, Bell, Clock, Download, FileText, RotateCcw, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { REQUESTS, BUYERS, STATUS_TONE, SettlementTimeline } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/requests")({
  head: () => ({ meta: [{ title: "Payment Requests — Supplier Portal — Canta" }] }),
  component: RequestsPanel,
});

// Indicative rates (NGN per 1 unit). Suppliers see values in both NGN and RMB.
const RATES = { RMB: 204.35, USD: 1580.0 } as const;
const RMB_PER_USD = 7.2;

function RequestsPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-3">
      <ButtonGroup label="Payment request actions">
        <Button size="sm" onClick={() => setOpen(true)}><Receipt className="h-4 w-4 mr-2" /> Create Payment Request</Button>
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

      <NewRequestDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [buyer, setBuyer] = useState(BUYERS[0].company);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [currency, setCurrency] = useState<"RMB" | "USD">("RMB");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [goods, setGoods] = useState("");

  const rate = RATES[currency];
  const amt = Number(amount) || 0;
  const { ngn, rmb } = useMemo(() => {
    const ngnVal = Math.round(amt * rate);
    const rmbVal = currency === "RMB" ? amt : Math.round(amt * RMB_PER_USD);
    return { ngn: ngnVal, rmb: rmbVal };
  }, [amt, rate, currency]);

  const submit = () => {
    if (!invoiceNumber || amt <= 0) {
      toast.error("Enter an invoice number and amount");
      return;
    }
    toast.success(`Payment request created for ${buyer} — ¥${rmb.toLocaleString()} RMB / ₦${ngn.toLocaleString()} NGN`);
    onOpenChange(false);
    setInvoiceNumber(""); setAmount(""); setDueDate(""); setGoods("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New payment request</DialogTitle>
          <DialogDescription>
            Buyer pays in NGN. You receive settlement in RMB or USD. Values shown are indicative — final FX is locked when the buyer views the quote.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nigerian buyer</Label>
            <Select value={buyer} onValueChange={setBuyer}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BUYERS.map((b) => <SelectItem key={b.company} value={b.company}>{b.company}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Invoice number</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-2026-091" />
            </div>
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-[110px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as "RMB" | "USD")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RMB">RMB (¥)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Invoice amount</Label>
              <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Goods description</Label>
            <Input value={goods} onChange={(e) => setGoods(e.target.value)} placeholder="e.g. LED panels x 100" />
          </div>

          <Card className="p-3 bg-secondary/30">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
              <span>Indicative conversion</span>
              <span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" /> 1 {currency} ≈ ₦{rate.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">Invoice</div>
                <div className="font-semibold tabular-nums">{currency === "RMB" ? "¥" : "$"}{amt.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">Buyer pays (NGN)</div>
                <div className="font-semibold tabular-nums">₦{ngn.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">You receive (RMB)</div>
                <div className="font-semibold tabular-nums">¥{rmb.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground italic mt-2">
              Final NGN/RMB values depend on FX quote lock, compliance review, and payout rails.
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
