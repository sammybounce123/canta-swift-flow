import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { integrations } from "@/lib/mock";
import { Plug, Key, Webhook, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Canta" }] }),
  component: Integrations,
});

function Integrations() {
  const [q, setQ] = useState("");
  const cats = useMemo(() => Array.from(new Set(integrations.map((i) => i.category))), []);
  const filtered = useMemo(() => integrations.filter((i) => `${i.name} ${i.category}`.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Integrations Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect tracking, payments, messaging, compliance, cards and accounting.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Key className="h-4 w-4 mr-1.5" /> API Keys</Button>
          <Button variant="outline"><Webhook className="h-4 w-4 mr-1.5" /> Webhooks</Button>
        </div>
      </div>

      <Card className="p-3 shadow-card flex items-center gap-3">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent outline-none text-sm" placeholder="Search integrations…" />
      </Card>

      {cats.map((cat) => {
        const items = filtered.filter((i) => i.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat}>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{cat}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((i) => (
                <Card key={i.name} className="p-5 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center"><Plug className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="font-semibold">{i.name}</div>
                        <div className="text-[11px] text-muted-foreground">{i.category}</div>
                      </div>
                    </div>
                    {i.connected ? (
                      <Badge className="bg-success/15 text-success border-success/30 text-[10px]">Connected</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Available</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{i.desc}</p>
                  <Button size="sm" variant={i.connected ? "outline" : "default"} className={`w-full mt-4 ${i.connected ? "" : "bg-primary"}`} onClick={() => toast.success(i.connected ? `${i.name} configured` : `${i.name} connected`)}>
                    {i.connected ? "Configure" : "Connect"}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
