import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight, ArrowDownRight, Plus, ArrowLeftRight, Send, Sparkles,
  TrendingUp, Wallet as WalletIcon, Zap, Eye, EyeOff,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { wallets, transactions, cashFlow, fmtMoney, fmtNGN } from "@/lib/mock";
import { StatusPill } from "@/components/StatusPill";
import { useActions } from "@/components/ActionsProvider";
import { useRole } from "@/components/RoleProvider";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Canta" }] }),
  component: Dashboard,
});

const MASK = "•••••••";

function Dashboard() {
  const { openFund, openConvert, openSend } = useActions();
  const { profile, role, can } = useRole();
  const [hidden, setHidden] = useState(false);
  const totalNGN = 2_847_120_000;
  const greet = role === "Viewer" ? "Welcome" : role === "Compliance" ? "Hello" : "Good morning";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{greet}, {profile.name.split(" ")[0]}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "Compliance"
              ? "Review pending approvals and audit recent activity."
              : role === "Viewer"
              ? "Read-only view of treasury activity."
              : "Here's what's happening with your treasury today."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setHidden((h) => !h)}>
            {hidden ? <Eye className="h-4 w-4 mr-1.5" /> : <EyeOff className="h-4 w-4 mr-1.5" />}
            {hidden ? "Show balances" : "Hide balances"}
          </Button>
          <Badge className="bg-accent/15 text-accent-foreground border border-accent/30 hover:bg-accent/20">
            <Zap className="h-3 w-3 mr-1" /> Oil & Gas Mode
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 bg-gradient-card text-primary-foreground border-none shadow-elevated overflow-hidden relative">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-widest text-primary-foreground/60">
              Total balance · NGN equivalent
            </div>
            <div className="mt-2 flex items-end gap-3">
              <div className="text-4xl lg:text-5xl font-semibold tabular-nums">{fmtNGN(totalNGN)}</div>
              <div className="inline-flex items-center gap-1 bg-success/20 text-success px-2 py-1 rounded text-xs mb-2">
                <ArrowUpRight className="h-3 w-3" /> +4.8% this week
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {wallets.map((w) => (
                <button
                  key={w.ccy}
                  onClick={() => openFund(w.ccy)}
                  className="text-left rounded-lg bg-white/5 backdrop-blur border border-white/10 px-3 py-2.5 hover:bg-white/10 transition"
                >
                  <div className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">
                    {w.flag} {w.ccy}
                  </div>
                  <div className="text-sm font-semibold tabular-nums mt-1">{fmtMoney(w.balance, w.ccy)}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={() => openFund("NGN")} className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                <Plus className="h-4 w-4 mr-1.5" /> Fund Wallet
              </Button>
              <Button onClick={() => openConvert("NGN", "USD")} variant="secondary" className="bg-white/10 hover:bg-white/15 text-primary-foreground border border-white/15">
                <ArrowLeftRight className="h-4 w-4 mr-1.5" /> Convert Currency
              </Button>
              <Button onClick={() => openSend()} variant="secondary" className="bg-white/10 hover:bg-white/15 text-primary-foreground border border-white/15">
                <Send className="h-4 w-4 mr-1.5" /> Send Payment
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Live FX Rates</div>
            <div className="flex items-center gap-1 text-[10px] text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { p: "USD/NGN", r: "1,612.45", c: "+0.32%", up: true },
              { p: "EUR/NGN", r: "1,745.10", c: "-0.18%", up: false },
              { p: "GBP/NGN", r: "2,048.77", c: "+0.21%", up: true },
            ].map((r) => (
              <div key={r.p} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div>
                  <div className="text-sm font-medium">{r.p}</div>
                  <div className="text-[11px] text-muted-foreground">Mid-market</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{r.r}</div>
                  <div className={`text-[11px] flex items-center gap-0.5 justify-end ${r.up ? "text-success" : "text-destructive"}`}>
                    {r.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{r.c}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="w-full mt-4">
            <Link to="/fx">Open Exchange</Link>
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">Cash flow</div>
              <div className="text-xs text-muted-foreground">Last 7 days · USD millions</div>
            </div>
            <div className="flex gap-1 text-xs">
              {["7D", "30D", "90D"].map((p, i) => (
                <button key={p} className={`px-2.5 py-1 rounded-md ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlow}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 175)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 175)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.36 0.12 260)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.36 0.12 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Area type="monotone" dataKey="inflow" stroke="oklch(0.78 0.16 175)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="outflow" stroke="oklch(0.36 0.12 260)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/20 grid place-items-center">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div className="text-sm font-semibold">AI Insight</div>
          </div>
          <p className="mt-4 text-base font-medium leading-snug">
            NGN expected to weaken <span className="text-destructive">~1.2%</span> against USD this week.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Consider converting up to <span className="font-semibold text-foreground">$2.4M</span> in export proceeds within the next 24 hours.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15">
              <TrendingUp className="h-3 w-3 mr-1" /> 87% confidence
            </Badge>
            <span className="text-muted-foreground">Updated 2m ago</span>
          </div>
          <Button onClick={() => openConvert("NGN", "USD")} className="w-full mt-5 bg-accent text-accent-foreground hover:bg-accent/90">
            Convert now
          </Button>
        </Card>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div>
            <div className="text-sm font-semibold">Recent transactions</div>
            <div className="text-xs text-muted-foreground">Last 24 hours</div>
          </div>
          <Button asChild variant="ghost" size="sm"><Link to="/transactions">View all</Link></Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 6).map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium">{t.desc}</div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </td>
                  <td className="px-5 py-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{t.type}</span></td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold">{fmtMoney(t.amount, t.ccy)}</td>
                  <td className="px-5 py-3"><StatusPill status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 shadow-card flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
            <WalletIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">Smart routing active</div>
            <div className="text-xs text-muted-foreground">Best corridor selected automatically · Avg savings 0.8%</div>
          </div>
        </div>
        <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15">Instant Settlement</Badge>
      </Card>
    </div>
  );
}
