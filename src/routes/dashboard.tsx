import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowLeftRight,
  Send,
  Sparkles,
  Wallet as WalletIcon,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { wallets, transactions, cashFlow, fmtMoney, fmtNGN } from "@/lib/mock";
import { StatusPill } from "@/components/StatusPill";
import { useActions } from "@/components/ActionsProvider";
import { useRole } from "@/components/RoleProvider";
import { useMode } from "@/components/ModeProvider";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, TrendingUp } from "lucide-react";
import { useRequireWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Canta" }] }),
  component: Dashboard,
});

const MASK = "•••••••";

function Dashboard() {
  // Cold start (no chosen workspace) must land on /welcome instead of
  // defaulting to an Enterprise Treasury identity.
  useRequireWorkspace();
  const { openFund, openConvert, openSend } = useActions();
  const { profile, role, can } = useRole();
  const { mode } = useMode();
  const [hidden, setHidden] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(true);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("canta.onboarding.v1");
      if (!raw) {
        setOnboardingDone(false);
        return;
      }
      const parsed = JSON.parse(raw);
      setOnboardingDone(Boolean(parsed?.completedAt));
    } catch {
      setOnboardingDone(false);
    }
  }, []);
  const totalNGN = 2_847_120_000;
  const greet = role === "Viewer" ? "Welcome" : role === "Compliance" ? "Hello" : "Good morning";
  return (
    <div className="space-y-6">
      <Card className="p-4 flex flex-wrap items-center gap-3 justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary font-bold text-xs flex-shrink-0">
            {mode
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{mode} Mode</div>
            <div className="text-xs text-muted-foreground">
              {mode === "Importer"
                ? "Track shipments, documents, suppliers and landed cost."
                : mode === "Supplier"
                  ? "Issue invoices, escrow & global settlement."
                  : mode === "Global Merchant"
                    ? "Collect locally, settle globally."
                    : "Move money, FX, wallets and settlements at enterprise scale."}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "Importer" && (
            <Button asChild size="sm" variant="outline">
              <Link to="/importer">Open Importer Portal</Link>
            </Button>
          )}
          {mode === "Supplier" && (
            <Button asChild size="sm" variant="outline">
              <Link to="/supplier-portal">Open Supplier Portal</Link>
            </Button>
          )}
          {mode === "Global Merchant" && (
            <Button asChild size="sm" variant="outline">
              <Link to="/collections">Open Collections</Link>
            </Button>
          )}
          {mode === "Importer" && (
            <Button asChild size="sm" variant="ghost">
              <Link to="/importer/payments" search={{ tab: "new" }}>
                Pay Supplier
              </Link>
            </Button>
          )}
        </div>
      </Card>
      {!onboardingDone && (
        <Card className="p-4 flex flex-wrap items-center gap-4 justify-between border-accent/40 bg-gradient-to-r from-accent/10 to-transparent shadow-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-accent/20 grid place-items-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Complete your enterprise onboarding</div>
              <div className="text-xs text-muted-foreground">
                Verify your business to unlock institutional FX, higher limits and unlimited
                corridors.
              </div>
            </div>
          </div>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/onboarding">
              Continue onboarding <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </Card>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {greet}, {profile.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "Compliance"
              ? "Review pending approvals and audit recent activity."
              : role === "Viewer"
                ? "Read-only view of treasury activity."
                : `Here's what's happening in your ${mode} workspace today.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setHidden((h) => !h)}>
            {hidden ? <Eye className="h-4 w-4 mr-1.5" /> : <EyeOff className="h-4 w-4 mr-1.5" />}
            {hidden ? "Show balances" : "Hide balances"}
          </Button>
          {(() => {
            const modeLabel: Record<string, string> = {
              "Enterprise Treasury": "Treasury Mode",
              Importer: "Importer Mode",
              Supplier: "Supplier Mode",
              "Canta Ops": "Ops Mode",
              "Global Merchant": "Merchant Mode",
              "Partner Property": "Partner Mode",
            };
            const label = modeLabel[mode] ?? "Workspace Demo";
            return (
              <Badge className="bg-accent/15 text-accent-foreground border border-accent/30 hover:bg-accent/20">
                <Zap className="h-3 w-3 mr-1" /> {label}
              </Badge>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        <Card className="p-5 sm:p-6 bg-gradient-card text-primary-foreground border-none shadow-elevated overflow-hidden relative min-w-0 h-full flex flex-col">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 flex-1">
            <div className="flex flex-col gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60">
                    Total balance
                  </span>
                  <Badge
                    variant="outline"
                    className="h-5 text-[9px] px-1.5 border-white/20 text-primary-foreground/70"
                  >
                    NGN equivalent
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl xl:text-4xl font-semibold tabular-nums tracking-tight mt-1.5 break-words">
                  {hidden ? `₦${MASK}` : fmtNGN(totalNGN)}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 bg-success/20 text-success px-2 py-0.5 rounded-full text-[11px] font-medium">
                  <ArrowUpRight className="h-3 w-3" /> +4.8% this week
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {wallets.map((w) => (
                  <button
                    key={w.ccy}
                    onClick={() => (can("initiate_tx") ? openFund(w.ccy) : undefined)}
                    disabled={!can("initiate_tx")}
                    className="text-left rounded-xl bg-white/5 backdrop-blur border border-white/10 px-3 py-2 hover:bg-white/10 transition disabled:cursor-not-allowed disabled:hover:bg-white/5"
                  >
                    <div className="flex items-center gap-1 text-[9px] text-primary-foreground/60 uppercase tracking-wider">
                      <span className="text-sm leading-none">{w.flag}</span> {w.ccy}
                    </div>
                    <div className="text-xs font-semibold tabular-nums mt-1 truncate">
                      {hidden ? MASK : fmtMoney(w.balance, w.ccy)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            <div>
              <div className="flex justify-between text-[10px] text-primary-foreground/50 uppercase tracking-wider mb-1.5">
                <span>Allocation</span>
                <span>{wallets.length} wallets</span>
              </div>
              <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-white/10">
                {wallets.map((w, i) => {
                  const total = wallets.reduce((s, x) => s + x.balance, 0);
                  const pct = total ? Math.max((w.balance / total) * 100, 1) : 0;
                  return (
                    <div
                      key={w.ccy}
                      className="h-full first:rounded-l-full last:rounded-r-full"
                      style={{ width: `${pct}%`, backgroundColor: `var(--chart-${i + 1})` }}
                    />
                  );
                })}
              </div>
            </div>

            {can("initiate_tx") && mode !== "Supplier" ? (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  onClick={() => openFund("NGN")}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-7 text-[11px] px-2.5"
                >
                  <Plus className="h-3 w-3 mr-1" /> Fund Wallet
                </Button>
                <Button
                  onClick={() => openConvert("NGN", "USD")}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/15 text-primary-foreground border border-white/15 h-7 text-[11px] px-2.5"
                >
                  <ArrowLeftRight className="h-3 w-3 mr-1" /> Convert Currency
                </Button>
                <Button
                  onClick={() => openSend()}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/15 text-primary-foreground border border-white/15 h-7 text-[11px] px-2.5"
                >
                  <Send className="h-3 w-3 mr-1" /> Send Payment
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        {mode === "Supplier" ? (
          <SupplierFxQuoteCard />
        ) : (
          <Card className="p-6 shadow-card h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Illustrative FX rates</div>
              <div className="text-[10px] text-muted-foreground">Demo data</div>
            </div>
            <div className="mt-4 space-y-3 flex-1">
              {[
                { p: "USD/NGN", r: "1,612.45", c: "+0.32%", up: true },
                { p: "EUR/NGN", r: "1,745.10", c: "-0.18%", up: false },
                { p: "GBP/NGN", r: "2,048.77", c: "+0.21%", up: true },
              ].map((r) => (
                <div
                  key={r.p}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <div className="text-sm font-medium">{r.p}</div>
                    <div className="text-[11px] text-muted-foreground">Mid-market</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums">{r.r}</div>
                    <div
                      className={`text-[11px] flex items-center gap-0.5 justify-end ${r.up ? "text-success" : "text-destructive"}`}
                    >
                      {r.up ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {r.c}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-auto pt-0">
              <Link to="/fx">Open Exchange</Link>
            </Button>
          </Card>
        )}
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
                <button
                  key={p}
                  className={`px-2.5 py-1 rounded-md ${i === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  {p}
                </button>
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.01 250)"
                  vertical={false}
                />
                <XAxis
                  dataKey="d"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.01 250)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stroke="oklch(0.78 0.16 175)"
                  strokeWidth={2}
                  fill="url(#g1)"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stroke="oklch(0.36 0.12 260)"
                  strokeWidth={2}
                  fill="url(#g2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-accent/20 grid place-items-center">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div className="text-sm font-semibold">AI Insight</div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Sample AI output
            </Badge>
          </div>
          <p className="mt-4 text-base font-medium leading-snug">
            FX movement may affect this payment window.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Review the quote expiry before sending the buyer link, and consider converting export
            proceeds within your usual treasury cadence.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="text-[10px]">
              Demo insight · not financial advice
            </Badge>
          </div>
          <Button
            onClick={() => openConvert("NGN", "USD")}
            disabled={!can("initiate_tx")}
            className="w-full mt-5 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {can("initiate_tx") ? "Open converter" : "Insight only · no permission"}
          </Button>
        </Card>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div>
            <div className="text-sm font-semibold">Recent transactions</div>
            <div className="text-xs text-muted-foreground">Last 24 hours</div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/transactions">View all</Link>
          </Button>
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
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold">
                    {hidden ? MASK : fmtMoney(t.amount, t.ccy)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={t.status} />
                  </td>
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
            <div className="text-xs text-muted-foreground">Sample routing output · Demo data</div>
          </div>
        </div>
        <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/15">
          Settlement tracking
        </Badge>
      </Card>
    </div>
  );
}

const FX_PAIRS = [
  { from: "USD", to: "NGN", rate: 1612.45, flag: "🇺🇸" },
  { from: "RMB", to: "NGN", rate: 223.18, flag: "🇨🇳" },
  { from: "EUR", to: "NGN", rate: 1745.1, flag: "🇪🇺" },
  { from: "GBP", to: "NGN", rate: 2048.77, flag: "🇬🇧" },
];

const DEFAULT_BUYERS = [
  "Lagos Trading Co.",
  "Accra Imports Ltd.",
  "Nairobi Wholesale",
  "Cairo Distributors",
];

function SupplierFxQuoteCard() {
  const navigate = useNavigate();
  const [pairKey, setPairKey] = useState("USD-NGN");
  const [amount, setAmount] = useState("10000");
  const [buyers, setBuyers] = useState<string[]>(DEFAULT_BUYERS);
  const [buyer, setBuyer] = useState(DEFAULT_BUYERS[0]);
  const [addingBuyer, setAddingBuyer] = useState(false);
  const [newBuyer, setNewBuyer] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("canta.buyers");
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length) {
          const merged = Array.from(new Set([...parsed, ...DEFAULT_BUYERS]));
          setBuyers(merged);
          setBuyer(parsed[0] ?? DEFAULT_BUYERS[0]);
        }
      }
    } catch {}
  }, []);

  function saveBuyers(next: string[]) {
    setBuyers(next);
    try {
      window.localStorage.setItem("canta.buyers", JSON.stringify(next));
    } catch {}
  }

  function confirmAddBuyer() {
    const name = newBuyer.trim();
    if (!name) {
      toast.error("Enter a buyer name");
      return;
    }
    if (buyers.includes(name)) {
      toast.error("Buyer already exists");
      setBuyer(name);
      setAddingBuyer(false);
      setNewBuyer("");
      return;
    }
    const next = [name, ...buyers];
    saveBuyers(next);
    setBuyer(name);
    setNewBuyer("");
    setAddingBuyer(false);
    toast.success(`Added buyer ${name}`);
  }

  const pair = useMemo(() => {
    const [from, to] = pairKey.split("-");
    return FX_PAIRS.find((p) => p.from === from && p.to === to) ?? FX_PAIRS[0];
  }, [pairKey]);

  const amt = Number(amount.replace(/,/g, "")) || 0;
  const converted = amt * pair.rate;
  const expiresIn = "15:00";

  function generateInvoice() {
    if (!amt) {
      toast.error("Enter an amount");
      return;
    }
    if (!buyer.trim()) {
      toast.error("Enter buyer name");
      return;
    }
    const quote = {
      id: `Q-${Math.floor(1000 + Math.random() * 9000)}`,
      buyer: buyer.trim(),
      from: pair.from,
      to: pair.to,
      rate: pair.rate,
      amount: amt,
      converted,
      createdAt: new Date().toISOString(),
    };
    try {
      window.sessionStorage.setItem("canta.fx.quote", JSON.stringify(quote));
    } catch {}
    toast.success(
      `Invoice draft prepared at ${pair.from}/${pair.to} = ${pair.rate.toLocaleString()}`,
    );
    navigate({ to: "/supplier-portal/invoices" });
  }

  return (
    <Card className="p-6 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent/20 grid place-items-center">
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <div>
            <div className="text-sm font-semibold">FX Quote</div>
            <div className="text-[11px] text-muted-foreground">
              Illustrative rate · expires in {expiresIn}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse mr-1 inline-block" />{" "}
          Live
        </Badge>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <Label className="text-xs">Currency pair</Label>
          <Select value={pairKey} onValueChange={setPairKey}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FX_PAIRS.map((p) => (
                <SelectItem key={`${p.from}-${p.to}`} value={`${p.from}-${p.to}`}>
                  {p.flag} {p.from}/{p.to} · {p.rate.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Amount ({pair.from})</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="mt-1 tabular-nums"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Buyer</Label>
              {!addingBuyer && (
                <button
                  type="button"
                  onClick={() => setAddingBuyer(true)}
                  className="text-[11px] text-accent hover:underline inline-flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> New
                </button>
              )}
            </div>
            {addingBuyer ? (
              <div className="mt-1 flex gap-1">
                <Input
                  value={newBuyer}
                  onChange={(e) => setNewBuyer(e.target.value)}
                  placeholder="Buyer name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmAddBuyer();
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={confirmAddBuyer}>
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAddingBuyer(false);
                    setNewBuyer("");
                  }}
                >
                  ×
                </Button>
              </div>
            ) : (
              <Select value={buyer} onValueChange={setBuyer}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="text-[11px] text-muted-foreground">Buyer pays ({pair.to})</div>
          <div className="text-lg font-semibold tabular-nums mt-0.5">
            {converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {pair.to}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            @ {pair.rate.toLocaleString()} {pair.from}/{pair.to}
          </div>
        </div>
      </div>

      <Button
        onClick={generateInvoice}
        className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <FileText className="h-4 w-4 mr-1.5" /> Generate invoice with this quote
      </Button>
    </Card>
  );
}
