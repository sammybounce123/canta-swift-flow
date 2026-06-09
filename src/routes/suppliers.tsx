import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { suppliers } from "@/lib/mock";
import { Factory, Plus, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — Canta" }] }),
  component: Suppliers,
});

function Suppliers() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">Foreign suppliers selling to African buyers — invoices, escrow & settlement.</p>
        </div>
        <Button className="bg-primary" onClick={() => toast.success("Supplier invoice draft created")}><Plus className="h-4 w-4 mr-1.5" /> New Supplier Invoice</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Active suppliers", v: suppliers.length },
          { l: "Invoices this month", v: 38 },
          { l: "Funds in escrow", v: "$214,800" },
          { l: "Pending settlements", v: 6 },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="text-2xl font-semibold mt-2">{k.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <Card key={s.name} className="p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center"><Factory className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.country} · {s.category}</div>
                </div>
              </div>
              {s.verified && (
                <Badge className="bg-success/15 text-success border-success/30 text-[10px]"><Shield className="h-3 w-3 mr-1" /> Verified</Badge>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px]">
              <Badge variant="outline">Funds Secured</Badge>
              <Badge variant="outline">Escrow Active</Badge>
              <Badge variant="outline">Settlement: USD</Badge>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.invoices} invoices</span>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">View invoices</Button>
              <Button size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast.success("Settlement scheduled")}>Settle</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
