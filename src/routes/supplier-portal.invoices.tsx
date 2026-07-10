import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FileText, Upload, MoreHorizontal, Eye, Edit3, Send, Download, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { GenerateInvoiceWizard } from "@/components/GenerateInvoiceWizard";
import { invoiceStore, useInvoices } from "@/lib/invoice-store";
import { formatCountdown } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Supplier Portal — Canta" }] }),
  component: InvoicesPanel,
});

const STATUS_TONE: Record<string, string> = {
  Draft: "bg-muted text-foreground",
  Issued: "bg-blue-100 text-blue-800",
  "Payment Requested": "bg-amber-100 text-amber-800",
  Paid: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-destructive/10 text-destructive",
};

function InvoicesPanel() {
  const invoices = useInvoices();
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-4 space-y-3">
      <div>
        <div className="text-sm font-semibold">Invoices &amp; shipping documents</div>
        <div className="text-xs text-muted-foreground">
          Create invoices for Nigerian buyers linked to an active FX quote. Payment requests and NGN
          collection are handled from the created invoice.
        </div>
      </div>

      <ButtonGroup label="Invoice actions">
        <Button size="sm" onClick={() => setOpen(true)}><FileText className="h-4 w-4 mr-2" /> Generate Invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Proforma invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload proforma invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Commercial invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload commercial invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Packing list uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload packing list</Button>
      </ButtonGroup>

      {invoices.length === 0 ? (
        <div className="text-xs text-muted-foreground border rounded-md p-6 text-center">
          No invoices yet. Click <strong>Generate Invoice</strong> to create one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 px-3">Invoice #</th>
                <th className="py-2 px-3">Buyer</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3">Ccy</th>
                <th className="py-2 px-3">FX quote</th>
                <th className="py-2 px-3">Quote expiry</th>
                <th className="py-2 px-3">Payment request</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t">
                  <td className="py-2 px-3 text-xs font-mono">{i.invoiceNumber}</td>
                  <td className="py-2 px-3 text-xs">{i.buyer.company}</td>
                  <td className="py-2 px-3 text-xs text-right tabular-nums">{i.total.toLocaleString()}</td>
                  <td className="py-2 px-3 text-xs">{i.currency}</td>
                  <td className="py-2 px-3 text-xs font-mono">{i.fxQuoteId ?? "—"}</td>
                  <td className="py-2 px-3 text-xs">{i.quoteExpiresAt ? formatCountdown(i.quoteExpiresAt) : "—"}</td>
                  <td className="py-2 px-3 text-xs">{i.paymentRequestStatus}</td>
                  <td className="py-2 px-3"><Badge className={STATUS_TONE[i.status]}>{i.status}</Badge></td>
                  <td className="py-2 px-3 text-xs">{i.createdAt.slice(0, 10)}</td>
                  <td className="py-2 px-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => toast.info(`Viewing ${i.invoiceNumber}`)}><Eye className="h-3.5 w-3.5 mr-2" /> View</DropdownMenuItem>
                        <DropdownMenuItem disabled={i.status !== "Draft"} onSelect={() => toast.info("Edit draft")}><Edit3 className="h-3.5 w-3.5 mr-2" /> Edit Draft</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { invoiceStore.update(i.id, { paymentRequestStatus: "Sent", status: "Payment Requested" }); toast.success("Payment request created"); }}><Send className="h-3.5 w-3.5 mr-2" /> Create Payment Request</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast.success("PDF downloaded")}><Download className="h-3.5 w-3.5 mr-2" /> Download PDF</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => { const d = invoiceStore.duplicate(i.id); if (d) toast.success(`Duplicated as ${d.invoiceNumber}`); }}><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={i.status !== "Draft"} className="text-destructive" onSelect={() => { invoiceStore.remove(i.id); toast.success("Draft deleted"); }}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Draft</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GenerateInvoiceWizard open={open} onOpenChange={setOpen} />
    </Card>
  );
}
