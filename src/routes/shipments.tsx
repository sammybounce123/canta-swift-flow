import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shipments, fmtMoney } from "@/lib/mock";
import { Plus, Search, Filter, Ship, Anchor, Truck, MapPin } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/shipments")({
  head: () => ({ meta: [{ title: "Shipments — Canta" }] }),
  component: Shipments,
});

const statusGroups: { label: string; statuses: string[]; tone: string }[] = [
  { label: "Active", statuses: ["Booked", "At Origin", "Loaded"], tone: "bg-primary/10 text-primary border-primary/20" },
  { label: "On Vessel", statuses: ["On Vessel"], tone: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  { label: "Arrived", statuses: ["Arrived", "Customs"], tone: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  { label: "Delivered", statuses: ["Released", "Delivered"], tone: "bg-success/10 text-success border-success/20" },
  { label: "Delayed", statuses: ["Delayed"], tone: "bg-destructive/10 text-destructive border-destructive/20" },
];

function Shipments() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const filtered = useMemo(() => shipments.filter((s) => {
    const okQ = `${s.id} ${s.name} ${s.importer} ${s.supplier} ${s.container} ${s.bl} ${s.category}`.toLowerCase().includes(q.toLowerCase());
    const okS = !active || statusGroups.find((g) => g.label === active)?.statuses.includes(s.status);
    return okQ && okS;
  }), [q, active]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Shipments</h1>
          <p className="text-sm text-muted-foreground mt-1">All shipments across containers, RORO, air freight & courier.</p>
        </div>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> New Shipment</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statusGroups.map((g) => {
          const count = shipments.filter((s) => g.statuses.includes(s.status)).length;
          return (
            <button key={g.label} onClick={() => setActive(active === g.label ? null : g.label)} className={`p-4 rounded-xl border text-left transition ${active === g.label ? "ring-2 ring-primary " + g.tone : g.tone + " hover:opacity-80"}`}>
              <div className="text-[10px] uppercase tracking-widest">{g.label}</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{count}</div>
            </button>
          );
        })}
      </div>

      <Card className="p-3 shadow-card flex items-center gap-3 flex-wrap">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 min-w-[200px] bg-transparent outline-none text-sm" placeholder="Container, BL, VIN, supplier, importer, category…" />
        <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1" /> Filters</Button>
        <Button variant="outline" size="sm"><MapPin className="h-3.5 w-3.5 mr-1" /> Map view</Button>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Importer · Supplier</th>
                <th className="px-4 py-3">Forwarder</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="font-medium flex items-center gap-2">
                      {s.type === "RORO" ? <Truck className="h-3.5 w-3.5 text-muted-foreground" /> : s.type === "Air Freight" ? <Anchor className="h-3.5 w-3.5 text-muted-foreground" /> : <Ship className="h-3.5 w-3.5 text-muted-foreground" />}
                      {s.id}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[260px]">{s.name}</div>
                    {s.container && <div className="text-[10px] font-mono text-muted-foreground">{s.container} · {s.bl}</div>}
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{s.type}</Badge></td>
                  <td className="px-4 py-3"><div>{s.origin}</div><div className="text-xs text-muted-foreground">→ {s.destination}</div></td>
                  <td className="px-4 py-3"><div>{s.importer}</div><div className="text-xs text-muted-foreground">{s.supplier}</div></td>
                  <td className="px-4 py-3">{s.forwarder}</td>
                  <td className="px-4 py-3 tabular-nums">{s.eta}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(s.value, s.ccy)}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    "On Vessel": "bg-blue-500/15 text-blue-700 border-blue-500/30",
    "Arrived": "bg-amber-500/15 text-amber-700 border-amber-500/30",
    "Customs": "bg-amber-500/15 text-amber-700 border-amber-500/30",
    "Delivered": "bg-success/15 text-success border-success/30",
    "Released": "bg-success/15 text-success border-success/30",
    "Delayed": "bg-destructive/15 text-destructive border-destructive/30",
    "Loaded": "bg-primary/10 text-primary border-primary/20",
    "At Origin": "bg-secondary text-secondary-foreground border-border",
    "Booked": "bg-secondary text-secondary-foreground border-border",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tones[status]}`}>{status}</span>;
}
