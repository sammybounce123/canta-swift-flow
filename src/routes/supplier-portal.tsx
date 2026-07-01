import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Factory, Users, Receipt, Wallet, FileText, MessageSquare, ShieldCheck,
  Upload, ArrowRight, CheckCircle2, Clock, AlertTriangle, Lock,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ButtonGroup } from "@/components/ui/action-group";

type SupplierTab =
  | "overview"
  | "buyers"
  | "requests"
  | "invoices"
  | "settlement"
  | "trade-files"
  | "documents"
  | "messages"
  | "verification"
  | "support";

const SUPPLIER_TABS: Array<{ value: SupplierTab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "buyers", label: "Nigerian Buyers" },
  { value: "requests", label: "Payment Requests" },
  { value: "invoices", label: "Invoices" },
  { value: "settlement", label: "RMB Settlement" },
  { value: "trade-files", label: "Trade Files" },
  { value: "documents", label: "Documents" },
  { value: "messages", label: "Messages" },
  { value: "verification", label: "Verification" },
  { value: "support", label: "Support" },
];

function coerceSupplierTab(value: unknown): SupplierTab {
  return typeof value === "string" && SUPPLIER_TABS.some((item) => item.value === value)
    ? value as SupplierTab
    : "overview";
}

export const Route = createFileRoute("/supplier-portal")({
  validateSearch: (search) => ({ tab: coerceSupplierTab(search.tab) }),
  head: () => ({ meta: [{ title: "Supplier Portal — Canta" }] }),
  component: SupplierPortal,
});

// --- Demo data ---------------------------------------------------------------

type SettlementStatus =
  | "Awaiting Buyer Payment"
  | "NGN Received"
  | "Compliance Review"
  | "FX Processing"
  | "RMB Payout Initiated"
  | "RMB Paid"
  | "Failed"
  | "On Hold"
  | "Refunded";

const STATUS_TONE: Record<SettlementStatus, string> = {
  "Awaiting Buyer Payment": "bg-muted text-foreground",
  "NGN Received":           "bg-primary/10 text-primary",
  "Compliance Review":      "bg-amber-100 text-amber-800",
  "FX Processing":          "bg-blue-100 text-blue-800",
  "RMB Payout Initiated":   "bg-indigo-100 text-indigo-800",
  "RMB Paid":               "bg-emerald-100 text-emerald-800",
  "Failed":                 "bg-destructive/10 text-destructive",
  "On Hold":                "bg-amber-100 text-amber-800",
  "Refunded":               "bg-muted text-foreground",
};

type Request = {
  id: string; buyer: string; tradeFile: string; goods: string;
  amountNgn: number; amountRmb: number; status: SettlementStatus; updated: string;
};

const REQUESTS: Request[] = [
  { id: "PR-3041", buyer: "Lagos Trade Holdings",  tradeFile: "TF-2026-0214", goods: "Bluetooth speakers x 500", amountNgn: 19_300_000, amountRmb: 94_500, status: "RMB Paid", updated: "2 hours ago" },
  { id: "PR-3055", buyer: "Abuja Imports Ltd",     tradeFile: "TF-2026-0231", goods: "LED panels x 220",          amountNgn: 8_650_000,  amountRmb: 42_300, status: "FX Processing", updated: "today" },
  { id: "PR-3062", buyer: "Kano Distributors",     tradeFile: "TF-2026-0244", goods: "Industrial sewing machines", amountNgn: 14_120_000, amountRmb: 69_100, status: "NGN Received", updated: "yesterday" },
  { id: "PR-3071", buyer: "Port Harcourt Trading", tradeFile: "TF-2026-0259", goods: "Solar inverters x 60",      amountNgn: 27_400_000, amountRmb: 134_200, status: "Awaiting Buyer Payment", updated: "3 days ago" },
  { id: "PR-3080", buyer: "Lagos Trade Holdings",  tradeFile: "TF-2026-0263", goods: "Plastic injection moulds",  amountNgn: 6_120_000,  amountRmb: 29_900, status: "Compliance Review", updated: "5 days ago" },
];

const TIMELINE_STEPS = [
  "Payment Request Sent",
  "Buyer Viewed",
  "NGN Awaiting Payment",
  "NGN Received",
  "Rate Locked",
  "Compliance Review",
  "RMB Settlement Processing",
  "RMB Paid Out",
  "Settlement Receipt Available",
];

// --- Component ---------------------------------------------------------------

function SupplierPortal() {
  const { tab: routeTab } = Route.useSearch();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [tab, setTab] = useState<SupplierTab>(routeTab);
  const [search] = useState("");
  const [invite, setInvite] = useState<null | "buyer" | "request">(null);

  useEffect(() => {
    setTab(routeTab);
  }, [routeTab]);

  const selectTab = (next: SupplierTab) => {
    setTab(next);
    void navigate({ to: "/supplier-portal", search: { tab: next } as never, replace: true });
  };

  const filtered = useMemo(
    () => REQUESTS.filter((r) => !search || r.buyer.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const totals = useMemo(() => ({
    pending: REQUESTS.filter((r) => r.status === "Awaiting Buyer Payment").length,
    ngnHeld: REQUESTS.filter((r) => r.status === "NGN Received" || r.status === "Compliance Review" || r.status === "FX Processing")
      .reduce((s, r) => s + r.amountNgn, 0),
    rmbPaid: REQUESTS.filter((r) => r.status === "RMB Paid").reduce((s, r) => s + r.amountRmb, 0),
    buyers: new Set(REQUESTS.map((r) => r.buyer)).size,
  }), []);

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta."
      />

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Badge variant="outline" className="gap-1"><Factory className="h-3 w-3" /> Supplier Portal · Invite-only access</Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">Welcome, Li Wei</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Nigerian buyers can pay locally in NGN while suppliers receive RMB settlement through Canta.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">Li Wei · Supplier Admin</Badge>
            <Badge variant="secondary" className="text-xs">Supplier Mode</Badge>
            <Badge variant="outline" className="text-xs">Guangzhou Tech Factory</Badge>
          </div>
        </div>
        <ButtonGroup label="Supplier portal actions" className="w-auto justify-start md:justify-end">
          <Button variant="outline" size="sm" onClick={() => setInvite("buyer")}>
            <Users className="h-4 w-4 mr-2" /> Add Nigerian buyer
          </Button>
          <Button size="sm" onClick={() => setInvite("request")}>
            <Receipt className="h-4 w-4 mr-2" /> New payment request
          </Button>
        </ButtonGroup>
      </header>

      {!verified && (
        <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
          <Lock className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm flex-1">
            <div className="font-semibold">Complete supplier verification to receive RMB settlement.</div>
            <div className="text-xs mt-1">You can view invited payment requests and upload documents now. RMB payouts unlock after verification.</div>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setVerified(true); toast.success("Verification simulated — RMB payouts enabled"); }}>
            Complete verification
          </Button>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <KPI label="Pending Payment Requests" value={String(totals.pending)} icon={Clock} />
        <KPI label="NGN Received Awaiting RMB Settlement" value={`₦${(totals.ngnHeld / 1_000_000).toFixed(1)}M`} icon={Wallet} />
        <KPI label="RMB Paid This Month" value={`¥${totals.rmbPaid.toLocaleString()}`} icon={CheckCircle2} />
        <KPI label="Active Nigerian Buyers" value={String(totals.buyers)} icon={Users} />
        <KPI label="Documents Required" value="2" icon={FileText} />
        <KPI label="Verification Status" value={verified ? "Verified" : "Pending"} icon={ShieldCheck} />
      </div>

      <section className="space-y-4">
        <div role="tablist" aria-label="Supplier Portal sections" className="flex w-full min-w-0 flex-wrap items-center justify-start gap-2 rounded-lg border border-border bg-muted/60 p-2 text-muted-foreground">
          {SUPPLIER_TABS.map((item) => {
            const active = tab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                data-state={active ? "active" : "inactive"}
                className={`inline-flex min-h-10 max-w-full flex-none shrink-0 items-center justify-center whitespace-normal break-words rounded-md border px-3 py-2 text-center text-sm font-medium leading-snug transition-all hover:border-primary/50 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-background/80"}`}
                onClick={() => selectTab(item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
        <div role="tabpanel" className="space-y-4">
          <Card className="p-5">
            <div className="text-sm font-semibold mb-3">Most recent payment request</div>
            <SettlementTimeline currentIndex={5} />
          </Card>
          <Card className="p-4 text-xs text-muted-foreground">
            You only see your own buyers, invoices, payment requests, documents, Trade Files, messages and settlement status. Other suppliers, importer landed cost, clearing agent bids and unrelated Trade Files are hidden.
          </Card>
          <RequestsTable rows={filtered.slice(0, 3)} compact />
        </div>
        )}

        {tab === "buyers" && (
        <div role="tabpanel">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-3">Nigerian buyers who have transacted with you on Canta.</div>
            <div className="divide-y">
              {Array.from(new Set(REQUESTS.map((r) => r.buyer))).map((b) => (
                <div key={b} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b}</div>
                    <div className="text-xs text-muted-foreground">{REQUESTS.filter((r) => r.buyer === b).length} requests on file</div>
                  </div>
                  <Button size="sm" variant="outline">View buyer</Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
        )}

        {tab === "requests" && (
        <div role="tabpanel" className="space-y-3">
          <ButtonGroup label="Payment request actions">
            <Button size="sm" onClick={() => setInvite("request")}><Receipt className="h-4 w-4 mr-2" /> Create payment request</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Buyer payment status refreshed")}><Clock className="h-4 w-4 mr-2" /> View buyer payment status</Button>
          </ButtonGroup>
          <RequestsTable rows={filtered} />
        </div>
        )}

        {tab === "invoices" && (
        <div role="tabpanel" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Invoices &amp; shipping documents</div>
            <div className="text-xs text-muted-foreground">Invoices link to each payment request. Upload proforma, commercial invoice and packing list per Trade File.</div>
            <ButtonGroup label="Invoice actions">
              <Button size="sm" variant="outline" onClick={() => toast.success("Proforma invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload proforma invoice</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Commercial invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload commercial invoice</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Packing list uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload packing list</Button>
            </ButtonGroup>
          </Card>
        </div>
        )}

        {tab === "settlement" && (
        <div role="tabpanel" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">RMB settlement statuses</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(Object.keys(STATUS_TONE) as SettlementStatus[]).map((s) => (
                <Badge key={s} className={STATUS_TONE[s]}>{s}</Badge>
              ))}
            </div>
            <ButtonGroup label="Settlement actions">
              <Button size="sm" variant="outline" onClick={() => toast.success("RMB payout bank details saved")}><Wallet className="h-4 w-4 mr-2" /> Add RMB payout bank details</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Settlement receipt downloaded")}><FileText className="h-4 w-4 mr-2" /> Download settlement receipt</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Settlement tracker opened")}><Clock className="h-4 w-4 mr-2" /> Track RMB settlement</Button>
            </ButtonGroup>
          </Card>
          <RequestsTable rows={filtered} />
        </div>
        )}

        {tab === "trade-files" && (
        <div role="tabpanel">
          <Card className="p-4 space-y-3 text-sm">
            <div className="text-muted-foreground">You can only see Trade Files where you have been invited as a supplier.</div>
            {Array.from(new Set(REQUESTS.map((r) => r.tradeFile))).map((tf) => (
              <div key={tf} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-mono text-xs">{tf}</div>
                  <div className="text-xs text-muted-foreground">Buyer: {REQUESTS.find((r) => r.tradeFile === tf)?.buyer}</div>
                </div>
                <Button size="sm" variant="outline">Open</Button>
              </div>
            ))}
          </Card>
        </div>
        )}

        {tab === "documents" && (
        <div role="tabpanel">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Documents on file</div>
            <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-2" /> Upload document</Button>
            <ul className="text-sm space-y-2">
              <li className="flex items-center justify-between border rounded p-2"><span>Business registration.pdf</span><Badge className="bg-emerald-100 text-emerald-800">Verified</Badge></li>
              <li className="flex items-center justify-between border rounded p-2"><span>Factory address proof.pdf</span><Badge className="bg-amber-100 text-amber-800">Pending</Badge></li>
              <li className="flex items-center justify-between border rounded p-2"><span>Bank statement.pdf</span><Badge variant="outline">Required</Badge></li>
            </ul>
          </Card>
        </div>
        )}

        {tab === "messages" && (
        <div role="tabpanel">
          <Card className="p-4 text-sm">
            <div className="text-muted-foreground mb-2">Messages are scoped to each Trade File. You only see communication related to your invoices.</div>
            <div className="border rounded-lg p-3">
              <div className="text-xs text-muted-foreground">TF-2026-0214 · Lagos Trade Holdings</div>
              <div className="text-sm mt-1">"Please confirm ETA for the second container." — buyer, 2h ago</div>
            </div>
          </Card>
        </div>
        )}

        {tab === "verification" && (
        <div role="tabpanel">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Verification checklist</div>
            <ul className="text-sm space-y-2">
              <Check item="Business registration" done />
              <Check item="Factory address proof" done={false} />
              <Check item="Bank account verification" done={false} />
              <Check item="Authorized representative ID" done />
            </ul>
            {!verified && (
              <Button size="sm" onClick={() => { setVerified(true); toast.success("Verification submitted"); }}>
                Submit for review
              </Button>
            )}
          </Card>
        </div>
        )}

        {tab === "support" && (
        <div role="tabpanel">
          <Card className="p-4 space-y-3 text-sm">
            <div className="font-semibold">Supplier support</div>
            <div className="text-muted-foreground">Get help with buyer payment requests, invoice documents, verification, and RMB settlement receipts.</div>
            <ButtonGroup label="Supplier support actions">
              <Button size="sm" variant="outline">Open support ticket</Button>
              <Button size="sm" variant="outline">Message Canta</Button>
            </ButtonGroup>
          </Card>
        </div>
        )}
      </section>

      <Dialog open={!!invite} onOpenChange={(o) => !o && setInvite(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{invite === "buyer" ? "Add a Nigerian buyer" : "New payment request"}</DialogTitle>
            <DialogDescription>
              {invite === "buyer"
                ? "Invite a Nigerian buyer to pay you through Canta. Buyer pays in NGN; you receive RMB settlement."
                : "Send a payment request linked to a Trade File. Buyer receives a Canta NGN payment link."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div><Label className="text-xs">Buyer company</Label><Input placeholder="e.g. Lagos Trade Holdings" /></div>
            <div><Label className="text-xs">Trade file</Label><Input placeholder="TF-2026-XXXX" /></div>
            {invite === "request" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Amount (RMB)</Label><Input type="number" placeholder="50000" /></div>
                  <div><Label className="text-xs">Goods</Label><Input placeholder="Bluetooth speakers x 500" /></div>
                </div>
                <div><Label className="text-xs">Notes for buyer</Label><Textarea placeholder="50% deposit, balance on BL" /></div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvite(null)}>Cancel</Button>
            <Button onClick={() => { setInvite(null); toast.success(invite === "buyer" ? "Buyer invitation sent" : "Payment request sent"); }}>
              {invite === "buyer" ? "Send invitation" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="p-4 text-xs text-muted-foreground">
        <Link to="/welcome" className="inline-flex items-center gap-1 hover:underline">
          Switch workspace <ArrowRight className="h-3 w-3" />
        </Link>
      </Card>
    </div>
  );
}

function KPI({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </Card>
  );
}

function Check({ item, done }: { item: string; done: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{item}</span>
    </li>
  );
}

function SettlementTimeline({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      {TIMELINE_STEPS.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={s} className={`rounded-lg border p-2 ${active ? "border-primary bg-primary/5" : done ? "border-emerald-300 bg-emerald-50" : "border-border"}`}>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">{i + 1}</div>
            <div className="font-medium text-foreground">{s}</div>
          </li>
        );
      })}
    </ol>
  );
}

function RequestsTable({ rows, compact }: { rows: Request[]; compact?: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left py-2 px-3">Request</th>
              <th className="text-left py-2 px-3">Buyer</th>
              <th className="text-left py-2 px-3">Trade File</th>
              {!compact && <th className="text-left py-2 px-3">Goods</th>}
              <th className="text-right py-2 px-3">NGN</th>
              <th className="text-right py-2 px-3">RMB</th>
              <th className="text-left py-2 px-3">Status</th>
              <th className="text-left py-2 px-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 px-3 font-mono text-xs">{r.id}</td>
                <td className="py-2 px-3">{r.buyer}</td>
                <td className="py-2 px-3 font-mono text-xs">{r.tradeFile}</td>
                {!compact && <td className="py-2 px-3 text-xs">{r.goods}</td>}
                <td className="py-2 px-3 text-right tabular-nums">₦{r.amountNgn.toLocaleString()}</td>
                <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()}</td>
                <td className="py-2 px-3"><Badge className={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                <td className="py-2 px-3 text-xs text-muted-foreground">{r.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
