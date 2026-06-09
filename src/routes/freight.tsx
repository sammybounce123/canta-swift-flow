import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shipments, importers, freightForwarders, fmtMoney } from "@/lib/mock";
import { Truck, Plus, MessageCircle, FileText, DollarSign, Users as UsersIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/freight")({
  head: () => ({ meta: [{ title: "Freight Workspace — Canta" }] }),
  component: Freight,
});

const stages = ["Booked", "At Origin", "Loaded", "On Vessel", "Arrived", "Customs", "Released", "Delivered"];

function Freight() {
  const kpis = [
    { l: "Active Shipments", v: shipments.filter((s) => !["Delivered", "Released"].includes(s.status)).length, icon: Truck },
    { l: "Arriving This Week", v: 3, icon: AlertTriangle },
    { l: "Delayed", v: shipments.filter((s) => s.status === "Delayed").length, icon: AlertTriangle },
    { l: "Customers", v: importers.length, icon: UsersIcon },
    { l: "Pending Documents", v: 7, icon: FileText },
    { l: "Outstanding Invoices", v: "$18,400", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Freight Forwarder Workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Operational HQ for shipment ops, customers & invoices.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("WhatsApp update queued")}><MessageCircle className="h-4 w-4 mr-1.5" /> Send Update</Button>
          <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Create Shipment</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold tabular-nums mt-2">{k.v}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-4">Shipment pipeline</div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {stages.map((stage) => {
            const items = shipments.filter((s) => s.status === stage || (stage === "At Origin" && s.status === "At Origin"));
            return (
              <div key={stage} className="bg-secondary/40 rounded-xl p-2 min-h-[180px]">
                <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  <span>{stage}</span><span className="font-bold text-foreground">{items.length}</span>
                </div>
                <div className="space-y-2 mt-1">
                  {items.map((s) => (
                    <div key={s.id} className="p-2 bg-card rounded-lg border border-border text-[11px]">
                      <div className="font-semibold truncate">{s.id}</div>
                      <div className="text-muted-foreground truncate">{s.importer}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Customers</div>
            <Button size="sm" variant="ghost">View all</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-3 py-2">Customer</th><th className="px-3 py-2">Shipments</th><th className="px-3 py-2">Outstanding</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {importers.map((c) => (
                  <tr key={c.name} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="px-3 py-2">{c.shipments}</td>
                    <td className="px-3 py-2 tabular-nums">{c.outstanding ? fmtMoney(c.outstanding, "USD") : "—"}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{c.status}</Badge></td>
                    <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => toast.success(`WhatsApp ${c.name}`)}><MessageCircle className="h-3.5 w-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="text-sm font-semibold mb-3">Top forwarders</div>
          <div className="space-y-3">
            {freightForwarders.map((f) => (
              <div key={f.name} className="flex items-center justify-between text-sm p-2 rounded-lg bg-secondary/40">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground">{f.routes} routes · {f.activeShipments} active</div>
                </div>
                <div className="text-xs font-semibold text-accent">★ {f.rating}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
