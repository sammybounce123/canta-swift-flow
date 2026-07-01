import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Ship, Wallet, Bell, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: Upload,   t: "Upload",     d: "Send invoice, BL, container number or supplier details." },
  { icon: FileText, t: "Trade File", d: "Canta organizes everything into one Trade File — your source of truth for the transaction." },
  { icon: Ship,     t: "Track",      d: "Supplier, shipment, documents, landed cost and payments — in one place." },
  { icon: Wallet,   t: "Act",        d: "Request quotes, verify supplier, request clearing bids, track shipment updates, and manage payments." },
  { icon: Bell,     t: "Stay ahead", d: "Reminders before goods arrive and clearing starts." },
];

export function TradeFileExplainer() {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">What is a Trade File?</div>
          <h3 className="text-lg font-semibold mt-1">One file per import transaction. Every supplier, shipment, document and payment tied together.</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Think of a Trade File as the folder for a single import: it holds the invoice, BL, shipment tracking, clearing bids,
            supplier payments and landed cost — so you and your team always know exactly what's happening with each order.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" asChild>
            <Link to="/trade-desk" search={{ new: "1" } as never}><Upload className="h-3.5 w-3.5" /> Upload Invoice or BL</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/trade-desk" search={{ new: "1" } as never}>Create Trade File <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-5 w-5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">{i + 1}</span>
              <s.icon className="h-3.5 w-3.5" />
              <span className="font-semibold text-foreground">{s.t}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

