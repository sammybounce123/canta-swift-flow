import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, FileText, CheckCircle2, Banknote, ArrowLeftRight, Clock,
  AlertTriangle, PiggyBank, ArrowRight, Plus, Home, ShieldCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { CASES, SOLICITORS, formatGBP, statusTone, getSolicitor } from "@/lib/partner";

export const Route = createFileRoute("/partner/")({
  head: () => ({ meta: [{ title: "Dashboard — Baron & Cabot Partner Payments" }] }),
  component: PartnerDashboard,
});

function PartnerDashboard() {
  const totalReferred = CASES.length;
  const active = CASES.filter((c) => !["Paid to Solicitor", "Receipt Uploaded", "Failed / Returned", "Cancelled"].includes(c.status)).length;
  const successful = CASES.filter((c) => ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status));
  const totalGBP = successful.reduce((s, c) => s + c.amountGBP, 0);
  const pendingFX = CASES.filter((c) => ["FX Quote Sent", "FX Accepted", "Funding Received"].includes(c.status)).length;
  const pendingPayout = CASES.filter((c) => ["FX Converted", "Payout Processing"].includes(c.status)).length;
  const failed = CASES.filter((c) => c.status === "Failed / Returned").length;
  const commission = Math.round(totalGBP * 0.005);

  const kpis = [
    { l: "Total Clients Referred", v: totalReferred.toString(), icon: Users, tone: "text-primary" },
    { l: "Active Payment Cases", v: active.toString(), icon: FileText, tone: "text-accent" },
    { l: "Successful Solicitor Payouts", v: successful.length.toString(), icon: CheckCircle2, tone: "text-success" },
    { l: "Total GBP Paid Out", v: formatGBP(totalGBP), icon: Banknote, tone: "text-success" },
    { l: "Pending FX Conversions", v: pendingFX.toString(), icon: ArrowLeftRight, tone: "text-warning" },
    { l: "Pending Solicitor Payouts", v: pendingPayout.toString(), icon: Clock, tone: "text-warning" },
    { l: "Failed / Returned", v: failed.toString(), icon: AlertTriangle, tone: "text-destructive" },
    { l: "Est. Partner Commission", v: formatGBP(commission), icon: PiggyBank, tone: "text-primary" },
  ];

  const monthly = [
    { m: "Jan", payouts: 820_000 },
    { m: "Feb", payouts: 1_120_000 },
    { m: "Mar", payouts: 980_000 },
    { m: "Apr", payouts: 1_540_000 },
    { m: "May", payouts: 1_810_000 },
    { m: "Jun", payouts: 1_245_000 },
  ];

  const solicitorMix = SOLICITORS.map((s) => ({ name: s.firm.split(" ")[0], value: s.totalPayouts }));
  const colors = ["oklch(0.36 0.12 260)", "oklch(0.78 0.16 175)", "oklch(0.6 0.18 240)", "oklch(0.72 0.17 160)"];

  const recent = [...CASES].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <Badge variant="outline" className="mb-1.5 text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1" /> Partner Workspace
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight">Baron &amp; Cabot — Property Payments</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Track every referred client from referral to UK solicitor completion — FX conversion, payouts and receipts in one place.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/partner/cases">View all cases</Link></Button>
            <Button asChild className="bg-primary"><Link to="/partner/new-referral"><Plus className="h-4 w-4 mr-1.5" /> New referral</Link></Button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.l} className="p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div className="text-xs text-muted-foreground">{k.l}</div>
                <Icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div className="text-2xl font-semibold mt-2 tabular-nums">{k.v}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Monthly payout volume</div>
              <div className="text-xs text-muted-foreground">GBP paid to solicitors · YTD</div>
            </div>
          </div>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => formatGBP(v)} />
                <Bar dataKey="payouts" fill="oklch(0.36 0.12 260)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="text-sm font-semibold">Volume by solicitor</div>
          <div className="text-xs text-muted-foreground">Total GBP paid · all-time</div>
          <div className="h-56 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={solicitorMix} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {solicitorMix.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatGBP(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent cases */}
      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Recent client payment cases</div>
            <div className="text-xs text-muted-foreground">Latest referrals from Baron &amp; Cabot</div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/partner/cases">All cases <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
          </Button>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                <th className="py-2 px-2">Client</th>
                <th className="py-2 px-2">Property</th>
                <th className="py-2 px-2 text-right">Amount</th>
                <th className="py-2 px-2">Solicitor</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => {
                const sol = getSolicitor(c.solicitorId);
                return (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-secondary/40">
                    <td className="py-3 px-2">
                      <div className="font-medium">{c.clientName}</div>
                      <div className="text-[11px] text-muted-foreground">{c.ref}</div>
                    </td>
                    <td className="py-3 px-2">
                      <div>{c.property}</div>
                      <div className="text-[11px] text-muted-foreground">{c.propertyLocation}</div>
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums font-medium">{formatGBP(c.amountGBP)}</td>
                    <td className="py-3 px-2 text-xs">{sol?.firm}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>View</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
