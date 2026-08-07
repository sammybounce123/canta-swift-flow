import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  Lock,
  Sparkles,
  Info,
  Wallet,
  Send,
  PartyPopper,
  CheckCircle2,
  Plane,
  Loader2,
  ArrowRight,
  Building2,
  UserPlus,
  Users,
  ChevronLeft,
  Paperclip,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { fxHistory, beneficiaries, fmtMoney } from "@/lib/mock";
import { addTransaction } from "@/lib/tx-store";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { useActions } from "@/components/actions-context";

export const Route = createFileRoute("/fx")({
  head: () => ({ meta: [{ title: "FX / Convert — Canta" }] }),
  component: FX,
});

type Beneficiary = (typeof beneficiaries)[number];

function FX() {
  const navigate = useNavigate();
  const { openConvert, openSend } = useActions();
  const [from, setFrom] = useState("NGN");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("50000000");
  const [rate, setRate] = useState(0.00062);
  const [timer, setTimer] = useState(30);
  const [phase, setPhase] = useState<"convert" | "beneficiary" | "tracking">("convert");
  const [pendingConversion, setPendingConversion] = useState<{
    sendAmt: number;
    from: string;
    to: string;
    out: number;
    rate: number;
  } | null>(null);
  const [chosenBeneficiary, setChosenBeneficiary] = useState<Beneficiary | null>(null);

  useEffect(() => {
    const i = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 30)), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (timer === 30) setRate(+(0.00062 + (Math.random() - 0.5) * 0.00001).toFixed(7));
  }, [timer]);

  const num = Number(amount) || 0;
  const out = num * rate;

  const requestConfirm = () => {
    if (num <= 0) return toast.error("Enter an amount to convert");
    if (from === to) return toast.error("Choose two different wallets");
    setConfirmOpen(true);
  };

  const confirm = () => {
    if (num <= 0) return toast.error("Enter an amount to convert");
    if (from === to) return toast.error("Choose two different wallets");
    addTransaction({
      type: "FX Conversion",
      desc: `${from} → ${to} · Received ${fmtMoney(out, to)}`,
      amount: num,
      ccy: from,
      status: "Completed",
    });
    toast.success("Conversion settled", {
      description: `${fmtMoney(num, from)} → ${fmtMoney(out, to)} · Funds are in your ${to} wallet.`,
    });
    setConfirmOpen(false);
    setPendingConversion(null);
    setChosenBeneficiary(null);
    setPhase("convert");
    navigate({ to: "/transactions" });
  };



  if (phase === "beneficiary" && pendingConversion) {
    return (
      <BeneficiaryStep
        conversion={pendingConversion}
        onBack={() => setPhase("convert")}
        onContinue={(ben) => {
          setChosenBeneficiary(ben);
          setPhase("tracking");
        }}
      />
    );
  }

  if (phase === "tracking" && pendingConversion && chosenBeneficiary) {
    return (
      <ConversionTracker
        {...pendingConversion}
        beneficiary={chosenBeneficiary}
        onDone={() => {
          addTransaction({
            type: "FX Conversion",
            desc: `${pendingConversion.from} → ${pendingConversion.to} · ${chosenBeneficiary.name}`,
            amount: pendingConversion.sendAmt,
            ccy: pendingConversion.from,
            status: "Completed",
          });
          toast.success("Beneficiary credited", {
            description: `${fmtMoney(pendingConversion.out, pendingConversion.to)} delivered to ${chosenBeneficiary.name}.`,
          });
          navigate({ to: "/transactions" });
        }}
        onBack={() => setPhase("beneficiary")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="FX rates are indicative and confirmed at settlement."
      />
      <div>
        <h1 className="text-2xl font-semibold">FX / Convert</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Convert between currencies at the best available rate.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => openConvert("NGN", "USD")}>Convert</Button>
          <Button variant="outline" onClick={() => openSend()}>
            Convert &amp; Send
          </Button>
        </div>
        <div className="mt-2 grid gap-1 text-[11px] text-muted-foreground">
          <span>
            <strong className="text-foreground">Convert</strong> — move money between your Canta
            wallets. No recipient needed.
          </span>
          <span>
            <strong className="text-foreground">Convert &amp; Send</strong> — convert funds and send
            to a supplier or beneficiary after review.
          </span>
        </div>
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
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border focus-within:border-ring">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                style={{ wordBreak: "normal", overflowWrap: "normal" }}
                className="min-w-0 w-full bg-transparent text-2xl font-semibold tabular-nums outline-none"
              />
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-card border border-border rounded-lg px-2 py-1.5 text-sm font-medium"
              >
                <option>NGN</option>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>

            <div className="flex justify-center -my-1 relative z-10">
              <button
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
                className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-elevated hover:bg-primary-glow"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            <label className="text-xs text-muted-foreground">You receive in your {to} wallet</label>
            <div className="grid grid-cols-[1fr_auto] items-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border">
              <div
                style={{ wordBreak: "normal", overflowWrap: "normal" }}
                className="min-w-0 text-2xl font-semibold tabular-nums truncate"
              >
                {out.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-card border border-border rounded-lg px-2 py-1.5 text-sm font-medium"
              >
                <option>USD</option>
                <option>NGN</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent" />
              <span>
                Rate locked · 1 {from} = {rate.toFixed(7)} {to}
              </span>
            </div>
            <span className="text-xs font-mono">{timer}s</span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <Row
              label="Mid-market rate"
              value={`1 ${from} = ${(rate * 1.0008).toFixed(7)} ${to}`}
            />
            <Row label="Canta spread" value="0.08%" />
            <Row label="Transfer fee" value="₦0.00" highlight />
            <Row label="Slippage" value="< 0.05%" />
          </div>

          <Button
            onClick={confirm}
            className="w-full mt-5 bg-accent text-accent-foreground hover:bg-accent/90 h-11 font-semibold"
          >
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
                  domain={["dataMin - 5", "dataMax + 5"]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 258)" }}
                />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="oklch(0.36 0.12 260)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/30 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold">Sample AI output</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Demo signal only — review your live quote and treasury policy before converting.
              </div>
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
      <span className="text-muted-foreground inline-flex items-center gap-1">
        {label} <Info className="h-3 w-3" />
      </span>
      <span className={highlight ? "font-semibold text-success" : "font-medium"}>{value}</span>
    </div>
  );
}

function ConversionTracker({
  sendAmt,
  from,
  to,
  out,
  rate,
  beneficiary,
  onDone,
  onBack,
}: {
  sendAmt: number;
  from: string;
  to: string;
  out: number;
  rate: number;
  beneficiary: (typeof beneficiaries)[number];
  onDone: () => void;
  onBack: () => void;
}) {
  // 0 = funded, 1 = in transit, 2 = received
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 3) return;
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 1600 : 2400);
    return () => clearTimeout(t);
  }, [step]);

  const fundedLabel = from === "NGN" ? "NGN Funded" : `${from} Funded`;
  const steps = [
    {
      key: "funded",
      title: fundedLabel,
      sub: `${fmtMoney(sendAmt, from)} debited and converted at 1 ${from} = ${rate} ${to}.`,
      icon: Wallet,
      tone: "from-primary/20 to-primary/5",
      iconBg: "bg-primary text-primary-foreground",
    },
    {
      key: "transit",
      title: "Your money is on its way",
      sub: `Routing ${fmtMoney(out, to)} to ${beneficiary.name} via ${beneficiary.bank}.`,
      icon: Plane,
      tone: "from-accent/20 to-accent/5",
      iconBg: "bg-accent text-accent-foreground",
    },
    {
      key: "received",
      title: "Your beneficiary has received funding",
      sub: `${fmtMoney(out, to)} settled into ${beneficiary.name} · ${beneficiary.account}.`,
      icon: PartyPopper,
      tone: "from-success/25 to-success/5",
      iconBg: "bg-success text-white",
    },
  ];

  const done = step >= 3;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-1">
        <Badge className="bg-accent/15 text-accent border-accent/30 hover:bg-accent/15">
          Illustrative rates
        </Badge>
        <h1 className="text-2xl font-semibold">Conversion in progress</h1>
        <p className="text-sm text-muted-foreground">
          {fmtMoney(sendAmt, from)} <ArrowRight className="inline h-3.5 w-3.5 mx-1" />{" "}
          {fmtMoney(out, to)} · {beneficiary.name}
        </p>
      </div>

      {/* Visual rail */}
      <Card className="p-6 shadow-elevated overflow-hidden relative">
        <div className="grid grid-cols-3 gap-4 relative">
          {/* progress line */}
          <div className="absolute top-7 left-[16%] right-[16%] h-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-success transition-all duration-700"
              style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
            />
          </div>

          {steps.map((s, idx) => {
            const isDone = step > idx;
            const isActive = step === idx;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`h-14 w-14 rounded-full grid place-items-center shadow-elevated transition-all duration-500 ${
                    isDone
                      ? s.iconBg
                      : isActive
                        ? s.iconBg + " animate-pulse"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                </div>
                <div className="mt-3 text-sm font-semibold">{s.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">{s.sub}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active step card with rich assets */}
      <Card
        className={`p-6 shadow-card bg-gradient-to-br ${steps[Math.min(step, 2)].tone} border-2 ${done ? "border-success/40" : "border-accent/30"} animate-scale-in`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${done ? "bg-success text-white" : steps[Math.min(step, 2)].iconBg}`}
          >
            {done ? (
              <PartyPopper className="h-6 w-6" />
            ) : (
              (() => {
                const I = steps[Math.min(step, 2)].icon;
                return <I className="h-6 w-6" />;
              })()
            )}
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold">
              {done ? "Funds delivered" : steps[Math.min(step, 2)].title}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {steps[Math.min(step, 2)].sub}
            </div>
          </div>
          {!done && <Loader2 className="h-5 w-5 animate-spin text-accent" />}
          {done && <CheckCircle2 className="h-6 w-6 text-success" />}
        </div>

        {/* Money trail */}
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="p-3 rounded-xl bg-card border border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Your {from} Wallet</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {fmtMoney(sendAmt, from)}
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-10 w-10 grid place-items-center">
            <Send className={`h-5 w-5 text-accent ${step === 1 ? "animate-pulse" : ""}`} />
          </div>

          <div className="p-3 rounded-xl bg-card border border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">To</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-8 w-8 rounded-lg bg-success/10 text-success grid place-items-center">
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{beneficiary.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {beneficiary.bank} · {fmtMoney(out, to)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={!done}>
          New conversion
        </Button>
        <Button
          onClick={onDone}
          disabled={!done}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {done ? "View in Transactions" : "Tracking…"}
        </Button>
      </div>
    </div>
  );
}

function BeneficiaryStep({
  conversion,
  onBack,
  onContinue,
}: {
  conversion: { sendAmt: number; from: string; to: string; out: number; rate: number };
  onBack: () => void;
  onContinue: (b: Beneficiary) => void;
}) {
  const [mode, setMode] = useState<"pick" | "new">("pick");
  const [selected, setSelected] = useState<string>(beneficiaries[0].name);

  // New beneficiary fields
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [country, setCountry] = useState("");
  const [narration, setNarration] = useState("");
  const [doc, setDoc] = useState<File | null>(null);

  const proceed = () => {
    if (mode === "pick") {
      const b = beneficiaries.find((x) => x.name === selected) ?? beneficiaries[0];
      onContinue(b);
    } else {
      if (!name || !bank || !account) {
        toast.error("Please complete the beneficiary details");
        return;
      }
      onContinue({
        name,
        bank,
        account,
        country: country || "—",
        ccy: conversion.to,
      } as Beneficiary);
      toast.success("Beneficiary saved");
    }
  };

  return (
    <div className="animate-fade-in pb-24">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-accent/15 text-accent border-accent/30 hover:bg-accent/15">
              Step 2 of 3
            </Badge>
            <h1 className="text-2xl font-semibold mt-1">Who is receiving the funds?</h1>
            <p className="text-sm text-muted-foreground">
              Converting {fmtMoney(conversion.sendAmt, conversion.from)}{" "}
              <ArrowRight className="inline h-3 w-3 mx-1" />
              {fmtMoney(conversion.out, conversion.to)} at locked rate {conversion.rate}.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("pick")}
            className={`p-4 rounded-xl border-2 text-left transition ${mode === "pick" ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
          >
            <Users className="h-5 w-5 text-accent mb-2" />
            <div className="text-sm font-semibold">Saved beneficiary</div>
            <div className="text-xs text-muted-foreground">Pick from your verified list</div>
          </button>
          <button
            onClick={() => setMode("new")}
            className={`p-4 rounded-xl border-2 text-left transition ${mode === "new" ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
          >
            <UserPlus className="h-5 w-5 text-accent mb-2" />
            <div className="text-sm font-semibold">Add new beneficiary</div>
            <div className="text-xs text-muted-foreground">One-time or save for next time</div>
          </button>
        </div>

        <Card className="p-6 shadow-card">
          {mode === "pick" ? (
            <div className="space-y-2">
              {beneficiaries.map((b) => (
                <button
                  key={b.name}
                  onClick={() => setSelected(b.name)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition ${selected === b.name ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{b.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {b.bank} · {b.account} · {b.country}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {b.ccy}
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Beneficiary name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Trading Ltd"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Bank name</Label>
                <Input
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  placeholder="e.g. HSBC"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Account number / IBAN</Label>
                <Input
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="GB00 …"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Country</Label>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United Kingdom"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Receive currency</Label>
                <Input value={conversion.to} disabled className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Narration / purpose of payment</Label>
                <Textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  placeholder="Invoice payment, supplier settlement…"
                  className="mt-1 min-h-20"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Supporting document (optional)</Label>
                <label className="mt-1 flex items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-accent cursor-pointer">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground flex-1">
                    {doc ? doc.name : "Attach invoice, contract or KYC proof"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block min-w-0 truncate">
            Sending{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {fmtMoney(conversion.out, conversion.to)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {mode === "pick" ? selected : name || "new beneficiary"}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button
              onClick={proceed}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Continue to transfer <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
