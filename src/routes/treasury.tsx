import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Calendar, Layers } from "lucide-react";
import { useActions } from "@/components/ActionsProvider";
import { WorkspaceWelcome } from "@/components/WorkspaceWelcome";
import { StartHereCard } from "@/components/StartHereCard";
import { ReadinessBar } from "@/components/ReadinessBar";

const allocation = [
  { name: "USD", value: 62 },
  { name: "NGN", value: 22 },
  { name: "EUR", value: 10 },
  { name: "GBP", value: 6 },
];
const colors = [
  "oklch(0.36 0.12 260)",
  "oklch(0.78 0.16 175)",
  "oklch(0.6 0.18 240)",
  "oklch(0.72 0.17 160)",
];

const flow = [
  { m: "Jan", inflow: 12, outflow: 8 },
  { m: "Feb", inflow: 15, outflow: 10 },
  { m: "Mar", inflow: 18, outflow: 12 },
  { m: "Apr", inflow: 22, outflow: 14 },
  { m: "May", inflow: 28, outflow: 18 },
];

export const Route = createFileRoute("/treasury")({
  head: () => ({ meta: [{ title: "Treasury — Canta" }] }),
  component: Treasury,
});

function Treasury() {
  const { openBulk, openSchedule } = useActions();
  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Interactive demo — balances, rates, and approvals shown here are illustrative."
      />
      <WorkspaceWelcome workspace="enterprise_treasury" />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Treasury & Liquidity</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Move multi-currency balances, run FX, pay beneficiaries in bulk, and route every action
            through approvals — with a full audit trail.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openBulk}>
            <Layers className="h-4 w-4 mr-1.5" /> Bulk Payments
          </Button>
          <Button className="bg-primary" onClick={openSchedule}>
            <Calendar className="h-4 w-4 mr-1.5" /> Schedule Conversion
          </Button>
        </div>
      </div>

      <StartHereCard
        title="Start FX Transfer"
        description="Convert funds, manage beneficiaries, and track approvals from one treasury workspace."
        primary={{ label: "Start FX Conversion", to: "/fx" }}
        secondary={[
          { label: "Add Beneficiary", to: "/beneficiaries" },
          { label: "View Transactions", to: "/transactions" },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "FX Exposure", v: "$24.8M", s: "+3.2% MoM", up: true },
          { l: "Liquidity Position", v: "₦4.12B", s: "Strong", up: true },
          { l: "Open Orders", v: "12", s: "3 pending approval" },
          { l: "Settlement tracking", v: "Demo", s: "After compliance clears" },
        ].map((m) => (
          <Card key={m.l} className="p-5 shadow-card">
            <div className="text-xs text-muted-foreground">{m.l}</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{m.v}</div>
            <div className={`text-xs mt-1 ${m.up ? "text-success" : "text-muted-foreground"}`}>
              {m.s}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="text-sm font-semibold">Currency Allocation</div>
          <div className="text-xs text-muted-foreground">% of total liquidity</div>
          <div className="h-64 mt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {allocation.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {allocation.map((a, i) => (
              <div key={a.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded" style={{ background: colors[i] }} />
                <span className="text-muted-foreground">{a.name}</span>
                <span className="ml-auto font-semibold">{a.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-3 p-6 shadow-card">
          <div className="text-sm font-semibold">Inflow vs Outflow</div>
          <div className="text-xs text-muted-foreground">USD millions · YTD</div>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <BarChart data={flow}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 250)"
                  vertical={false}
                />
                <XAxis
                  dataKey="m"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }}
                />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="inflow" fill="oklch(0.78 0.16 175)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outflow" fill="oklch(0.36 0.12 260)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4 shadow-card border-dashed bg-muted/20 opacity-80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Secondary treasury control
            </div>
            <div className="text-sm font-semibold mt-1">Company expense controls</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Optional enterprise expense controls are secondary and not available in this focused
              demo.
            </div>
          </div>
          <Button variant="outline" size="sm" disabled>
            Not available in demo
          </Button>
        </div>
      </Card>
    </div>
  );
}
