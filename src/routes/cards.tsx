import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { cards as baseCards, fmtMoney, type Card as MockCard } from "@/lib/mock";
import {
  Plus, Snowflake, Plane, Briefcase, Ship, GraduationCap, Megaphone, Users,
  CreditCard as CreditCardIcon, User, Wallet, Banknote, AlertTriangle, CheckCircle2,
  Receipt, Download, ArrowUpRight, Flame, Clock, FileText, ArrowLeft, Lock, ShieldAlert,
  Globe, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/cards")({
  head: () => ({ meta: [{ title: "Global Spend Cards — Canta" }] }),
  component: CardsPage,
});

// ---------- Purpose definitions ----------
type Purpose =
  | "Business Expenses" | "Travel" | "Import/Trade Expenses"
  | "Student Abroad" | "Online Ads" | "Team Spending" | "Personal Global Spend";

const PURPOSES: { i: any; l: Purpose; d: string; type: MockCard["type"]; tone: string }[] = [
  { i: Briefcase,      l: "Business Expenses",       d: "Day-to-day company spend",         type: "Business", tone: "bg-primary/10 text-primary" },
  { i: Plane,          l: "Travel",                  d: "Trips, hotels, per-diem",          type: "Travel",   tone: "bg-accent/15 text-accent" },
  { i: Ship,           l: "Import/Trade Expenses",   d: "Samples, inspection, logistics",   type: "Importer", tone: "bg-warning/10 text-warning" },
  { i: GraduationCap,  l: "Student Abroad",          d: "Monthly allowance & emergencies",  type: "Student",  tone: "bg-success/10 text-success" },
  { i: Megaphone,      l: "Online Ads",              d: "Meta, Google, TikTok campaigns",   type: "Ad Spend", tone: "bg-destructive/10 text-destructive" },
  { i: Users,          l: "Team Spending",           d: "Staff cards with approvals",       type: "Team",     tone: "bg-primary/10 text-primary" },
  { i: Globe,          l: "Personal Global Spend",   d: "Worldwide personal use",           type: "Business", tone: "bg-muted text-foreground" },
];

// ---------- Extended card data ----------
type RichCard = MockCard & {
  purpose: Purpose;
  wallet: string;
  linked?: string;        // trade file / campaign / trip
  budget?: number;
  destination?: string;
  travelDates?: string;
  platform?: "Meta" | "Google" | "TikTok";
  receiptsMissing?: number;
};

const purposeOf = (t: MockCard["type"]): Purpose => {
  switch (t) {
    case "Travel":   return "Travel";
    case "Importer": return "Import/Trade Expenses";
    case "Student":  return "Student Abroad";
    case "Ad Spend": return "Online Ads";
    case "Team":     return "Team Spending";
    default:         return "Business Expenses";
  }
};

const rich: RichCard[] = baseCards.map((c) => {
  const purpose = purposeOf(c.type);
  const extras: Partial<RichCard> = {};
  if (c.type === "Travel")   { extras.destination = "Dubai, UAE"; extras.travelDates = "Jun 12 → Jun 20, 2026"; extras.linked = "Trip: Sourcing Q2"; extras.budget = 6000; }
  if (c.type === "Importer") { extras.linked = "Trade File TR-2031 · Guangzhou Q2"; extras.budget = 20_000; }
  if (c.type === "Ad Spend") { extras.platform = "Meta"; extras.linked = "Campaign: Brand-Q2"; extras.budget = 10_000; }
  if (c.type === "Student")  { extras.linked = "Sponsor: Mr. & Mrs. Bello"; extras.budget = 1500; }
  if (c.type === "Team")     { extras.linked = "Department: Sales"; extras.budget = 15_000; }
  if (c.type === "Business") { extras.budget = c.limit; }
  return {
    ...c, purpose,
    wallet: "USD Wallet",
    receiptsMissing: Math.max(0, Math.floor((c.monthlySpend / 1000) % 4)),
    ...extras,
  };
});

const txns = [
  { id: "T1", cardId: "CRD-001", date: "2026-06-07", merchant: "AWS",                 cat: "Software",  amount: 1240, status: "Posted" as const, receipt: true  },
  { id: "T2", cardId: "CRD-001", date: "2026-06-06", merchant: "Office Depot",        cat: "Office",    amount: 320,  status: "Posted" as const, receipt: false },
  { id: "T3", cardId: "CRD-002", date: "2026-06-07", merchant: "Emirates Airlines",   cat: "Travel",    amount: 1650, status: "Posted" as const, receipt: true  },
  { id: "T4", cardId: "CRD-002", date: "2026-06-06", merchant: "Burj Al Arab",        cat: "Hotel",     amount: 980,  status: "Posted" as const, receipt: false },
  { id: "T5", cardId: "CRD-003", date: "2026-06-05", merchant: "Shenzhen Logistics",  cat: "Logistics", amount: 2200, status: "Posted" as const, receipt: true  },
  { id: "T6", cardId: "CRD-003", date: "2026-06-04", merchant: "QC Inspection Ltd",   cat: "Inspection",amount: 480,  status: "Posted" as const, receipt: true  },
  { id: "T7", cardId: "CRD-004", date: "2026-06-07", merchant: "Meta Platforms",      cat: "Ads",       amount: 4200, status: "Posted" as const, receipt: true  },
  { id: "T8", cardId: "CRD-004", date: "2026-06-06", merchant: "Meta Platforms",      cat: "Ads",       amount: 950,  status: "Failed" as const, receipt: false },
  { id: "T9", cardId: "CRD-005", date: "2026-06-07", merchant: "Tesco UK",            cat: "Groceries", amount: 142,  status: "Posted" as const, receipt: false },
  { id: "T10",cardId: "CRD-006", date: "2026-06-03", merchant: "Uber",                cat: "Transport", amount: 38,   status: "Posted" as const, receipt: true  },
];

const approvals = [
  { id: "AP-21", card: "CRD-006", requester: "James O.", amount: 320, reason: "Client dinner",     status: "Pending" },
  { id: "AP-20", card: "CRD-003", requester: "Ops Team", amount: 1800,reason: "Container release", status: "Pending" },
];

function statusTone(s: string) {
  const map: Record<string, string> = {
    Active:  "bg-success/15 text-success border-success/30",
    Posted:  "bg-success/15 text-success border-success/30",
    Frozen:  "bg-primary/15 text-primary border-primary/30",
    Expired: "bg-muted text-muted-foreground border-border",
    Pending: "bg-warning/15 text-warning border-warning/30",
    Failed:  "bg-destructive/15 text-destructive border-destructive/30",
  };
  return map[s] ?? "";
}

function KPI({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: any; tone?: string; }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`h-7 w-7 rounded-lg grid place-items-center ${tone ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-semibold mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}

// ---------- Create Card Wizard (7 steps) ----------
function CreateCardDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [holder, setHolder] = useState("");
  const [limit, setLimit] = useState("5000");
  const [wallet, setWallet] = useState("USD Wallet");
  const [approval, setApproval] = useState("none");
  const [receipts, setReceipts] = useState("optional");
  const TOTAL = 7;

  const reset = () => {
    setStep(1); setPurpose(null); setHolder("");
    setLimit("5000"); setWallet("USD Wallet"); setApproval("none"); setReceipts("optional");
  };

  const stepTitles = [
    "What is the card for?",
    "Who will use it?",
    "Monthly limit",
    "Funding wallet",
    "Approval rules",
    "Receipt requirement",
    "Review & create",
  ];

  function finish() {
    toast.success(`${purpose ?? "Business"} card created for ${holder || "you"}`);
    setOpen(false); reset();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Create Card</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stepTitles[step - 1]}</DialogTitle>
          <DialogDescription>Step {step} of {TOTAL} · Create Card Wizard</DialogDescription>
        </DialogHeader>

        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>

        <div className="min-h-[220px]">
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PURPOSES.map((p) => (
                <button
                  key={p.l}
                  onClick={() => { setPurpose(p.l); setStep(2); }}
                  className={`text-left p-4 rounded-xl border transition ${purpose === p.l ? "border-accent bg-accent/5" : "border-border hover:border-accent hover:shadow-card"}`}
                >
                  <div className={`h-9 w-9 rounded-lg grid place-items-center ${p.tone}`}><p.i className="h-4 w-4" /></div>
                  <div className="text-sm font-semibold mt-2">{p.l}</div>
                  <div className="text-[11px] text-muted-foreground">{p.d}</div>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <Label>Cardholder name</Label>
              <Input value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="e.g. James Okafor" />
              <div className="text-xs text-muted-foreground">For team cards, this becomes the assigned user. For business cards, this prints on the card.</div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <Label>Monthly spend limit (USD)</Label>
              <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" />
              <div className="text-xs text-muted-foreground">You can change this at any time. Hard-stop triggers at the limit.</div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-3">
              <Label>Funding wallet</Label>
              <Select value={wallet} onValueChange={setWallet}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD Wallet">USD Wallet</SelectItem>
                  <SelectItem value="GBP Wallet">GBP Wallet</SelectItem>
                  <SelectItem value="EUR Wallet">EUR Wallet</SelectItem>
                  <SelectItem value="NGN Wallet">NGN Wallet (auto FX)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Card debits the chosen wallet — auto FX runs if the merchant currency differs.</div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <Label>Approval rules</Label>
              <Select value={approval} onValueChange={setApproval}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No approval needed</SelectItem>
                  <SelectItem value="over-500">Approval required over $500</SelectItem>
                  <SelectItem value="over-2000">Approval required over $2,000</SelectItem>
                  <SelectItem value="every">Approval required for every transaction</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Approvers can act in-app or directly from WhatsApp.</div>
            </div>
          )}
          {step === 6 && (
            <div className="space-y-3">
              <Label>Receipt requirement</Label>
              <Select value={receipts} onValueChange={setReceipts}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="over-100">Required over $100</SelectItem>
                  <SelectItem value="all">Required for every transaction</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Missing receipts are auto-chased on WhatsApp.</div>
            </div>
          )}
          {step === 7 && (
            <div className="p-4 rounded-lg bg-secondary/40 border border-border text-sm space-y-2">
              <div className="font-semibold">Review</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Purpose:</span> {purpose ?? "—"}</div>
                <div><span className="text-muted-foreground">User:</span> {holder || "—"}</div>
                <div><span className="text-muted-foreground">Monthly limit:</span> ${limit}</div>
                <div><span className="text-muted-foreground">Funding wallet:</span> {wallet}</div>
                <div><span className="text-muted-foreground">Approval:</span> {approval}</div>
                <div><span className="text-muted-foreground">Receipts:</span> {receipts}</div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
            </Button>
          )}
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          {step < TOTAL && step > 1 && (
            <Button onClick={() => setStep(step + 1)} disabled={step === 2 && !holder}>Next</Button>
          )}
          {step === TOTAL && <Button onClick={finish}>Create card</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function CardSetupFields({ purpose }: { purpose: Purpose }) {
  const common = (
    <>
      <div><Label>Card label</Label><Input placeholder="e.g. Lagos→Dubai Sourcing" /></div>
      <div>
        <Label>Linked wallet</Label>
        <Select defaultValue="USD"><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["USD","EUR","GBP","NGN"].map(w => <SelectItem key={w} value={w}>{w} Wallet</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div><Label>Spending limit</Label><Input type="number" placeholder="5000" /></div>
    </>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {common}
      {purpose === "Travel" && (<>
        <div><Label>Destination</Label><Input placeholder="Dubai, UAE" /></div>
        <div><Label>Trip budget</Label><Input type="number" placeholder="6000" /></div>
        <div><Label>Travel dates</Label><Input placeholder="Jun 12 → Jun 20" /></div>
        <div><Label>Spend alert at</Label><Input placeholder="80% of budget" /></div>
      </>)}
      {purpose === "Team Spending" && (<>
        <div><Label>Cardholder (staff)</Label><Input placeholder="Adaeze O." /></div>
        <div>
          <Label>Approval rule</Label>
          <Select defaultValue=">500">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Every transaction</SelectItem>
              <SelectItem value=">500">Above $500</SelectItem>
              <SelectItem value=">2000">Above $2,000</SelectItem>
              <SelectItem value="none">No approvals</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2"><Label>Monthly report email</Label><Input placeholder="finance@company.com" /></div>
      </>)}
      {purpose === "Import/Trade Expenses" && (<>
        <div><Label>Linked trade file</Label><Input placeholder="TR-2031 · Guangzhou Q2" /></div>
        <div><Label>Budget per shipment</Label><Input type="number" placeholder="20000" /></div>
        <div className="col-span-2">
          <Label>Allowed categories</Label>
          <Input placeholder="Samples, Inspection, Logistics" />
        </div>
      </>)}
      {purpose === "Student Abroad" && (<>
        <div><Label>Student name</Label><Input placeholder="Aisha Bello" /></div>
        <div><Label>Monthly allowance</Label><Input type="number" placeholder="1500" /></div>
        <div><Label>Parent / sponsor</Label><Input placeholder="Mr. Bello" /></div>
        <div><Label>Emergency top-up cap</Label><Input type="number" placeholder="500" /></div>
        <div className="col-span-2"><Label>Allowed categories</Label><Input placeholder="Groceries, Transport, Education" /></div>
      </>)}
      {purpose === "Online Ads" && (<>
        <div>
          <Label>Platform</Label>
          <Select defaultValue="Meta"><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Meta","Google","TikTok","X / Twitter","LinkedIn"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Campaign / client</Label><Input placeholder="Brand-Q2" /></div>
        <div><Label>Ad budget</Label><Input type="number" placeholder="10000" /></div>
        <div><Label>Failed-payment alert</Label><Input placeholder="ops@company.com" /></div>
      </>)}
      {purpose === "Business Expenses" && (
        <div className="col-span-2"><Label>Notes</Label><Textarea placeholder="Description of intended use" /></div>
      )}
      {purpose === "Personal Global Spend" && (
        <div className="col-span-2"><Label>Notes</Label><Textarea placeholder="Personal use notes" /></div>
      )}
    </div>
  );
}

// ---------- Visual card component ----------
function CardVisual({ c, onClick }: { c: RichCard; onClick: () => void }) {
  const meta = PURPOSES.find(p => p.l === c.purpose)!;
  const used = Math.min(100, Math.round((c.monthlySpend / Math.max(1, c.limit)) * 100));
  return (
    <button onClick={onClick} className="text-left group">
      <Card className="p-4 shadow-card hover:shadow-elevated transition relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 group-hover:bg-primary/10 transition" />
        <div className="flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-lg grid place-items-center ${meta.tone}`}><meta.i className="h-3.5 w-3.5" /></div>
              <Badge variant="outline" className="text-[10px]">{c.purpose}</Badge>
            </div>
            <div className="text-sm font-semibold mt-3">{c.label}</div>
            <div className="text-[11px] text-muted-foreground">{c.holder}</div>
          </div>
          <Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge>
        </div>

        <div className="mt-4 font-mono text-sm tracking-widest text-muted-foreground">
          •••• •••• •••• {c.last4}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground text-[10px] uppercase">Balance</div>
            <div className="font-semibold tabular-nums">{fmtMoney(c.balance, "USD")}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px] uppercase">Limit</div>
            <div className="font-semibold tabular-nums">{fmtMoney(c.limit, "USD")}</div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Spent this month</span><span>{used}%</span>
          </div>
          <Progress value={used} className="h-1.5" />
        </div>

        {c.linked && (
          <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
            <ChevronRight className="h-3 w-3" /> {c.linked}
          </div>
        )}
      </Card>
    </button>
  );
}

// ---------- Detail Drawer/Dialog ----------
function CardDetail({ c, onClose }: { c: RichCard; onClose: () => void }) {
  const meta = PURPOSES.find(p => p.l === c.purpose)!;
  const cardTxns = txns.filter(t => t.cardId === c.id);
  const missing = cardTxns.filter(t => !t.receipt).length;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-lg grid place-items-center ${meta.tone}`}><meta.i className="h-3.5 w-3.5" /></div>
            {c.label}
          </DialogTitle>
          <DialogDescription>{c.purpose} · {c.holder}</DialogDescription>
        </DialogHeader>

        {/* Summary strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3"><div className="text-[10px] uppercase text-muted-foreground">Balance</div><div className="text-base font-semibold tabular-nums">{fmtMoney(c.balance,"USD")}</div></Card>
          <Card className="p-3"><div className="text-[10px] uppercase text-muted-foreground">Limit</div><div className="text-base font-semibold tabular-nums">{fmtMoney(c.limit,"USD")}</div></Card>
          <Card className="p-3"><div className="text-[10px] uppercase text-muted-foreground">Wallet</div><div className="text-base font-semibold">{c.wallet}</div></Card>
          <Card className="p-3"><div className="text-[10px] uppercase text-muted-foreground">Status</div><Badge variant="outline" className={`text-[10px] mt-1 ${statusTone(c.status)}`}>{c.status}</Badge></Card>
        </div>

        {/* Card-number + linked */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="text-[10px] uppercase text-muted-foreground">Card number</div>
          <div className="font-mono text-lg tracking-widest mt-1">•••• •••• •••• {c.last4}</div>
          {c.linked && <div className="text-xs text-muted-foreground mt-2">Linked: <span className="text-foreground">{c.linked}</span></div>}
          {c.destination && <div className="text-xs text-muted-foreground">Destination: <span className="text-foreground">{c.destination}</span> · {c.travelDates}</div>}
          {c.platform && <div className="text-xs text-muted-foreground">Platform: <span className="text-foreground">{c.platform}</span></div>}
        </Card>

        <Tabs defaultValue="txn">
          <TabsList>
            <TabsTrigger value="txn">Transactions</TabsTrigger>
            <TabsTrigger value="rec">Receipts {missing > 0 && <Badge variant="outline" className="ml-1.5 text-[10px] bg-warning/15 text-warning border-warning/30">{missing}</Badge>}</TabsTrigger>
            <TabsTrigger value="ctl">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="txn">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-3 py-2">Date</th><th className="px-3 py-2">Merchant</th>
                  <th className="px-3 py-2">Category</th><th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2">Status</th><th className="px-3 py-2">Receipt</th>
                </tr></thead>
                <tbody>
                  {cardTxns.map(t => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground">{t.date}</td>
                      <td className="px-3 py-2">{t.merchant}</td>
                      <td className="px-3 py-2">{t.cat}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold">{fmtMoney(t.amount,"USD")}</td>
                      <td className="px-3 py-2"><Badge variant="outline" className={`text-[10px] ${statusTone(t.status)}`}>{t.status}</Badge></td>
                      <td className="px-3 py-2">
                        {t.receipt
                          ? <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">Attached</Badge>
                          : <Button size="sm" variant="outline" onClick={() => toast.success("Receipt uploaded")}>Upload</Button>}
                      </td>
                    </tr>
                  ))}
                  {cardTxns.length === 0 && <tr><td colSpan={6} className="text-center text-xs text-muted-foreground py-6">No transactions yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="rec">
            <div className="space-y-2">
              {cardTxns.filter(t => !t.receipt).map(t => (
                <Card key={t.id} className="p-3 flex items-center justify-between">
                  <div className="text-sm">{t.merchant} <span className="text-muted-foreground">· {t.date} · {fmtMoney(t.amount,"USD")}</span></div>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Receipt uploaded")}><Receipt className="h-3.5 w-3.5 mr-1.5" /> Upload receipt</Button>
                </Card>
              ))}
              {missing === 0 && <div className="text-sm text-muted-foreground text-center py-6">All receipts captured ✓</div>}
            </div>
          </TabsContent>

          <TabsContent value="ctl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => toast.success("Card frozen")}><Snowflake className="h-3.5 w-3.5 mr-1.5" /> Freeze card</Button>
              <Button variant="outline" onClick={() => toast.success("Funding initiated")}><Banknote className="h-3.5 w-3.5 mr-1.5" /> Fund card</Button>
              <Button variant="outline" onClick={() => toast.success("Limit updated")}><ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Set limit</Button>
              <Button variant="outline" onClick={() => toast.success("Cardholder assigned")}><User className="h-3.5 w-3.5 mr-1.5" /> Assign user</Button>
              <Button variant="outline" onClick={() => toast.success("Statement exported")}><Download className="h-3.5 w-3.5 mr-1.5" /> Export statement</Button>
              <Button variant="outline" onClick={() => toast.success("Approval requested")}><Clock className="h-3.5 w-3.5 mr-1.5" /> Request approval</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Page ----------
function CardsPage() {
  const [purposeFilter, setPurposeFilter] = useState<"All" | Purpose>("All");
  const [active, setActive] = useState<RichCard | null>(null);

  const kpis = useMemo(() => {
    const activeCount = rich.filter(c => c.status === "Active").length;
    const totalSpend = rich.reduce((s, c) => s + c.monthlySpend, 0);
    const monthlyBudget = rich.reduce((s, c) => s + (c.budget ?? c.limit), 0);
    const frozen = rich.filter(c => c.status === "Frozen").length;
    const failed = txns.filter(t => t.status === "Failed").length;
    const receiptsMissing = txns.filter(t => !t.receipt).length;
    return { activeCount, totalSpend, monthlyBudget, frozen, failed, receiptsMissing };
  }, []);

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    txns.forEach(t => map.set(t.cat, (map.get(t.cat) ?? 0) + t.amount));
    return [...map.entries()].sort((a,b) => b[1]-a[1]).slice(0, 5);
  }, []);

  const filtered = purposeFilter === "All" ? rich : rich.filter(c => c.purpose === purposeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CreditCardIcon className="h-3.5 w-3.5" /> Global Spend Control
          </div>
          <h1 className="text-2xl font-semibold mt-1">Global Spend Cards</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Purpose-built global cards for African businesses, importers, travelers, students,
            teams, and ad spend — with controls and reporting tailored to each use case.
          </p>
        </div>
        <CreateCardDialog />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPI label="Active Cards"      value={String(kpis.activeCount)}                            icon={CheckCircle2} tone="bg-success/10 text-success" />
        <KPI label="Total Spend"       value={fmtMoney(kpis.totalSpend,"USD")}    sub="This month" icon={ArrowUpRight} />
        <KPI label="Monthly Budget"    value={fmtMoney(kpis.monthlyBudget,"USD")}                  icon={Wallet} />
        <KPI label="Pending Approvals" value={String(approvals.length)}                            icon={Clock}        tone="bg-warning/10 text-warning" />
        <KPI label="Receipts Missing"  value={String(kpis.receiptsMissing)}                        icon={Receipt}      tone="bg-warning/10 text-warning" />
        <KPI label="Top Category"      value={topCategories[0]?.[0] ?? "—"} sub={topCategories[0] ? fmtMoney(topCategories[0][1],"USD") : ""} icon={Flame} />
        <KPI label="Frozen Cards"      value={String(kpis.frozen)}                                 icon={Lock} />
        <KPI label="Failed Txns"       value={String(kpis.failed)}                                 icon={AlertTriangle} tone="bg-destructive/10 text-destructive" />
      </div>

      {/* Pending approvals strip */}
      {approvals.length > 0 && (
        <Card className="p-4 shadow-card">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-warning" /> Pending approvals</div>
          <div className="space-y-2">
            {approvals.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm border-t border-border first:border-0 pt-2 first:pt-0">
                <div>
                  <span className="font-medium">{a.requester}</span>{" "}
                  <span className="text-muted-foreground">requests {fmtMoney(a.amount,"USD")} on {a.card} — {a.reason}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success("Declined")}>Decline</Button>
                  <Button size="sm" onClick={() => toast.success("Approved")}>Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Purpose filter chips */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...PURPOSES.map(p => p.l)] as ("All"|Purpose)[]).map(p => (
          <button
            key={p}
            onClick={() => setPurposeFilter(p)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              purposeFilter === p
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-accent"
            }`}
          >{p}</button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => <CardVisual key={c.id} c={c} onClick={() => setActive(c)} />)}
        {filtered.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground col-span-full">
            No cards for this purpose yet.
          </Card>
        )}
      </div>

      {/* Top spend categories */}
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3 flex items-center gap-2"><Flame className="h-4 w-4" /> Top spend categories</div>
        <div className="space-y-2">
          {topCategories.map(([cat, amt]) => {
            const max = topCategories[0][1];
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{cat}</span>
                  <span className="tabular-nums text-muted-foreground">{fmtMoney(amt,"USD")}</span>
                </div>
                <Progress value={Math.round((amt/max)*100)} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </Card>

      {/* All transactions */}
      <Card className="shadow-card overflow-hidden">
        <div className="p-4 border-b border-border text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" /> Recent card transactions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-4 py-3">Date</th><th className="px-4 py-3">Card</th>
              <th className="px-4 py-3">Merchant</th><th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {txns.map(t => {
                const c = rich.find(rc => rc.id === t.cardId)!;
                return (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                    <td className="px-4 py-3">{c.label} <span className="text-muted-foreground">····{c.last4}</span></td>
                    <td className="px-4 py-3">{t.merchant}</td>
                    <td className="px-4 py-3">{t.cat}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(t.amount,"USD")}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${statusTone(t.status)}`}>{t.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {active && <CardDetail c={active} onClose={() => setActive(null)} />}
    </div>
  );
}
