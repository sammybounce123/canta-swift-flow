import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Send, ShieldCheck, Upload, Check, Plus, Wallet, AlertTriangle } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { FundWalletDialog } from "@/components/importer/FundWalletDialog";
import {
  useImporter, addPayment, addSupplier, addDocument, debitWallet, addWalletTx, quoteFor,
  fmtNGN, fmtWallet, CURRENCIES, COUNTRIES, FX_RATES, saveDraft, removeDraft, walletOf,
  type PaymentDraft,
} from "@/lib/importer-store";

const STEPS = ["Supplier", "Payment details", "Documents", "FX quote", "Funding", "Review & submit"];

type Form = {
  supplierId: string;
  name: string; country: string; contact: string; channel: string;
  bankName: string; accountName: string; accountNumber: string; swift: string; bankAddress: string;
  currency: string;
  amount: string; description: string; purpose: string; notes: string;
  invoice: string; supporting: string;
  fundingWallet: "NGN" | "USDT";
};

const EMPTY: Form = {
  supplierId: "", name: "", country: "", contact: "", channel: "",
  bankName: "", accountName: "", accountNumber: "", swift: "", bankAddress: "",
  currency: "RMB", amount: "", description: "", purpose: "Goods import payment", notes: "",
  invoice: "", supporting: "", fundingWallet: "NGN",
};

export function PaySupplierWizard() {
  const s = useImporter();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [addOpen, setAddOpen] = useState(false);
  const [fundOpen, setFundOpen] = useState(false);
  const [quoteAcceptedAt, setQuoteAcceptedAt] = useState<number | null>(null);
  const [quoteIssuedAt, setQuoteIssuedAt] = useState<number>(() => Date.now());
  const set = (k: keyof Form) => (v: string) => setF((x) => ({ ...x, [k]: v }));

  const amount = Number(f.amount.replace(/[^\d.]/g, "")) || 0;
  const quote = useMemo(() => quoteFor(amount, f.currency), [amount, f.currency]);
  const expired = Date.now() - quoteIssuedAt > 10 * 60 * 1000;

  const wallet = walletOf(s, f.fundingWallet);
  const cost = f.fundingWallet === "NGN" ? quote.ngnCost : Math.ceil(quote.ngnCost / FX_RATES.USD);
  const enough = (wallet?.available ?? 0) >= cost;

  const pickSaved = (id: string) => {
    const sup = s.suppliers.find((x) => x.id === id);
    if (!sup) return;
    setF((x) => ({
      ...x, supplierId: id, name: sup.name, country: sup.country, contact: sup.contact ?? "",
      channel: sup.contactChannel ?? "", bankName: sup.bankName, accountName: sup.accountName,
      accountNumber: sup.accountNumber, swift: sup.swift, currency: sup.currency,
    }));
  };

  const resume = (d: PaymentDraft) => {
    setF({ ...EMPTY, ...(d.form as Partial<Form>) });
    removeDraft(d.id);
    setQuoteAcceptedAt(null);
    setQuoteIssuedAt(Date.now());
    setStep(3);
    toast.success("Draft restored", { description: "Review the FX quote before submitting." });
  };

  const submit = () => {
    if (!f.bankName || !f.accountNumber) { toast.error("Supplier bank details are required"); return; }
    if (!f.invoice) { toast.error("Upload the supplier invoice before submitting"); return; }
    if (!quoteAcceptedAt || expired) { toast.error("Accept a valid FX quote first"); return; }
    if (!enough) { toast.error("Insufficient balance", { description: `Fund your ${f.fundingWallet} wallet before submitting.` }); return; }

    const docs = [f.invoice, f.supporting].filter(Boolean);
    const id = addPayment({
      supplierId: f.supplierId || undefined,
      supplier: f.name, country: f.country, bank: f.bankName, accountNumber: f.accountNumber,
      swift: f.swift, currency: f.currency, amount, ngnCost: quote.ngnCost, rate: quote.rate,
      fee: quote.fee, description: f.description, purpose: f.purpose, notes: f.notes,
      status: "Compliance review",
      fundedFrom: `${f.fundingWallet} Wallet`, documents: docs,
    });
    docs.forEach((d) => addDocument({ name: d, type: d === f.invoice ? "Commercial invoice" : "Supporting document", linkedPayment: id }));
    debitWallet(f.fundingWallet, cost);
    addWalletTx({ ccy: f.fundingWallet, type: "Supplier payment", amount: cost, status: "Pending", reference: id });
    toast.success(`Supplier Payment ${id} submitted`, { description: "Receipt is generated after payout confirmation." });
    navigate({ to: "/importer/payments", search: { tab: "pending" } });
  };

  const canNext =
    step === 0 ? Boolean(f.name && f.country && f.bankName && f.accountNumber) :
    step === 1 ? amount > 0 :
    step === 2 ? Boolean(f.invoice) :
    step === 3 ? Boolean(quoteAcceptedAt) && !expired :
    step === 4 ? enough : true;

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

      {step === 0 && s.drafts.length > 0 && (
        <Card className="p-3 shadow-card space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Saved drafts</div>
          {s.drafts.map((d) => (
            <div key={d.id} className="rounded-lg border border-border p-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>{d.supplier || "Unnamed supplier"} · {d.amountLabel} · saved {d.at}</span>
              <Button size="sm" variant="outline" onClick={() => resume(d)}>Resume draft</Button>
            </div>
          ))}
        </Card>
      )}

      <Card className="p-4 sm:p-5 shadow-card space-y-4">
        {step === 0 && (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[220px]">
                <Label>Select a saved supplier</Label>
                <Select value={f.supplierId} onValueChange={pickSaved}>
                  <SelectTrigger><SelectValue placeholder="Select a saved supplier" /></SelectTrigger>
                  <SelectContent>
                    {s.suppliers.map((sup) => <SelectItem key={sup.id} value={sup.id}>{sup.name} — {sup.country}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add New Supplier</Button>
            </div>

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
            <div className="sm:col-span-2"><Label>Notes</Label><Textarea value={f.notes} onChange={(e) => set("notes")(e.target.value)} /></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div><Label>Supplier invoice *</Label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => set("invoice")(`Commercial invoice — ${f.name || "supplier"}.pdf`)}>
                <Upload className="h-4 w-4" /> {f.invoice || "Upload invoice"}
              </Button>
            </div>
            <div><Label>Supporting documents (optional)</Label>
              <Button type="button" variant="outline" className="w-full justify-start" onClick={() => set("supporting")(`Supporting document — ${f.name || "supplier"}.pdf`)}>
                <Upload className="h-4 w-4" /> {f.supporting || "Upload supporting document"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">A supplier invoice is required before a payment can be submitted for review.</p>
          </div>
        )}

        {step === 3 && (
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

        {step === 4 && (
          <div className="space-y-3">
            <Label>Choose the wallet that funds this payment</Label>
            {(["NGN", "USDT"] as const).map((ccy) => {
              const w = walletOf(s, ccy);
              const need = ccy === "NGN" ? quote.ngnCost : Math.ceil(quote.ngnCost / FX_RATES.USD);
              return (
                <button
                  key={ccy}
                  onClick={() => setF((x) => ({ ...x, fundingWallet: ccy }))}
                  className={`w-full text-left rounded-lg border p-3 text-sm transition ${f.fundingWallet === ccy ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="font-medium flex items-center gap-1.5"><Wallet className="h-4 w-4" /> {ccy} Wallet</div>
                  <div className="text-xs text-muted-foreground">
                    Available {fmtWallet(w?.available ?? 0, ccy)} · this payment needs {fmtWallet(need, ccy)}
                  </div>
                </button>
              );
            })}

            {enough ? (
              <p className="text-xs text-muted-foreground">Use wallet balance — {fmtWallet(cost, f.fundingWallet)} will be reserved when you submit.</p>
            ) : (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
                <div className="text-sm font-semibold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4 text-destructive" /> Insufficient balance</div>
                <p className="text-xs text-muted-foreground">You need to fund your wallet before submitting this supplier payment.</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => { setF((x) => ({ ...x, fundingWallet: "NGN" })); setFundOpen(true); }}>Fund NGN Wallet</Button>
                  <Button size="sm" variant="outline" onClick={() => { setF((x) => ({ ...x, fundingWallet: "USDT" })); setFundOpen(true); }}>Fund USDT Wallet</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/importer/balance" })}>Go to Balance</Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      saveDraft({ supplier: f.name, amountLabel: `${f.currency} ${amount.toLocaleString()}`, form: f as unknown as Record<string, unknown> });
                      toast.success("Payment saved as draft", { description: "Fund your wallet, then resume the draft." });
                      navigate({ to: "/importer/balance" });
                    }}
                  >Save payment as draft</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
            <Row k="Supplier" v={`${f.name} · ${f.country}`} />
            <Row k="Supplier bank details" v={`${f.bankName} · ${f.accountNumber}${f.swift ? ` · ${f.swift}` : ""}`} />
            <Row k="Amount" v={`${f.currency} ${amount.toLocaleString()}`} />
            <Row k="You pay" v={fmtNGN(quote.ngnCost)} />
            <Row k="Canta fee" v={fmtNGN(quote.fee)} />
            <Row k="Documents" v={[f.invoice, f.supporting].filter(Boolean).join(", ") || "None uploaded"} />
            <Row k="Funding source" v={`${f.fundingWallet} Wallet — ${fmtWallet(cost, f.fundingWallet)}`} />
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

      <AddSupplierDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={(id) => { pickSaved(id); setAddOpen(false); toast.success("Supplier bank details added."); }}
      />
      <FundWalletDialog open={fundOpen} onOpenChange={setFundOpen} initialMethod={f.fundingWallet} />
    </div>
  );
}

function AddSupplierDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: (id: string) => void }) {
  const [d, setD] = useState({
    name: "", country: "", contact: "", channel: "", bankName: "", accountName: "",
    accountNumber: "", swift: "", bankAddress: "", currency: "RMB",
  });
  const set = (k: keyof typeof d) => (v: string) => setD((x) => ({ ...x, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new supplier</DialogTitle>
          <DialogDescription>Beneficiary means the supplier bank account that receives the payment.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2"><Label>Supplier company name *</Label><Input value={d.name} onChange={(e) => set("name")(e.target.value)} /></div>
          <div>
            <Label>Supplier country *</Label>
            <Select value={d.country} onValueChange={set("country")}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Contact name (optional)</Label><Input value={d.contact} onChange={(e) => set("contact")(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>WhatsApp / email (optional)</Label><Input value={d.channel} onChange={(e) => set("channel")(e.target.value)} /></div>
          <div><Label>Supplier bank name *</Label><Input value={d.bankName} onChange={(e) => set("bankName")(e.target.value)} /></div>
          <div><Label>Supplier account name</Label><Input value={d.accountName} onChange={(e) => set("accountName")(e.target.value)} /></div>
          <div><Label>Account number / IBAN *</Label><Input value={d.accountNumber} onChange={(e) => set("accountNumber")(e.target.value)} /></div>
          <div><Label>SWIFT / BIC</Label><Input value={d.swift} onChange={(e) => set("swift")(e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Bank address (optional)</Label><Input value={d.bankAddress} onChange={(e) => set("bankAddress")(e.target.value)} /></div>
          <div>
            <Label>Settlement currency</Label>
            <Select value={d.currency} onValueChange={set("currency")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="w-full"
          disabled={!d.name || !d.country || !d.bankName || !d.accountNumber}
          onClick={() => {
            const id = addSupplier({
              name: d.name, country: d.country, contact: d.contact, contactChannel: d.channel,
              bankName: d.bankName, accountName: d.accountName, accountNumber: d.accountNumber,
              swift: d.swift, bankAddress: d.bankAddress, currency: d.currency,
            });
            onSaved(id);
          }}
        >Save supplier bank details</Button>
      </DialogContent>
    </Dialog>
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
