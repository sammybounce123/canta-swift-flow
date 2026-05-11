import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Send, Search } from "lucide-react";
import { beneficiaries } from "@/lib/mock";

export const Route = createFileRoute("/beneficiaries")({
  head: () => ({ meta: [{ title: "Beneficiaries — Canta" }] }),
  component: Beneficiaries,
});

function Beneficiaries() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Beneficiaries</h1>
          <p className="text-sm text-muted-foreground mt-1">Saved recipients for fast, validated payments.</p>
        </div>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Add Beneficiary</Button>
      </div>

      <Card className="p-4 shadow-card flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Search beneficiaries by name or bank…" />
      </Card>

      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Recently used</div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {beneficiaries.map((b) => (
            <Card key={b.name} className="p-5 shadow-card hover:shadow-elevated transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center font-semibold">
                    {b.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.country} · {b.bank}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{b.ccy}</span>
              </div>
              <div className="mt-4 text-xs text-muted-foreground font-mono">{b.account}</div>
              <Button size="sm" className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Send Payment
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
