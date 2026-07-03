import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Receipt, Lock, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useFxQuotes, useActiveQuote, fxQuoteStore, formatCountdown,
  COMPLIANCE_DISCLAIMER, type FxQuoteStatus,
} from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/fx-quotes")({
  head: () => ({ meta: [{ title: "FX Quotes — Supplier Portal — Canta" }] }),
  component: FxQuotesPanel,
});

function FxQuotesPanel() {
  const quotes = useFxQuotes();
  const activeQuote = useActiveQuote();
  const navigate = useNavigate();
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);

  const handleGenerate = () => {
    const q = fxQuoteStore.generate();
    toast.success(`FX quote ${q.id} generated · Rate ${q.rate} · Expires in 15m`);
  };
  const handleLock = () => {
    if (!activeQuote) return toast.error("No quote to lock");
    if (activeQuote.status === "Rate Locked") return toast.info(`${activeQuote.id} already locked`);
    fxQuoteStore.lock(activeQuote.id);
    toast.success(`${activeQuote.id} locked at ${activeQuote.rate} for 15 minutes`);
  };
  const handleSend = () => {
    if (!activeQuote) return toast.error("No quote to send");
    fxQuoteStore.send(activeQuote.id);
    toast.success(`${activeQuote.id} sent to ${activeQuote.buyer}`);
    void navigate({ to: "/supplier-portal/ngn-details" });
  };
  const handleRefresh = () => {
    if (!activeQuote) return toast.error("No quote to refresh");
    if (activeQuote.status === "Rate Locked") return toast.error("Locked quote cannot be refreshed — generate a new quote");
    fxQuoteStore.refresh(activeQuote.id);
    toast.success(`${activeQuote.id} refreshed`);
  };

  return (
    <div className="space-y-3">
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold">FX Quotes · 汇率报价</div>
            <div className="text-xs text-muted-foreground">
              {activeQuote
                ? <>Active: <span className="font-mono">{activeQuote.id}</span> · {activeQuote.buyer} · Rate {activeQuote.rate} · {activeQuote.status}</>
                : "Generate a quote to see the RMB you'll receive and the NGN your buyer needs to pay. Lock the rate for 15 minutes before sending to the buyer — if the buyer pays within the lock window, that rate applies."}
            </div>
          </div>

          <ButtonGroup label="FX quote actions">
            <Button size="sm" onClick={handleGenerate}><Receipt className="h-4 w-4 mr-2" /> Generate FX Quote</Button>
            <Button size="sm" variant="outline" onClick={handleLock} disabled={!activeQuote || activeQuote.status === "Rate Locked"}>
              <Lock className="h-4 w-4 mr-2" /> Lock Quote
            </Button>
            <Button size="sm" variant="outline" onClick={handleSend} disabled={!activeQuote}>
              <ArrowRight className="h-4 w-4 mr-2" /> Send Quote to Buyer
            </Button>
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={!activeQuote || activeQuote.status === "Rate Locked"}>
              <Clock className="h-4 w-4 mr-2" /> Refresh Quote
            </Button>
          </ButtonGroup>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Quote #</th>
                <th className="text-left py-2 px-3">Invoice</th>
                <th className="text-right py-2 px-3">Invoice amt</th>
                <th className="text-left py-2 px-3">Buyer pays (NGN)</th>
                <th className="text-right py-2 px-3">Est. receivable</th>
                <th className="text-right py-2 px-3">Rate</th>
                <th className="text-right py-2 px-3">Canta fee</th>
                <th className="text-left py-2 px-3">Settlement</th>
                <th className="text-left py-2 px-3">Payout acct</th>
                <th className="text-left py-2 px-3">Expires</th>
                <th className="text-left py-2 px-3">Status</th>
                <th className="text-right py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const isActive = activeQuote?.id === q.id;
                const expired = q.status !== "Rate Locked" && Date.now() > q.expiresAt;
                const shownStatus: FxQuoteStatus = expired && (q.status === "Quote Generated" || q.status === "Sent to Buyer") ? "Expired" : q.status;
                return (
                  <tr key={q.id} className={`border-t cursor-pointer ${isActive ? "bg-primary/5" : "hover:bg-muted/40"}`}
                    onClick={() => fxQuoteStore.select(q.id)}>
                    <td className="py-2 px-3 font-mono text-xs">{q.id}</td>
                    <td className="py-2 px-3 font-mono text-xs">{q.invoiceNumber}</td>
                    <td className="py-2 px-3 text-right tabular-nums">¥{q.invoiceAmount.toLocaleString()} <span className="text-[10px] text-muted-foreground">{q.invoiceCurrency}</span></td>
                    <td className="py-2 px-3 tabular-nums">₦{q.ngnTotal.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {q.settlementCurrency === "RMB" ? `¥${q.estReceivable.toLocaleString()}` : `$${q.estReceivable.toLocaleString()}`}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">{q.rate.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-xs">₦{q.fee.toLocaleString()}</td>
                    <td className="py-2 px-3 text-xs">{q.settlementCurrency}</td>
                    <td className="py-2 px-3 text-xs">{q.payoutAccount}</td>
                    <td className="py-2 px-3 text-xs tabular-nums">
                      {q.status === "Rate Locked" && <Lock className="h-3 w-3 inline mr-1" />}
                      {formatCountdown(q.expiresAt)}
                    </td>
                    <td className="py-2 px-3">
                      <Badge className={
                        shownStatus === "Expired" ? "bg-destructive/10 text-destructive" :
                        shownStatus === "Rate Locked" ? "bg-emerald-100 text-emerald-800" :
                        shownStatus === "Sent to Buyer" ? "bg-blue-100 text-blue-800" :
                        "bg-primary/10 text-primary"
                      }>{shownStatus}</Badge>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {!isActive && (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); fxQuoteStore.select(q.id); }}>Select</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {quotes.length === 0 && (
                <tr><td colSpan={12} className="py-8 text-center text-muted-foreground text-sm">No FX quotes yet — click Generate FX Quote.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-3 text-xs text-muted-foreground">
        Quote statuses: Draft · Quote Generated · Rate Locked · Sent to Buyer · Expired · Buyer Paid · Processing Settlement · Settled · Cancelled
      </Card>
      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>
    </div>
  );
}
