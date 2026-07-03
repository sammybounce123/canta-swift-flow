import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Upload, Bell, Clock, Download, FileText, RotateCcw, RefreshCw, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { REQUESTS, BUYERS, STATUS_TONE, SettlementTimeline, fxQuoteStore, COMPLIANCE_DISCLAIMER, type SupplierRequest } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/payment-requests")({
  head: () => ({ meta: [{ title: "Payment Requests — Supplier Portal — Canta" }] }),
  component: RequestsPanel,
});

// Indicative NGN per 1 RMB. Buyers always pay NGN; suppliers always receive RMB.
const NGN_PER_RMB = 204.35;
const RMB_PER_USD = 7.2; // indicative reference rate for USD equivalent display
const FEE_BPS = 90; // ~0.9% platform fee for indicative preview

function buildIndicativeQuote(amountRmb: number) {
  // Deterministic pseudo-jitter so SSR and client agree (avoids hydration mismatch)
  // and the number is stable per amount within a session.
  const seed = Math.abs(Math.sin(amountRmb * 0.017 + 1.3));
  const jitter = (seed - 0.5) * 0.4;
  const rate = +(NGN_PER_RMB + jitter).toFixed(2);
  const ngnGross = Math.round(amountRmb * rate);
  const feeNgn = Math.round((ngnGross * FEE_BPS) / 10000);
  const ngnBuyerPays = ngnGross + feeNgn;
  const usdEquiv = +(amountRmb / RMB_PER_USD).toFixed(2);
  return { rate, ngnGross, feeNgn, ngnBuyerPays, usdEquiv, expiresInMin: 15 };
}

function RequestsPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const sendToBuyerWithQuote = (r: SupplierRequest) => {
    const q = buildIndicativeQuote(r.amountRmb);
    toast.success(
      `Quote sent to ${r.buyer} · Buyer pays ₦${q.ngnBuyerPays.toLocaleString()} · You receive ¥${r.amountRmb.toLocaleString()} · Rate ${q.rate} · Locks 15m`,
    );
    void navigate({ to: "/supplier-portal/ngn-details" });
  };

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
        Buyers always pay in <strong>NGN</strong>; suppliers always receive settlement in <strong>RMB</strong>. Every payment request and every send-to-buyer action carries the current FX quote (rate, NGN buyer pays, RMB you receive, fee, expiry). Refunds return only to the same Nigerian buyer bank account that originally sent the NGN payment.
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Invoice #</th>
                <th className="text-left py-2 px-3">Buyer</th>
                <th className="text-right py-2 px-3">RMB (you receive)</th>
                <th className="text-right py-2 px-3">NGN (buyer pays)</th>
                <th className="text-right py-2 px-3">Rate</th>
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
                    <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums">₦{r.amountNgn.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{r.rate.toFixed(2)}</td>
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
                        <Button size="sm" variant="outline" onClick={() => sendToBuyerWithQuote(r)}>
                          <Send className="h-3.5 w-3.5 mr-1" /> Send quote to buyer
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast.success(`Timeline for ${r.invoiceNumber}`)}><Clock className="h-3.5 w-3.5 mr-1" /> Timeline</Button>
                        <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent with current FX quote")}><Bell className="h-3.5 w-3.5 mr-1" /> Remind</Button>
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

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>

      <NewRequestDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewRequestDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [buyer, setBuyer] = useState(BUYERS[0].company);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amountRmb, setAmountRmb] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [goods, setGoods] = useState("");

  const amt = Number(amountRmb) || 0;
  const quote = useMemo(() => buildIndicativeQuote(amt), [amt]);

  const submit = () => {
    if (!invoiceNumber || amt <= 0) {
      toast.error("Enter an invoice number and RMB amount");
      return;
    }
    // Persist a real FX quote so it appears on the FX Quotes page and travels with the send-to-buyer flow.
    const q = fxQuoteStore.generate();
    toast.success(
      `Payment request created for ${buyer} · Buyer pays ₦${quote.ngnBuyerPays.toLocaleString()} · You receive ¥${amt.toLocaleString()} · Rate ${quote.rate} · FX quote ${q.id} generated (locks 15m)`,
    );
    onOpenChange(false);
    setInvoiceNumber(""); setAmountRmb(""); setDueDate(""); setGoods("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New payment request</DialogTitle>
          <DialogDescription>
            Buyer pays in <strong>NGN</strong>. You receive settlement in <strong>RMB</strong>. The FX quote below travels with the request and is shown to the buyer at every step.
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

          <div className="space-y-1.5">
            <Label>Amount to receive (RMB)</Label>
            <Input type="number" min="0" value={amountRmb} onChange={(e) => setAmountRmb(e.target.value)} placeholder="0.00" />
            <div className="text-[11px] text-muted-foreground">Settlement currency is fixed to RMB. Buyer will pay the equivalent in NGN.</div>
          </div>

          <div className="space-y-1.5">
            <Label>Goods description</Label>
            <Input value={goods} onChange={(e) => setGoods(e.target.value)} placeholder="e.g. LED panels x 100" />
          </div>

          <Card className="p-3 bg-secondary/30 space-y-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> FX quote (indicative)</span>
              <span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" /> 1 RMB ≈ ₦{quote.rate.toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">You receive (RMB)</div>
                <div className="font-semibold tabular-nums">¥{amt.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">Buyer pays (NGN)</div>
                <div className="font-semibold tabular-nums">₦{quote.ngnBuyerPays.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">NGN value</div>
                <div className="tabular-nums">₦{quote.ngnGross.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase">Canta fee</div>
                <div className="tabular-nums">₦{quote.feeNgn.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground italic">
              Quote locks for {quote.expiresInMin} minutes on send. Final NGN/RMB depend on FX lock, compliance review, and payout rails.
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}><Send className="h-4 w-4 mr-2" /> Create request &amp; generate FX quote</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
