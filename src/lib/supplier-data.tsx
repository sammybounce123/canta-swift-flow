import { useSyncExternalStore } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { CheckCircle2, AlertTriangle, Landmark, Wallet } from "lucide-react";

// --- Types & constants -------------------------------------------------------

export type SettlementStatus =
  | "Awaiting Buyer Payment"
  | "NGN Received"
  | "Compliance Review"
  | "FX Processing"
  | "RMB Payout Initiated"
  | "RMB Paid"
  | "Failed"
  | "On Hold"
  | "Refunded";

export const STATUS_TONE: Record<SettlementStatus, string> = {
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

export type SupplierRequest = {
  id: string; invoiceNumber: string; buyer: string; tradeFile: string; goods: string;
  amountNgn: number; amountRmb: number; invoiceCurrency: "RMB" | "USD";
  dueDate: string; invoiceDoc: string; status: SettlementStatus; updated: string;
  rate: number; fee: number; payoutRef?: string; paidDate?: string;
  senderAccount?: { bank: string; accountName: string; accountNumber: string };
};

export const REQUESTS: SupplierRequest[] = [
  { id: "PR-3041", invoiceNumber: "INV-2026-041", buyer: "Lagos Trade Holdings",  tradeFile: "TF-2026-0214", goods: "Bluetooth speakers x 500",   amountNgn: 19_300_000, amountRmb: 94_500,  invoiceCurrency: "RMB", dueDate: "2026-06-10", invoiceDoc: "INV-041.pdf", status: "RMB Paid",               updated: "2 hours ago", rate: 204.23, fee: 12_500, payoutRef: "RMB-PO-88421", paidDate: "2026-06-12", senderAccount: { bank: "GTBank", accountName: "Lagos Trade Holdings Ltd", accountNumber: "0123456789" } },
  { id: "PR-3055", invoiceNumber: "INV-2026-055", buyer: "Abuja Imports Ltd",     tradeFile: "TF-2026-0231", goods: "LED panels x 220",           amountNgn: 8_650_000,  amountRmb: 42_300,  invoiceCurrency: "RMB", dueDate: "2026-06-20", invoiceDoc: "INV-055.pdf", status: "FX Processing",          updated: "today",       rate: 204.49, fee: 8_100,  senderAccount: { bank: "Access Bank", accountName: "Abuja Imports Ltd", accountNumber: "0987654321" } },
  { id: "PR-3062", invoiceNumber: "INV-2026-062", buyer: "Kano Distributors",     tradeFile: "TF-2026-0244", goods: "Industrial sewing machines", amountNgn: 14_120_000, amountRmb: 69_100,  invoiceCurrency: "RMB", dueDate: "2026-06-25", invoiceDoc: "INV-062.pdf", status: "NGN Received",           updated: "yesterday",   rate: 204.34, fee: 10_900, senderAccount: { bank: "Zenith Bank", accountName: "Kano Distributors", accountNumber: "1122334455" } },
  { id: "PR-3071", invoiceNumber: "INV-2026-071", buyer: "Port Harcourt Trading", tradeFile: "TF-2026-0259", goods: "Solar inverters x 60",       amountNgn: 27_400_000, amountRmb: 134_200, invoiceCurrency: "RMB", dueDate: "2026-07-01", invoiceDoc: "INV-071.pdf", status: "Awaiting Buyer Payment", updated: "3 days ago",  rate: 204.17, fee: 15_400 },
  { id: "PR-3080", invoiceNumber: "INV-2026-080", buyer: "Lagos Trade Holdings",  tradeFile: "TF-2026-0263", goods: "Plastic injection moulds",   amountNgn: 6_120_000,  amountRmb: 29_900,  invoiceCurrency: "RMB", dueDate: "2026-07-04", invoiceDoc: "INV-080.pdf", status: "Compliance Review",      updated: "5 days ago",  rate: 204.68, fee: 6_200,  senderAccount: { bank: "GTBank", accountName: "Lagos Trade Holdings Ltd", accountNumber: "0123456789" } },
];

export type Buyer = {
  name: string; company: string; email: string; phone: string; country: string;
};

export const BUYERS: Buyer[] = [
  { name: "Tunde Bakare",   company: "Lagos Trade Holdings",  email: "tunde@lagostrade.ng",    phone: "+234 802 111 2233", country: "Nigeria" },
  { name: "Amina Yusuf",    company: "Abuja Imports Ltd",     email: "amina@abujaimports.ng",  phone: "+234 803 222 3344", country: "Nigeria" },
  { name: "Ibrahim Musa",   company: "Kano Distributors",     email: "ibrahim@kanodist.ng",    phone: "+234 805 333 4455", country: "Nigeria" },
  { name: "Chioma Eze",     company: "Port Harcourt Trading", email: "chioma@phtrading.ng",    phone: "+234 806 444 5566", country: "Nigeria" },
];

export const TIMELINE_STEPS = [
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

export const COMPLIANCE_DISCLAIMER =
  "FX quotes, settlement amounts, and payout timelines are subject to payment confirmation, compliance review, FX availability, partner rails, and applicable regulations.";

export const SUPPLIER_TABS: Array<{ to: string; label: string }> = [
  { to: "/supplier-portal",                    label: "Overview" },
  { to: "/supplier-portal/buyers",             label: "Nigerian Buyers" },
  { to: "/supplier-portal/requests",           label: "Payment Requests" },
  { to: "/supplier-portal/fx-quotes",          label: "FX Quotes" },
  { to: "/supplier-portal/ngn-details",        label: "NGN Payment Details" },
  { to: "/supplier-portal/payout-accounts",    label: "Payout Accounts" },
  { to: "/supplier-portal/invoices",           label: "Invoices" },
  { to: "/supplier-portal/settlement",         label: "RMB / USD Settlement" },
  { to: "/supplier-portal/trade-files",        label: "Trade Files" },
  { to: "/supplier-portal/documents",          label: "Documents" },
  { to: "/supplier-portal/messages",           label: "Messages" },
  { to: "/supplier-portal/verification",       label: "Verification" },
  { to: "/supplier-portal/support",            label: "Support" },
];

// --- Verification store ------------------------------------------------------

let verified = false;
const verifiedSubs = new Set<() => void>();
export const verifiedStore = {
  get: () => verified,
  set: (v: boolean) => { verified = v; verifiedSubs.forEach((f) => f()); },
  subscribe: (f: () => void) => { verifiedSubs.add(f); return () => verifiedSubs.delete(f); },
};
export function useVerified() {
  return useSyncExternalStore(verifiedStore.subscribe, verifiedStore.get, verifiedStore.get);
}

// --- FX quote store ----------------------------------------------------------

export type FxQuoteStatus =
  | "Draft" | "Quote Generated" | "Rate Locked" | "Sent to Buyer" | "Expired"
  | "Buyer Paid" | "Processing Settlement" | "Settled" | "Cancelled";

export type FxQuote = {
  id: string; invoiceNumber: string; buyer: string;
  invoiceAmount: number; invoiceCurrency: "RMB" | "USD";
  settlementCurrency: "RMB" | "USD"; rate: number; ngnTotal: number;
  fee: number; estReceivable: number; payoutAccount: string;
  expiresAt: number; lockedUntil?: number; status: FxQuoteStatus;
  sentAt?: number;
};

function buildQuote(r: SupplierRequest, seq: number, statusOverride?: FxQuoteStatus): FxQuote {
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
}

let fxQuotes: FxQuote[] = (() => {
  const seeded: FxQuoteStatus[] = ["Quote Generated", "Rate Locked", "Buyer Paid", "Processing Settlement"];
  return REQUESTS.slice(0, 4).map((r, i) => {
    const q = buildQuote(r, i, seeded[i]);
    if (q.status === "Rate Locked") q.lockedUntil = q.expiresAt;
    return q;
  });
})();
let selectedQuoteId: string | null = null;
const fxSubs = new Set<() => void>();
const notify = () => fxSubs.forEach((f) => f());

export const fxQuoteStore = {
  getQuotes: () => fxQuotes,
  getSelectedId: () => selectedQuoteId,
  subscribe: (f: () => void) => { fxSubs.add(f); return () => fxSubs.delete(f); },
  select: (id: string) => { selectedQuoteId = id; notify(); },
  generate: () => {
    const nextIndex = fxQuotes.length;
    const source = REQUESTS[nextIndex % REQUESTS.length];
    const quote = buildQuote(source, nextIndex);
    fxQuotes = [quote, ...fxQuotes];
    selectedQuoteId = quote.id;
    notify();
    return quote;
  },
  lock: (id: string) => {
    fxQuotes = fxQuotes.map((q) => q.id === id
      ? { ...q, status: "Rate Locked", lockedUntil: Date.now() + 15 * 60 * 1000, expiresAt: Date.now() + 15 * 60 * 1000 }
      : q);
    notify();
  },
  send: (id: string) => {
    fxQuotes = fxQuotes.map((q) => q.id === id
      ? { ...q, status: q.status === "Rate Locked" ? "Rate Locked" : "Sent to Buyer", sentAt: Date.now() }
      : q);
    notify();
  },
  refresh: (id: string) => {
    fxQuotes = fxQuotes.map((q) => {
      if (q.id !== id) return q;
      const jitter = (Math.random() - 0.5) * 0.8;
      const newRate = +(q.rate + jitter).toFixed(2);
      return { ...q, rate: newRate, ngnTotal: Math.round(q.invoiceAmount * newRate), expiresAt: Date.now() + 15 * 60 * 1000, status: "Quote Generated" };
    });
    notify();
  },
};

export function useFxQuotes() {
  return useSyncExternalStore(fxQuoteStore.subscribe, fxQuoteStore.getQuotes, fxQuoteStore.getQuotes);
}
export function useSelectedQuoteId() {
  return useSyncExternalStore(fxQuoteStore.subscribe, fxQuoteStore.getSelectedId, fxQuoteStore.getSelectedId);
}
export function useActiveQuote() {
  const quotes = useFxQuotes();
  const selectedId = useSelectedQuoteId();
  return quotes.find((q) => q.id === selectedId) ?? quotes.find((q) => q.status === "Quote Generated") ?? quotes[0];
}
export function formatCountdown(ts: number) {
  const ms = Math.max(0, ts - Date.now());
  const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000);
  return ms === 0 ? "Expired" : `${m}m ${s.toString().padStart(2, "0")}s`;
}

// --- Shared subcomponents ----------------------------------------------------

export function KPI({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Wallet }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </Card>
  );
}

export function Check({ item, done }: { item: string; done: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{item}</span>
    </li>
  );
}

export function SettlementTimeline({ currentIndex }: { currentIndex: number }) {
  return (
    <ol className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
      {TIMELINE_STEPS.map((s, i) => {
        const done = i < currentIndex; const active = i === currentIndex;
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

export function RequestsTable({ rows, compact }: { rows: SupplierRequest[]; compact?: boolean }) {
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

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-right break-all">{value}</div>
    </div>
  );
}

export function PayoutAccountCard({
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
      <div className="text-[11px] text-muted-foreground italic">
        Payout account is receive-only. Suppliers cannot send funds out of Canta from this account.
      </div>
      {status !== "Verified" && (
        <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          This account cannot receive settlement until it is verified.
        </div>
      )}
    </Card>
  );
}
