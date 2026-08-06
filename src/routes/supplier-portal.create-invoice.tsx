import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Mail, Copy, Download, Link2 } from "lucide-react";
import {
  quoteFor, simpleInvoiceStore, copyText, wechatMessage, formatExpiry,
  isInvoiceQuoteExpired, NGN_COLLECTION_ACCOUNT, type SimpleInvoice,
} from "@/lib/supplier-simple";
import { whatsappUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/supplier-portal/create-invoice")({
  head: () => ({
    meta: [
      { title: "Create Invoice — Supplier Portal — Canta" },
      { name: "description", content: "Quote NGN to RMB, generate an invoice and send it to your Nigerian buyer." },
    ],
  }),
  component: CreateInvoicePage,
});

function CreateInvoicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amountRmb, setAmountRmb] = useState("");
  const [goods, setGoods] = useState("");
  const [quote, setQuote] = useState<{ rate: number; feeNgn: number; amountNgn: number; expiresAt: number } | null>(null);
  const [buyer, setBuyer] = useState({ company: "", whatsapp: "", email: "", wechat: "", dueDate: "", notes: "" });
  const [invoice, setInvoice] = useState<SimpleInvoice | null>(null);

  const rmb = Number(amountRmb) || 0;

  const generateQuote = () => {
    if (rmb <= 0) { toast.error("Enter the RMB amount you want to receive."); return; }
    if (!goods.trim()) { toast.error("Add a goods / order description."); return; }
    const q = quoteFor(rmb);
    setQuote({ ...q, expiresAt: Date.now() + 15 * 60 * 1000 });
    toast.success("Quote generated — valid for 15 minutes");
  };

  const generateInvoice = () => {
    if (!quote) return;
    if (Date.now() > quote.expiresAt) { toast.error("Quote expired. Generate a new rate before creating the invoice."); return; }
    if (!buyer.company.trim()) { toast.error("Buyer company / name is required."); return; }
    if (!buyer.whatsapp.trim() && !buyer.email.trim()) { toast.error("Add a buyer WhatsApp number or email."); return; }
    const created = simpleInvoiceStore.add({
      buyerCompany: buyer.company,
      buyerWhatsapp: buyer.whatsapp,
      buyerEmail: buyer.email,
      buyerWechat: buyer.wechat || undefined,
      goods,
      amountRmb: rmb,
      fxRate: quote.rate,
      feeNgn: quote.feeNgn,
      amountNgn: quote.amountNgn,
      quoteExpiresAt: quote.expiresAt,
      dueDate: buyer.dueDate || "—",
      notes: buyer.notes || undefined,
      payoutAccountId: "RB-1001",
      status: "Quote Locked",
    });
    setInvoice(created);
    setStep(3);
    toast.success(`Invoice ${created.invoiceNumber} created`);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-2 text-xs">
          {[["1", "Quote NGN to RMB"], ["2", "Generate invoice"], ["3", "Send invoice"]].map(([n, label]) => (
            <Badge key={n} variant={Number(n) === step ? "default" : "outline"}>{n}. {label}</Badge>
          ))}
        </div>
      </Card>

      {step === 1 && (
        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Step 1 — Quote NGN to RMB</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Amount to receive (RMB)</Label>
              <Input className="mt-1" type="number" value={amountRmb} onChange={(e) => setAmountRmb(e.target.value)} placeholder="50000" />
            </div>
            <div>
              <Label className="text-xs">Buyer country</Label>
              <Input className="mt-1" value="Nigeria" readOnly />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Goods / order description</Label>
              <Input className="mt-1" value={goods} onChange={(e) => setGoods(e.target.value)} placeholder="Bluetooth speakers x 500" />
            </div>
          </div>

          {quote && (
            <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
              <Kv k="Quote rate" v={`₦${quote.rate} / ¥1`} />
              <Kv k="Canta fee" v={`₦${quote.feeNgn.toLocaleString()}`} />
              <Kv k="Buyer pays (NGN)" v={`₦${quote.amountNgn.toLocaleString()}`} />
              <Kv k="Quote expiry" v={formatExpiry(quote.expiresAt)} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={quote ? "outline" : "default"} onClick={generateQuote}>
              {quote ? "Refresh quote" : "Generate quote"}
            </Button>
            <Button size="sm" disabled={!quote} onClick={() => setStep(2)}>Generate Invoice</Button>
          </div>
        </Card>
      )}

      {step === 2 && quote && (
        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Step 2 — Invoice details</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label className="text-xs">Buyer company / name</Label><Input className="mt-1" value={buyer.company} onChange={(e) => setBuyer({ ...buyer, company: e.target.value })} placeholder="Zenith Imports Nigeria" /></div>
            <div><Label className="text-xs">Buyer WhatsApp number</Label><Input className="mt-1" value={buyer.whatsapp} onChange={(e) => setBuyer({ ...buyer, whatsapp: e.target.value })} placeholder="+234 802 111 2233" /></div>
            <div><Label className="text-xs">Buyer email</Label><Input className="mt-1" type="email" value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} placeholder="buyer@example.ng" /></div>
            <div><Label className="text-xs">WeChat ID (optional)</Label><Input className="mt-1" value={buyer.wechat} onChange={(e) => setBuyer({ ...buyer, wechat: e.target.value })} /></div>
            <div><Label className="text-xs">Goods / order description</Label><Input className="mt-1" value={goods} onChange={(e) => setGoods(e.target.value)} /></div>
            <div><Label className="text-xs">Invoice due date</Label><Input className="mt-1" type="date" value={buyer.dueDate} onChange={(e) => setBuyer({ ...buyer, dueDate: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label className="text-xs">Notes to buyer</Label><Textarea className="mt-1" value={buyer.notes} onChange={(e) => setBuyer({ ...buyer, notes: e.target.value })} placeholder="50% deposit, balance before shipment" /></div>
          </div>
          <div className="grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm sm:grid-cols-4">
            <Kv k="RMB amount" v={`¥${rmb.toLocaleString()}`} />
            <Kv k="FX rate" v={`₦${quote.rate}`} />
            <Kv k="NGN amount" v={`₦${quote.amountNgn.toLocaleString()}`} />
            <Kv k="Quote expiry" v={formatExpiry(quote.expiresAt)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button size="sm" onClick={generateInvoice}>Create invoice</Button>
          </div>
        </Card>
      )}

      {step === 3 && invoice && (
        <Card className="space-y-3 p-4">
          <div className="text-sm font-semibold">Step 3 — Send invoice</div>
          <div className="grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-3">
            <Kv k="Invoice number" v={invoice.invoiceNumber} />
            <Kv k="Payment request ID" v={invoice.paymentRequestId} />
            <Kv k="Buyer" v={invoice.buyerCompany} />
            <Kv k="RMB amount" v={`¥${invoice.amountRmb.toLocaleString()}`} />
            <Kv k="NGN amount" v={`₦${invoice.amountNgn.toLocaleString()}`} />
            <Kv k="FX rate" v={`₦${invoice.fxRate}`} />
            <Kv k="Quote expiry" v={formatExpiry(invoice.quoteExpiresAt)} />
            <Kv k="Supplier" v="Guangzhou Tech Factory Co., Ltd" />
            <Kv k="Payment link" v={invoice.paymentLink} />
            <Kv k="NGN collection account" v={`${NGN_COLLECTION_ACCOUNT.bankName} · ${NGN_COLLECTION_ACCOUNT.accountNumber}`} />
          </div>

          {isInvoiceQuoteExpired(invoice) ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              Quote expired before payment. Generate a new rate before conversion — expired quotes cannot be sent to buyers.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => {
                simpleInvoiceStore.update(invoice.id, { status: "Sent to Buyer", sentBy: "WhatsApp" });
                window.open(whatsappUrl(wechatMessage(invoice), invoice.buyerWhatsapp), "_blank", "noopener");
                toast.success("Opening WhatsApp");
              }}><MessageCircle className="mr-2 h-4 w-4" /> Send by WhatsApp</Button>
              <Button size="sm" variant="outline" onClick={() => {
                simpleInvoiceStore.update(invoice.id, { status: "Sent to Buyer", sentBy: "Email" });
                window.location.href = `mailto:${invoice.buyerEmail}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(wechatMessage(invoice))}`;
              }}><Mail className="mr-2 h-4 w-4" /> Send by Email</Button>
              <Button size="sm" variant="outline" onClick={() => {
                simpleInvoiceStore.update(invoice.id, { status: "Sent to Buyer", sentBy: "WeChat" });
                copyText(wechatMessage(invoice)); toast.success("WeChat message copied — paste it in WeChat");
              }}><Copy className="mr-2 h-4 w-4" /> Copy WeChat message</Button>
              <Button size="sm" variant="outline" onClick={() => { copyText(invoice.paymentLink); toast.success("Payment link copied"); }}>
                <Link2 className="mr-2 h-4 w-4" /> Copy payment link
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Invoice PDF downloaded")}>
                <Download className="mr-2 h-4 w-4" /> Download PDF invoice
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={() => { setStep(1); setInvoice(null); setQuote(null); setAmountRmb(""); setGoods(""); }}>
              Create another invoice
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate({ to: "/supplier-portal/invoices" })}>
              Go to invoice history
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="break-words text-sm font-medium">{v}</div>
    </div>
  );
}
