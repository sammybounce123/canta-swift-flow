import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { StartHereCard } from "@/components/StartHereCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  CheckCircle2,
  Banknote,
  ArrowLeftRight,
  Clock,
  AlertTriangle,
  PiggyBank,
  ArrowRight,
  Plus,
  Home,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  CASES,
  SOLICITORS,
  formatGBP,
  statusTone,
  getSolicitor,
  getMarketer,
  LEADS,
  visibleCases,
  visibleLeads,
  marketerPerformance,
  PARTNER_ROLES,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { ReadinessBar } from "@/components/ReadinessBar";
import { PartnerWalletCards } from "@/components/partner/SolicitorPaymentSections";

export const Route = createFileRoute("/partner/")({
  head: () => ({ meta: [{ title: "Dashboard — Kingsbridge Property Partners Partner Payments" }] }),
  component: PartnerDashboard,
});

function PartnerDashboard() {
  const { role, userId, user } = usePartnerRole();
  return (
    <div className="space-y-5">
      <PartnerWalletCards />
      {role === "marketer" ? (
        <MarketerDashboard userId={userId} name={user?.name ?? "Marketer"} />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}

/* ============================ Partner Admin ============================ */
function AdminDashboard() {
  const totalReferred = CASES.length + LEADS.length;
  const activeLeads = LEADS.filter(
    (l) => !["Lost", "Not Ready", "Converted to Payment Case"].includes(l.status),
  ).length;
  const active = CASES.filter(
    (c) =>
      !["Paid to Solicitor", "Receipt Uploaded", "Failed / Returned", "Cancelled"].includes(
        c.status,
      ),
  ).length;
  const successful = CASES.filter((c) =>
    ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status),
  );
  const totalGBP = successful.reduce((s, c) => s + c.amountGBP, 0);
  const pendingPayout = CASES.filter((c) =>
    ["FX Converted", "Payout Processing"].includes(c.status),
  ).length;
  const failed = CASES.filter((c) => c.status === "Failed / Returned").length;

  const kpis = [
    {
      l: "Clients referred (all marketers)",
      v: totalReferred.toString(),
      icon: Users,
      tone: "text-primary",
    },
    { l: "Active referral leads", v: activeLeads.toString(), icon: Sparkles, tone: "text-accent" },
    { l: "Active payment cases", v: active.toString(), icon: FileText, tone: "text-accent" },
    {
      l: "Successful solicitor payouts",
      v: successful.length.toString(),
      icon: CheckCircle2,
      tone: "text-success",
    },
    { l: "Total GBP paid out", v: formatGBP(totalGBP), icon: Banknote, tone: "text-success" },
    { l: "Pending payouts", v: pendingPayout.toString(), icon: Clock, tone: "text-warning" },
    { l: "Failed / Returned", v: failed.toString(), icon: AlertTriangle, tone: "text-destructive" },
    {
      l: "Est. partner commission",
      v: formatGBP(Math.round(totalGBP * 0.005)),
      icon: PiggyBank,
      tone: "text-primary",
    },
  ];

  const monthly = [
    { m: "Jan", payouts: 820_000 },
    { m: "Feb", payouts: 1_120_000 },
    { m: "Mar", payouts: 980_000 },
    { m: "Apr", payouts: 1_540_000 },
    { m: "May", payouts: 1_810_000 },
    { m: "Jun", payouts: 1_245_000 },
  ];

  const perf = marketerPerformance().sort((a, b) => b.totalPaidGBP - a.totalPaidGBP);
  const topMarketers = perf.slice(0, 5);
  const colors = [
    "oklch(0.36 0.12 260)",
    "oklch(0.78 0.16 175)",
    "oklch(0.6 0.18 240)",
    "oklch(0.72 0.17 160)",
    "oklch(0.65 0.18 30)",
  ];
  const conversionData = perf.map((p, i) => ({
    name: p.marketer.name.split(" ")[0],
    value: Math.round(p.conversionRate * 100),
    fill: colors[i % colors.length],
  }));

  const recent = [...CASES].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Client verification and consent may be required before funding instructions are shown."
      />
      <Hero
        title="Kingsbridge Property Partners — Partner Property Payments"
        subtitle="Track every referred client, marketer and UK solicitor payout end-to-end."
      />
      <StartHereCard
        title="Create Payment Case"
        description="Refer a client, generate FX quote, create payment link, and track solicitor payout."
        primary={{ label: "Add Referral", to: "/partner/new-referral" }}
        secondary={[
          { label: "Create FX Quote", to: "/partner/fx-quotes" },
          { label: "Generate Payment Link", to: "/partner/payment-links" },
          { label: "View Solicitor Payouts", to: "/partner/payouts" },
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Kpi key={k.l} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 p-6 shadow-card">
          <div className="text-sm font-semibold">Monthly payout volume</div>
          <div className="text-xs text-muted-foreground">GBP paid to solicitors · YTD</div>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 250)"
                  vertical={false}
                />
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
                <Bar dataKey="payouts" fill="oklch(0.36 0.12 260)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="text-sm font-semibold">Conversion by marketer</div>
          <div className="text-xs text-muted-foreground">Lead → successful payout · %</div>
          <div className="h-56 mt-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={conversionData}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {conversionData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => `${v}%`}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Top marketers
            </div>
            <div className="text-xs text-muted-foreground">Ranked by GBP paid to solicitors</div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/partner/marketers">
              All marketers <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                <th className="py-2 px-2">Marketer</th>
                <th className="py-2 px-2 text-right">Clients</th>
                <th className="py-2 px-2 text-right">Successful</th>
                <th className="py-2 px-2 text-right">Paid (GBP)</th>
                <th className="py-2 px-2 text-right">Conversion</th>
                <th className="py-2 px-2">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {topMarketers.map((p) => (
                <tr key={p.marketer.id} className="border-b last:border-0">
                  <td className="py-3 px-2">
                    <div className="font-medium">{p.marketer.name}</div>
                    <div className="text-[11px] text-muted-foreground">{p.marketer.region}</div>
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums">{p.clientsReferred}</td>
                  <td className="py-3 px-2 text-right tabular-nums">{p.successfulPayouts}</td>
                  <td className="py-3 px-2 text-right tabular-nums font-medium">
                    {formatGBP(p.totalPaidGBP)}
                  </td>
                  <td className="py-3 px-2 text-right tabular-nums">
                    {Math.round(p.conversionRate * 100)}%
                  </td>
                  <td className="py-3 px-2 text-xs text-muted-foreground tabular-nums">
                    {p.lastActivity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Recent client payment cases</div>
            <div className="text-xs text-muted-foreground">Across all marketers</div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/partner/cases">
              All cases <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        <CasesTable rows={recent} showMarketer />
      </Card>

      <Card className="p-5 shadow-card bg-muted/30">
        <div className="text-xs text-muted-foreground">Volume by solicitor</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
          {SOLICITORS.map((s) => (
            <div key={s.id} className="rounded-lg border bg-background p-3">
              <div className="text-sm font-medium">{s.firm}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.linkedClients} clients</div>
              <div className="text-sm font-semibold tabular-nums mt-2">
                {formatGBP(s.totalPayouts)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================ Marketer Dashboard ============================ */
function MarketerDashboard({ userId, name }: { userId: string; name: string }) {
  const myCases = visibleCases(userId, "marketer");
  const myLeads = visibleLeads(userId, "marketer");
  const successful = myCases.filter((c) =>
    ["Paid to Solicitor", "Receipt Uploaded"].includes(c.status),
  );
  const active = myCases.filter(
    (c) =>
      !["Paid to Solicitor", "Receipt Uploaded", "Failed / Returned", "Cancelled"].includes(
        c.status,
      ),
  );
  const paid = successful.reduce((s, c) => s + c.amountGBP, 0);
  const activeLeads = myLeads.filter(
    (l) => !["Lost", "Not Ready", "Converted to Payment Case"].includes(l.status),
  );
  const needAction = myCases.filter((c) =>
    ["Awaiting Client Funding", "KYC Pending", "Documents Requested"].includes(c.status as string),
  );
  const pendingDocs = myCases.filter(
    (c) => c.status === "KYC Pending" || c.status === "Awaiting Client Funding",
  ).length;
  const referrals = myCases.length + myLeads.length;
  const conv = referrals ? Math.round((successful.length / referrals) * 100) : 0;

  const kpis = [
    { l: "My referral leads", v: myLeads.length.toString(), icon: Sparkles, tone: "text-accent" },
    {
      l: "My active payment cases",
      v: active.length.toString(),
      icon: FileText,
      tone: "text-primary",
    },
    {
      l: "My successful payouts",
      v: successful.length.toString(),
      icon: CheckCircle2,
      tone: "text-success",
    },
    { l: "My total GBP paid out", v: formatGBP(paid), icon: Banknote, tone: "text-success" },
    {
      l: "Active leads in pipeline",
      v: activeLeads.length.toString(),
      icon: ArrowLeftRight,
      tone: "text-warning",
    },
    { l: "Pending documents", v: pendingDocs.toString(), icon: Clock, tone: "text-warning" },
    {
      l: "Clients needing action",
      v: needAction.length.toString(),
      icon: AlertTriangle,
      tone: "text-destructive",
    },
    { l: "My conversion rate", v: `${conv}%`, icon: PiggyBank, tone: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <Hero
        title={`Welcome back, ${name.split(" ")[0]}`}
        subtitle="Your referrals, leads and successful solicitor payouts."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Kpi key={k.l} {...k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">My active leads</div>
              <div className="text-xs text-muted-foreground">Work each one to a payment case</div>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/partner/leads">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          <ul className="text-sm divide-y">
            {activeLeads.slice(0, 6).map((l) => (
              <li key={l.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{l.clientName}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{l.property}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium tabular-nums">
                    {formatGBP(l.expectedAmountGBP)}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-1">
                    {l.status}
                  </Badge>
                </div>
              </li>
            ))}
            {activeLeads.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">No active leads.</li>
            )}
          </ul>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Clients needing action</div>
              <div className="text-xs text-muted-foreground">
                Awaiting funding, KYC or documents
              </div>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/partner/cases">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
          <ul className="text-sm divide-y">
            {needAction.slice(0, 6).map((c) => (
              <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/partner/cases/$caseId"
                    params={{ caseId: c.id }}
                    className="font-medium hover:underline"
                  >
                    {c.clientName}
                  </Link>
                  <div className="text-[11px] text-muted-foreground truncate">{c.property}</div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>
                  {c.status}
                </Badge>
              </li>
            ))}
            {needAction.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                No actions required.
              </li>
            )}
          </ul>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">My successful payouts</div>
            <div className="text-xs text-muted-foreground">Receipts available</div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link to="/partner/payouts">
              All payouts <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        <CasesTable rows={successful} />
      </Card>
    </div>
  );
}

/* ----------------- shared bits ----------------- */
function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  const { role } = usePartnerRole();
  const roleLabel = PARTNER_ROLES.find((r) => r.id === role)?.label;
  return (
    <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 via-card to-accent/5 border-primary/20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <Badge variant="outline" className="mb-1.5 text-[10px]">
              <ShieldCheck className="h-3 w-3 mr-1" /> {roleLabel} · Partner Workspace
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/partner/leads">Leads</Link>
          </Button>
          <Button asChild className="bg-primary">
            <Link to="/partner/new-referral">
              <Plus className="h-4 w-4 mr-1.5" /> New referral
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Kpi({
  l,
  v,
  icon: Icon,
  tone,
}: {
  l: string;
  v: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="text-xs text-muted-foreground">{l}</div>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="text-2xl font-semibold mt-2 tabular-nums">{v}</div>
    </Card>
  );
}

function CasesTable({ rows, showMarketer }: { rows: typeof CASES; showMarketer?: boolean }) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
            <th className="py-2 px-2">Client</th>
            <th className="py-2 px-2">Property</th>
            <th className="py-2 px-2 text-right">Amount</th>
            <th className="py-2 px-2">Solicitor</th>
            {showMarketer && <th className="py-2 px-2">Marketer</th>}
            <th className="py-2 px-2">Status</th>
            <th className="py-2 px-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => {
            const sol = getSolicitor(c.solicitorId);
            const m = getMarketer(c.assignedMarketerId);
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
                <td className="py-3 px-2 text-right tabular-nums font-medium">
                  {formatGBP(c.amountGBP)}
                </td>
                <td className="py-3 px-2 text-xs">{sol?.firm}</td>
                {showMarketer && <td className="py-3 px-2 text-xs">{m?.name}</td>}
                <td className="py-3 px-2">
                  <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>
                    {c.status}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>
                      View
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
