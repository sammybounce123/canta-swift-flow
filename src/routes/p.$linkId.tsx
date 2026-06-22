import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Lock, ShieldCheck, CheckCircle2, AlertTriangle, CreditCard, Building2, Smartphone, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/mock";

export const Route = createFileRoute("/p/$linkId")({
  head: () => ({ meta: [{ title: "Secure Payment — Canta" }] }),
  component: PublicPayPage,
});

type PaymentLink = {
  id: string;
  invoiceId?: string;
  label?: string;
  url?: string;
  amount: number;
  ccy: string;
  status: "Active" | "Paid" | "Expired";
  createdAt: string;
};
type Invoice = {
  id: string;
  subject?: string;
  purpose?: string;
  amount: number;
  ccy: string;
  status?: string;
  createdAt?: string;
  fields?: Record<string, string>;
};

const LS_LINKS = "canta:collections:paymentLinks";
const LS_INVOICES = "canta:collections:invoices";

const DEMO: Record<string, PaymentLink> = {
  "pl-demo-001": { id: "PL-DEMO-001", label: "Tuition — Spring 2026", amount: 8500, ccy: "USD", status: "Active", createdAt: "2026-06-12" },
  "pl-demo-002": { id: "PL-DEMO-002", label: "Donation — June Drive", amount: 2500, ccy: "USD", status: "Paid", createdAt: "2026-06-11" },
  "pl-demo-003": { id: "PL-DEMO-003", label: "Conference ticket", amount: 350, ccy: "EUR", status: "Active", createdAt: "2026-06-10" },
};

function readArr<T>(key: string): T[] {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function writeArr<T>(key: string, arr: T[]) {
  try { localStorage.setItem(key, JSON.stringify(arr)); } catch {}
}

function PublicPayPage() {
  const { linkId } = useParams({ from: "/p/$linkId" });
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [step, setStep] = useState<"review" | "method" | "done">("review");
  const [method, setMethod] = useState<"card" | "bank" | "mobile">("card");

  useEffect(() => {
    const links = readArr<PaymentLink>(LS_LINKS);
    const id = linkId.toUpperCase();
    let found = links.find(l => l.id?.toUpperCase() === id || l.id?.toLowerCase() === linkId.toLowerCase());
    if (!found) {
      const demo = DEMO[linkId.toLowerCase()];
      if (demo) found = demo;
    }
    if (found) {
      setLink(found);
      if (found.invoiceId) {
        const inv = readArr<Invoice>(LS_INVOICES).find(i => i.id === found!.invoiceId);
        if (inv) setInvoice(inv);
      }
    }
  }, [linkId]);

  const ref = useMemo(() => `CANTA-${linkId.toUpperCase().slice(0, 8)}`, [linkId]);

  if (!link) {
    return (
      <Shell>
        <Card className="p-10 text-center shadow-card max-w-md mx-auto mt-20">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
          <h2 className="mt-3 text-lg font-semibold">Payment link not found</h2>
          <p className="text-sm text-muted-foreground mt-2">This link may have expired or been removed by the merchant.</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/">Back to Canta</Link></Button>
        </Card>
      </Shell>
    );
  }

  if (link.status === "Paid") {
    return (
      <Shell>
        <Card className="p-10 text-center shadow-card max-w-md mx-auto mt-20">
          <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
          <h2 className="mt-3 text-lg font-semibold">This payment is already complete</h2>
          <p className="text-sm text-muted-foreground mt-2">A receipt was sent to the payer's email.</p>
        </Card>
      </Shell>
    );
  }

  const pay = () => {
    // mark link as paid in storage
    const links = readArr<PaymentLink>(LS_LINKS);
    const next = links.map(l => l.id === link.id ? { ...l, status: "Paid" as const } : l);
    if (next.find(l => l.id === link.id)) writeArr(LS_LINKS, next);
    // mark invoice as paid
    if (link.invoiceId) {
      const invs = readArr<Invoice>(LS_INVOICES);
      writeArr(LS_INVOICES, invs.map(i => i.id === link.invoiceId ? { ...i, status: "Paid" } : i));
    }
    setStep("done");
    toast.success("Payment successful", { description: `${fmtMoney(link.amount, link.ccy)} received` });
  };

  return (
    <Shell>
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-semibold">Canta</span>
            <span className="text-muted-foreground"> · Secure checkout</span>
          </div>
          <Badge variant="outline" className="ml-auto text-[10px]"><Lock className="h-3 w-3 mr-1" /> 256-bit secure</Badge>
        </div>

        <Card className="p-6 shadow-card space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Pay</div>
              <div className="text-2xl font-semibold tabular-nums mt-1">{fmtMoney(link.amount, link.ccy)}</div>
              <div className="text-sm text-muted-foreground mt-1 truncate">{link.label || invoice?.subject || "Payment to Canta merchant"}</div>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-[10px]">{link.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
            <Field label="Reference" value={ref} copyable />
            <Field label="Link ID" value={link.id} />
            {invoice?.purpose && <Field label="Purpose" value={invoice.purpose} />}
            {invoice?.fields?.payerCountry && <Field label="Country" value={invoice.fields.payerCountry} />}
            <Field label="Issued" value={link.createdAt} />
          </div>

          {step === "review" && (
            <div className="flex justify-end border-t pt-4">
              <Button onClick={() => setStep("method")}>Continue to payment</Button>
            </div>
          )}

          {step === "method" && (
            <div className="space-y-4 border-t pt-4">
              <div className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Choose payment method</div>
              <div className="grid grid-cols-3 gap-2">
                <MethodPill icon={CreditCard} label="Card" active={method === "card"} onClick={() => setMethod("card")} />
                <MethodPill icon={Building2} label="Bank" active={method === "bank"} onClick={() => setMethod("bank")} />
                <MethodPill icon={Smartphone} label="Mobile" active={method === "mobile"} onClick={() => setMethod("mobile")} />
              </div>
              {method === "card" && <CardForm />}
              {method === "bank" && <BankInstructions ref_={ref} amount={fmtMoney(link.amount, link.ccy)} />}
              {method === "mobile" && <MobileForm />}
              <div className="flex justify-between items-center border-t pt-4">
                <Button variant="ghost" onClick={() => setStep("review")}>Back</Button>
                <Button onClick={pay} className="bg-primary">Pay {fmtMoney(link.amount, link.ccy)}</Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="border-t pt-6 text-center space-y-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-success/15 grid place-items-center"><CheckCircle2 className="h-6 w-6 text-success" /></div>
              <div className="text-lg font-semibold">Payment successful</div>
              <p className="text-sm text-muted-foreground">A receipt for {fmtMoney(link.amount, link.ccy)} has been sent. Reference <span className="font-mono">{ref}</span>.</p>
              <Button asChild variant="outline"><Link to="/">Done</Link></Button>
            </div>
          )}
        </Card>

        <div className="text-center text-[11px] text-muted-foreground">
          Powered by Canta · <Link to="/" className="underline">canta.app</Link>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">C</div>
          <div>
            <div className="text-sm font-semibold leading-none">Canta Checkout</div>
            <div className="text-[11px] text-muted-foreground">Secure global payment</div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium flex items-center gap-1.5">
        <span className="truncate">{value}</span>
        {copyable && (
          <button onClick={() => { navigator.clipboard?.writeText(value); toast.success("Copied"); }} className="text-muted-foreground hover:text-foreground">
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function MethodPill({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`rounded-lg border p-3 flex flex-col items-center gap-1 text-xs transition ${active ? "border-primary bg-primary/5 text-primary" : "hover:border-primary/40"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function CardForm() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2"><Label className="text-xs">Card number</Label><Input placeholder="4242 4242 4242 4242" /></div>
      <div><Label className="text-xs">Expiry</Label><Input placeholder="MM / YY" /></div>
      <div><Label className="text-xs">CVC</Label><Input placeholder="123" /></div>
      <div className="col-span-2"><Label className="text-xs">Name on card</Label><Input placeholder="Full name" /></div>
      <div className="col-span-2"><Label className="text-xs">Country</Label>
        <Select defaultValue="NG"><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{["NG","GB","US","KE","ZA","GH"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

function BankInstructions({ ref_, amount }: { ref_: string; amount: string }) {
  const copy = (s: string) => { navigator.clipboard?.writeText(s); toast.success("Copied"); };
  return (
    <div className="rounded-lg border bg-secondary/30 p-4 grid grid-cols-2 gap-3 text-sm">
      <Field label="Account name" value="Canta Payments Ltd" />
      <Field label="Bank" value="Providus Bank" />
      <Field label="Account number" value="1300912488" copyable />
      <Field label="Amount" value={amount} />
      <Field label="Reference" value={ref_} copyable />
      <div className="col-span-2 text-[11px] text-muted-foreground">Use the reference exactly so Canta can match your transfer.</div>
      <button onClick={() => copy("1300912488")} className="hidden" />
    </div>
  );
}

function MobileForm() {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div><Label className="text-xs">Mobile money provider</Label>
        <Select defaultValue="mpesa"><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{[["mpesa","M-Pesa"],["mtn","MTN MoMo"],["airtel","Airtel Money"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label className="text-xs">Phone number</Label><Input placeholder="+254…" /></div>
    </div>
  );
}
