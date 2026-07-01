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
  Factory, Users, Receipt, Wallet, FileText, ShieldCheck,
  Upload, ArrowRight, CheckCircle2, Clock, AlertTriangle, Lock,
  Eye, Bell, Download, Building2, Mail, Phone, MapPin, Landmark, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ButtonGroup } from "@/components/ui/action-group";

type SupplierTab =
  | "overview"
  | "buyers"
  | "requests"
  | "fx-quotes"
  | "ngn-details"
  | "payout-accounts"
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
  { value: "fx-quotes", label: "FX Quotes" },
  { value: "ngn-details", label: "NGN Payment Details" },
  { value: "payout-accounts", label: "Payout Accounts" },
  { value: "invoices", label: "Invoices" },
  { value: "settlement", label: "RMB / USD Settlement" },
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
  id: string; invoiceNumber: string; buyer: string; tradeFile: string; goods: string;
  amountNgn: number; amountRmb: number; invoiceCurrency: "RMB" | "USD";
  dueDate: string; invoiceDoc: string; status: SettlementStatus; updated: string;
  rate: number; fee: number; payoutRef?: string; paidDate?: string;
};

const REQUESTS: Request[] = [
  { id: "PR-3041", invoiceNumber: "INV-2026-041", buyer: "Lagos Trade Holdings",  tradeFile: "TF-2026-0214", goods: "Bluetooth speakers x 500",   amountNgn: 19_300_000, amountRmb: 94_500,  invoiceCurrency: "RMB", dueDate: "2026-06-10", invoiceDoc: "INV-041.pdf", status: "RMB Paid",              updated: "2 hours ago",  rate: 204.23, fee: 12_500, payoutRef: "RMB-PO-88421", paidDate: "2026-06-12" },
  { id: "PR-3055", invoiceNumber: "INV-2026-055", buyer: "Abuja Imports Ltd",     tradeFile: "TF-2026-0231", goods: "LED panels x 220",           amountNgn: 8_650_000,  amountRmb: 42_300,  invoiceCurrency: "RMB", dueDate: "2026-06-20", invoiceDoc: "INV-055.pdf", status: "FX Processing",         updated: "today",        rate: 204.49, fee: 8_100 },
  { id: "PR-3062", invoiceNumber: "INV-2026-062", buyer: "Kano Distributors",     tradeFile: "TF-2026-0244", goods: "Industrial sewing machines", amountNgn: 14_120_000, amountRmb: 69_100,  invoiceCurrency: "RMB", dueDate: "2026-06-25", invoiceDoc: "INV-062.pdf", status: "NGN Received",          updated: "yesterday",    rate: 204.34, fee: 10_900 },
  { id: "PR-3071", invoiceNumber: "INV-2026-071", buyer: "Port Harcourt Trading", tradeFile: "TF-2026-0259", goods: "Solar inverters x 60",       amountNgn: 27_400_000, amountRmb: 134_200, invoiceCurrency: "RMB", dueDate: "2026-07-01", invoiceDoc: "INV-071.pdf", status: "Awaiting Buyer Payment", updated: "3 days ago",  rate: 204.17, fee: 15_400 },
  { id: "PR-3080", invoiceNumber: "INV-2026-080", buyer: "Lagos Trade Holdings",  tradeFile: "TF-2026-0263", goods: "Plastic injection moulds",   amountNgn: 6_120_000,  amountRmb: 29_900,  invoiceCurrency: "RMB", dueDate: "2026-07-04", invoiceDoc: "INV-080.pdf", status: "Compliance Review",     updated: "5 days ago",   rate: 204.68, fee: 6_200 },
];

type Buyer = {
  name: string; company: string; email: string; phone: string; country: string;
};

const BUYERS: Buyer[] = [
  { name: "Tunde Bakare",   company: "Lagos Trade Holdings",  email: "tunde@lagostrade.ng",    phone: "+234 802 111 2233", country: "Nigeria" },
  { name: "Amina Yusuf",    company: "Abuja Imports Ltd",     email: "amina@abujaimports.ng",  phone: "+234 803 222 3344", country: "Nigeria" },
  { name: "Ibrahim Musa",   company: "Kano Distributors",     email: "ibrahim@kanodist.ng",    phone: "+234 805 333 4455", country: "Nigeria" },
  { name: "Chioma Eze",     company: "Port Harcourt Trading", email: "chioma@phtrading.ng",    phone: "+234 806 444 5566", country: "Nigeria" },
];

const TIMELINE_STEPS = [
  "Payment Request Created",
  "FX Quote Generated",
  "NGN Payment Details Sent",
  "Buyer Viewed",
  "Awaiting NGN Payment",
  "NGN Received",
  "Compliance Review",
  "FX Processing",
  "RMB/USD Payout Initiated",
  "Supplier Paid",
  "Settlement Receipt Available",
];

const COMPLIANCE_DISCLAIMER =
  "FX quotes, settlement amounts, and payout timelines are subject to payment confirmation, compliance review, FX availability, partner rails, and applicable regulations.";

// --- Component ---------------------------------------------------------------

function SupplierPortal() {
  const { tab: routeTab } = Route.useSearch();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);
  const [tab, setTab] = useState<SupplierTab>(routeTab);
  const [search] = useState("");
  const [invite, setInvite] = useState<null | "buyer" | "request">(null);

  // --- FX Quote state ---
  type FxQuoteStatus = "Draft" | "Quote Generated" | "Rate Locked" | "Sent to Buyer" | "Expired" | "Buyer Paid" | "Processing Settlement" | "Settled" | "Cancelled";
  type FxQuote = {
    id: string; invoiceNumber: string; buyer: string;
    invoiceAmount: number; invoiceCurrency: "RMB" | "USD";
    settlementCurrency: "RMB" | "USD"; rate: number; ngnTotal: number;
    fee: number; estReceivable: number; payoutAccount: string;
    expiresAt: number; lockedUntil?: number; status: FxQuoteStatus;
    sentAt?: number;
  };
  const buildQuote = (r: Request, seq: number, statusOverride?: FxQuoteStatus): FxQuote => {
    const settlementCurrency: "RMB" | "USD" = seq % 2 === 0 ? "RMB" : "USD";
    const jitter = (Math.random() - 0.5) * 0.6;
    const rate = +(r.rate + jitter).toFixed(2);
    const ngnTotal = Math.round(r.amountRmb * rate);
    const estReceivable = settlementCurrency === "RMB" ? r.amountRmb : Math.round(r.amountRmb / 7.2);
    return {
      id: `FXQ-${3100 + seq}`, invoiceNumber: r.invoiceNumber, buyer: r.buyer,
      invoiceAmount: r.amountRmb, invoiceCurrency: r.invoiceCurrency,
      settlementCurrency, rate, ngnTotal, fee: r.fee, estReceivable,
      payoutAccount: settlementCurrency === "RMB" ? "ICBC ****4821" : "Bank of China ****9012",
      expiresAt: Date.now() + 15 * 60 * 1000,
      status: statusOverride ?? "Quote Generated",
    };
  };
  const [fxQuotes, setFxQuotes] = useState<FxQuote[]>(() => {
    const seeded: FxQuoteStatus[] = ["Quote Generated", "Rate Locked", "Buyer Paid", "Processing Settlement"];
    return REQUESTS.slice(0, 4).map((r, i) => {
      const q = buildQuote(r, i, seeded[i]);
      if (q.status === "Rate Locked") q.lockedUntil = q.expiresAt;
      return q;
    });
  });
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [, setNowTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const activeQuote = fxQuotes.find((q) => q.id === selectedQuoteId) ?? fxQuotes.find((q) => q.status === "Quote Generated") ?? fxQuotes[0];

  const handleGenerateQuote = () => {
    const nextIndex = fxQuotes.length;
    const source = REQUESTS[nextIndex % REQUESTS.length];
    const quote = buildQuote(source, nextIndex);
    setFxQuotes((prev) => [quote, ...prev]);
    setSelectedQuoteId(quote.id);
    toast.success(`FX quote ${quote.id} generated · Rate ${quote.rate} · Expires in 15m`);
  };
  const handleLockQuote = () => {
    if (!activeQuote) return toast.error("No quote to lock");
    if (activeQuote.status === "Rate Locked") return toast.info(`${activeQuote.id} already locked`);
    setFxQuotes((prev) => prev.map((q) => q.id === activeQuote.id
      ? { ...q, status: "Rate Locked", lockedUntil: Date.now() + 15 * 60 * 1000, expiresAt: Date.now() + 15 * 60 * 1000 }
      : q));
    toast.success(`${activeQuote.id} locked at ${activeQuote.rate} for 15 minutes`);
  };
  const handleSendQuote = () => {
    if (!activeQuote) return toast.error("No quote to send");
    setFxQuotes((prev) => prev.map((q) => q.id === activeQuote.id
      ? { ...q, status: q.status === "Rate Locked" ? "Rate Locked" : "Sent to Buyer", sentAt: Date.now() }
      : q));
    toast.success(`${activeQuote.id} sent to ${activeQuote.buyer}`);
    selectTab("ngn-details");
  };
  const handleRefreshQuote = () => {
    if (!activeQuote) return toast.error("No quote to refresh");
    if (activeQuote.status === "Rate Locked") return toast.error("Locked quote cannot be refreshed — unlock or generate a new quote");
    const jitter = (Math.random() - 0.5) * 0.8;
    const newRate = +(activeQuote.rate + jitter).toFixed(2);
    const newNgn = Math.round(activeQuote.invoiceAmount * newRate);
    setFxQuotes((prev) => prev.map((q) => q.id === activeQuote.id
      ? { ...q, rate: newRate, ngnTotal: newNgn, expiresAt: Date.now() + 15 * 60 * 1000, status: "Quote Generated" }
      : q));
    toast.success(`${activeQuote.id} refreshed · New rate ${newRate}`);
  };
  const formatCountdown = (ts: number) => {
    const ms = Math.max(0, ts - Date.now());
    const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000);
    return ms === 0 ? "Expired" : `${m}m ${s.toString().padStart(2, "0")}s`;
  };
  const activeQuoteCount = fxQuotes.filter((q) => q.status === "Quote Generated" || q.status === "Rate Locked" || q.status === "Sent to Buyer").length;

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

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        <KPI label="Active FX Quotes" value={String(activeQuoteCount)} icon={Receipt} />
        <KPI label="Quotes Awaiting Buyer Payment" value={String(totals.pending)} icon={Clock} />
        <KPI label="NGN Received Awaiting Settlement" value={`₦${(totals.ngnHeld / 1_000_000).toFixed(1)}M`} icon={Wallet} />
        <KPI label="RMB Settlement Pending" value="¥42,300" icon={Landmark} />
        <KPI label="USD Settlement Pending" value="$0" icon={Landmark} />
        <KPI label="Settled This Month" value={`¥${totals.rmbPaid.toLocaleString()}`} icon={CheckCircle2} />
        <KPI label="Active Nigerian Buyers" value={String(totals.buyers)} icon={Users} />
        <KPI label="Payout Accounts Verified" value="1 of 2" icon={ShieldCheck} />
        <KPI label="Documents Required" value="2" icon={FileText} />
        <KPI label="Verification Status" value={verified ? "Verified" : "Pending"} icon={ShieldCheck} />
      </div>

      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">
        {COMPLIANCE_DISCLAIMER}
      </Card>

      <section className="space-y-4">
        <div role="tablist" aria-label="Supplier Portal sections" className="flex w-full min-w-0 flex-wrap items-stretch justify-start gap-3">
          {SUPPLIER_TABS.map((item) => {
            const active = tab === item.value;
            return (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={active}
                data-state={active ? "active" : "inactive"}
                className={`inline-flex min-h-11 max-w-full flex-none shrink-0 items-center justify-center whitespace-normal break-words rounded-lg border-2 px-4 py-2.5 text-center text-sm font-semibold leading-snug shadow-sm transition-all hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
                onClick={() => selectTab(item.value)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
        <div role="tabpanel" data-state="active" className="space-y-4">
          <ButtonGroup label="Overview quick actions">
            <Button size="sm" onClick={() => setInvite("request")}><Receipt className="h-4 w-4 mr-2" /> Create Payment Request</Button>
            {!verified && (
              <Button size="sm" variant="outline" onClick={() => selectTab("verification")}><ShieldCheck className="h-4 w-4 mr-2" /> Complete Verification</Button>
            )}
          </ButtonGroup>

          {(!verified || REQUESTS.some((r) => r.status === "Compliance Review")) && (
            <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm flex-1">
                <div className="font-semibold">Action needed</div>
                <ul className="text-xs mt-1 list-disc pl-4 space-y-0.5">
                  {!verified && <li>Verification incomplete — RMB settlement is on hold until verification is approved.</li>}
                  <li>2 documents required: Factory address proof, Bank statement.</li>
                  {REQUESTS.some((r) => r.status === "Compliance Review") && <li>1 payment request under compliance review.</li>}
                </ul>
              </div>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="text-sm font-semibold mb-3">Recent payment requests</div>
              <RequestsTable rows={REQUESTS.slice(0, 3)} compact />
            </Card>
            <Card className="p-5">
              <div className="text-sm font-semibold mb-3">Recent settlement activity</div>
              <ul className="text-sm space-y-2">
                {REQUESTS.filter((r) => r.status === "RMB Paid" || r.status === "FX Processing" || r.status === "Compliance Review").map((r) => (
                  <li key={r.id} className="flex items-center justify-between border rounded-lg p-2">
                    <div>
                      <div className="font-mono text-xs">{r.id} · {r.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">{r.buyer} · {r.updated}</div>
                    </div>
                    <Badge className={STATUS_TONE[r.status]}>{r.status}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-5">
            <div className="text-sm font-semibold mb-3">Most recent payment request timeline</div>
            <SettlementTimeline currentIndex={5} />
          </Card>

          <Card className="p-4 text-xs text-muted-foreground">
            You only see your own buyers, invoices, payment requests, documents, Trade Files, messages and settlement status. Other suppliers, importer landed cost, clearing agent bids and unrelated Trade Files are hidden.
          </Card>
        </div>
        )}

        {tab === "buyers" && (
        <div role="tabpanel" data-state="active" className="space-y-3">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-3">Nigerian buyers linked to your supplier account. You only see buyers you have transacted with.</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-3">Buyer</th>
                    <th className="text-left py-2 px-3">Company</th>
                    <th className="text-left py-2 px-3">Contact</th>
                    <th className="text-left py-2 px-3">Country</th>
                    <th className="text-left py-2 px-3">Trade File</th>
                    <th className="text-right py-2 px-3">Invoice value</th>
                    <th className="text-left py-2 px-3">Payment status</th>
                    <th className="text-left py-2 px-3">Last activity</th>
                    <th className="text-right py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {BUYERS.map((b) => {
                    const rows = REQUESTS.filter((r) => r.buyer === b.company);
                    const total = rows.reduce((s, r) => s + r.amountNgn, 0);
                    const last = rows[0];
                    return (
                      <tr key={b.company} className="border-t align-top">
                        <td className="py-2 px-3 font-medium flex items-center gap-1"><UserCheck className="h-3.5 w-3.5 text-muted-foreground" /> {b.name}</td>
                        <td className="py-2 px-3 text-xs"><Building2 className="h-3 w-3 inline mr-1" />{b.company}</td>
                        <td className="py-2 px-3 text-xs">
                          <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {b.email}</div>
                          <div className="flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {b.phone}</div>
                        </td>
                        <td className="py-2 px-3 text-xs"><MapPin className="h-3 w-3 inline mr-1" />{b.country}</td>
                        <td className="py-2 px-3 font-mono text-xs">{last?.tradeFile ?? "—"}</td>
                        <td className="py-2 px-3 text-right tabular-nums">₦{total.toLocaleString()}</td>
                        <td className="py-2 px-3">{last && <Badge className={STATUS_TONE[last.status]}>{last.status}</Badge>}</td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{last?.updated ?? "—"}</td>
                        <td className="py-2 px-3">
                          <ButtonGroup label={`Actions for ${b.company}`} className="justify-end">
                            <Button size="sm" variant="outline" onClick={() => toast.success(`Opened ${b.company}`)}><Eye className="h-3.5 w-3.5 mr-1" /> View buyer</Button>
                            <Button size="sm" onClick={() => setInvite("request")}><Receipt className="h-3.5 w-3.5 mr-1" /> Create payment request</Button>
                          </ButtonGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        )}

        {tab === "requests" && (
        <div role="tabpanel" data-state="active" className="space-y-3">
          <ButtonGroup label="Payment request actions">
            <Button size="sm" onClick={() => setInvite("request")}><Receipt className="h-4 w-4 mr-2" /> Create Payment Request</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload Invoice</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent to buyer")}><Bell className="h-4 w-4 mr-2" /> Send Reminder</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Timeline opened")}><Clock className="h-4 w-4 mr-2" /> View Timeline</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Receipt downloaded")}><Download className="h-4 w-4 mr-2" /> Download Receipt</Button>
          </ButtonGroup>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-3">Invoice #</th>
                    <th className="text-left py-2 px-3">Buyer</th>
                    <th className="text-right py-2 px-3">Amount</th>
                    <th className="text-right py-2 px-3">NGN equiv.</th>
                    <th className="text-left py-2 px-3">Due</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Invoice</th>
                    <th className="text-right py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                      <td className="py-2 px-3">{r.buyer}</td>
                      <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()} <span className="text-xs text-muted-foreground">{r.invoiceCurrency}</span></td>
                      <td className="py-2 px-3 text-right tabular-nums">₦{r.amountNgn.toLocaleString()}</td>
                      <td className="py-2 px-3 text-xs">{r.dueDate}</td>
                      <td className="py-2 px-3"><Badge className={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                      <td className="py-2 px-3 text-xs"><FileText className="h-3 w-3 inline mr-1" />{r.invoiceDoc}</td>
                      <td className="py-2 px-3">
                        <ButtonGroup label={`Actions for ${r.invoiceNumber}`} className="justify-end">
                          <Button size="sm" variant="outline" onClick={() => toast.success(`Timeline for ${r.invoiceNumber}`)}><Clock className="h-3.5 w-3.5 mr-1" /> Timeline</Button>
                          <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent")}><Bell className="h-3.5 w-3.5 mr-1" /> Remind</Button>
                          {r.status === "RMB Paid" && (
                            <Button size="sm" variant="outline" onClick={() => toast.success("Settlement receipt downloaded")}><Download className="h-3.5 w-3.5 mr-1" /> Receipt</Button>
                          )}
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold mb-2">Payment request timeline stages</div>
            <SettlementTimeline currentIndex={5} />
          </Card>
        </div>
        )}

        {tab === "fx-quotes" && (
        <div role="tabpanel" data-state="active" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-sm font-semibold">FX Quotes</div>
                <div className="text-xs text-muted-foreground">Generate a quote to see estimated RMB/USD you receive and the NGN amount your buyer pays.</div>
              </div>
              <ButtonGroup label="FX quote actions">
                <Button size="sm" onClick={() => toast.success("FX quote generated")}><Receipt className="h-4 w-4 mr-2" /> Generate FX Quote</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Rate locked for 15 minutes")}><Lock className="h-4 w-4 mr-2" /> Lock Quote</Button>
                <Button size="sm" variant="outline" onClick={() => selectTab("ngn-details")}><ArrowRight className="h-4 w-4 mr-2" /> Send Quote to Buyer</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Quote refreshed")}><Clock className="h-4 w-4 mr-2" /> Refresh Quote</Button>
              </ButtonGroup>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-3">Quote #</th>
                    <th className="text-left py-2 px-3">Invoice</th>
                    <th className="text-right py-2 px-3">Invoice amt</th>
                    <th className="text-left py-2 px-3">Buyer pays</th>
                    <th className="text-right py-2 px-3">Est. receivable</th>
                    <th className="text-right py-2 px-3">Rate</th>
                    <th className="text-right py-2 px-3">Canta fee</th>
                    <th className="text-left py-2 px-3">Settlement</th>
                    <th className="text-left py-2 px-3">Payout acct</th>
                    <th className="text-left py-2 px-3">Expires</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {REQUESTS.slice(0, 4).map((r, i) => {
                    const status = ["Quote Generated","Rate Locked","Buyer Paid","Processing Settlement"][i] ?? "Draft";
                    const settle = i % 2 === 0 ? "RMB" : "USD";
                    return (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 px-3 font-mono text-xs">FXQ-{3100 + i}</td>
                        <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                        <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()} <span className="text-[10px] text-muted-foreground">{r.invoiceCurrency}</span></td>
                        <td className="py-2 px-3 tabular-nums">₦{r.amountNgn.toLocaleString()} <span className="text-[10px] text-muted-foreground">NGN</span></td>
                        <td className="py-2 px-3 text-right tabular-nums">{settle === "RMB" ? `¥${r.amountRmb.toLocaleString()}` : `$${Math.round(r.amountRmb / 7.2).toLocaleString()}`}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-xs">{r.rate.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-xs">₦{r.fee.toLocaleString()}</td>
                        <td className="py-2 px-3 text-xs">{settle}</td>
                        <td className="py-2 px-3 text-xs">{settle === "RMB" ? "ICBC ****4821" : "Bank of China ****9012"}</td>
                        <td className="py-2 px-3 text-xs">14m 32s</td>
                        <td className="py-2 px-3"><Badge className="bg-primary/10 text-primary">{status}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-3 text-xs text-muted-foreground">
            Quote statuses: Draft · Quote Generated · Rate Locked · Expired · Buyer Paid · Processing Settlement · Settled · Cancelled
          </Card>
          <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>
        </div>
        )}

        {tab === "ngn-details" && (
        <div role="tabpanel" data-state="active" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Canta NGN payment details for your buyer</div>
            <div className="text-xs text-muted-foreground">
              Nigerian buyers pay NGN locally through Canta. Canta handles conversion and settlement backend, then pays the supplier in RMB or USD through approved payout rails.
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <DetailRow label="Account name" value="Canta Settlement / Guangzhou Tech Factory" />
              <DetailRow label="Bank name" value="Providus Bank" />
              <DetailRow label="Account number" value="9901234567" />
              <DetailRow label="Payment reference" value="CANTA-INV-2026-055" />
              <DetailRow label="NGN amount to pay" value="₦8,650,000" />
              <DetailRow label="Payment expiry" value="Today · 23:59 WAT" />
              <DetailRow label="Linked invoice" value="INV-2026-055" />
              <DetailRow label="Linked payment request" value="PR-3055" />
            </div>
            <Card className="p-3 bg-muted/40 text-xs">
              <div className="font-semibold mb-1">Buyer instructions</div>
              Pay the exact NGN amount into the Canta account using the payment reference. Your supplier will receive RMB/USD settlement after payment confirmation, compliance checks, and payout processing.
            </Card>
            <ButtonGroup label="Payment detail actions">
              <Button size="sm" onClick={() => toast.success("Payment details copied")}><FileText className="h-4 w-4 mr-2" /> Copy Payment Details</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Sent to buyer on WhatsApp")}><Phone className="h-4 w-4 mr-2" /> Send on WhatsApp</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Sent to buyer by email")}><Mail className="h-4 w-4 mr-2" /> Send by Email</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Payment instruction PDF downloaded")}><Download className="h-4 w-4 mr-2" /> Download Instruction</Button>
            </ButtonGroup>
          </Card>
          <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>
        </div>
        )}

        {tab === "payout-accounts" && (
        <div role="tabpanel" data-state="active" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-sm font-semibold">Supplier payout accounts</div>
                <div className="text-xs text-muted-foreground">Add RMB and USD accounts to receive settlement from Canta. Unverified accounts cannot receive settlement.</div>
              </div>
              <ButtonGroup label="Payout account actions">
                <Button size="sm" onClick={() => toast.success("Add RMB payout account")}><Landmark className="h-4 w-4 mr-2" /> Add RMB account</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Add USD payout account")}><Landmark className="h-4 w-4 mr-2" /> Add USD account</Button>
              </ButtonGroup>
            </div>
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <PayoutAccountCard
              currency="RMB"
              status="Verified"
              rows={[
                ["Beneficiary", "Guangzhou Tech Factory Co., Ltd"],
                ["Bank", "ICBC — Guangzhou Baiyun Branch"],
                ["Account number", "6222 **** **** 4821"],
                ["SWIFT", "ICBKCNBJGDG"],
                ["CNAPS", "102581000026"],
                ["Beneficiary address", "88 Baiyun Rd, Guangzhou, China"],
                ["Contact", "Li Wei · +86 138 0000 1234"],
              ]}
            />
            <PayoutAccountCard
              currency="USD"
              status="Under Review"
              rows={[
                ["Beneficiary", "Guangzhou Tech Factory Co., Ltd"],
                ["Bank", "Bank of China — Guangdong Branch"],
                ["Account number", "**** **** 9012"],
                ["SWIFT", "BKCHCNBJ400"],
                ["Bank branch", "Guangdong, China"],
                ["Beneficiary address", "88 Baiyun Rd, Guangzhou, China"],
                ["Contact", "Li Wei · liwei@gztech.cn"],
              ]}
            />
          </div>

          <Card className="p-3 text-xs text-muted-foreground">
            Account statuses: Not Submitted · Under Review · Verified · Rejected · Update Required. Supplier cannot receive settlement into an unverified payout account.
          </Card>
        </div>
        )}



        {tab === "invoices" && (
        <div role="tabpanel" data-state="active" className="space-y-3">
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
        <div role="tabpanel" data-state="active" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">RMB settlement statuses</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(Object.keys(STATUS_TONE) as SettlementStatus[]).map((s) => (
                <Badge key={s} className={STATUS_TONE[s]}>{s}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">
              RMB settlement is processed after NGN payment confirmation, compliance checks, FX availability, and payout approval.
            </div>
            <ButtonGroup label="Settlement actions">
              <Button size="sm" variant="outline" onClick={() => toast.success("RMB payout bank details saved")}><Landmark className="h-4 w-4 mr-2" /> Add RMB payout bank details</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Settlement receipt downloaded")}><Download className="h-4 w-4 mr-2" /> Download settlement receipt</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Settlement tracker opened")}><Clock className="h-4 w-4 mr-2" /> Track RMB settlement</Button>
            </ButtonGroup>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-2 px-3">Buyer</th>
                    <th className="text-left py-2 px-3">Invoice #</th>
                    <th className="text-right py-2 px-3">NGN paid</th>
                    <th className="text-right py-2 px-3">Expected RMB</th>
                    <th className="text-right py-2 px-3">Rate</th>
                    <th className="text-right py-2 px-3">Fee (₦)</th>
                    <th className="text-left py-2 px-3">Payout bank</th>
                    <th className="text-left py-2 px-3">Status</th>
                    <th className="text-left py-2 px-3">Compliance</th>
                    <th className="text-left py-2 px-3">Payout ref</th>
                    <th className="text-left py-2 px-3">Date paid</th>
                    <th className="text-right py-2 px-3">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 px-3">{r.buyer}</td>
                      <td className="py-2 px-3 font-mono text-xs">{r.invoiceNumber}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{["NGN Received","Compliance Review","FX Processing","RMB Payout Initiated","RMB Paid"].includes(r.status) ? `₦${r.amountNgn.toLocaleString()}` : "—"}</td>
                      <td className="py-2 px-3 text-right tabular-nums">¥{r.amountRmb.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-xs">{r.rate.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-xs">₦{r.fee.toLocaleString()}</td>
                      <td className="py-2 px-3 text-xs">ICBC · ****4821</td>
                      <td className="py-2 px-3"><Badge className={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                      <td className="py-2 px-3 text-xs">{r.status === "Compliance Review" ? "In review" : r.status === "Awaiting Buyer Payment" ? "Not started" : "Cleared"}</td>
                      <td className="py-2 px-3 font-mono text-xs">{r.payoutRef ?? "—"}</td>
                      <td className="py-2 px-3 text-xs">{r.paidDate ?? "—"}</td>
                      <td className="py-2 px-3 text-right">
                        {r.status === "RMB Paid"
                          ? <Button size="sm" variant="outline" onClick={() => toast.success(`Receipt ${r.payoutRef} downloaded`)}><Download className="h-3.5 w-3.5 mr-1" /> Receipt</Button>
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        )}

        {tab === "trade-files" && (
        <div role="tabpanel" data-state="active">
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
        <div role="tabpanel" data-state="active">
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
        <div role="tabpanel" data-state="active">
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
        <div role="tabpanel" data-state="active" className="space-y-4">
          <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
            <Lock className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm flex-1">
              <div className="font-semibold">Complete supplier verification to receive RMB settlement.</div>
              <div className="text-xs mt-1">You can view payment requests, upload invoices/documents, and message buyers or Canta before verification. RMB payouts unlock only after verification is approved.</div>
            </div>
            <Badge className={verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
              {verified ? "Verified" : "Submitted"}
            </Badge>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 space-y-2">
              <div className="text-sm font-semibold flex items-center gap-1"><Building2 className="h-4 w-4" /> Business Information</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Legal name: Guangzhou Tech Factory Co., Ltd</li>
                <li>Registration #: 91440101MA9XXX</li>
                <li>Address: 88 Baiyun Rd, Guangzhou, China</li>
              </ul>
              <Button size="sm" variant="outline">Update business info</Button>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="text-sm font-semibold flex items-center gap-1"><FileText className="h-4 w-4" /> Company Documents</div>
              <ul className="text-xs space-y-1">
                <li className="flex items-center justify-between">Business licence <Badge className="bg-emerald-100 text-emerald-800">Verified</Badge></li>
                <li className="flex items-center justify-between">Tax certificate <Badge className="bg-amber-100 text-amber-800">Pending</Badge></li>
                <li className="flex items-center justify-between">Export licence <Badge variant="outline">Required</Badge></li>
              </ul>
              <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1" /> Upload document</Button>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="text-sm font-semibold flex items-center gap-1"><UserCheck className="h-4 w-4" /> Authorized Representative</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Name: Li Wei</li>
                <li>Role: Supplier Admin</li>
                <li>ID: Passport E12345678</li>
              </ul>
              <Button size="sm" variant="outline">Update representative</Button>
            </Card>

            <Card className="p-4 space-y-2">
              <div className="text-sm font-semibold flex items-center gap-1"><Landmark className="h-4 w-4" /> Bank / RMB Payout Details</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>Bank: ICBC Guangzhou Branch</li>
                <li>Account: ****4821</li>
                <li>Beneficiary: Guangzhou Tech Factory Co., Ltd</li>
              </ul>
              <Button size="sm" variant="outline">Update payout details</Button>
            </Card>
          </div>

          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Verification Status</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {(["Not Submitted","Submitted","Under Review","Verified","Rejected","Update Required"]).map((s) => {
                const active = (verified && s === "Verified") || (!verified && s === "Under Review");
                return (
                  <Badge key={s} className={active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}>{s}</Badge>
                );
              })}
            </div>
            <ul className="text-sm space-y-2">
              <Check item="Business registration" done />
              <Check item="Factory address proof" done={false} />
              <Check item="Bank account verification" done={false} />
              <Check item="Authorized representative ID" done />
            </ul>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="text-sm font-semibold">Required Actions</div>
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
              <li>Upload factory address proof.</li>
              <li>Upload bank statement (last 3 months).</li>
              <li>Confirm authorized representative contact.</li>
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
        <div role="tabpanel" data-state="active">
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right break-all">{value}</div>
    </div>
  );
}

function PayoutAccountCard({
  currency, status, rows,
}: { currency: "RMB" | "USD"; status: "Not Submitted" | "Under Review" | "Verified" | "Rejected" | "Update Required"; rows: Array<[string, string]> }) {
  const tone =
    status === "Verified" ? "bg-emerald-100 text-emerald-800" :
    status === "Under Review" ? "bg-amber-100 text-amber-800" :
    status === "Rejected" ? "bg-destructive/10 text-destructive" :
    "bg-muted text-foreground";
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold flex items-center gap-1"><Landmark className="h-4 w-4" /> {currency} payout account</div>
        <Badge className={tone}>{status}</Badge>
      </div>
      <ul className="text-xs space-y-1.5">
        {rows.map(([k, v]) => (
          <li key={k} className="flex items-start justify-between gap-3 border-b last:border-0 pb-1">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </li>
        ))}
      </ul>
      <ButtonGroup label={`${currency} account actions`}>
        <Button size="sm" variant="outline">Edit account</Button>
        <Button size="sm" variant="outline">Submit for review</Button>
      </ButtonGroup>
      {status !== "Verified" && (
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          This account cannot receive settlement until it is verified.
        </div>
      )}
    </Card>
  );
}
