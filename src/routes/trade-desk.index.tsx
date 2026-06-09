import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { tradeFiles, fmtMoney } from "@/lib/mock";
import { FileText, Plus, Search, ArrowRight, Ship, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/trade-desk/")({
  head: () => ({ meta: [{ title: "Trade Desk — Canta" }] }),
  component: TradeDeskList,
});

const STATUS_FILTERS = ["All", "Drafting", "In Transit", "Arrived", "Cleared", "Delivered"] as const;

function TradeDeskList() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    return tradeFiles.filter((f) => {
      if (status !== "All" && f.status !== status) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [f.name, f.id, f.importer, f.supplier, f.forwarder, f.origin, f.destination, f.goods]
        .some((v) => v.toLowerCase().includes(s));
    });
  }, [q, status]);

  const stats = useMemo(() => ({
    total: tradeFiles.length,
    inTransit: tradeFiles.filter((f) => f.status === "In Transit").length,
    arrived: tradeFiles.filter((f) => f.status === "Arrived" || f.status === "Cleared").length,
    atRisk: tradeFiles.filter((f) => f.risk === "High").length,
    value: tradeFiles.reduce((s, f) => s + f.invoiceValue, 0),
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Trade Desk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every shipment, supplier, payment and document in one operating system.
          </p>
        </div>
        <Button onClick={() => toast.success("New trade file drafted")} className="bg-primary">
          <Plus className="h-4 w-4 mr-1.5" /> New Trade File
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={<FileText className="h-4 w-4" />} label="Active trade files" value={stats.total.toString()} />
        <Kpi icon={<Ship className="h-4 w-4" />} label="In transit" value={stats.inTransit.toString()} tone="accent" />
        <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Arrived / cleared" value={stats.arrived.toString()} tone="success" />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="At risk" value={stats.atRisk.toString()} tone="danger" />
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by importer, supplier, BL, file ID…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      <Card className="shadow-card overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border bg-secondary/30">
          <div className="col-span-4">Trade file</div>
          <div className="col-span-2">Importer · Supplier</div>
          <div className="col-span-2">Route</div>
          <div className="col-span-1">Value</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">ETA</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((f) => (
            <Link
              key={f.id}
              to="/trade-desk/$fileId"
              params={{ fileId: f.id }}
              className="grid grid-cols-12 px-5 py-4 items-center hover:bg-secondary/40 group"
            >
              <div className="col-span-4 min-w-0">
                <div className="text-sm font-semibold flex items-center gap-2 truncate">
                  {f.name}
                  <RiskBadge risk={f.risk} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{f.id} · {f.goods}</div>
              </div>
              <div className="col-span-2 text-xs">
                <div className="font-medium truncate">{f.importer}</div>
                <div className="text-muted-foreground truncate">{f.supplier}</div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground truncate">{f.origin} → {f.destination}</div>
              <div className="col-span-1 text-sm font-semibold tabular-nums">{fmtMoney(f.invoiceValue, f.ccy)}</div>
              <div className="col-span-1">
                <Badge variant="outline" className="text-[10px]">{f.paymentStatus}</Badge>
              </div>
              <div className="col-span-1">
                <Badge className="text-[10px] bg-secondary text-secondary-foreground">{f.status}</Badge>
              </div>
              <div className="col-span-1 text-right text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                {f.eta}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 ml-1 text-primary" />
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              No trade files match your filters.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone?: "success" | "danger" | "accent" }) {
  const toneCls =
    tone === "success" ? "text-success" :
    tone === "danger" ? "text-destructive" :
    tone === "accent" ? "text-accent" : "text-foreground";
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <div className={`text-2xl font-semibold mt-1.5 tabular-nums ${toneCls}`}>{value}</div>
    </Card>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const cls =
    risk === "High" ? "bg-destructive/15 text-destructive border-destructive/30"
    : risk === "Medium" ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
    : "bg-success/15 text-success border-success/30";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border ${cls}`}>{risk}</span>;
}
