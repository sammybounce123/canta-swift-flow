import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ArrowLeft, Clock } from "lucide-react";
import {
  useFreightStore, freightStore, SHIPMENT_STATUSES, FREIGHT_STAFF,
  fmtFreight, daysUntil, type ShipmentStatus,
} from "@/lib/freight-store";

export const Route = createFileRoute("/freight-pipeline")({
  head: () => ({ meta: [{ title: "Shipment Pipeline — Canta Freight" }] }),
  component: FreightPipeline,
});

const STATUS_TONE: Record<ShipmentStatus, string> = {
  New: "bg-secondary text-secondary-foreground border-border",
  "In Transit": "bg-primary/15 text-primary border-primary/30",
  Arriving: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  Delivered: "bg-success/15 text-success border-success/30",
  Exception: "bg-destructive/15 text-destructive border-destructive/30",
};

function FreightPipeline() {
  const state = useFreightStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<ShipmentStatus | "">("");
  const [bulkStaff, setBulkStaff] = useState<string>("");

  const customerName = (id: string) => state.customers.find((c) => c.id === id)?.company ?? "—";

  const arriving = useMemo(
    () => state.shipments.filter((s) => s.status === "Arriving").sort((a, b) => daysUntil(a.eta) - daysUntil(b.eta)),
    [state.shipments],
  );

  const toggleOne = (id: string) => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((cur) => (cur.size === state.shipments.length ? new Set() : new Set(state.shipments.map((s) => s.id))));
  };

  const applyBulkStatus = () => {
    if (!bulkStatus || selected.size === 0) return;
    freightStore.bulkUpdateShipments([...selected], { status: bulkStatus });
    toast.success(`${selected.size} shipment(s) set to ${bulkStatus}`);
    setBulkStatus("");
  };

  const applyBulkStaff = () => {
    if (!bulkStaff || selected.size === 0) return;
    freightStore.bulkUpdateShipments([...selected], { staff: bulkStaff });
    toast.success(`${selected.size} shipment(s) assigned to ${bulkStaff}`);
    setBulkStaff("");
  };

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Shipment pipeline demo — status and staff assignment changes persist locally in this browser." />
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
          <Link to="/freight"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Clearing Agent Portal</Link>
        </Button>
        <h1 className="text-2xl font-semibold">Shipment Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">Track and update shipment status, assign staff, and select rows for bulk actions.</p>
      </div>

      <Card className="p-4 shadow-card border border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-amber-600" />
          <div className="text-sm font-semibold">Arriving shipments</div>
          <Badge variant="outline" className="text-[10px]">{arriving.length}</Badge>
        </div>
        {arriving.length === 0 ? (
          <div className="text-xs text-muted-foreground">No shipments currently marked as Arriving.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {arriving.map((s) => {
              const d = daysUntil(s.eta);
              return (
                <div key={s.id} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
                  <div className="font-semibold">{s.shipmentNumber} · {customerName(s.customerId)}</div>
                  <div className="text-muted-foreground">{s.route}</div>
                  <div className="flex items-center justify-between">
                    <span>ETA {s.eta}</span>
                    <Badge variant="outline" className="text-[10px]">{d >= 0 ? `${d} day${d === 1 ? "" : "s"} to arrival` : "Overdue"}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {selected.size > 0 && (
        <Card className="p-3 shadow-card border border-primary/30 bg-primary/5 flex items-center flex-wrap gap-3">
          <div className="text-sm font-medium">{selected.size} selected</div>
          <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as ShipmentStatus)}>
            <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Set status…" /></SelectTrigger>
            <SelectContent>{SHIPMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={applyBulkStatus} disabled={!bulkStatus}>Apply status</Button>
          <Select value={bulkStaff} onValueChange={setBulkStaff}>
            <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Assign staff…" /></SelectTrigger>
            <SelectContent>{FREIGHT_STAFF.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={applyBulkStaff} disabled={!bulkStaff}>Apply staff</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear selection</Button>
        </Card>
      )}

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3 w-10"><Checkbox checked={selected.size === state.shipments.length && state.shipments.length > 0} onCheckedChange={toggleAll} /></th>
                <th className="px-4 py-3">Shipment</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">ETA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assigned staff</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {state.shipments.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3"><Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleOne(s.id)} /></td>
                  <td className="px-4 py-3 font-mono text-xs">{s.shipmentNumber}<div className="text-muted-foreground font-sans">{s.goods}</div></td>
                  <td className="px-4 py-3">{customerName(s.customerId)}</td>
                  <td className="px-4 py-3 text-xs">{s.route}</td>
                  <td className="px-4 py-3 text-xs tabular-nums">{s.eta}</td>
                  <td className="px-4 py-3">
                    <Select value={s.status} onValueChange={(v) => { freightStore.updateShipment(s.id, { status: v as ShipmentStatus }); toast.success(`${s.shipmentNumber} moved to ${v}`); }}>
                      <SelectTrigger className={`h-7 w-[140px] text-[10px] border ${STATUS_TONE[s.status]}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{SHIPMENT_STATUSES.map((st) => <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={s.staff} onValueChange={(v) => { freightStore.updateShipment(s.id, { staff: v }); toast.success(`${s.shipmentNumber} assigned to ${v}`); }}>
                      <SelectTrigger className="h-7 w-[150px] text-[10px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{FREIGHT_STAFF.map((st) => <SelectItem key={st} value={st} className="text-xs">{st}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{fmtFreight(s.valueUsd, "USD")}</td>
                </tr>
              ))}
              {state.shipments.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No shipments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
