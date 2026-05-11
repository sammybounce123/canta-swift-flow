import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Building, CreditCard, Zap, ArrowDown, Lock, CheckCircle2, Upload, CalendarClock, Trash2, Plus } from "lucide-react";
import { wallets, beneficiaries, fmtMoney } from "@/lib/mock";

type Ctx = {
  openFund: (ccy?: string) => void;
  openConvert: (from?: string, to?: string) => void;
  openSend: (beneficiaryName?: string) => void;
  openAddBeneficiary: () => void;
  openSchedule: () => void;
  openBulk: () => void;
  openInvite: () => void;
};
const ActionsCtx = createContext<Ctx | null>(null);
export const useActions = () => {
  const c = useContext(ActionsCtx);
  if (!c) throw new Error("useActions must be used within ActionsProvider");
  return c;
};

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
  const [conv, setConv] = useState<{ open: boolean; from: string; to: string }>({ open: false, from: "NGN", to: "USD" });
  const [send, setSend] = useState<{ open: boolean; beneficiary: string }>({ open: false, beneficiary: "" });
  const [addBen, setAddBen] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [invite, setInvite] = useState(false);

  const ctx: Ctx = {
    openFund: (ccy = "NGN") => setFund({ open: true, ccy }),
    openConvert: (from = "NGN", to = "USD") => setConv({ open: true, from, to }),
    openSend: (beneficiary = "") => setSend({ open: true, beneficiary }),
    openAddBeneficiary: () => setAddBen(true),
    openSchedule: () => setSchedule(true),
    openBulk: () => setBulk(true),
    openInvite: () => setInvite(true),
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
                    navigate({ to: "/transactions" });
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
          <AddBeneficiaryForm onClose={() => setAddBen(false)} />
        </DialogContent>
      </Dialog>

      {/* SCHEDULE CONVERSION */}
      <Dialog open={schedule} onOpenChange={setSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Conversion</DialogTitle>
            <DialogDescription>Auto-convert when your target rate or date is hit.</DialogDescription>
          </DialogHeader>
          <ScheduleForm onClose={() => { setSchedule(false); navigate({ to: "/transactions" }); }} />
        </DialogContent>
      </Dialog>

      {/* BULK PAYMENTS */}
      <Dialog open={bulk} onOpenChange={setBulk}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Payments</DialogTitle>
            <DialogDescription>Pay multiple beneficiaries in a single batch run.</DialogDescription>
          </DialogHeader>
          <BulkPaymentsForm onClose={() => { setBulk(false); navigate({ to: "/transactions" }); }} />
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

function AddBeneficiaryForm({ onClose }: { onClose: () => void }) {
  const [country, setCountry] = useState("US");
  const auto = COUNTRIES.find((c) => c.code === country)?.ccy ?? "USD";
  const [ccy, setCcy] = useState(auto);
  // when country changes, auto-set currency
  useMemo(() => { setCcy(auto); }, [auto]);

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
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Currency</Label>
            <Select value={ccy} onValueChange={setCcy}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => { onClose(); toast.success("Beneficiary added", { description: `Validated for ${ccy} payouts.` }); }}
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
  const [date, setDate] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">From</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{["NGN","USD","EUR","GBP"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>{["USD","NGN","EUR","GBP"].map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Amount ({from})</Label>
        <Input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className="mt-1" />
      </div>
      <div>
        <Label className="text-xs">Trigger</Label>
        <Select value={trigger} onValueChange={setTrigger}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rate">When rate is reached</SelectItem>
            <SelectItem value="date">On a specific date/time</SelectItem>
            <SelectItem value="recurring">Recurring (weekly)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {trigger === "rate" ? (
        <div>
          <Label className="text-xs">Target rate (1 {to} = ? {from})</Label>
          <Input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))} className="mt-1" />
        </div>
      ) : (
        <div>
          <Label className="text-xs">{trigger === "date" ? "Execute at" : "Starts on"}</Label>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
        </div>
      )}
      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30 text-xs flex items-center gap-2">
        <CalendarClock className="h-3.5 w-3.5 text-accent" />
        We'll auto-execute and notify you the moment the trigger fires.
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => { onClose(); toast.success("Conversion scheduled", { description: `${Number(amount).toLocaleString()} ${from} → ${to}.` }); }}
      >
        Schedule Conversion
      </Button>
    </div>
  );
}

function BulkPaymentsForm({ onClose }: { onClose: () => void }) {
  type Row = { id: number; name: string; amount: string; ccy: string };
  const [rows, setRows] = useState<Row[]>(
    beneficiaries.slice(0, 3).map((b, i) => ({ id: i, name: b.name, amount: "10000", ccy: b.ccy }))
  );
  const total = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  return (
    <div className="space-y-3">
      <button
        onClick={() => toast.info("CSV import", { description: "Upload a CSV with name, amount, currency columns." })}
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
          <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-border items-center">
            <select
              value={r.name}
              onChange={(e) => setRows(rows.map(x => x.id === r.id ? { ...x, name: e.target.value, ccy: beneficiaries.find(b=>b.name===e.target.value)?.ccy ?? x.ccy } : x))}
              className="col-span-5 bg-card border border-border rounded px-2 py-1 text-sm"
            >
              {beneficiaries.map((b) => <option key={b.name}>{b.name}</option>)}
            </select>
            <Input
              value={r.amount}
              onChange={(e) => setRows(rows.map(x => x.id === r.id ? { ...x, amount: e.target.value.replace(/[^0-9.]/g, "") } : x))}
              className="col-span-4 h-8"
            />
            <div className="col-span-2 text-xs font-medium">{r.ccy}</div>
            <button onClick={() => setRows(rows.filter(x => x.id !== r.id))} className="col-span-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => setRows([...rows, { id: Date.now(), name: beneficiaries[0].name, amount: "0", ccy: beneficiaries[0].ccy }])}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add row
      </Button>
      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm">
        <span className="text-muted-foreground">{rows.length} payments</span>
        <span className="font-semibold tabular-nums">Total ≈ {total.toLocaleString()}</span>
      </div>
      <Button
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => { onClose(); toast.success(`${rows.length} payments queued`, { description: "Awaiting approver sign-off." }); }}
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
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" placeholder="name@company.com" />
        </div>
        <div>
          <Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Admin","Treasury","Finance","Compliance","Viewer"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => {
            if (!email) { toast.error("Email required"); return; }
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
