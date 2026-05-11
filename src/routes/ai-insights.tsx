import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";

const data = [
  { d: "T-7", actual: 1598 }, { d: "T-6", actual: 1604 }, { d: "T-5", actual: 1601 },
  { d: "T-4", actual: 1609 }, { d: "T-3", actual: 1612 }, { d: "T-2", actual: 1615 },
  { d: "T-1", actual: 1612 }, { d: "Now", actual: 1612, predicted: 1612 },
  { d: "T+1", predicted: 1618 }, { d: "T+2", predicted: 1624 },
  { d: "T+3", predicted: 1629 }, { d: "T+4", predicted: 1632 },
];

export const Route = createFileRoute("/ai-insights")({
  head: () => ({ meta: [{ title: "AI Insights — Canta" }] }),
  component: AIInsights,
});

function AIInsights() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-accent/15 grid place-items-center">
          <Sparkles className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">AI Insights</h1>
          <p className="text-sm text-muted-foreground">Predictive FX intelligence for treasury teams.</p>
        </div>
      </div>

      <Card className="p-6 shadow-elevated bg-gradient-card text-primary-foreground border-none relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid lg:grid-cols-3 gap-6">
          <div>
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">Buy Signal</Badge>
            <div className="mt-4 text-3xl font-semibold">Buy USD now</div>
            <p className="text-sm text-primary-foreground/70 mt-2 leading-relaxed">
              NGN expected to weaken ~1.2% over the next 48 hours driven by oil revenue cycles
              and import demand. Locking USD now optimises corporate cash positions.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div>
                <div className="text-xs text-primary-foreground/60">Confidence</div>
                <div className="text-xl font-semibold">87%</div>
              </div>
              <div className="h-10 w-px bg-white/15" />
              <div>
                <div className="text-xs text-primary-foreground/60">Horizon</div>
                <div className="text-xl font-semibold">48h</div>
              </div>
              <div className="h-10 w-px bg-white/15" />
              <div>
                <div className="text-xs text-primary-foreground/60">Suggested size</div>
                <div className="text-xl font-semibold">$2.4M</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 h-64">
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: "oklch(0.18 0.06 260)", border: "none", color: "#fff" }} />
                <ReferenceLine x="Now" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="actual" stroke="oklch(0.78 0.16 175)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="predicted" stroke="#fff" strokeDasharray="6 4" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { t: "EUR/NGN", desc: "Wait 24-48 hours", c: 72, dir: "wait", icon: TrendingDown },
          { t: "GBP/NGN", desc: "Hold position", c: 65, dir: "hold", icon: TrendingUp },
          { t: "Oil receipts (USD)", desc: "Convert in tranches", c: 81, dir: "tranche", icon: TrendingUp },
        ].map((s) => (
          <Card key={s.t} className="p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{s.t}</div>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-3 text-base font-medium">{s.desc}</div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-semibold">{s.c}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-gradient-accent" style={{ width: `${s.c}%` }} />
            </div>
            <button className="mt-4 text-xs text-accent inline-flex items-center gap-1 font-medium hover:underline">
              View full analysis <ArrowRight className="h-3 w-3" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
