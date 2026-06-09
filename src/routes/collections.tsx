import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { collections, fmtMoney } from "@/lib/mock";
import { Globe, Plus, Link as LinkIcon, GraduationCap, Home, Stethoscope, Plane, ShoppingBag, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/collections")({
  head: () => ({ meta: [{ title: "Global Collections — Canta" }] }),
  component: Collections,
});

const templates = [
  { i: GraduationCap, l: "Tuition Collection", d: "Universities & schools" },
  { i: Home, l: "Property Payment", d: "Rent, deposits, mortgage" },
  { i: Stethoscope, l: "Medical Payment", d: "Hospitals & clinics" },
  { i: Receipt, l: "Supplier Invoice", d: "B2B settlements" },
  { i: Plane, l: "Travel Payment", d: "Airlines & agencies" },
  { i: ShoppingBag, l: "E-commerce Order", d: "Online merchants" },
];

function Collections() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Global Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">Collect locally from African customers. Settle globally.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Payment link copied")}><LinkIcon className="h-4 w-4 mr-1.5" /> New Payment Link</Button>
          <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> New Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Total Collections", v: "$842,150" },
          { l: "Pending Settlement", v: "$48,920" },
          { l: "Settled (30d)", v: "$612,300" },
          { l: "Active Links", v: 12 },
          { l: "Failed", v: 3 },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="text-xl font-semibold mt-2 tabular-nums">{k.v}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4" /> Start with a template</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {templates.map((t) => (
            <button key={t.l} onClick={() => toast.success(`${t.l} template`)} className="text-left p-4 rounded-xl border border-border hover:border-accent hover:shadow-card transition">
              <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center"><t.i className="h-4 w-4 text-primary" /></div>
              <div className="text-sm font-semibold mt-2">{t.l}</div>
              <div className="text-[11px] text-muted-foreground">{t.d}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="p-4 border-b border-border text-sm font-semibold">Recent collections</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Payer</th><th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3">{c.payer}</td>
                  <td className="px-4 py-3">{c.purpose}</td>
                  <td className="px-4 py-3">{c.date}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(c.amount, c.ccy)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[10px] ${c.status === "Settled" ? "bg-success/15 text-success border-success/30" : c.status === "Failed" ? "bg-destructive/15 text-destructive border-destructive/30" : ""}`}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
