import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import {
  useSimpleInvoices,
  simpleInvoiceStore,
  INVOICE_STATUS_TONE,
  isInvoiceQuoteExpired,
  copyText,
  wechatMessage,
  useAutoConvert,
  SETTLEMENT_NEXT_LABEL,
  type SimpleInvoice,
} from "@/lib/supplier-simple";
import { useConversionBlockers } from "@/components/supplier/AutoConvertCard";
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

type Ctx = { autoConvert: boolean; blockers: string[] };

function actionsFor(inv: SimpleInvoice, ctx: Ctx): Array<{ label: string; run: () => void }> {
  const status = isInvoiceQuoteExpired(inv) && inv.status !== "Cancelled" ? "Expired" : inv.status;
  const timeline = {
    label: "View timeline",
    run: () => toast.info(`${inv.invoiceNumber}: ${status} · ${inv.buyerCompany}`),
  };
  const simulatePayment = {
    label: "Simulate buyer payment (demo)",
    run: () => {
      const res = simpleInvoiceStore.simulateBuyerPayment(inv.id);
      if (res.ok) toast.success("Buyer payment confirmed by provider — NGN received");
      else toast.error(res.error ?? "Could not confirm payment");
    },
  };
  const advance = (label: string) => ({
    label,
    run: () => {
      const res = simpleInvoiceStore.advanceSettlement(inv.id);
      if (res.ok)
        toast.success(
          res.status === "RMB Paid"
            ? "Provider confirmed payout — RMB paid, receipt available"
            : `Moved to ${res.status}`,
        );
      else toast.error(res.error ?? "Could not advance settlement");
    },
  });
  const conversion = () => {
    if (!ctx.autoConvert) {
      return {
        label: "Request conversion",
        run: () => {
          const res = simpleInvoiceStore.requestConversion(inv.id);
          if (res.ok) toast.success("Conversion requested — compliance review started");
          else toast.error(res.error ?? "Could not request conversion");
        },
      };
    }
    if (ctx.blockers.length > 0) {
      return {
        label: "Action needed",
        run: () =>
          toast.error(`Action needed before automatic conversion: ${ctx.blockers.join(", ")}`),
      };
    }
    return advance(SETTLEMENT_NEXT_LABEL["NGN Received"] ?? "Continue conversion");
  };

  switch (status) {
    case "Draft":
      return [
        { label: "Continue", run: () => toast.info(`Continue ${inv.invoiceNumber}`) },
        {
          label: "Delete",
          run: () => {
            simpleInvoiceStore.remove(inv.id);
            toast.success("Draft deleted");
          },
        },
      ];
    case "Quote Locked":
      return [
        {
          label: "Send invoice",
          run: () => {
            copyText(wechatMessage(inv));
            simpleInvoiceStore.update(inv.id, { status: "Sent to Buyer" });
            toast.success("Invoice message copied — paste it to your buyer");
          },
        },
        { label: "Download PDF", run: () => toast.success("Invoice PDF downloaded") },
        simulatePayment,
        timeline,
      ];
    case "Sent to Buyer":
    case "Buyer Viewed":
      return [
        {
          label: "Remind buyer",
          run: () => {
            copyText(wechatMessage(inv));
            toast.success("Reminder message copied — send it to your buyer");
          },
        },
        {
          label: "Copy payment link",
          run: () => {
            copyText(inv.paymentLink);
            toast.success("Payment link copied");
          },
        },
        simulatePayment,
        timeline,
      ];
    case "Awaiting NGN Payment":
      return [
        {
          label: "Copy payment link",
          run: () => {
            copyText(inv.paymentLink);
            toast.success("Payment link copied");
          },
        },
        {
          label: "Remind buyer",
          run: () => {
            copyText(wechatMessage(inv));
            toast.success("Reminder message copied — send it to your buyer");
          },
        },
        simulatePayment,
        timeline,
      ];
    case "NGN Received":
      return [
        {
          label: "View conversion status",
          run: () =>
            toast.info(
              ctx.autoConvert
                ? "NGN received — compliance review runs before automatic conversion"
                : "Automatic Convert is OFF — NGN stays in your balance until you request conversion",
            ),
        },
        conversion(),
        timeline,
      ];
    case "Compliance Review":
      return [
        { label: "View review status", run: () => toast.info("Compliance review in progress") },
        advance(SETTLEMENT_NEXT_LABEL["Compliance Review"]!),
        timeline,
      ];
    case "Auto-Converting":
      return [
        { label: "View FX status", run: () => toast.info(`Converting at ₦${inv.fxRate} / ¥1`) },
        advance(SETTLEMENT_NEXT_LABEL["Auto-Converting"]!),
        timeline,
      ];
    case "RMB Settlement Pending":
      return [
        {
          label: "View settlement",
          run: () => toast.info("Payout to your verified RMB bank account is queued"),
        },
        advance(SETTLEMENT_NEXT_LABEL["RMB Settlement Pending"]!),
        timeline,
      ];
    case "RMB Paid":
      return [
        {
          label: "Download receipt",
          run: () => toast.success(`Settlement receipt ${inv.receiptId ?? ""} downloaded`),
        },
        timeline,
      ];
    case "Expired":
      return [
        {
          label: "Refresh quote",
          run: () => {
            simpleInvoiceStore.refreshQuote(inv.id);
            toast.success("New rate locked");
          },
        },
        {
          label: "Duplicate invoice",
          run: () => {
            simpleInvoiceStore.duplicate(inv.id);
            toast.success("Invoice duplicated");
          },
        },
        timeline,
      ];
    case "Cancelled":
      return [
        {
          label: "Duplicate invoice",
          run: () => {
            simpleInvoiceStore.duplicate(inv.id);
            toast.success("Invoice duplicated");
          },
        },
        timeline,
      ];
    default:
      return [timeline];
  }
}

function InvoiceHistory() {
  const invoices = useSimpleInvoices();
  const t = useT();
  const autoConvert = useAutoConvert();
  // Account-level blockers only; per-row quote expiry is handled by the row status.
  const blockers = useConversionBlockers()
    .filter((b) => b.label !== "Refresh expired quote")
    .map((b) => b.label);

  const ctx: Ctx = { autoConvert, blockers };

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
              const status =
                isInvoiceQuoteExpired(i) && i.status !== "Cancelled" ? "Expired" : i.status;
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
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {actionsFor(i, ctx).map((a) => (
                        <Button
                          key={a.label}
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={a.run}
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
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
