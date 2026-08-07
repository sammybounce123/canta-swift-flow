import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { CASES, SOLICITORS, formatGBP, getSolicitor } from "@/lib/partner";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/reports")({
  head: () => ({ meta: [{ title: "Reports — Kingsbridge Property Partners" }] }),
  component: Reports,
});

function Reports() {
  const totalReferred = CASES.length;
  const success = CASES.filter((c) => ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status));
  const pending = CASES.filter(
    (c) =>
      !["Paid to Solicitor", "Receipt Uploaded", "Failed / Returned", "Cancelled"].includes(
        c.status,
      ),
  );
  const failed = CASES.filter((c) => c.status === "Failed / Returned");
  const totalGBP = success.reduce((s, c) => s + c.amountGBP, 0);
  const avg = success.length ? Math.round(totalGBP / success.length) : 0;
  const conversion = totalReferred ? Math.round((success.length / totalReferred) * 100) : 0;
  const commission = Math.round(totalGBP * 0.005);

  const monthly = [
    { m: "Jan", v: 820_000 },
    { m: "Feb", v: 1_120_000 },
    { m: "Mar", v: 980_000 },
    { m: "Apr", v: 1_540_000 },
    { m: "May", v: 1_810_000 },
    { m: "Jun", v: 1_245_000 },
  ];

  const bySolicitor = SOLICITORS.map((s) => ({
    name: s.firm.split(" ")[0],
    volume: CASES.filter((c) => c.solicitorId === s.id).reduce((sum, c) => sum + c.amountGBP, 0),
  }));

  const byProperty = Array.from(
    CASES.reduce(
      (m, c) => m.set(c.propertyLocation, (m.get(c.propertyLocation) ?? 0) + c.amountGBP),
      new Map<string, number>(),
    ),
  ).map(([name, v]) => ({ name, v }));

  return (
    <div className="space-y-5">
      <ReadinessBar status="Demo Preview" cue="Reports reflect data captured in your workspace." />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Partner reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reporting on every client referred by Kingsbridge Property Partners.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-1.5" /> CSV
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-1.5" /> Excel
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-1.5" /> PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi l="Clients referred" v={totalReferred.toString()} />
        <Kpi l="Total GBP paid out" v={formatGBP(totalGBP)} />
        <Kpi l="Successful payouts" v={success.length.toString()} />
        <Kpi l="Pending payouts" v={pending.length.toString()} />
        <Kpi l="Failed payouts" v={failed.length.toString()} />
        <Kpi l="Client conversion" v={`${conversion}%`} />
        <Kpi l="Avg transaction" v={formatGBP(avg)} />
        <Kpi l="Est. commission" v={formatGBP(commission)} />
      </div>

      <Card className="p-6 shadow-card">
        <div className="text-sm font-semibold">Monthly payout volume</div>
        <div className="text-xs text-muted-foreground">GBP paid · YTD</div>
        <div className="h-72 mt-3">
          <ResponsiveContainer>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
              <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => formatGBP(v)}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="oklch(0.36 0.12 260)"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold">Volume by solicitor</div>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <BarChart data={bySolicitor}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 250)"
                  vertical={false}
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatGBP(v)}
                />
                <Bar dataKey="volume" fill="oklch(0.78 0.16 175)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="text-sm font-semibold">Volume by property location</div>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <BarChart data={byProperty} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 250)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatGBP(v)}
                />
                <Bar dataKey="v" fill="oklch(0.36 0.12 260)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="text-sm font-semibold mb-4">Top solicitors by total payouts</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
              <th className="py-2">Solicitor</th>
              <th className="py-2 text-right">Clients</th>
              <th className="py-2 text-right">Total paid</th>
              <th className="py-2 text-right">Last payout</th>
            </tr>
          </thead>
          <tbody>
            {SOLICITORS.map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="py-2">{s.firm}</td>
                <td className="py-2 text-right tabular-nums">{s.linkedClients}</td>
                <td className="py-2 text-right tabular-nums font-medium">
                  {formatGBP(s.totalPayouts)}
                </td>
                <td className="py-2 text-right text-muted-foreground tabular-nums">
                  {s.lastPayout}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="hidden">{getSolicitor("SOL-001")?.firm}</div>
      </Card>
    </div>
  );
}

function Kpi({ l, v }: { l: string; v: string }) {
  return (
    <Card className="p-5 shadow-card">
      <div className="text-xs text-muted-foreground">{l}</div>
      <div className="text-2xl font-semibold mt-2 tabular-nums">{v}</div>
    </Card>
  );
}
