import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
    { id: "4", label: "Clearing / handling fee", amount: 180 },
    { id: "5", label: "Inland transport", amount: 90 },
  ]);
  const totals = useMemo(() => {
    const total = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
    const perUnit = units > 0 ? total / units : 0;
    const revenue = units * salePrice;
    const profit = revenue - total;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { total, perUnit, revenue, profit, margin };
  }, [lines, units, salePrice]);

  function update(id: string, patch: Partial<CostLine>) {
    setLines((cur) => cur.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  function add() {
    setLines((cur) => [...cur, { id: String(Date.now()), label: "New cost item", amount: 0 }]);
  }
  function remove(id: string) { setLines((cur) => cur.filter((l) => l.id !== id)); }

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Landed cost is an estimate based on the values you enter." />
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <Calculator className="h-5 w-5 shrink-0 text-accent" /> <span className="truncate">Landed Cost</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Know your true cost per unit before goods arrive — and see your projected profit.
          </p>
        </div>
        <Button className="shrink-0" onClick={() => toast.success("Estimate saved")}>Save estimate</Button>
      </header>




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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 p-4 shadow-card">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold">Cost breakdown</div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" /> Add cost</Button>
          </div>
          <div className="space-y-2">
            {lines.map((l) => (
              <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
                <Input className="col-span-2 min-w-0 sm:col-span-1" value={l.label} onChange={(e) => update(l.id, { label: e.target.value })} />
                <Input className="min-w-0" type="number" value={l.amount} onChange={(e) => update(l.id, { amount: Number(e.target.value) || 0 })} />
                <Button size="icon" variant="ghost" className="shrink-0" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
    <div className="flex items-center justify-between gap-2">
      <span className="min-w-0 truncate text-xs text-muted-foreground">{label}</span>
      <span className={`shrink-0 text-sm font-semibold tabular-nums ${tone ?? ""}`}>{value}</span>
    </div>
  );
}

