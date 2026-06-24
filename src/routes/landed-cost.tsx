import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { fmtMoney } from "@/lib/mock";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { getAcceptedBid } from "@/lib/clearing-store";

export const Route = createFileRoute("/landed-cost")({
  head: () => ({ meta: [{ title: "Landed Cost — Canta" }] }),
  component: LandedCostPage,
});

type CostLine = { id: string; label: string; amount: number };

const FX: Record<string, number> = { USD: 1, EUR: 1.08, GBP: 1.27, NGN: 0.00062, GHS: 0.066, KES: 0.0077, RMB: 0.14 };

function LandedCostPage() {
  const [shipment, setShipment] = useState("");
  const [units, setUnits] = useState(100);
  const [salePrice, setSalePrice] = useState(50);
  const [ccy, setCcy] = useState("USD");
  const [lines, setLines] = useState<CostLine[]>([
    { id: "1", label: "Goods cost (supplier invoice)", amount: 2500 },
    { id: "2", label: "Freight / shipping", amount: 600 },
    { id: "3", label: "Customs duty", amount: 320 },
    { id: "4", label: "Clearing agent fee (agent quote)", amount: 180 },
    { id: "5", label: "Inland transport", amount: 90 },
  ]);
  const [clearingTouched, setClearingTouched] = useState(false);
  const [acceptedBid, setAcceptedBid] = useState(() => getAcceptedBid());

  useEffect(() => { setAcceptedBid(getAcceptedBid()); }, []);

  // When an accepted bid exists and user hasn't manually overridden, sync the clearing line.
  useEffect(() => {
    if (!acceptedBid || clearingTouched) return;
    setLines((cur) => cur.map((l) => l.id === "4" ? { ...l, label: `Clearing agent fee (${acceptedBid.agentName})`, amount: acceptedBid.clearingFee } : l));
  }, [acceptedBid, clearingTouched]);

  const clearingSource = acceptedBid && !clearingTouched
    ? { label: `Selected agent quote — ${acceptedBid.agentName}`, tone: "border-success/40 bg-success/10" }
    : clearingTouched
      ? { label: "Manual estimate", tone: "border-border bg-muted/30" }
      : { label: "Awaiting agent bids", tone: "border-amber-500/30 bg-amber-500/5" };

  const totals = useMemo(() => {
    const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
    const perUnit = units > 0 ? total / units : 0;
    const revenue = units * salePrice;
    const profit = revenue - total;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { total, perUnit, revenue, profit, margin };
  }, [lines, units, salePrice]);

  function update(id: string, patch: Partial<CostLine>) {
    if (id === "4") setClearingTouched(true);
    setLines((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function add() {
    setLines((cur) => [...cur, { id: String(Date.now()), label: "New cost item", amount: 0 }]);
  }
  function remove(id: string) { setLines((cur) => cur.filter((l) => l.id !== id)); }

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Landed cost is an estimate based on the values you enter." />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Calculator className="h-5 w-5 text-accent shrink-0" /> Landed Cost
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Know your true cost per unit before goods arrive — and see your projected profit.
          </p>
        </div>
        <Button onClick={() => toast.success("Estimate saved")}>Save estimate</Button>
      </header>

      <Card className={`p-3 shadow-card text-xs text-muted-foreground ${clearingSource.tone}`}>
        <span className="font-semibold text-foreground">Clearing fee source:</span> {clearingSource.label}. Canta does not quote clearing fees directly — fees, timelines, duty estimates and service delivery are provided by the selected clearing agent.
      </Card>


      <Card className="p-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div><Label>Shipment / Trade file</Label><Input value={shipment} onChange={(e) => setShipment(e.target.value)} placeholder="SH-9012" /></div>
          <div><Label>Currency</Label>
            <Select value={ccy} onValueChange={setCcy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{Object.keys(FX).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Units</Label><Input type="number" value={units} onChange={(e) => setUnits(Number(e.target.value) || 0)} /></div>
          <div><Label>Sale price / unit</Label><Input type="number" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value) || 0)} /></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold">Cost breakdown</div>
            <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" /> Add cost</Button>
          </div>
          <div className="space-y-2">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[1fr_140px_auto] gap-2 items-center">
                <Input value={l.label} onChange={(e) => update(l.id, { label: e.target.value })} />
                <Input type="number" value={l.amount} onChange={(e) => update(l.id, { amount: Number(e.target.value) || 0 })} />
                <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 shadow-card h-fit space-y-3">
          <div className="text-sm font-semibold">Summary</div>
          <Row label="Total landed cost" value={fmtMoney(totals.total, ccy)} />
          <Row label="Cost per unit" value={fmtMoney(totals.perUnit, ccy)} />
          <Row label="Projected revenue" value={fmtMoney(totals.revenue, ccy)} />
          <div className="border-t pt-2">
            <Row label="Projected profit" value={fmtMoney(totals.profit, ccy)} tone={totals.profit >= 0 ? "text-success" : "text-destructive"} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Margin</span>
              <Badge variant="outline" className={totals.margin >= 0 ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>
                {totals.margin.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${tone ?? ""}`}>{value}</span>
    </div>
  );
}
