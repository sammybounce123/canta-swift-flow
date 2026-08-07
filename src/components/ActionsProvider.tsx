import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Coins,
  Zap,
  ArrowDown,
  Lock,
  CheckCircle2,
  Upload,
  CalendarClock,
  Trash2,
  Plus,
  Paperclip,
  UserPlus,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Copy,
  Landmark,
  Wallet,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { beneficiaries, fmtMoney } from "@/lib/mock";
import { addTransaction } from "@/lib/tx-store";
import { ngnRateOf, fmtAnyCcy, WALLET_CCYS, GLOBAL_SEND_CCYS } from "@/lib/importer-store";
import { useRole } from "@/components/RoleProvider";
import { ActionsContext, type ActionsContextValue } from "@/components/actions-context";

const COUNTRIES = [
  { code: "US", name: "United States", ccy: "USD" },
  { code: "GB", name: "United Kingdom", ccy: "GBP" },
  { code: "FR", name: "France", ccy: "EUR" },
  { code: "DE", name: "Germany", ccy: "EUR" },
  { code: "NL", name: "Netherlands", ccy: "EUR" },
  { code: "NG", name: "Nigeria", ccy: "NGN" },
  { code: "ZA", name: "South Africa", ccy: "ZAR" },
  { code: "AE", name: "United Arab Emirates", ccy: "AED" },
  { code: "CN", name: "China", ccy: "CNY" },
  { code: "IN", name: "India", ccy: "INR" },
];
const CURRENCIES = ["USD", "GBP", "EUR", "NGN", "ZAR", "AED", "CNY", "INR"];

export function ActionsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [fund, setFund] = useState<{ open: boolean; ccy: string }>({ open: false, ccy: "NGN" });
  const [conv, setConv] = useState<{ open: boolean; from: string; to: string }>({
    open: false,
    from: "NGN",
    to: "USD",
  });
  const [send, setSend] = useState<{ open: boolean; beneficiary: string }>({
    open: false,
    beneficiary: "",
  });
  const [addBen, setAddBen] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [invite, setInvite] = useState(false);

  const ctx: ActionsContextValue = {
    openFund: (ccy = "NGN") => setFund({ open: true, ccy }),
    openConvert: (from = "NGN", to = "USD") => setConv({ open: true, from, to }),
    openSend: (beneficiary = "") => setSend({ open: true, beneficiary }),
    openAddBeneficiary: () => setAddBen(true),
    openSchedule: () => setSchedule(true),
    openBulk: () => setBulk(true),
    openInvite: () => setInvite(true),
  };

  return (
    <ActionsContext.Provider value={ctx}>
      {children}

      {/* FUND */}
      <Dialog open={fund.open} onOpenChange={(o) => setFund((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fund {fund.ccy} Wallet</DialogTitle>
            <DialogDescription>Choose a funding method to top up your wallet.</DialogDescription>
          </DialogHeader>
          <FundForm
            ccy={fund.ccy}
            onConfirm={(amount, method) => {
              setFund((s) => ({ ...s, open: false }));
              addTransaction({
                type: "Funding",
                desc: `${method} inflow · ${fund.ccy} wallet`,
                amount,
                ccy: fund.ccy,
                status: "Completed",
              });
              toast.success(`${method} confirmed`, {
                description: `${fmtMoney(amount, fund.ccy)} credited to your ${fund.ccy} wallet.`,
                icon: <CheckCircle2 className="h-4 w-4" />,
              });
              navigate({ to: "/transactions" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* CONVERT */}
      <Dialog open={conv.open} onOpenChange={(o) => setConv((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert</DialogTitle>
            <DialogDescription>
              Move money between your Canta wallets. No recipient needed.
            </DialogDescription>
          </DialogHeader>
          <ConvertForm
            from={conv.from}
            to={conv.to}
            onConfirm={(amt, from, to, received) => {
              setConv((s) => ({ ...s, open: false }));
              addTransaction({
                type: "FX Conversion",
                desc: `${from} → ${to} · Received ${fmtMoney(received, to)}`,
                amount: amt,
                ccy: from,
                status: "Completed",
              });
              toast.success("Conversion settled", {
                description: `${fmtMoney(amt, from)} → ${fmtMoney(received, to)} · Funds in your ${to} wallet.`,
                icon: <CheckCircle2 className="h-4 w-4" />,
              });
              navigate({ to: "/transactions" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* SEND */}
      <Dialog open={send.open} onOpenChange={(o) => setSend((s) => ({ ...s, open: o }))}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto">

          <DialogHeader>
            <DialogTitle>Convert &amp; Send</DialogTitle>
            <DialogDescription>
              Convert funds and send to a supplier or beneficiary after review.
            </DialogDescription>
          </DialogHeader>
          <SendForm
            initialBeneficiary={send.beneficiary}
            onAddBeneficiary={() => {
              setSend((s) => ({ ...s, open: false }));
              setAddBen(true);
            }}
            onConfirm={(amt, ccy, name, ref) => {
              setSend((s) => ({ ...s, open: false }));
              addTransaction({
                type: "Outgoing",
                desc: `${name}${ref ? ` · ${ref}` : ""}`,
                amount: amt,
                ccy,
                status: "Completed",
              });
              toast.success("Payment sent", {
                description: `${fmtMoney(amt, ccy)} to ${name}. Best corridor selected.`,
                icon: <CheckCircle2 className="h-4 w-4" />,
              });
              navigate({ to: "/transactions" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* ADD BENEFICIARY */}
      <Dialog open={addBen} onOpenChange={setAddBen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Beneficiary</DialogTitle>
            <DialogDescription>Save a recipient for fast, validated payments.</DialogDescription>
          </DialogHeader>
          <AddBeneficiaryForm onClose={() => setAddBen(false)} />
        </DialogContent>
      </Dialog>

      {/* SCHEDULE CONVERSION */}
      <Dialog open={schedule} onOpenChange={setSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Conversion</DialogTitle>
            <DialogDescription>
              Auto-convert when your target rate or date is hit.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            onClose={() => {
              setSchedule(false);
              navigate({ to: "/transactions" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* BULK PAYMENTS */}
      <Dialog open={bulk} onOpenChange={setBulk}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Payments</DialogTitle>
            <DialogDescription>Pay multiple beneficiaries in a single batch run.</DialogDescription>
          </DialogHeader>
          <BulkPaymentsForm
            onClose={() => {
              setBulk(false);
              navigate({ to: "/transactions" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* INVITE MEMBER */}
      <Dialog open={invite} onOpenChange={setInvite}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send a secure invite with role-based permissions.</DialogDescription>
          </DialogHeader>
          <InviteForm onClose={() => setInvite(false)} />
        </DialogContent>
      </Dialog>
    </ActionsContext.Provider>
  );
}

// Shared multi-step "fund flow" visualisation used by Convert + Send + Fund
// so the user can actually watch money move from debit → corridor → credit
// before the transaction lands on /transactions.
function FundFlow({
  steps,
  onDone,
}: {
  steps: { label: string; sub: string }[];
  onDone: () => void;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((x) => x + 1), 900);
    return () => clearTimeout(t);
  }, [i, steps.length, onDone]);
  return (
    <div className="space-y-3 py-2">
      {steps.map((s, idx) => {
        const done = idx < i;
        const active = idx === i;
        return (
          <div
            key={s.label}
            className={`flex items-start gap-3 p-3 rounded-xl border ${done ? "border-success/40 bg-success/5" : active ? "border-accent/40 bg-accent/5" : "border-border bg-secondary/30 opacity-60"}`}
          >
            <div className="mt-0.5 h-7 w-7 grid place-items-center rounded-full bg-card border border-border">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
              ) : (
                <span className="text-xs">{idx + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          </div>
        );
      })}
      <div className="text-xs text-muted-foreground text-center pt-1">
        {i >= steps.length
          ? "Funds successfully credited. Redirecting…"
          : "Do not close this window — settling on the corridor."}
      </div>
    </div>
  );
}

const FUNDING_CCYS = ["NGN", "USDT"] as const;
type FundingCcy = (typeof FUNDING_CCYS)[number];

/** Converts the funded NGN/USDT amount into the destination wallet currency. */
function FundFxQuote({
  fundCcy,
  target,
  amount,
}: {
  fundCcy: FundingCcy;
  target: string;
  amount: number;
}) {
  const ngnAmount = amount * ngnRateOf(fundCcy);
  const rate = ngnRateOf(fundCcy) / ngnRateOf(target);
  const receive = ngnAmount / ngnRateOf(target);

  return (
    <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">FX quote</div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          Illustrative rates
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Indicative rate</span>
        <span className="font-medium tabular-nums">
          1 {fundCcy} = {rate >= 1 ? rate.toFixed(2) : rate.toFixed(6)} {target}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {fmtAnyCcy(amount, fundCcy)} credits approximately
        </span>
        <span className="font-semibold tabular-nums">{fmtAnyCcy(receive, target)}</span>
      </div>
      {fundCcy !== target && (
        <div className="text-[11px] text-muted-foreground">
          Funding is accepted in NGN or USDT only; the balance is converted to {target} on credit.
        </div>
      )}
    </div>
  );
}

function FundForm({
  ccy,
  onConfirm,
}: {
  ccy: string;
  onConfirm: (amount: number, method: string) => void;
}) {
  const { profile } = useRole();
  const [fundCcy, setFundCcy] = useState<FundingCcy>(ccy === "USDT" ? "USDT" : "NGN");
  const [target, setTarget] = useState<string>(ccy);
  const [amount, setAmount] = useState(ccy === "USDT" ? "1000" : "1000000");
  const [method, setMethod] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "vaccount" | "tracker">("form");
  const amt = Number(amount.replace(/,/g, "")) || 0;
  const credited = (amt * ngnRateOf(fundCcy)) / ngnRateOf(ccy);

  if (stage === "tracker" && method) {
    return (
      <FundTracker
        ccy={ccy}
        amount={credited}
        method={method}
        accountName={profile.name}
        onDone={() => onConfirm(credited, method)}
      />
    );
  }

  if (stage === "vaccount" && method === "Bank Transfer") {
    return (
      <VirtualAccountPanel
        ccy={fundCcy}
        amount={amt}
        accountName={profile.name}
        onBack={() => {
          setStage("form");
          setMethod(null);
        }}
        onPaid={() => setStage("tracker")}
      />
    );
  }

  const methods =
    fundCcy === "NGN"
      ? [
          {
            icon: Building,
            label: "Bank Transfer",
            desc: "Free · NGN virtual account in your name",
            rec: true,
          },
        ]
      : [
          {
            icon: Coins,
            label: "USDT (TRC20 / ERC20)",
            desc: "Stablecoin deposit · Converted on credit",
            rec: true,
          },
        ];

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Fund with</Label>
        <Select value={fundCcy} onValueChange={(v) => setFundCcy(v as FundingCcy)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FUNDING_CCYS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Funding is only available in NGN or USDT.
        </div>
      </div>
      <div>
        <Label className="text-xs">Amount ({fundCcy})</Label>
        <Input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
          className="mt-1 text-lg font-semibold tabular-nums"
        />
        <div className="mt-1 text-[11px] text-muted-foreground">
          Funding as <span className="font-medium text-foreground">{profile.name}</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Quote against</Label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GLOBAL_SEND_CCYS.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.code} · {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <FundFxQuote fundCcy={fundCcy} target={target} amount={amt} />
      <div className="space-y-2">
        {methods.map((o) => (
          <button
            key={o.label}
            disabled={amt <= 0}
            className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-secondary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setMethod(o.label);
              setStage(o.label === "Bank Transfer" ? "vaccount" : "tracker");
            }}
          >
            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center shrink-0">
              <o.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{o.label}</div>
              <div className="text-xs text-muted-foreground">{o.desc}</div>
            </div>
            {o.rec && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground shrink-0">
                Recommended
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function VirtualAccountPanel({
  ccy,
  amount,
  accountName,
  onBack,
  onPaid,
}: {
  ccy: string;
  amount: number;
  accountName: string;
  onBack: () => void;
  onPaid: () => void;
}) {
  // Deterministic-ish mock account number per session
  const acct = useMemo(() => {
    const seed = `${accountName}-${ccy}`.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = (9000000000 + ((seed * 314159) % 999999999)).toString().slice(0, 10);
    return base;
  }, [accountName, ccy]);
  const reference = useMemo(
    () => `CNT-${ccy}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    [ccy],
  );
  const bank =
    ccy === "NGN"
      ? "Canta MFB · Wema Bank (sponsor)"
      : ccy === "USD"
        ? "Canta Trust · Bank of America"
        : ccy === "EUR"
          ? "Canta EU · Modulr (SEPA)"
          : ccy === "GBP"
            ? "Canta UK · ClearBank (Faster Payments)"
            : "Canta Global Settlement";
  const expires = useMemo(() => {
    const d = new Date(Date.now() + 30 * 60 * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const copyAll = () => {
    const txt = `Account name: ${accountName}\nBank: ${bank}\nAccount number: ${acct}\nReference: ${reference}\nAmount: ${fmtMoney(amount, ccy)}`;
    navigator.clipboard?.writeText(txt);
    toast.success("Account details copied");
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back
      </button>

      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-5 shadow-card relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Send exactly
              </div>
              <div className="text-2xl font-semibold tabular-nums mt-0.5">
                {fmtMoney(amount, ccy)}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-accent/20 grid place-items-center shrink-0">
              <Landmark className="h-5 w-5 text-accent" />
            </div>
          </div>

          <div className="space-y-2.5">
            <AcctRow label="Account name" value={accountName} />
            <AcctRow label="Bank" value={bank} />
            <AcctRow label="Account number" value={acct} mono copy />
            <AcctRow label="Reference (required)" value={reference} mono copy highlight />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3 w-3" /> Dedicated to your account
            </span>
            <span>Expires {expires}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
        Transfer from any bank app. We'll detect the inflow automatically using your reference and
        credit your {ccy} wallet.
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copyAll} className="flex-1">
          <Copy className="h-4 w-4 mr-1.5" /> Copy details
        </Button>
        <Button onClick={onPaid} className="flex-1 bg-primary">
          I've sent the funds <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

function AcctRow({
  label,
  value,
  mono,
  copy,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${highlight ? "bg-accent/10 border border-accent/30" : "bg-card/60 border border-border"}`}
    >
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`text-sm font-semibold truncate ${mono ? "tabular-nums" : ""}`}>
          {value}
        </div>
      </div>
      {copy && (
        <button
          onClick={() => {
            navigator.clipboard?.writeText(value);
            toast.success(`${label} copied`);
          }}
          className="shrink-0 h-7 w-7 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function FundTracker({
  ccy,
  amount,
  method,
  accountName,
  onDone,
}: {
  ccy: string;
  amount: number;
  method: string;
  accountName: string;
  onDone: () => void;
}) {
  const nodes =
    method === "USDT (TRC20 / ERC20)"
      ? [
          { icon: UserIcon, label: "Your wallet", sub: accountName },
          { icon: Coins, label: "Blockchain", sub: "TRC20 confirmation" },
          { icon: Landmark, label: "Canta Vault", sub: "Auto-converted" },
          { icon: Wallet, label: `${ccy} Wallet`, sub: fmtMoney(amount, ccy) },
        ]
      : method === "Bank Transfer"
        ? [
            { icon: UserIcon, label: accountName.split(" ")[0], sub: "Sender" },
            { icon: Building, label: "Your Bank", sub: "Outbound transfer" },
            { icon: Landmark, label: "Canta Vault", sub: "Funds received" },
            { icon: Wallet, label: `${ccy} Wallet`, sub: fmtMoney(amount, ccy) },
          ]
        : [
            { icon: UserIcon, label: "Buyer", sub: "Card / wallet" },
            { icon: Zap, label: "Inline auth", sub: "No pre-funding" },
            { icon: Landmark, label: "Canta Vault", sub: "Fronted" },
            { icon: Wallet, label: `${ccy} Wallet`, sub: fmtMoney(amount, ccy) },
          ];

  const steps =
    method === "USDT (TRC20 / ERC20)"
      ? [
          { label: "Deposit detected", sub: "TRC20 confirmation received" },
          { label: `Auto-converted to ${ccy}`, sub: "Mid-market rate, zero spread" },
          { label: `${fmtMoney(amount, ccy)} credited`, sub: `Available in your ${ccy} wallet` },
        ]
      : method === "Bank Transfer"
        ? [
            { label: "Awaiting bank inflow", sub: "Matching reference automatically" },
            { label: "Funds received by Canta", sub: "Cleared on fast settlement rail" },
            { label: `${fmtMoney(amount, ccy)} credited`, sub: `Available in your ${ccy} wallet` },
          ]
        : [
            { label: "Inline payment authorised", sub: "Buyer card / wallet captured" },
            { label: "Auto-routed to beneficiary", sub: "No pre-funding required" },
            { label: "Settlement booked", sub: `${fmtMoney(amount, ccy)} fronted by Canta` },
          ];

  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setI((x) => x + 1), 1200);
    return () => clearTimeout(t);
  }, [i, steps.length, onDone]);

  // progress = how far the moving dot has advanced across the node row
  const totalSegments = nodes.length - 1;
  const progress = Math.min(i / steps.length, 1) * totalSegments; // in segments

  return (
    <div className="space-y-5 py-1">
      {/* Horizontal node tracker */}
      <div className="relative px-1">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}
        >
          {nodes.map((n, idx) => {
            const reached = idx <= Math.ceil(progress);
            const active = idx === Math.ceil(progress) && i < steps.length;
            return (
              <div key={n.label} className="flex flex-col items-center text-center gap-1.5">
                <div
                  className={`h-12 w-12 rounded-2xl grid place-items-center border-2 transition-all duration-500 ${
                    reached
                      ? active
                        ? "bg-accent text-accent-foreground border-accent shadow-glow scale-110"
                        : "bg-success/15 text-success border-success/50"
                      : "bg-secondary/40 text-muted-foreground border-border"
                  }`}
                >
                  <n.icon className="h-5 w-5" />
                </div>
                <div className="text-[11px] font-semibold leading-tight">{n.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight truncate max-w-full">
                  {n.sub}
                </div>
              </div>
            );
          })}
        </div>
        {/* connecting track */}
        <div className="pointer-events-none absolute left-0 right-0 top-6 -z-10 px-[12.5%]">
          <div className="relative h-1 bg-border rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-success via-accent to-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${(progress / totalSegments) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((s, idx) => {
          const done = idx < i;
          const active = idx === i;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                done
                  ? "border-success/30 bg-success/5"
                  : active
                    ? "border-accent/40 bg-accent/5"
                    : "border-border bg-secondary/20 opacity-60"
              }`}
            >
              <div className="h-7 w-7 grid place-items-center rounded-full bg-card border border-border shrink-0">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                ) : (
                  <span className="text-[11px] text-muted-foreground">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{s.label}</div>
                <div className="text-xs text-muted-foreground truncate">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {i >= steps.length
          ? "Funds credited successfully — redirecting…"
          : "Tracking your transfer in real time. You can safely close this; we'll notify you when it lands."}
      </div>
    </div>
  );
}

function ConvertForm({
  from: f0,
  to: t0,
  onConfirm,
}: {
  from: string;
  to: string;
  onConfirm: (a: number, f: string, t: string, received: number) => void;
}) {
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const [amount, setAmount] = useState("1000000");
  const [confirming, setConfirming] = useState(false);
  const rate = from === "NGN" && to === "USD" ? 0.00062 : 1612.45;
  const sendAmt = Number(amount) || 0;
  const out = sendAmt * rate;
  if (confirming) {
    return (
      <FundFlow
        steps={[
          { label: `Debiting ${fmtMoney(sendAmt, from)}`, sub: `From your ${from} wallet` },
          { label: "Executing FX at locked rate", sub: `1 ${from} = ${rate} ${to}` },
          { label: `Crediting ${fmtMoney(out, to)}`, sub: `Into your ${to} wallet` },
        ]}
        onDone={() => onConfirm(sendAmt, from, to, out)}
      />
    );
  }
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">You convert (from wallet)</Label>
        <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border mt-1">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="flex-1 bg-transparent text-xl font-semibold tabular-nums outline-none"
          />
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-card border border-border rounded-lg px-2 text-sm"
          >
            <option>NGN</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
          className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
      <div>
        <Label className="text-xs">Destination wallet receives</Label>
        <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border mt-1">
          <div className="flex-1 text-xl font-semibold tabular-nums">
            {out.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-card border border-border rounded-lg px-2 text-sm"
          >
            <option>USD</option>
            <option>NGN</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-xs flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-accent" /> Rate locked · 1 {from} = {rate} {to}
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => setConfirming(true)}
      >
        Confirm Conversion
      </Button>
    </div>
  );
}

function SendForm({
  initialBeneficiary,
  onAddBeneficiary,
  onConfirm,
}: {
  initialBeneficiary: string;
  onAddBeneficiary: () => void;
  onConfirm: (a: number, c: string, n: string, ref: string) => void;
}) {
  const [name, setName] = useState(initialBeneficiary || beneficiaries[0].name);
  const ben = beneficiaries.find((b) => b.name === name) ?? beneficiaries[0];
  const [amount, setAmount] = useState("50000");
  const [reference, setReference] = useState("");
  const [narration, setNarration] = useState("");
  const [doc, setDoc] = useState<File | null>(null);
  const [stage, setStage] = useState<"form" | "review" | "sending">("form");
  const [confirmDetails, setConfirmDetails] = useState(false);
  const [confirmAuth, setConfirmAuth] = useState(false);
  const amt = Number(amount) || 0;
  const [payCcy, setPayCcy] = useState<FundingCcy>("NGN");
  const [quoteCcy, setQuoteCcy] = useState<string>(ben.ccy);
  useEffect(() => {
    setQuoteCcy(ben.ccy);
  }, [ben.ccy]);
  const receiveAmt = (amt * ngnRateOf(payCcy)) / ngnRateOf(quoteCcy);



  if (stage === "sending") {
    return (
      <FundFlow
        steps={[
          { label: `Debiting ${fmtAnyCcy(amt, payCcy)}`, sub: `From your ${payCcy} wallet` },
          { label: "Routing on best corridor", sub: `${ben.country} · ${ben.bank}` },
          {
            label: `Crediting ${ben.name}`,
            sub: `${fmtAnyCcy(receiveAmt, quoteCcy)} · ${ben.account}`,
          },
        ]}
        onDone={() => onConfirm(receiveAmt, quoteCcy, ben.name, reference || narration)}
      />
    );
  }

  if (stage === "review") {
    const rows: [string, string][] = [
      ["Beneficiary", ben.name],
      ["Country", ben.country],
      ["Bank", ben.bank],
      ["Account", ben.account],
      ["You pay", fmtAnyCcy(amt, payCcy)],
      ["Beneficiary receives", fmtAnyCcy(receiveAmt, quoteCcy)],
      ["Reference", reference || "—"],
    ];
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-warning mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-foreground">Verify before you send</div>
            Funds sent to the wrong account often cannot be recovered. Please check every detail
            below.
          </div>
        </div>
        <div className="rounded-xl border divide-y bg-secondary/30">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-4 px-3 py-2 text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right break-all">{v}</span>
            </div>
          ))}
        </div>
        {(!reference || !narration || !doc) && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <span>
              Some fields are empty (
              {[!reference && "reference", !narration && "purpose", !doc && "supporting document"]
                .filter(Boolean)
                .join(", ")}
              ). You can go back and add them, or continue if not required.
            </span>
          </div>
        )}
        <label className="flex items-start gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={confirmDetails}
            onCheckedChange={(v) => setConfirmDetails(Boolean(v))}
            className="mt-0.5"
          />
          <span>
            I have verified the beneficiary name, bank, account number, currency and amount are
            correct.
          </span>
        </label>
        <label className="flex items-start gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={confirmAuth}
            onCheckedChange={(v) => setConfirmAuth(Boolean(v))}
            className="mt-0.5"
          />
          <span>I authorise Canta to debit my wallet and send these funds to the beneficiary.</span>
        </label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setStage("form")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to edit
          </Button>
          <Button
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={!confirmDetails || !confirmAuth}
            onClick={() => {
              toast.success("Details verified — sending");
              setStage("sending");
            }}
          >
            Confirm &amp; send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs">Beneficiary</Label>
          <button
            type="button"
            onClick={onAddBeneficiary}
            className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
          >
            <UserPlus className="h-3 w-3" /> Add new beneficiary
          </button>
        </div>
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-border bg-card text-sm"
        >
          {beneficiaries.map((b) => (
            <option key={b.name}>{b.name}</option>
          ))}
        </select>
        <div className="text-xs text-muted-foreground mt-1">
          {ben.country} · {ben.bank} · {ben.account}
        </div>
      </div>
      <div>
        <Label className="text-xs">Amount</Label>
        <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border mt-1">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="min-w-0 flex-1 bg-transparent text-lg sm:text-xl font-semibold tabular-nums outline-none"
          />
          <span className="text-sm font-medium grid place-items-center px-2 shrink-0">
            {payCcy}
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          You pay in {payCcy}; {ben.name} is credited in {quoteCcy}.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="min-w-0">
          <Label className="text-xs">Convert from</Label>
          <Select value={payCcy} onValueChange={(v) => setPayCcy(v as FundingCcy)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FUNDING_CCYS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-0">
          <Label className="text-xs">Quote against</Label>
          <Select value={quoteCcy} onValueChange={setQuoteCcy}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue className="truncate" />
            </SelectTrigger>
            <SelectContent>
              {GLOBAL_SEND_CCYS.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} · {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <FundFxQuote fundCcy={payCcy} target={quoteCcy} amount={amt} />


      <div>
        <Label className="text-xs">Reference</Label>
        <Input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="mt-1"
          placeholder="Invoice #INV-0421"
        />
      </div>
      <div>
        <Label className="text-xs">Narration / purpose of payment</Label>
        <Textarea
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          className="mt-1"
          rows={2}
          placeholder="e.g. Supplier payment for solar inverters, PO #2241"
        />
      </div>
      <div>
        <Label className="text-xs">Supporting document</Label>
        <label className="mt-1 flex items-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-accent cursor-pointer text-xs">
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-muted-foreground">
            {doc ? doc.name : "Invoice, contract or proof of trade (PDF, PNG, JPG)"}
          </span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
          />
          <span className="text-accent font-medium">{doc ? "Replace" : "Upload"}</span>
        </label>
      </div>
      <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-xs">
        Smart routing selected · Estimated arrival{" "}
        <span className="font-semibold">under 30 seconds</span>
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => {
          if (!amt) {
            toast.error("Enter an amount");
            return;
          }
          setConfirmDetails(false);
          setConfirmAuth(false);
          setStage("review");
        }}
      >
        Review payment details
      </Button>
    </div>
  );
}

function AddBeneficiaryForm({ onClose }: { onClose: () => void }) {
  const [country, setCountry] = useState("US");
  const auto = COUNTRIES.find((c) => c.code === country)?.ccy ?? "USD";
  const [ccy, setCcy] = useState(auto);
  useEffect(() => {
    setCcy(auto);
  }, [auto]);

  // Predict fields based on currency
  const fields = useMemo(() => {
    switch (ccy) {
      case "USD":
        return [
          { key: "bank", label: "Bank Name", placeholder: "JPMorgan Chase" },
          { key: "routing", label: "ACH Routing Number", placeholder: "021000021" },
          { key: "account", label: "Account Number", placeholder: "0000 0000 0000" },
          { key: "accountType", label: "Account Type", placeholder: "Checking / Savings" },
        ];
      case "EUR":
        return [
          { key: "bank", label: "Bank Name", placeholder: "BNP Paribas" },
          { key: "iban", label: "IBAN", placeholder: "FR76 3000 6000 0112..." },
          { key: "bic", label: "BIC / SWIFT", placeholder: "BNPAFRPP" },
        ];
      case "GBP":
        return [
          { key: "bank", label: "Bank Name", placeholder: "Barclays" },
          { key: "sort", label: "Sort Code", placeholder: "20-00-00" },
          { key: "account", label: "Account Number", placeholder: "12345678" },
        ];
      case "NGN":
        return [
          { key: "bank", label: "Bank", placeholder: "Guaranty Trust Bank" },
          { key: "account", label: "10-digit NUBAN", placeholder: "0123456789" },
          { key: "bvn", label: "BVN (optional)", placeholder: "22XXXXXXXXX" },
        ];
      default:
        return [
          { key: "bank", label: "Bank Name", placeholder: "Bank name" },
          { key: "iban", label: "IBAN / Account", placeholder: "Account or IBAN" },
          { key: "swift", label: "SWIFT / BIC", placeholder: "SWIFT code" },
        ];
    }
  }, [ccy]);

  return (
    <>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Full name / Company</Label>
          <Input className="mt-1" placeholder="Acme Energy Ltd" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Currency</Label>
            <Select value={ccy} onValueChange={setCcy}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {fields.map((f) => (
          <div key={f.key}>
            <Label className="text-xs">{f.label}</Label>
            <Input className="mt-1" placeholder={f.placeholder} />
          </div>
        ))}
        <div>
          <Label className="text-xs">Email (for remittance advice)</Label>
          <Input className="mt-1" type="email" placeholder="ap@acmeenergy.com" />
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            onClose();
            toast.success("Beneficiary added", { description: `Validated for ${ccy} payouts.` });
          }}
        >
          Save Beneficiary
        </Button>
      </DialogFooter>
    </>
  );
}

function ScheduleForm({ onClose }: { onClose: () => void }) {
  const [from, setFrom] = useState("NGN");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("50000000");
  const [trigger, setTrigger] = useState("rate");
  const [target, setTarget] = useState("1600");
  const [date, setDate] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">From</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["NGN", "USD", "EUR", "GBP"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["USD", "NGN", "EUR", "GBP"].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Amount ({from})</Label>
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Trigger</Label>
        <Select value={trigger} onValueChange={setTrigger}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rate">When rate is reached</SelectItem>
            <SelectItem value="date">On a specific date/time</SelectItem>
            <SelectItem value="recurring">Recurring (weekly)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {trigger === "rate" ? (
        <div>
          <Label className="text-xs">
            Target rate (1 {to} = ? {from})
          </Label>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
            className="mt-1"
          />
        </div>
      ) : (
        <div>
          <Label className="text-xs">{trigger === "date" ? "Execute at" : "Starts on"}</Label>
          <Input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>
      )}
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-xs flex items-center gap-2">
        <CalendarClock className="h-3.5 w-3.5 text-accent" />
        We'll auto-execute and notify you the moment the trigger fires.
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => {
          onClose();
          toast.success("Conversion scheduled", {
            description: `${Number(amount).toLocaleString()} ${from} → ${to}.`,
          });
        }}
      >
        Schedule Conversion
      </Button>
    </div>
  );
}

function BulkPaymentsForm({ onClose }: { onClose: () => void }) {
  type Row = { id: number; name: string; amount: string; ccy: string };
  const [rows, setRows] = useState<Row[]>(
    beneficiaries.slice(0, 3).map((b, i) => ({ id: i, name: b.name, amount: "10000", ccy: b.ccy })),
  );
  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  return (
    <div className="space-y-3">
      <button
        onClick={() =>
          toast.info("CSV import", {
            description: "Upload a CSV with name, amount, currency columns.",
          })
        }
        className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-accent text-sm flex items-center justify-center gap-2 text-muted-foreground"
      >
        <Upload className="h-4 w-4" /> Drop CSV here or click to upload
      </button>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 text-xs font-medium bg-secondary/50 px-3 py-2 text-muted-foreground">
          <div className="col-span-5">Beneficiary</div>
          <div className="col-span-4">Amount</div>
          <div className="col-span-2">Ccy</div>
          <div className="col-span-1" />
        </div>
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-border items-center"
          >
            <select
              value={r.name}
              onChange={(e) =>
                setRows(
                  rows.map((x) =>
                    x.id === r.id
                      ? {
                          ...x,
                          name: e.target.value,
                          ccy: beneficiaries.find((b) => b.name === e.target.value)?.ccy ?? x.ccy,
                        }
                      : x,
                  ),
                )
              }
              className="col-span-5 bg-card border border-border rounded px-2 py-1 text-sm"
            >
              {beneficiaries.map((b) => (
                <option key={b.name}>{b.name}</option>
              ))}
            </select>
            <Input
              value={r.amount}
              onChange={(e) =>
                setRows(
                  rows.map((x) =>
                    x.id === r.id ? { ...x, amount: e.target.value.replace(/[^0-9.]/g, "") } : x,
                  ),
                )
              }
              className="col-span-4 h-8"
            />
            <div className="col-span-2 text-xs font-medium">{r.ccy}</div>
            <button
              onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
              className="col-span-1 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          setRows([
            ...rows,
            { id: Date.now(), name: beneficiaries[0].name, amount: "0", ccy: beneficiaries[0].ccy },
          ])
        }
      >
        <Plus className="h-3.5 w-3.5 mr-1" /> Add row
      </Button>
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
        <span className="text-muted-foreground">{rows.length} payments</span>
        <span className="font-semibold tabular-nums">Total ≈ {total.toLocaleString()}</span>
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => {
          rows.forEach((r) => {
            const amt = Number(r.amount) || 0;
            if (!amt) return;
            addTransaction({
              type: "Outgoing",
              desc: `Bulk batch · ${r.name}`,
              amount: amt,
              ccy: r.ccy,
              status: "Completed",
            });
          });
          onClose();
          toast.success(`${rows.length} payments settled`, {
            description: "Batch routed on best corridors.",
          });
        }}
      >
        Submit Batch
      </Button>
    </div>
  );
}

function InviteForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Treasury");
  return (
    <>
      <div className="space-y-3">
        <div>
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="name@company.com"
          />
        </div>
        <div>
          <Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Admin", "Treasury", "Finance", "Compliance", "Viewer"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            if (!email) {
              toast.error("Email required");
              return;
            }
            onClose();
            toast.success("Invite sent", { description: `${email} invited as ${role}.` });
          }}
        >
          Send Invite
        </Button>
      </DialogFooter>
    </>
  );
}
