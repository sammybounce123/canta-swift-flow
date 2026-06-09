import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cards, fmtMoney } from "@/lib/mock";
import { CreditCard, Plus, Snowflake, Plane, Briefcase, Ship, GraduationCap, Megaphone, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cards")({
  head: () => ({ meta: [{ title: "Global Spend Cards — Canta" }] }),
  component: Cards,
});

const purposes = [
  { i: Briefcase, l: "Business Expenses" },
  { i: Plane, l: "Travel" },
  { i: Ship, l: "Import / Trade" },
  { i: GraduationCap, l: "Student Abroad" },
  { i: Megaphone, l: "Ad Spend" },
  { i: Users, l: "Team Spending" },
];

function Cards() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Global Spend Cards</h1>
          <p className="text-sm text-muted-foreground mt-1">Purpose-built cards for business, travel, importers, students and ads.</p>
        </div>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Create Card</Button>
      </div>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">What do you need this card for?</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {purposes.map((p) => (
            <button key={p.l} onClick={() => toast.success(`${p.l} card`)} className="text-left p-4 rounded-xl border border-border hover:border-accent hover:shadow-card transition">
              <div className="h-9 w-9 rounded-lg bg-accent/15 grid place-items-center"><p.i className="h-4 w-4 text-accent" /></div>
              <div className="text-sm font-semibold mt-2">{p.l}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Active cards", v: cards.filter((c) => c.status === "Active").length },
          { l: "Total spend (mo)", v: fmtMoney(cards.reduce((a, c) => a + c.monthlySpend, 0), "USD") },
          { l: "Pending approvals", v: 4 },
          { l: "Receipts missing", v: 7 },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="text-xl font-semibold mt-2">{k.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.id} className="p-5 shadow-card bg-gradient-card text-primary-foreground border-none relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20 blur-2xl" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-primary-foreground/70">{c.type}</div>
                  <div className="text-base font-semibold mt-0.5">{c.label}</div>
                </div>
                <CreditCard className="h-5 w-5 text-primary-foreground/70" />
              </div>
              <div className="mt-6 font-mono tracking-widest text-sm">•••• •••• •••• {c.last4}</div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Monthly spend</div>
                  <div className="text-lg font-semibold tabular-nums">{fmtMoney(c.monthlySpend, "USD")} / {fmtMoney(c.limit, "USD")}</div>
                </div>
                <Badge className={`text-[10px] ${c.status === "Frozen" ? "bg-destructive/30 text-primary-foreground" : "bg-white/15 text-primary-foreground border-white/20"}`}>{c.status}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" className="bg-white/10 text-primary-foreground border-white/15 hover:bg-white/15" onClick={() => toast.success("Funded card")}>Fund</Button>
                <Button size="sm" variant="secondary" className="bg-white/10 text-primary-foreground border-white/15 hover:bg-white/15" onClick={() => toast.success(c.status === "Frozen" ? "Unfrozen" : "Frozen")}><Snowflake className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="secondary" className="bg-white/10 text-primary-foreground border-white/15 hover:bg-white/15">Statement</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
