import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, RefreshCw, Lock, ArrowLeft, ArrowRight, FileText, Send, Copy, Download, MessageCircle, Save } from "lucide-react";
import { toast } from "sonner";
import {
  BUYERS, fxQuoteStore, useFxQuotes, formatCountdown, type FxQuote,
} from "@/lib/supplier-data";
import {
  invoiceStore, nextInvoiceNumber, calcTotals, isQuoteExpired,
  type Invoice, type InvoiceItem,
} from "@/lib/invoice-store";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetQuoteId?: string;
  presetBuyerCompany?: string;
  onCreated?: (inv: Invoice) => void;
};

const SUPPLIER = {
  company: "Shenzhen Canta Trading Co., Ltd",
  address: "Room 1208, Futian District, Shenzhen, China",
};
const PAYOUT_ACCOUNT = { label: "ICBC ****4821 (RMB)", verified: true };

function emptyItem(): InvoiceItem {
  return { id: crypto.randomUUID?.() ?? `it_${Math.random()}`, description: "", quantity: 1, unit: "pcs", unitPrice: 0 };
}

export function GenerateInvoiceWizard({ open, onOpenChange, presetQuoteId, presetBuyerCompany, onCreated }: Props) {
  const quotes = useFxQuotes();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t); }, []);

  // Step 1
  const [quoteId, setQuoteId] = useState<string | undefined>(presetQuoteId);
  const [buyerCompany, setBuyerCompany] = useState<string>(presetBuyerCompany ?? BUYERS[0].company);

  useEffect(() => {
    if (open) {
      setStep(1);
      setQuoteId(presetQuoteId ?? quotes.find((q) => !isQuoteExpired(q))?.id);
      setBuyerCompany(presetBuyerCompany ?? BUYERS[0].company);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedQuote: FxQuote | undefined = useMemo(
    () => quotes.find((q) => q.id === quoteId),
    [quotes, quoteId],
  );
  const buyer = BUYERS.find((b) => b.company === buyerCompany) ?? BUYERS[0];
  const expired = isQuoteExpired(selectedQuote);

  // Step 2
  const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [tradeFileRef, setTradeFileRef] = useState("");
  const [buyerReference, setBuyerReference] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("Lagos, Nigeria");
  const [origin, setOrigin] = useState("Shenzhen, CN");
  const [destination, setDestination] = useState("Apapa Port, Lagos, NG");
  const [incoterm, setIncoterm] = useState("FOB");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [other, setOther] = useState(0);

  useEffect(() => { if (open) setInvoiceNumber(nextInvoiceNumber()); }, [open]);

  const { subtotal, total } = calcTotals(items, discount, shipping, other);

  // Step 3
  const [confirmed, setConfirmed] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [paymentRequestOpen, setPaymentRequestOpen] = useState(false);

  const currency = selectedQuote?.invoiceCurrency ?? "RMB";
  const ngnBuyerPays = selectedQuote ? Math.round(total * selectedQuote.rate) : 0;
  const cantaFee = selectedQuote ? Math.round(ngnBuyerPays * 0.009) : 0;
  const estReceivable = selectedQuote?.settlementCurrency === "USD"
    ? +(total / 7.2).toFixed(2)
    : total;

  const refreshQuote = () => {
    if (!selectedQuote) {
      const q = fxQuoteStore.generate();
      setQuoteId(q.id);
      toast.success(`New FX quote ${q.id} generated`);
      return;
    }
    fxQuoteStore.refresh(selectedQuote.id);
    toast.success(`Quote ${selectedQuote.id} refreshed`);
  };

  const generate = () => {
    if (!selectedQuote) return toast.error("Select an FX quote");
    if (isQuoteExpired(selectedQuote)) return toast.error("FX quote has expired");
    if (!PAYOUT_ACCOUNT.verified) return toast.error("Supplier payout account is not verified");
    if (!invoiceNumber.trim()) return toast.error("Invoice number required");
    if (items.length === 0 || items.some((i) => !i.description.trim() || i.quantity <= 0)) {
      return toast.error("Add at least one valid invoice item");
    }
    if (total <= 0) return toast.error("Invoice total must be greater than zero");
    if (invoiceStore.list().some((i) => i.invoiceNumber === invoiceNumber)) {
      return toast.error("Duplicate invoice number");
    }
    if (!confirmed) return toast.error("Please confirm invoice details");

    try {
      const inv = invoiceStore.add({
        invoiceNumber,
        invoiceDate,
        dueDate: dueDate || invoiceDate,
        poNumber: poNumber || undefined,
        tradeFileRef: tradeFileRef || undefined,
        buyerReference: buyerReference || undefined,
        currency,
        supplier: SUPPLIER,
        buyer: { company: buyer.company, email: buyer.email, phone: buyer.phone, address: buyerAddress },
        shippingOrigin: origin,
        destination,
        incoterm,
        notes,
        items,
        discount, shipping, otherCharges: other,
        subtotal, total,
        fxQuoteId: selectedQuote.id,
        fxRate: selectedQuote.rate,
        ngnBuyerPays,
        cantaFee,
        estReceivable,
        settlementCurrency: selectedQuote.settlementCurrency,
        payoutAccount: PAYOUT_ACCOUNT.label,
        quoteExpiresAt: selectedQuote.expiresAt,
        status: "Draft",
        paymentRequestStatus: "None",
      });
      setCreatedInvoice(inv);
      onCreated?.(inv);
      onOpenChange(false);
      setSuccessOpen(true);
      toast.success(`Invoice ${inv.invoiceNumber} created as Draft`);
    } catch (e) {
      toast.error("Failed to save invoice");
    }
  };

  const saveDraft = () => {
    if (!invoiceNumber.trim()) return toast.error("Invoice number required");
    try {
      const inv = invoiceStore.add({
        invoiceNumber, invoiceDate, dueDate: dueDate || invoiceDate,
        poNumber: poNumber || undefined, tradeFileRef: tradeFileRef || undefined,
        buyerReference: buyerReference || undefined, currency,
        supplier: SUPPLIER,
        buyer: { company: buyer.company, email: buyer.email, phone: buyer.phone, address: buyerAddress },
        shippingOrigin: origin, destination, incoterm, notes,
        items, discount, shipping, otherCharges: other, subtotal, total,
        fxQuoteId: selectedQuote?.id, fxRate: selectedQuote?.rate,
        ngnBuyerPays, cantaFee, estReceivable,
        settlementCurrency: selectedQuote?.settlementCurrency,
        payoutAccount: PAYOUT_ACCOUNT.label,
        quoteExpiresAt: selectedQuote?.expiresAt,
        status: "Draft",
      });
      onCreated?.(inv);
      onOpenChange(false);
      toast.success(`Draft ${inv.invoiceNumber} saved`);
    } catch { toast.error("Failed to save draft"); }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Invoice</DialogTitle>
            <DialogDescription>
              Create a draft invoice for a Nigerian buyer. Review all details before creating the payment request.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2 text-xs">
            {[1, 2, 3].map((n) => (
              <div key={n} className={`flex-1 h-1.5 rounded ${step >= n ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Step {step} of 3 · {step === 1 ? "Buyer & FX quote" : step === 2 ? "Invoice details" : "Review & confirm"}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nigerian buyer</Label>
                <Select value={buyerCompany} onValueChange={setBuyerCompany}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUYERS.map((b) => <SelectItem key={b.company} value={b.company}>{b.company}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Card className="p-3 text-xs space-y-1 bg-secondary/30">
                  <div><span className="text-muted-foreground">Contact:</span> {buyer.name}</div>
                  <div><span className="text-muted-foreground">Email:</span> {buyer.email}</div>
                  <div><span className="text-muted-foreground">WhatsApp:</span> {buyer.phone}</div>
                </Card>
              </div>

              <div className="space-y-1.5">
                <Label>Select an active FX quote</Label>
                <Select value={quoteId} onValueChange={setQuoteId}>
                  <SelectTrigger><SelectValue placeholder="Choose FX quote" /></SelectTrigger>
                  <SelectContent>
                    {quotes.map((q) => (
                      <SelectItem key={q.id} value={q.id} disabled={isQuoteExpired(q)}>
                        {q.id} · {q.invoiceCurrency} → {q.settlementCurrency} · Rate {q.rate} {isQuoteExpired(q) ? "· Expired" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedQuote && (
                  <Card className="p-3 text-xs grid grid-cols-2 gap-2 bg-secondary/30">
                    <div><span className="text-muted-foreground">Quote:</span> {selectedQuote.id}</div>
                    <div><span className="text-muted-foreground">Currency:</span> {selectedQuote.invoiceCurrency}</div>
                    <div><span className="text-muted-foreground">Rate:</span> {selectedQuote.rate} NGN/{selectedQuote.invoiceCurrency}</div>
                    <div className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Expires: {formatCountdown(selectedQuote.expiresAt)}</div>
                    <div><span className="text-muted-foreground">Payout currency:</span> {selectedQuote.settlementCurrency}</div>
                    <div><span className="text-muted-foreground">Payout account:</span> {PAYOUT_ACCOUNT.label} <Badge className="ml-1 bg-emerald-100 text-emerald-800">Verified</Badge></div>
                  </Card>
                )}
                {expired && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded p-2 flex items-center justify-between">
                    <span>This FX quote has expired. Generate a new quote before creating the invoice.</span>
                    <Button size="sm" variant="outline" onClick={refreshQuote}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh FX Quote</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Invoice number"><Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} /></Field>
                <Field label="Currency">
                  <Input value={currency} disabled />
                </Field>
                <Field label="Invoice date"><Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} /></Field>
                <Field label="Payment due date"><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></Field>
                <Field label="PO number (optional)"><Input value={poNumber} onChange={(e) => setPoNumber(e.target.value)} /></Field>
                <Field label="Trade File (optional)"><Input value={tradeFileRef} onChange={(e) => setTradeFileRef(e.target.value)} placeholder="TR-1234" /></Field>
                <Field label="Buyer reference (optional)"><Input value={buyerReference} onChange={(e) => setBuyerReference(e.target.value)} /></Field>
                <Field label="Incoterm (optional)"><Input value={incoterm} onChange={(e) => setIncoterm(e.target.value)} /></Field>
                <Field label="Supplier company"><Input value={SUPPLIER.company} disabled /></Field>
                <Field label="Supplier address"><Input value={SUPPLIER.address} disabled /></Field>
                <Field label="Buyer company"><Input value={buyer.company} disabled /></Field>
                <Field label="Buyer address"><Input value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} /></Field>
                <Field label="Shipping origin"><Input value={origin} onChange={(e) => setOrigin(e.target.value)} /></Field>
                <Field label="Destination"><Input value={destination} onChange={(e) => setDestination(e.target.value)} /></Field>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Invoice items</Label>
                  <Button size="sm" variant="outline" onClick={() => setItems((v) => [...v, emptyItem()])}><Plus className="h-3.5 w-3.5 mr-1" /> Add item</Button>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary/40">
                      <tr>
                        <th className="text-left p-2">Description</th>
                        <th className="text-right p-2 w-16">Qty</th>
                        <th className="text-left p-2 w-16">Unit</th>
                        <th className="text-right p-2 w-24">Unit price</th>
                        <th className="text-right p-2 w-24">Total</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={it.id} className="border-t">
                          <td className="p-1"><Input className="h-8" value={it.description} onChange={(e) => setItems((v) => v.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} /></td>
                          <td className="p-1"><Input className="h-8 text-right" type="number" value={it.quantity} onChange={(e) => setItems((v) => v.map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value) } : x))} /></td>
                          <td className="p-1"><Input className="h-8" value={it.unit} onChange={(e) => setItems((v) => v.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))} /></td>
                          <td className="p-1"><Input className="h-8 text-right" type="number" value={it.unitPrice} onChange={(e) => setItems((v) => v.map((x, i) => i === idx ? { ...x, unitPrice: Number(e.target.value) } : x))} /></td>
                          <td className="p-2 text-right tabular-nums">{(it.quantity * it.unitPrice).toLocaleString()}</td>
                          <td className="p-1"><Button size="icon" variant="ghost" onClick={() => setItems((v) => v.filter((_, i) => i !== idx))}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Field label="Discount"><Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></Field>
                  <Field label="Shipping"><Input type="number" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} /></Field>
                  <Field label="Other charges"><Input type="number" value={other} onChange={(e) => setOther(Number(e.target.value))} /></Field>
                </div>
                <Card className="p-3 grid grid-cols-2 gap-2 text-sm bg-secondary/30">
                  <div className="text-muted-foreground">Subtotal</div><div className="text-right tabular-nums">{subtotal.toLocaleString()} {currency}</div>
                  <div className="text-muted-foreground">Discount</div><div className="text-right tabular-nums">-{discount.toLocaleString()} {currency}</div>
                  <div className="text-muted-foreground">Shipping</div><div className="text-right tabular-nums">{shipping.toLocaleString()} {currency}</div>
                  <div className="text-muted-foreground">Other</div><div className="text-right tabular-nums">{other.toLocaleString()} {currency}</div>
                  <div className="font-semibold">Invoice total</div><div className="text-right tabular-nums font-semibold">{total.toLocaleString()} {currency}</div>
                </Card>
              </div>

              <Field label="Notes (optional)"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Card className="p-4 space-y-2 text-sm">
                <Row k="Invoice number" v={invoiceNumber} />
                <Row k="Buyer" v={buyer.company} />
                <Row k="Invoice total" v={`${total.toLocaleString()} ${currency}`} />
                <Row k="FX quote" v={selectedQuote ? `${selectedQuote.id} @ ${selectedQuote.rate}` : "—"} />
                <Row k="Buyer will pay (NGN)" v={`₦${ngnBuyerPays.toLocaleString()}`} />
                <Row k="Canta fee" v={`₦${cantaFee.toLocaleString()}`} />
                <Row k="Est. supplier receivable" v={`${estReceivable.toLocaleString()} ${selectedQuote?.settlementCurrency ?? currency}`} />
                <Row k="Quote expires" v={selectedQuote ? formatCountdown(selectedQuote.expiresAt) : "—"} />
                <Row k="Payout account" v={PAYOUT_ACCOUNT.label} />
                <Row k="Trade File" v={tradeFileRef || "—"} />
              </Card>
              <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded p-2">
                The buyer&apos;s NGN payment details will not be generated at this stage. They will be generated only after the buyer opens the payment request, completes verification, accepts the current quote, and confirms payment.
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} />
                I confirm that the invoice and buyer details are correct.
              </label>
            </div>
          )}

          <DialogFooter className="gap-2 flex-wrap">
            {step > 1 && <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>}
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            {step === 1 && (
              <Button disabled={!selectedQuote || expired} onClick={() => setStep(2)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            )}
            {step === 2 && (
              <Button onClick={() => setStep(3)}>Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            )}
            {step === 3 && (
              <>
                <Button variant="outline" onClick={saveDraft}><Save className="h-4 w-4 mr-1" /> Save as Draft</Button>
                <Button onClick={generate}><FileText className="h-4 w-4 mr-1" /> Generate Invoice</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice draft created</DialogTitle>
            <DialogDescription>
              Invoice {createdInvoice?.invoiceNumber} has been created and linked to {createdInvoice?.buyer.company}.
            </DialogDescription>
          </DialogHeader>
          {createdInvoice && (
            <Card className="p-3 text-sm space-y-1.5">
              <Row k="Invoice" v={createdInvoice.invoiceNumber} />
              <Row k="Buyer" v={createdInvoice.buyer.company} />
              <Row k="Amount" v={`${createdInvoice.total.toLocaleString()} ${createdInvoice.currency}`} />
              <Row k="Supplier receivable" v={`${createdInvoice.estReceivable?.toLocaleString() ?? "—"} ${createdInvoice.settlementCurrency ?? ""}`} />
              <Row k="Quote expires" v={createdInvoice.quoteExpiresAt ? formatCountdown(createdInvoice.quoteExpiresAt) : "—"} />
              <Row k="Status" v="Draft" />
            </Card>
          )}
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="ghost" onClick={() => setSuccessOpen(false)}>Close</Button>
            <Button variant="outline" onClick={() => { setSuccessOpen(false); toast.info(`Opening invoice ${createdInvoice?.invoiceNumber}`); }}>
              <FileText className="h-4 w-4 mr-1" /> View Invoice
            </Button>
            <Button onClick={() => { setSuccessOpen(false); setPaymentRequestOpen(true); }}>
              <Send className="h-4 w-4 mr-1" /> Create Payment Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Request review modal */}
      <PaymentRequestReview
        open={paymentRequestOpen}
        onOpenChange={setPaymentRequestOpen}
        invoice={createdInvoice}
      />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function PaymentRequestReview({ open, onOpenChange, invoice }: { open: boolean; onOpenChange: (v: boolean) => void; invoice: Invoice | null }) {
  const [sent, setSent] = useState(false);
  useEffect(() => { if (open) setSent(false); }, [open]);
  if (!invoice) return null;
  const link = `https://canta.link/pay/${invoice.id.slice(-8)}`;
  const create = () => {
    invoiceStore.update(invoice.id, { paymentRequestStatus: "Sent", status: "Payment Requested" });
    setSent(true);
    toast.success("Payment request created");
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create payment request</DialogTitle>
          <DialogDescription>Review the invoice and current FX quote before generating the secure buyer payment link.</DialogDescription>
        </DialogHeader>
        <Card className="p-3 text-sm space-y-1.5">
          <Row k="Invoice" v={invoice.invoiceNumber} />
          <Row k="Buyer" v={`${invoice.buyer.company} · ${invoice.buyer.email}`} />
          <Row k="FX rate" v={invoice.fxRate ? `${invoice.fxRate} NGN/${invoice.currency}` : "—"} />
          <Row k="NGN payable" v={`₦${(invoice.ngnBuyerPays ?? 0).toLocaleString()}`} />
          <Row k="Supplier receivable" v={`${(invoice.estReceivable ?? 0).toLocaleString()} ${invoice.settlementCurrency ?? ""}`} />
        </Card>
        {sent && (
          <div className="space-y-2">
            <div className="text-xs bg-secondary/40 border rounded p-2 font-mono break-all">{link}</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(link); toast.success("Payment link copied"); }}><Copy className="h-3.5 w-3.5 mr-1" /> Copy Payment Link</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Shared on WhatsApp")}><MessageCircle className="h-3.5 w-3.5 mr-1" /> Share on WhatsApp</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Payment request downloaded")}><Download className="h-3.5 w-3.5 mr-1" /> Download Payment Request</Button>
              <Button size="sm" onClick={() => toast.success(`Sent to ${invoice.buyer.email}`)}><Send className="h-3.5 w-3.5 mr-1" /> Send to Buyer</Button>
            </div>
            <div className="text-[11px] text-muted-foreground italic">
              Buyer NGN payment details generate only after the buyer opens the link, passes KYC/KYB, accepts the valid quote, and confirms the payment request.
            </div>
          </div>
        )}
        <DialogFooter>
          {!sent
            ? <><Button variant="outline" onClick={() => { invoiceStore.update(invoice.id, { paymentRequestStatus: "Pending" }); onOpenChange(false); toast.success("Saved as draft"); }}><Save className="h-4 w-4 mr-1" /> Save as Draft</Button>
                <Button onClick={create}><Send className="h-4 w-4 mr-1" /> Create Payment Request</Button></>
            : <Button onClick={() => onOpenChange(false)}>Done</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
