import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Ship, Wallet, Bell, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: Upload,   t: "Upload",   d: "Send invoice, BL, container number or supplier details." },
  { icon: FileText, t: "Trade File", d: "Canta organizes everything into one Trade File." },
  { icon: Ship,     t: "Track",    d: "Supplier, shipment, documents, landed cost and payments — in one place." },
  { icon: Wallet,   t: "Act",      d: "Request quote, verify supplier, start escrow, freight update or card." },
  { icon: Bell,     t: "Stay ahead", d: "Reminders before goods arrive and clearing starts." },
];

export function TradeFileExplainer() {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">How Trade File works</div>
          <h3 className="text-lg font-semibold mt-1">One file. One transaction. Every supplier, shipment, document and payment in one place.</h3>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild><Link to="/trade-desk"><Upload className="h-3.5 w-3.5" /> Upload Invoice or BL</Link></Button>
          <Button size="sm" asChild><Link to="/trade-desk">Create Trade File <ArrowRight className="h-3.5 w-3.5" /></Link></Button>
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
