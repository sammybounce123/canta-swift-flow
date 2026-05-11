import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { ArrowDown, Lock, Sparkles, Info } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { fxHistory } from "@/lib/mock";

export const Route = createFileRoute("/fx")({
  head: () => ({ meta: [{ title: "FX / Exchange — Canta" }] }),
  component: FX,
});

function FX() {
  const [from, setFrom] = useState("NGN");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("50000000");
  const [rate, setRate] = useState(0.00062);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    const i = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 30)), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (timer === 30) setRate(+(0.00062 + (Math.random() - 0.5) * 0.00001).toFixed(7));
  }, [timer]);

  const num = Number(amount) || 0;
  const out = num * rate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">FX / Exchange</h1>
        <p className="text-sm text-muted-foreground mt-1">Convert between currencies at the best available rate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Currency Converter</div>
            <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15">
              Best Rate Available
            </Badge>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-xs text-muted-foreground">You send</label>
            <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border focus-within:border-ring">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="flex-1 bg-transparent text-2xl font-semibold tabular-nums outline-none"
              />
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="bg-card border border-border rounded-lg px-2 text-sm font-medium">
                <option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option>
              </select>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <button
                onClick={() => { setFrom(to); setTo(from); }}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-elevated hover:bg-primary-glow"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            <label className="text-xs text-muted-foreground">Recipient gets</label>
            <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
              <div className="flex-1 text-2xl font-semibold tabular-nums">
                {out.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="bg-card border border-border rounded-lg px-2 text-sm font-medium">
                <option>USD</option><option>NGN</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>Rate locked · 1 {from} = {rate.toFixed(7)} {to}</span>
            </div>
            <span className="text-xs font-mono">{timer}s</span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <Row label="Mid-market rate" value={`1 ${from} = ${(rate * 1.0008).toFixed(7)} ${to}`} />
            <Row label="Canta spread" value="0.08%" />
            <Row label="Transfer fee" value="₦0.00" highlight />
            <Row label="Slippage" value="< 0.05%" />
          </div>

          <Button className="w-full mt-5 bg-accent text-accent-foreground hover:bg-accent/90 h-11 font-semibold">
            Confirm Conversion
          </Button>
        </Card>

        <Card className="lg:col-span-3 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">USD / NGN — 7 day history</div>
              <div className="text-xs text-muted-foreground">Mid-market rate</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold tabular-nums">1,612.45</div>
              <div className="text-xs text-success">+0.32% today</div>
            </div>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fxHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }} />
                <YAxis domain={["dataMin - 5", "dataMax + 5"]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="oklch(0.36 0.12 260)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/30 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold">AI signal: Buy USD now</div>
              <div className="text-xs text-muted-foreground mt-0.5">Predicted upward trend over next 48h. Confidence 87%.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground inline-flex items-center gap-1">{label} <Info className="h-3 w-3" /></span>
      <span className={highlight ? "font-semibold text-success" : "font-medium"}>{value}</span>
    </div>
  );
}
