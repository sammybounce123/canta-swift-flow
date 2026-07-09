import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { FileText, Upload, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/supplier-portal/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Supplier Portal — Canta" }] }),
  component: InvoicesPanel,
});

type GeneratedInvoice = { id: string; buyer: string; amount: string; ccy: string; date: string; quote?: string };

function InvoicesPanel() {
  const [invoices, setInvoices] = useState<GeneratedInvoice[]>([]);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("canta.fx.quote");
      if (!raw) return;
      const q = JSON.parse(raw) as { buyer: string; from: string; to: string; rate: number; amount: number; converted: number };
      const inv: GeneratedInvoice = {
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        buyer: q.buyer,
        amount: q.converted.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        ccy: q.to,
        date: new Date().toISOString().slice(0, 10),
        quote: `${q.amount.toLocaleString()} ${q.from} @ ${q.rate.toLocaleString()} ${q.from}/${q.to}`,
      };
      setInvoices((prev) => [inv, ...prev]);
      window.sessionStorage.removeItem("canta.fx.quote");
      toast.success(`Invoice ${inv.id} generated from FX quote`);
    } catch {}
  }, []);

  function generate() {
    const inv: GeneratedInvoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      buyer: "Lagos Trading Co.",
      amount: (Math.round(Math.random() * 50000 + 5000)).toLocaleString(),
      ccy: "USD",
      date: new Date().toISOString().slice(0, 10),
    };
    setInvoices((prev) => [inv, ...prev]);
    toast.success(`Invoice ${inv.id} generated`);
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="text-sm font-semibold">Invoices &amp; shipping documents</div>
      <div className="text-xs text-muted-foreground">Invoices link to each payment request. Generate a new invoice or upload proforma, commercial and packing list documents for each buyer payment.</div>
      <ButtonGroup label="Invoice actions">
        <Button size="sm" onClick={generate}><FileText className="h-4 w-4 mr-2" /> Generate invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Proforma invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload proforma invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Commercial invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload commercial invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Packing list uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload packing list</Button>
      </ButtonGroup>

      {invoices.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-3">Invoice</th>
                <th className="py-2 px-3">Buyer</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">FX Quote</th>
                <th className="py-2 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="py-2 px-3 text-xs font-mono">{i.id}</td>
                  <td className="py-2 px-3 text-xs">{i.buyer}</td>
                  <td className="py-2 px-3 text-xs">{i.date}</td>
                  <td className="py-2 px-3 text-xs">{i.quote ? (<span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3 text-accent" />{i.quote}</span>) : <span className="text-muted-foreground">—</span>}</td>
                  <td className="py-2 px-3 text-xs text-right tabular-nums">{i.amount} {i.ccy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
