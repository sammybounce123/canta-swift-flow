import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useSimpleInvoices, INVOICE_STATUS_TONE } from "@/lib/supplier-simple";
import {
  SupplierInvoiceActions,
  effectiveStatus,
} from "@/components/supplier/SupplierInvoiceActions";
import { useT } from "@/lib/supplier-lang";

export const Route = createFileRoute("/supplier-portal/invoices")({
  head: () => ({
    meta: [
      { title: "Invoice History — Supplier Portal — Canta" },
      {
        name: "description",
        content:
          "Every invoice you sent to Nigerian buyers, with payment, conversion and settlement status.",
      },
    ],
  }),
  component: InvoiceHistory,
});

function InvoiceHistory() {
  const invoices = useSimpleInvoices();
  const t = useT();

  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{t("invoiceHistory")}</div>
          <div className="text-xs text-muted-foreground">
            Every invoice links to its buyer, payment request, FX rate, quote expiry and settlement
            status.
          </div>
        </div>
        <Button size="sm" asChild>
          <Link to="/supplier-portal/create-invoice">
            <FileText className="mr-2 h-4 w-4" /> {t("createInvoice")}
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Invoice #</th>
              <th className="px-3 py-2 text-left">Buyer</th>
              <th className="px-3 py-2 text-right">RMB Amount</th>
              <th className="px-3 py-2 text-right">NGN Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Sent By</th>
              <th className="px-3 py-2 text-left">Created</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((i) => {
              const status = effectiveStatus(i);
              return (
                <tr key={i.id} className="border-t align-top">
                  <td className="px-3 py-2 font-mono text-xs">
                    {i.invoiceNumber}
                    <div className="text-[10px] text-muted-foreground">{i.paymentRequestId}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{i.buyerCompany}</td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums">
                    ¥{i.amountRmb.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-xs tabular-nums">
                    ₦{i.amountNgn.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <Badge className={INVOICE_STATUS_TONE[status]}>{status}</Badge>
                  </td>
                  <td className="px-3 py-2 text-xs">{i.sentBy}</td>
                  <td className="px-3 py-2 text-xs">{i.createdAt}</td>
                  <td className="px-3 py-2">
                    <SupplierInvoiceActions invoice={i} />
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-xs text-muted-foreground">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
