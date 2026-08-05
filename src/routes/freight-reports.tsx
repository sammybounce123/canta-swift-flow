import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ArrowLeft, BarChart3, Users, Route as RouteIcon, DollarSign } from "lucide-react";
import { useFreightStore, fmtFreight } from "@/lib/freight-store";

export const Route = createFileRoute("/freight-reports")({
  head: () => ({ meta: [{ title: "Reports — Canta Freight" }] }),
  component: FreightReports,
});

function FreightReports() {
  const state = useFreightStore();

  const byCustomer = useMemo(() => state.customers.map((c) => {
    const shipments = state.shipments.filter((s) => s.customerId === c.id);
    const revenue = state.invoices.filter((i) => i.customerId === c.id)
      .reduce((sum, i) => sum + (i.currency === "USD" ? i.amount : i.amount / 1612), 0);
    return { name: c.company, shipments: shipments.length, revenue };
  }).sort((a, b) => b.revenue - a.revenue), [state]);

  const byRoute = useMemo(() => {
    const map = new Map<string, number>();
    state.shipments.forEach((s) => map.set(s.route, (map.get(s.route) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [state.shipments]);

  const byVolume = useMemo(() => {
    const map = new Map<string, number>();
    state.shipments.forEach((s) => map.set(s.status, (map.get(s.status) ?? 0) + 1));
    return [...map.entries()];
  }, [state.shipments]);

  const totalRevenueUsd = useMemo(
    () => state.invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + (i.currency === "USD" ? i.amount : i.amount / 1612), 0),
    [state.invoices],
  );

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Reports are computed live from demo customer, shipment and invoice records." />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link to="/freight"><ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Clearing Agent Portal</Link>
          </Button>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Grouped summaries by customer, route, shipment volume and revenue.</p>
        </div>
        <Badge variant="outline" className="text-[10px]">Demo data</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ReportCard title="By customer" icon={<Users className="h-4 w-4" />}>
          {byCustomer.map((c) => (
            <Row key={c.name} label={c.name} value={`${c.shipments} shipments · ${fmtFreight(c.revenue, "USD")}`} bar={byCustomer[0].revenue ? c.revenue / byCustomer[0].revenue : 0} />
          ))}
          {byCustomer.length === 0 && <Empty />}
        </ReportCard>

        <ReportCard title="By route" icon={<RouteIcon className="h-4 w-4" />}>
          {byRoute.map(([route, count]) => (
            <Row key={route} label={route} value={String(count)} bar={byRoute[0] ? count / byRoute[0][1] : 0} />
          ))}
          {byRoute.length === 0 && <Empty />}
        </ReportCard>

        <ReportCard title="By shipment volume (status)" icon={<BarChart3 className="h-4 w-4" />}>
          {byVolume.map(([status, count]) => (
            <Row key={status} label={status} value={String(count)} bar={state.shipments.length ? count / state.shipments.length : 0} tone="success" />
          ))}
          {byVolume.length === 0 && <Empty />}
        </ReportCard>

        <ReportCard title="By revenue" icon={<DollarSign className="h-4 w-4" />}>
          <div className="text-sm mb-2">Total collected revenue: <span className="font-semibold text-success">{fmtFreight(totalRevenueUsd, "USD")}</span></div>
          {byCustomer.map((c) => (
            <Row key={c.name} label={c.name} value={fmtFreight(c.revenue, "USD")} bar={byCustomer[0].revenue ? c.revenue / byCustomer[0].revenue : 0} tone="success" />
          ))}
        </ReportCard>
      </div>
    </div>
  );
}

function Empty() {
  return <div className="text-sm text-muted-foreground">No data yet.</div>;
}

function ReportCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5 shadow-card">
      <div className="text-sm font-semibold mb-3 flex items-center gap-2">{icon} {title}</div>
      <div className="space-y-2">{children}</div>
    </Card>
  );
}

function Row({ label, value, bar, tone }: { label: string; value: string; bar: number; tone?: "success" }) {
  const color = tone === "success" ? "bg-success/60" : "bg-primary/60";
  return (
    <div>
      <div className="flex items-center justify-between text-xs"><span className="truncate pr-2">{label}</span><span className="font-medium tabular-nums">{value}</span></div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1"><div className={color + " h-full"} style={{ width: `${Math.max(8, bar * 100)}%` }} /></div>
    </div>
  );
}
