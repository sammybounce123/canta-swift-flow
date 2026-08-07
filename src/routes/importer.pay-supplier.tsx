import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send, ShieldCheck, Upload, Check } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import {
  useImporter, addPayment, addSupplier, addDocument, debitBalance, quoteFor,
  fmtNGN, CURRENCIES, COUNTRIES,
} from "@/lib/importer-store";

export const Route = createFileRoute("/importer/pay-supplier")({
  head: () => ({
    meta: [
      { title: "Pay a Supplier — Canta Importer" },
      { name: "description", content: "Pay any supplier globally: add their bank details, accept an FX quote, fund and submit." },
      { property: "og:title", content: "Pay a Supplier — Canta Importer" },
      { property: "og:description", content: "Pay any supplier globally: add their bank details, accept an FX quote, fund and submit." },
    ],
  }),
  component: PaySupplierPage,
});

const STEPS = ["Supplier details", "Payment details", "FX quote", "Fund payment", "Review & submit"];

type Form = {
  supplierId: string;
  name: string; country: string; contact: string; channel: string;
  bankName: string; accountName: string; accountNumber: string; swift: string; bankAddress: string;
  currency: string;
  amount: string; description: string; purpose: string; notes: string;
  invoice: string; supporting: string;
  fundedFrom: string;
  saveSupplier: boolean;
};

const EMPTY: Form = {
  supplierId: "", name: "", country: "", contact: "", channel: "",
  bankName: "", accountName: "", accountNumber: "", swift: "", bankAddress: "",
  currency: "RMB", amount: "", description: "", purpose: "Goods import payment", notes: "",
  invoice: "", supporting: "", fundedFrom: "Canta balance", saveSupplier: true,
};

function PaySupplierPage() {
  const s = useImporter();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [quoteAcceptedAt, setQuoteAcceptedAt] = useState<number | null>(null);
  const [quoteIssuedAt, setQuoteIssuedAt] = useState<number>(() => Date.now());
  const set = (k: keyof Form) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const amount = Number(f.amount.replace(/[^\d.]/g, "")) || 0;
  const quote = useMemo(() => quoteFor(amount, f.currency), [amount, f.currency]);
  const expired = Date.now() - quoteIssuedAt > 10 * 60 * 1000;

  const pickSaved = (id: string) => {
    const sup = s.suppliers.find((x) => x.id === id);
    if (!sup) return;
    setF((x) => ({
      ...x, supplierId: id, name: sup.name, country: sup.country, contact: sup.contact ?? "",
      channel: sup.contactChannel ?? "", bankName: sup.bankName, accountName: sup.accountName,
      accountNumber: sup.accountNumber, swift: sup.swift, currency: sup.currency, saveSupplier: false,
    }));
  };

  const submit = () => {
    if (!quoteAcceptedAt) { toast.error("Accept a valid FX quote first"); return; }
    if (f.saveSupplier && f.name) {
      addSupplier({
        name: f.name, country: f.country, contact: f.contact, contactChannel: f.channel,
        bankName: f.bankName, accountName: f.accountName, accountNumber: f.accountNumber,
        swift: f.swift, bankAddress: f.bankAddress, currency: f.currency,
      });
    }
    const docs = [f.invoice, f.supporting].filter(Boolean);
    const id = addPayment({
      supplierId: f.supplierId || undefined,
      supplier: f.name, country: f.country, bank: f.bankName, accountNumber: f.accountNumber,
      swift: f.swift, currency: f.currency, amount, ngnCost: quote.ngnCost, rate: quote.rate,
      fee: quote.fee, description: f.description, purpose: f.purpose, notes: f.notes,
      status: f.fundedFrom === "Canta balance" ? "Compliance review" : "Awaiting funding",
      fundedFrom: f.fundedFrom, documents: docs,
    });
    docs.forEach((d) => addDocument({ name: d, type: d === f.invoice ? "Commercial invoice" : "Supporting document", linkedPayment: id }));
    if (f.fundedFrom === "Canta balance") debitBalance(quote.ngnCost);
    toast.success(`Supplier Payment ${id} submitted`, { description: "Payments are reviewed before payout." });
    navigate({ to: "/importer/payments" });
  };

  const canNext =
    step === 0 ? Boolean(f.name && f.country && f.bankName && f.accountNumber) :
    step === 1 ? amount > 0 :
    step === 2 ? Boolean(quoteAcceptedAt) : true;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <ReadinessBar status="Demo Preview" cue="Illustrative FX rates. Payments are reviewed before payout." />
      <header>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Pay a Supplier</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your supplier does not need a Canta account. Canta pays directly to the supplier's bank account after payment, FX, and compliance review.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {STEPS.map((label, i) => (
          <Badge key={label} variant={i === step ? "default" : "outline"} className="text-[10px]">{i + 1}. {label}</Badge>
        ))}
      </div>

      <Card className="p-4 sm:p-5 shadow-card space-y-4">
        {step === 0 && (
          <>
            {s.suppliers.length > 0 && (
              <div>
                <Label>Use a saved supplier</Label>
                <Select value={f.supplierId} onValueChange={pickSaved}>
                  <SelectTrigger><SelectValue placeholder="Select a saved supplier (optional)" /></SelectTrigger>
                  <SelectContent>
                    {s.suppliers.map((sup) => <SelectItem key={sup.id} value={sup.id}>{sup.name} — {sup.country}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><Label>Supplier company name *</Label><Input value={f.name} onChange={(e) => set("name")(e.target.value)} placeholder="Yiwu Fashion Co." /></div>
              <div>
                <Label>Supplier country *</Label>
                <Select value={f.country} onValueChange={set("country")}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Contact name (optional)</Label><Input value={f.contact} onChange={(e) => set("contact")(e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>WhatsApp / email (optional)</Label><Input value={f.channel} onChange={(e) => set("channel")(e.target.value)} /></div>
              <div><Label>Supplier bank name *</Label><Input value={f.bankName} onChange={(e) => set("bankName")(e.target.value)} /></div>
              <div><Label>Account name</Label><Input value={f.accountName} onChange={(e) => set("accountName")(e.target.value)} /></div>
              <div><Label>Account number / IBAN *</Label><Input value={f.accountNumber} onChange={(e) => set("accountNumber")(e.target.value)} /></div>
              <div><Label>SWIFT / BIC</Label><Input value={f.swift} onChange={(e) => set("swift")(e.target.value)} /></div>
              <div className="sm:col-span-2"><Label>Bank address (optional)</Label><Input value={f.bankAddress} onChange={(e) => set("bankAddress")(e.target.value)} /></div>
              <div>
                <Label>Settlement currency</Label>
                <Select value={f.currency} onValueChange={set("currency")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
              Supplier bank details are checked before payout.
            </p>
          </>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><Label>Amount to send *</Label><Input inputMode="decimal" value={f.amount} onChange={(e) => { setF((x) => ({ ...x, amount: e.target.value })); setQuoteAcceptedAt(null); setQuoteIssuedAt(Date.now()); }} placeholder="180,000" /></div>
            <div>
              <Label>Currency supplier receives</Label>
              <Select value={f.currency} onValueChange={(v) => { set("currency")(v); setQuoteAcceptedAt(null); setQuoteIssuedAt(Date.now()); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label>Goods / service description</Label><Input value={f.description} onChange={(e) => set("description")(e.target.value)} placeholder="Apparel order #2291" /></div>
            <div><Label>Payment purpose</Label><Input value={f.purpose} onChange={(e) => set("purpose")(e.target.value)} /></div>
            <div><Label>Invoice upload</Label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => set("invoice")(`Commercial invoice — ${f.name || "supplier"}.pdf`)}>
                <Upload className="h-4 w-4" /> {f.invoice || "Upload invoice"}
              </Button>
            </div>
            <div className="sm:col-span-2"><Label>Supporting documents</Label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => set("supporting")(`Supporting document — ${f.name || "supplier"}.pdf`)}>
                <Upload className="h-4 w-4" /> {f.supporting || "Upload supporting document"}
              </Button>
            </div>
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={f.notes} onChange={(e) => set("notes")(e.target.value)} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
              <Row k="Amount supplier receives" v={`${f.currency} ${amount.toLocaleString()}`} />
              <Row k="Amount you pay" v={fmtNGN(quote.ngnCost)} />
              <Row k="Exchange rate" v={`1 ${f.currency} = ₦${quote.rate}`} />
              <Row k="Canta fee" v={fmtNGN(quote.fee)} />
              <Row k="Estimated settlement" v="1–3 business days after compliance review" />
              <Row k="Quote expiry" v={expired ? "Expired" : "10 minutes from issue"} />
            </div>
            {expired ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="destructive" className="text-[10px]">Quote expired</Badge>
                <span className="text-xs text-muted-foreground">Expired FX quotes cannot be used.</span>
                <Button size="sm" variant="outline" onClick={() => { setQuoteIssuedAt(Date.now()); setQuoteAcceptedAt(null); }}>Get a new quote</Button>
              </div>
            ) : quoteAcceptedAt ? (
              <Badge className="text-[10px]"><Check className="h-3 w-3" /> Quote accepted</Badge>
            ) : (
              <Button onClick={() => setQuoteAcceptedAt(Date.now())}>Accept quote</Button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <Label>How do you want to fund this payment?</Label>
            {["Canta balance", "Fund with NGN", "Fund with USDT"].map((opt) => (
              <button
                key={opt}
                onClick={() => set("fundedFrom")(opt)}
                className={`w-full text-left rounded-lg border p-3 text-sm transition ${f.fundedFrom === opt ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="font-medium">{opt === "Canta balance" ? "Use existing Canta balance" : opt}</div>
                <div className="text-xs text-muted-foreground">
                  {opt === "Canta balance" ? `Available: ${fmtNGN(s.ngnBalance)}` : "You'll get payment instructions on the Balance page."}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
            <Row k="Supplier" v={`${f.name} · ${f.country}`} />
            <Row k="Supplier bank details" v={`${f.bankName} · ${f.accountNumber}${f.swift ? ` · ${f.swift}` : ""}`} />
            <Row k="Amount" v={`${f.currency} ${amount.toLocaleString()}`} />
            <Row k="You pay" v={fmtNGN(quote.ngnCost)} />
            <Row k="Canta fee" v={fmtNGN(quote.fee)} />
            <Row k="Documents" v={[f.invoice, f.supporting].filter(Boolean).join(", ") || "None uploaded"} />
            <Row k="Funding" v={f.fundedFrom} />
            <Row k="Estimated timeline" v="1–3 business days after compliance review" />
            <p className="text-xs text-muted-foreground pt-2">
              Payments are reviewed before payout. Receipts are generated after provider confirmation.
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 pt-2">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((x) => x - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep((x) => x + 1)}>Continue</Button>
          ) : (
            <Button onClick={submit}>Submit Supplier Payment</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right break-words max-w-[60%]">{v}</span>
    </div>
  );
}
