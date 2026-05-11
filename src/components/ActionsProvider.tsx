import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, CreditCard, Zap, ArrowDown, Lock, CheckCircle2 } from "lucide-react";
import { wallets, beneficiaries, fmtMoney } from "@/lib/mock";

type Ctx = {
  openFund: (ccy?: string) => void;
  openConvert: (from?: string, to?: string) => void;
  openSend: (beneficiaryName?: string) => void;
  openAddBeneficiary: () => void;
};
const ActionsCtx = createContext<Ctx | null>(null);
export const useActions = () => {
  const c = useContext(ActionsCtx);
  if (!c) throw new Error("useActions must be used within ActionsProvider");
  return c;
};

export function ActionsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [fund, setFund] = useState<{ open: boolean; ccy: string }>({ open: false, ccy: "NGN" });
  const [conv, setConv] = useState<{ open: boolean; from: string; to: string }>({ open: false, from: "NGN", to: "USD" });
  const [send, setSend] = useState<{ open: boolean; beneficiary: string }>({ open: false, beneficiary: "" });
  const [addBen, setAddBen] = useState(false);

  const ctx: Ctx = {
    openFund: (ccy = "NGN") => setFund({ open: true, ccy }),
    openConvert: (from = "NGN", to = "USD") => setConv({ open: true, from, to }),
    openSend: (beneficiary = "") => setSend({ open: true, beneficiary }),
    openAddBeneficiary: () => setAddBen(true),
  };

  return (
    <ActionsCtx.Provider value={ctx}>
      {children}

      {/* FUND */}
      <Dialog open={fund.open} onOpenChange={(o) => setFund((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fund {fund.ccy} Wallet</DialogTitle>
            <DialogDescription>Choose a funding method to top up instantly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Amount ({fund.ccy})</Label>
              <Input defaultValue="1,000,000" className="mt-1" />
            </div>
            <div className="space-y-2">
              {[
                { icon: Building, label: "Bank Transfer", desc: "Free · Settles in seconds", rec: true },
                { icon: CreditCard, label: "Card Payment", desc: "1.5% fee · Instant" },
                { icon: Zap, label: "Pay Without Funding", desc: "Inline · No pre-fund needed" },
              ].map((o) => (
                <button
                  key={o.label}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent hover:bg-secondary/40"
                  onClick={() => {
                    setFund((s) => ({ ...s, open: false }));
                    toast.success(`${o.label} initiated`, { description: `Funding your ${fund.ccy} wallet.` });
                  }}
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center">
                    <o.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{o.label}</div>
                    <div className="text-xs text-muted-foreground">{o.desc}</div>
                  </div>
                  {o.rec && <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">Recommended</span>}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONVERT */}
      <Dialog open={conv.open} onOpenChange={(o) => setConv((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Currency</DialogTitle>
            <DialogDescription>Lock a rate and settle in seconds.</DialogDescription>
          </DialogHeader>
          <ConvertForm
            from={conv.from}
            to={conv.to}
            onConfirm={(amt, from, to) => {
              setConv((s) => ({ ...s, open: false }));
              toast.success("Conversion confirmed", {
                description: `Converted ${amt} ${from} → ${to}. Settled instantly.`,
                icon: <CheckCircle2 className="h-4 w-4" />,
              });
              navigate({ to: "/transactions" });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* SEND */}
      <Dialog open={send.open} onOpenChange={(o) => setSend((s) => ({ ...s, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Payment</DialogTitle>
            <DialogDescription>Send to a saved beneficiary or new recipient.</DialogDescription>
          </DialogHeader>
          <SendForm
            initialBeneficiary={send.beneficiary}
            onConfirm={(amt, ccy, name) => {
              setSend((s) => ({ ...s, open: false }));
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
          <div className="space-y-3">
            <div><Label className="text-xs">Full name / Company</Label><Input className="mt-1" placeholder="Acme Energy Ltd" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Country</Label><Input className="mt-1" placeholder="USA" /></div>
              <div><Label className="text-xs">Currency</Label><Input className="mt-1" defaultValue="USD" /></div>
            </div>
            <div><Label className="text-xs">Bank</Label><Input className="mt-1" placeholder="JPMorgan Chase" /></div>
            <div><Label className="text-xs">Account / IBAN</Label><Input className="mt-1" placeholder="0000 0000 0000" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBen(false)}>Cancel</Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => { setAddBen(false); toast.success("Beneficiary added"); }}
            >
              Save Beneficiary
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ActionsCtx.Provider>
  );
}

function ConvertForm({ from: f0, to: t0, onConfirm }: { from: string; to: string; onConfirm: (a: string, f: string, t: string) => void }) {
  const [from, setFrom] = useState(f0);
  const [to, setTo] = useState(t0);
  const [amount, setAmount] = useState("1000000");
  const rate = from === "NGN" && to === "USD" ? 0.00062 : 1612.45;
  const out = (Number(amount) || 0) * rate;
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">You send</Label>
        <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border mt-1">
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="flex-1 bg-transparent text-xl font-semibold tabular-nums outline-none" />
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="bg-card border border-border rounded-lg px-2 text-sm">
            <option>NGN</option><option>USD</option><option>EUR</option><option>GBP</option>
          </select>
        </div>
      </div>
      <div className="flex justify-center">
        <button onClick={() => { setFrom(to); setTo(from); }} className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center">
          <ArrowDown className="h-4 w-4" />
        </button>
      </div>
      <div>
        <Label className="text-xs">Recipient gets</Label>
        <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border mt-1">
          <div className="flex-1 text-xl font-semibold tabular-nums">{out.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="bg-card border border-border rounded-lg px-2 text-sm">
            <option>USD</option><option>NGN</option><option>EUR</option><option>GBP</option>
          </select>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-xs flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-accent" /> Rate locked · 1 {from} = {rate} {to}
      </div>
      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onConfirm(amount, from, to)}>
        Confirm Conversion
      </Button>
    </div>
  );
}

function SendForm({ initialBeneficiary, onConfirm }: { initialBeneficiary: string; onConfirm: (a: number, c: string, n: string) => void }) {
  const [name, setName] = useState(initialBeneficiary || beneficiaries[0].name);
  const ben = beneficiaries.find((b) => b.name === name) ?? beneficiaries[0];
  const [amount, setAmount] = useState("50000");
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs">Beneficiary</Label>
        <select value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2.5 rounded-lg border border-border bg-card text-sm">
          {beneficiaries.map((b) => <option key={b.name}>{b.name}</option>)}
        </select>
        <div className="text-xs text-muted-foreground mt-1">{ben.country} · {ben.bank} · {ben.account}</div>
      </div>
      <div>
        <Label className="text-xs">Amount</Label>
        <div className="flex gap-2 p-3 rounded-xl bg-secondary/50 border border-border mt-1">
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="flex-1 bg-transparent text-xl font-semibold tabular-nums outline-none" />
          <span className="text-sm font-medium grid place-items-center px-2">{ben.ccy}</span>
        </div>
      </div>
      <div>
        <Label className="text-xs">Reference</Label>
        <Input className="mt-1" placeholder="Invoice #INV-0421" />
      </div>
      <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-xs">
        Smart routing selected · Estimated arrival <span className="font-semibold">under 30 seconds</span>
      </div>
      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => onConfirm(Number(amount) || 0, ben.ccy, ben.name)}>
        Send Payment
      </Button>
    </div>
  );
}
