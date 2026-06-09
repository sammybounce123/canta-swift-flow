import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shipments, fmtMoney } from "@/lib/mock";
import { MessageCircle, Upload, Sparkles, FileQuestion, Ship, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/importer")({
  head: () => ({ meta: [{ title: "Importer Portal — Canta" }] }),
  component: ImporterPortal,
});

function ImporterPortal() {
  const mine = shipments.slice(0, 4);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, Tunde 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's a simple view of your goods, suppliers and payments.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Goods in transit", v: 3 },
          { l: "Goods arriving soon", v: 2 },
          { l: "Documents missing", v: 1 },
          { l: "Outstanding payments", v: "$8,900" },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="text-2xl font-semibold mt-2">{k.v}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 shadow-card border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
        <div className="flex items-center gap-2 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-accent" /> WhatsApp Import Desk</div>
        <p className="text-sm text-muted-foreground mt-2">Send invoices, BLs and receipts directly on WhatsApp. We'll create the trade file for you.</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { i: Upload, l: "Send invoice on WhatsApp" },
            { i: Upload, l: "Upload shipment document" },
            { i: Sparkles, l: "Ask Canta assistant" },
            { i: FileQuestion, l: "Request landed cost" },
          ].map((a) => (
            <Button key={a.l} variant="outline" className="justify-start h-auto py-3" onClick={() => toast.success(a.l)}>
              <a.i className="h-4 w-4 mr-2" /><span className="text-xs text-left">{a.l}</span>
            </Button>
          ))}
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">My shipments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mine.map((s) => {
            const simple =
              s.status === "On Vessel" ? "Your goods are on the vessel."
              : s.status === "Arrived" ? "Your goods have arrived at the port."
              : s.status === "Customs" ? "Your goods are clearing customs."
              : s.status === "Delivered" ? "Your goods have been delivered."
              : s.status === "Delayed" ? "Your shipment is delayed. Our team is on it."
              : "Your goods are being prepared by the supplier.";
            return (
              <Card key={s.id} className="p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{s.id}</div>
                    <div className="font-semibold mt-0.5 truncate">{s.name}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-secondary/40 text-sm">
                  <Ship className="h-3.5 w-3.5 inline mr-1 text-primary" /> {simple}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Supplier:</span> {s.supplier}</div>
                  <div><span className="text-muted-foreground">Forwarder:</span> {s.forwarder}</div>
                  <div><span className="text-muted-foreground">Value:</span> {fmtMoney(s.value, s.ccy)}</div>
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-muted-foreground" /> ETA {s.eta}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">View details</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.success("Asked for landed cost")}>Ask for landed cost</Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
