import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Calendar, Layers } from "lucide-react";
import { useActions } from "@/components/ActionsProvider";
import { WorkspaceCardsPanel } from "@/components/CardsPanel";
import { WorkspaceWelcome } from "@/components/WorkspaceWelcome";
import { StartHereCard } from "@/components/StartHereCard";

const allocation = [
  { name: "USD", value: 62 },
  { name: "NGN", value: 22 },
  { name: "EUR", value: 10 },
  { name: "GBP", value: 6 },
];
const colors = ["oklch(0.36 0.12 260)", "oklch(0.78 0.16 175)", "oklch(0.6 0.18 240)", "oklch(0.72 0.17 160)"];

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
      <WorkspaceWelcome workspace="enterprise_treasury" />
      <StartHereCard
        title="Start FX Transfer"
        description="Convert funds, manage beneficiaries, and track approvals from one treasury workspace."
        primary={{ label: "Start FX Conversion", to: "/fx" }}
        secondary={[
          { label: "Add Beneficiary", to: "/beneficiaries" },
          { label: "View Transactions", to: "/transactions" },
          { label: "Create Company Card", to: "/treasury/cards" },
        ]}
      />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Treasury & Liquidity</h1>
          <p className="text-sm text-muted-foreground mt-1">FX exposure and corporate cash positions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openBulk}><Layers className="h-4 w-4 mr-1.5" /> Bulk Payments</Button>
          <Button className="bg-primary" onClick={openSchedule}><Calendar className="h-4 w-4 mr-1.5" /> Schedule Conversion</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "FX Exposure", v: "$24.8M", s: "+3.2% MoM", up: true },
          { l: "Liquidity Position", v: "₦4.12B", s: "Strong", up: true },
          { l: "Open Orders", v: "12", s: "3 pending approval" },
          { l: "Avg Settlement", v: "8.2s", s: "Instant rail" },
        ].map((m) => (
          <Card key={m.l} className="p-5 shadow-card">
            <div className="text-xs text-muted-foreground">{m.l}</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{m.v}</div>
            <div className={`text-xs mt-1 ${m.up ? "text-success" : "text-muted-foreground"}`}>{m.s}</div>
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
                <Pie data={allocation} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {allocation.map((_, i) => <Cell key={i} fill={colors[i]} />)}
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
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="inflow" fill="oklch(0.78 0.16 175)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="outflow" fill="oklch(0.36 0.12 260)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <WorkspaceCardsPanel
        title="Company Cards"
        subtitle="Staff, department, travel, procurement, ad-spend and project cards across the enterprise."
        categories={["Staff", "Department", "Travel", "Procurement", "Ad Spend", "Project"]}
        pendingApprovals={3}
        receiptsMissing={5}
        groupedLabel="department"
        groupedSpend={[
          { label: "Procurement", amount: 84_200 },
          { label: "Sales", amount: 41_800 },
          { label: "Operations", amount: 36_400 },
          { label: "Marketing", amount: 28_900 },
          { label: "Treasury", amount: 12_400 },
        ]}
        cards={[
          { id: "T1", label: "CFO Travel",         holder: "Adaeze O.", last4: "4421", status: "Active", monthlySpend: 3850, limit: 8000,  category: "Travel",     linked: "Trip: Dubai Sourcing" },
          { id: "T2", label: "Procurement Dept",   holder: "Tunde B.",  last4: "7782", status: "Active", monthlySpend: 12400, limit: 25000, category: "Procurement", linked: "Cost Center CC-100" },
          { id: "T3", label: "Meta Ads — Brand",   holder: "Marketing", last4: "9012", status: "Active", monthlySpend: 5150,  limit: 10000, category: "Ad Spend",    linked: "Campaign: Brand-Q2" },
          { id: "T4", label: "Lagos HQ Office",    holder: "Femi A.",   last4: "3318", status: "Frozen", monthlySpend: 1280,  limit: 5000,  category: "Staff" },
          { id: "T5", label: "Project Atlantic",   holder: "Ops Team",  last4: "5567", status: "Active", monthlySpend: 6800,  limit: 15000, category: "Project",     linked: "Project: Atlantic" },
          { id: "T6", label: "Sales Per-Diem",     holder: "Sales",     last4: "2204", status: "Active", monthlySpend: 2240,  limit: 6000,  category: "Staff" },
        ]}
      />

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold">Spend by staff</div>
        <div className="text-xs text-muted-foreground mb-4">Top cardholders this month · USD</div>
        <div className="space-y-3">
          {[
            { name: "Tunde Bakare",   role: "Procurement Officer", amount: 12_400, limit: 25_000 },
            { name: "Marketing Team", role: "Ad Spend",            amount: 5_150,  limit: 10_000 },
            { name: "Ops Team",       role: "Project Atlantic",    amount: 6_800,  limit: 15_000 },
            { name: "Adaeze Okonkwo", role: "CFO",                 amount: 3_850,  limit: 8_000 },
            { name: "Sales Team",     role: "Per-Diem",            amount: 2_240,  limit: 6_000 },
            { name: "Femi Adeyemi",   role: "Lagos HQ Office",     amount: 1_280,  limit: 5_000 },
          ].map((s) => {
            const pct = Math.round((s.amount / s.limit) * 100);
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div>
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground"> · {s.role}</span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    ${s.amount.toLocaleString()} / ${s.limit.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${pct > 85 ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
