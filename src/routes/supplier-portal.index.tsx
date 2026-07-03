import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Send, Wallet, Landmark, RefreshCw,
  ArrowUpRight, Activity, Sparkles, TrendingUp,
} from "lucide-react";
import {
  REQUESTS, STATUS_TONE, useVerified,
} from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/")({
  head: () => ({ meta: [{ title: "Overview — Supplier Portal — Canta" }] }),
  component: OverviewPanel,
});

function OverviewPanel() {
  const verified = useVerified();
  const recent = REQUESTS.slice(0, 4);
  const activity = REQUESTS.filter((r) =>
    ["RMB Paid", "FX Processing", "Compliance Review", "NGN Received"].includes(r.status),
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* FX ticker + quick action */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Activity className="h-3 w-3 text-accent" /> Live FX · 实时汇率
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <div className="text-4xl font-semibold tracking-tight tabular-nums">₦204.35</div>
                <div className="text-sm text-muted-foreground">/ ¥1 RMB</div>
                <Badge className="border-emerald-300/40 bg-emerald-50 text-emerald-700">
                  <TrendingUp className="mr-1 h-3 w-3" /> +0.28%
                </Badge>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Rate lock available for 15 min · 汇率锁定 15 分钟
              </div>
            </div>
            <Button size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow" asChild>
              <Link to="/supplier-portal/fx-quotes">
                <RefreshCw className="mr-2 h-4 w-4" /> Open FX Exchange
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border bg-gradient-card p-5 text-white shadow-card">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
            <Sparkles className="h-3 w-3 text-accent" /> Today
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/70">New requests</span>
              <span className="font-semibold tabular-nums">2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">NGN received</span>
              <span className="font-semibold tabular-nums">₦22.7M</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">RMB paid out</span>
              <span className="font-semibold tabular-nums">¥94,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* How settlement works */}
      <div className="rounded-3xl border bg-card p-6 shadow-card">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-base font-semibold tracking-tight">How settlement works</div>
            <div className="text-xs text-muted-foreground">结算流程 · from buyer NGN payment to RMB in your wallet</div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Send, t: "Send payment request", cn: "1. 发送收款请求",
              d: "Attach invoice and RMB amount. Buyer sees NGN they owe using the current FX quote.",
            },
            {
              icon: Landmark, t: "Buyer pays in NGN", cn: "2. 买家在尼日利亚以奈拉付款",
              d: "Nigerian buyer pays locally via bank transfer. Canta reviews compliance and processes FX.",
            },
            {
              icon: Wallet, t: "You receive RMB", cn: "3. 人民币结算至您的钱包",
              d: "RMB lands in your Canta wallet. Full receipt and audit trail attached to the request.",
            },
          ].map((s, i) => (
            <div key={s.t} className="group relative overflow-hidden rounded-2xl border bg-background/60 p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-elevated">
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">STEP 0{i + 1}</span>
                </div>
                <div className="mt-3 text-sm font-semibold">{s.t}</div>
                <div className="text-[11px] text-muted-foreground">{s.cn}</div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action needed */}
      {(!verified || REQUESTS.some((r) => r.status === "Compliance Review")) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/80 p-4 text-amber-900 shadow-card backdrop-blur">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm flex-1">
            <div className="font-semibold">Action needed</div>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">
              {!verified && <li>Verification incomplete — RMB settlement is on hold until verification is approved.</li>}
              <li>2 documents required: Factory address proof, Bank statement.</li>
              {REQUESTS.some((r) => r.status === "Compliance Review") && <li>1 payment request under compliance review.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Bento: recent requests + activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-3xl border bg-card p-5 shadow-card lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recent payment requests</div>
              <div className="text-[11px] text-muted-foreground">Last 4 · newest first</div>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <Link to="/supplier-portal/payment-requests">
                View all <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
          <ul className="space-y-2">
            {recent.map((r) => (
              <li
                key={r.id}
                className="group flex items-center gap-3 rounded-2xl border bg-background/60 p-3 transition-all hover:border-accent/40 hover:bg-background"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-mono text-[10px] font-semibold text-primary">
                  {r.id.replace("PR-", "#")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.buyer}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {r.invoiceNumber} · {r.goods}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-semibold tabular-nums">¥{r.amountRmb.toLocaleString()}</div>
                  <div className="text-[10px] tabular-nums text-muted-foreground">
                    ₦{r.amountNgn.toLocaleString()}
                  </div>
                </div>
                <Badge className={`${STATUS_TONE[r.status]} shrink-0`}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Settlement activity</div>
            <Badge variant="outline" className="text-[10px]">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Live
            </Badge>
          </div>
          <ol className="relative space-y-4 border-l border-border pl-4">
            {activity.map((r) => (
              <li key={r.id} className="relative">
                <span className="absolute -left-[21px] top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-background ring-2 ring-accent" />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {r.id} · {r.invoiceNumber}
                    </div>
                    <div className="truncate text-sm font-medium">{r.buyer}</div>
                    <div className="text-[11px] text-muted-foreground">{r.updated}</div>
                  </div>
                  <Badge className={`${STATUS_TONE[r.status]} shrink-0 text-[10px]`}>{r.status}</Badge>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border bg-card/60 p-4 text-xs text-muted-foreground backdrop-blur">
        You only see your own buyers, invoices, payment requests, documents, messages, FX quotes, RMB wallet, and settlement status.
      </div>
    </div>
  );
}
