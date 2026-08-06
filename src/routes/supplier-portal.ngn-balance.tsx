import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Share2, FileText } from "lucide-react";
import { AutoConvertCard } from "@/components/supplier/AutoConvertCard";
import {
  NGN_COLLECTION_ACCOUNT, copyText, ngnSummary, paymentInstructions, useSimpleInvoices,
} from "@/lib/supplier-simple";
import { useT } from "@/lib/supplier-lang";

export const Route = createFileRoute("/supplier-portal/ngn-balance")({
  head: () => ({
    meta: [
      { title: "NGN Balance — Supplier Portal — Canta" },
      { name: "description", content: "Naira paid by your Nigerian buyers, your Canta collection account details and conversion status." },
    ],
  }),
  component: NgnBalancePage,
});

function NgnBalancePage() {
  const t = useT();
  const invoices = useSimpleInvoices();
  const s = ngnSummary(invoices);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Available NGN balance" value={`₦${s.available.toLocaleString()}`} />
        <Stat label="Pending NGN payments" value={`₦${s.pending.toLocaleString()}`} />
        <Stat label="NGN received today" value={`₦${s.receivedToday.toLocaleString()}`} />
        <Stat label="NGN awaiting conversion" value={`₦${s.awaitingConversion.toLocaleString()}`} />
        <Stat label="NGN converted to RMB" value={`₦${s.convertedNgn.toLocaleString()}`} />
      </div>

      <AutoConvertCard />

      <Card className="space-y-3 p-4">
        <div className="text-sm font-semibold">Your Nigerian collection account</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Row k="Bank name" v={NGN_COLLECTION_ACCOUNT.bankName} />
          <Row k="Account name" v={NGN_COLLECTION_ACCOUNT.accountName} />
          <Row k="Account number" v={NGN_COLLECTION_ACCOUNT.accountNumber} />
          <Row k="Currency" v="NGN" />
          <Row k="Reference instructions" v={NGN_COLLECTION_ACCOUNT.reference} />
        </div>
        <p className="text-xs text-muted-foreground">
          Share these details only with Nigerian buyers paying invoices created through Canta. Canta reconciles buyer
          payments to your invoice before RMB conversion.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { copyText(NGN_COLLECTION_ACCOUNT.accountNumber); toast.success("Account number copied"); }}>
            <Copy className="mr-2 h-4 w-4" /> Copy account number
          </Button>
          <Button size="sm" variant="outline" onClick={() => { copyText(paymentInstructions()); toast.success("Payment instructions copied"); }}>
            <Copy className="mr-2 h-4 w-4" /> Copy full payment instructions
          </Button>
          <Button size="sm" variant="outline" onClick={() => { copyText(paymentInstructions()); toast.success("Instructions ready to share"); }}>
            <Share2 className="mr-2 h-4 w-4" /> Share payment instructions
          </Button>
          <Button size="sm" asChild>
            <Link to="/supplier-portal/create-invoice"><FileText className="mr-2 h-4 w-4" /> {t("createInvoice")}</Link>
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm font-semibold">Linked invoices</div>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Invoice #</th>
                <th className="px-3 py-2 text-left">Buyer</th>
                <th className="px-3 py-2 text-right">NGN</th>
                <th className="px-3 py-2 text-right">RMB</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {s.linked.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{i.invoiceNumber}</td>
                  <td className="px-3 py-2 text-xs">{i.buyerCompany}</td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums">₦{i.amountNgn.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums">¥{i.amountRmb.toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs">{i.status}</td>
                </tr>
              ))}
              {s.linked.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-xs text-muted-foreground">No NGN payments received yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">{value}</div>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border bg-card p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-sm font-medium break-words">{v}</div>
    </div>
  );
}
