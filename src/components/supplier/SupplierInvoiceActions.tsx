import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Circle, Clock, Copy, Download } from "lucide-react";
import {
  copyText,
  downloadTextFile,
  formatStamp,
  invoiceTimeline,
  isInvoiceQuoteExpired,
  mailtoHref,
  maskAccount,
  paymentLinkUrl,
  previewRefreshedQuote,
  receiptText,
  reminderMessage,
  simpleInvoiceStore,
  SUPPLIER_NAME,
  UNPAID_STATUSES,
  useRmbBanks,
  whatsappHref,
  wechatMessage,
  type SimpleInvoice,
} from "@/lib/supplier-simple";
import { useConversionBlockers } from "@/components/supplier/AutoConvertCard";

type DialogKind =
  | null
  | "timeline"
  | "settlement"
  | "remind"
  | "receipt"
  | "refresh"
  | "providerConfirm";

/** Effective status: an unpaid invoice past its quote window reads as Expired. */
export function effectiveStatus(inv: SimpleInvoice) {
  return isInvoiceQuoteExpired(inv) && inv.status !== "Cancelled" ? "Expired" : inv.status;
}

export function SupplierInvoiceActions({
  invoice,
  showDemoActions = true,
  className,
}: {
  invoice: SimpleInvoice;
  showDemoActions?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<DialogKind>(null);
  const banks = useRmbBanks();
  const blockers = useConversionBlockers().map((b) => b.label);
  const accountBlockers = blockers.filter((b) => b !== "Refresh expired quote");
  const dest = banks.find((b) => b.isSettlementDestination) ?? null;
  const bankLine = dest
    ? `${dest.bankName} · ${maskAccount(dest.accountNumber)}`
    : "No verified settlement account";

  const status = effectiveStatus(invoice);
  const expired = status === "Expired";
  const canCopyLink = UNPAID_STATUSES.includes(invoice.status) && !expired;
  const canRemind =
    ["Sent to Buyer", "Buyer Viewed", "Awaiting NGN Payment", "Quote Locked"].includes(
      invoice.status,
    ) && !expired;
  const showSettlement = [
    "NGN Received",
    "Compliance Review",
    "Auto-Converting",
    "RMB Settlement Pending",
    "RMB Paid",
  ].includes(invoice.status);
  const receiptReady = invoice.status === "RMB Paid" && !!invoice.providerConfirmed;

  const btns: ReactNode[] = [];
  const add = (
    key: string,
    label: string,
    onClick: () => void,
    opts: { disabled?: boolean; title?: string; primary?: boolean } = {},
  ) =>
    btns.push(
      <Button
        key={key}
        size="sm"
        variant={opts.primary ? "default" : "outline"}
        className="h-7 text-xs"
        disabled={opts.disabled}
        title={opts.title}
        onClick={onClick}
      >
        {label}
      </Button>,
    );

  const copyLink = () => {
    if (!canCopyLink) {
      toast.error(
        expired
          ? "Quote expired — refresh quote to create a new payment link."
          : "Payment link is available only before buyer payment.",
      );
      return;
    }
    copyText(paymentLinkUrl(invoice));
    simpleInvoiceStore.addEvent(invoice.id, "Payment link copied", paymentLinkUrl(invoice));
    toast.success("Payment link copied.");
  };

  if (status === "Draft") {
    add("continue", "Continue invoice", () =>
      toast.info(`${invoice.invoiceNumber} is a draft — open Create Invoice to finish it.`),
    );
    add("delete", "Delete", () => {
      simpleInvoiceStore.remove(invoice.id);
      toast.success("Draft deleted");
    });
  }
  if (status === "Quote Locked") {
    add(
      "send",
      "Send invoice",
      () => {
        copyText(wechatMessage(invoice));
        simpleInvoiceStore.update(invoice.id, {
          status: "Sent to Buyer",
          events: [
            ...invoice.events,
            { id: `ev_send_${invoice.id}`, label: "Invoice sent to buyer", at: Date.now() },
          ],
        });
        toast.success("Invoice message copied — paste it to your buyer");
      },
      { primary: true },
    );
  }
  if (canCopyLink) add("copylink", "Copy payment link", copyLink);
  if (canRemind) add("remind", "Remind buyer", () => setOpen("remind"));
  if (showSettlement) add("settlement", "View settlement", () => setOpen("settlement"));
  if (invoice.status === "RMB Settlement Pending")
    add("provider", "Simulate provider confirmation", () => setOpen("providerConfirm"));
  if (invoice.status === "RMB Paid") {
    add("receipt", "View receipt", () => setOpen("receipt"));
    add("download", "Download receipt", () => downloadReceipt());
  } else if (showSettlement) {
    add("receipt-disabled", "View receipt", () => undefined, {
      disabled: true,
      title: "Receipt will be available after provider confirmation.",
    });
  }
  if (status === "Expired")
    add("refresh", "Refresh quote", () => setOpen("refresh"), {
      primary: true,
    });
  if (status === "Expired" || status === "Cancelled")
    add("duplicate", "Duplicate invoice", () => {
      simpleInvoiceStore.duplicate(invoice.id);
      toast.success("Invoice duplicated");
    });
  add("timeline", "View timeline", () => setOpen("timeline"));

  if (showDemoActions) {
    if (UNPAID_STATUSES.includes(invoice.status) && !expired)
      add("simpay", "Simulate buyer payment (demo)", () => {
        const res = simpleInvoiceStore.simulateBuyerPayment(invoice.id);
        if (res.ok) toast.success("Buyer payment confirmed by provider — NGN received");
        else toast.error(res.error ?? "Could not confirm payment");
      });
    if (["NGN Received", "Compliance Review", "Auto-Converting"].includes(invoice.status))
      add("advance", "Simulate next step (demo)", () => {
        const res = simpleInvoiceStore.advanceSettlement(invoice.id);
        if (res.ok) toast.success(`Moved to ${res.status}`);
        else toast.error(res.error ?? "Could not advance settlement");
      });
  }

  function downloadReceipt() {
    if (!receiptReady) {
      toast.error("Receipt is available only after provider confirmation.");
      return;
    }
    const ok = downloadTextFile(
      `${invoice.receiptId}-${invoice.invoiceNumber}.txt`,
      receiptText(invoice, bankLine),
    );
    if (ok) toast.success("Receipt downloaded.");
    else {
      copyText(receiptText(invoice, bankLine));
      toast.success("Download not available here — receipt copied instead.");
    }
  }

  return (
    <>
      <div className={className ?? "flex flex-wrap justify-end gap-1.5"}>{btns}</div>

      <TimelineDialog
        invoice={invoice}
        blockers={accountBlockers}
        open={open === "timeline"}
        onOpenChange={(v) => setOpen(v ? "timeline" : null)}
        onProviderConfirm={() => setOpen("providerConfirm")}
      />
      <SettlementDialog
        invoice={invoice}
        bankLine={bankLine}
        open={open === "settlement"}
        onOpenChange={(v) => setOpen(v ? "settlement" : null)}
        onTimeline={() => setOpen("timeline")}
        onProviderConfirm={() => setOpen("providerConfirm")}
        onReceipt={() => setOpen("receipt")}
        onRemind={() => setOpen("remind")}
        onCopyLink={copyLink}
        canCopyLink={canCopyLink}
      />
      <RemindBuyerDialog
        invoice={invoice}
        open={open === "remind"}
        onOpenChange={(v) => setOpen(v ? "remind" : null)}
        onCopyLink={copyLink}
      />
      <ReceiptDialog
        invoice={invoice}
        bankLine={bankLine}
        open={open === "receipt"}
        onOpenChange={(v) => setOpen(v ? "receipt" : null)}
        onDownload={downloadReceipt}
      />
      <RefreshQuoteDialog
        invoice={invoice}
        open={open === "refresh"}
        onOpenChange={(v) => setOpen(v ? "refresh" : null)}
      />
      <ProviderConfirmDialog
        invoice={invoice}
        open={open === "providerConfirm"}
        onOpenChange={(v) => setOpen(v ? "providerConfirm" : null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="text-sm font-medium break-words">{v}</div>
    </div>
  );
}

export function TimelineDialog({
  invoice,
  blockers,
  open,
  onOpenChange,
  onProviderConfirm,
}: {
  invoice: SimpleInvoice;
  blockers: string[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onProviderConfirm?: () => void;
}) {
  const steps = invoiceTimeline(invoice, blockers);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment Timeline</DialogTitle>
          <DialogDescription>
            {invoice.invoiceNumber} / {invoice.paymentRequestId} · {invoice.buyerCompany}
          </DialogDescription>
        </DialogHeader>
        <ol className="space-y-2">
          {steps.map((s) => (
            <li
              key={s.key}
              className={`rounded-md border p-2 ${
                s.state === "Current"
                  ? "border-primary bg-primary/5"
                  : s.state === "Blocked"
                    ? "border-amber-300 bg-amber-50"
                    : s.state === "Completed"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-border"
              }`}
            >
              <div className="flex items-start gap-2">
                {s.state === "Completed" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                ) : s.state === "Blocked" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
                ) : s.state === "Current" ? (
                  <Clock className="mt-0.5 h-4 w-4 text-primary" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{s.label}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {s.state}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.explain}</p>
                  {s.at && (
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatStamp(s.at)}
                    </div>
                  )}
                  {s.blocker && (
                    <div className="mt-0.5 text-[11px] text-amber-800">{s.blocker}</div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        {invoice.events.length > 0 && (
          <div className="rounded-md border p-2">
            <div className="mb-1 text-xs font-semibold">Activity</div>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              {invoice.events
                .slice()
                .reverse()
                .slice(0, 8)
                .map((e) => (
                  <li key={e.id}>
                    {formatStamp(e.at)} — {e.label}
                    {e.detail ? ` · ${e.detail}` : ""}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          {invoice.status === "RMB Settlement Pending" && onProviderConfirm && (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onProviderConfirm();
              }}
            >
              Simulate provider confirmation — demo only
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SettlementDialog({
  invoice,
  bankLine,
  open,
  onOpenChange,
  onTimeline,
  onProviderConfirm,
  onReceipt,
  onRemind,
  onCopyLink,
  canCopyLink,
}: {
  invoice: SimpleInvoice;
  bankLine: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onTimeline: () => void;
  onProviderConfirm: () => void;
  onReceipt: () => void;
  onRemind: () => void;
  onCopyLink: () => void;
  canCopyLink: boolean;
}) {
  const settlementStatus =
    invoice.status === "RMB Settlement Pending" ? "Provider Confirmation Pending" : invoice.status;
  const compliance =
    invoice.status === "NGN Received"
      ? "Not started"
      : invoice.status === "Compliance Review"
        ? "In review"
        : "Completed";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settlement details</DialogTitle>
          <DialogDescription>
            {invoice.invoiceNumber} · {invoice.buyerCompany}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field k="Invoice number" v={invoice.invoiceNumber} />
          <Field k="Payment request ID" v={invoice.paymentRequestId} />
          <Field k="Buyer" v={invoice.buyerCompany} />
          <Field k="RMB amount" v={`¥${invoice.amountRmb.toLocaleString()}`} />
          <Field k="NGN amount paid" v={`₦${invoice.amountNgn.toLocaleString()}`} />
          <Field k="FX rate" v={`₦${invoice.fxRate} / ¥1`} />
          <Field k="Canta fee" v={`₦${invoice.feeNgn.toLocaleString()}`} />
          <Field k="Quote expiry" v={formatStamp(invoice.quoteExpiresAt)} />
          <Field k="Settlement bank account" v={bankLine} />
          <Field k="Settlement status" v={settlementStatus} />
          <Field k="Compliance status" v={compliance} />
          <Field
            k="Provider confirmation"
            v={invoice.providerConfirmed ? `Confirmed · ${invoice.providerRef}` : "Pending"}
          />
          <Field
            k="Receipt"
            v={
              invoice.providerConfirmed
                ? `Available · ${invoice.receiptId}`
                : "Available after provider confirmation"
            }
          />
        </div>
        <DialogFooter className="flex-wrap gap-2">
          {canCopyLink && (
            <>
              <Button size="sm" variant="outline" onClick={onCopyLink}>
                Copy payment link
              </Button>
              <Button size="sm" variant="outline" onClick={onRemind}>
                Remind buyer
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={onTimeline}>
            View timeline
          </Button>
          {invoice.status === "RMB Settlement Pending" && (
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onProviderConfirm();
              }}
            >
              Simulate provider confirmation — demo only
            </Button>
          )}
          {invoice.providerConfirmed && (
            <Button size="sm" onClick={onReceipt}>
              View receipt
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RemindBuyerDialog({
  invoice,
  open,
  onOpenChange,
  onCopyLink,
}: {
  invoice: SimpleInvoice;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCopyLink: () => void;
}) {
  const message = reminderMessage(invoice);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Remind Buyer</DialogTitle>
          <DialogDescription>
            Sending is not configured in demo. Copy the message and send it manually.
          </DialogDescription>
        </DialogHeader>
        <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-xs">
          {message}
        </pre>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              copyText(message);
              simpleInvoiceStore.addEvent(invoice.id, "Buyer reminder prepared", "WhatsApp");
              toast.success("Reminder copied");
              window.open(whatsappHref(invoice), "_blank", "noopener");
            }}
          >
            WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              copyText(message);
              simpleInvoiceStore.addEvent(invoice.id, "Buyer reminder prepared", "Email");
              toast.success("Reminder copied");
              window.open(mailtoHref(invoice), "_blank", "noopener");
            }}
          >
            Email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              copyText(message);
              simpleInvoiceStore.addEvent(invoice.id, "Buyer reminder prepared", "Copy message");
              toast.success("Reminder copied");
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy message
          </Button>
          <Button variant="outline" size="sm" onClick={onCopyLink}>
            Copy payment link
          </Button>
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptDialog({
  invoice,
  bankLine,
  open,
  onOpenChange,
  onDownload,
}: {
  invoice: SimpleInvoice;
  bankLine: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onDownload: () => void;
}) {
  const ready = invoice.status === "RMB Paid" && invoice.providerConfirmed;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settlement receipt</DialogTitle>
          <DialogDescription>
            {ready
              ? `${invoice.receiptId} · ${invoice.invoiceNumber}`
              : "Receipt will be available after provider confirmation."}
          </DialogDescription>
        </DialogHeader>
        {ready ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field k="Receipt number" v={invoice.receiptId ?? "—"} />
              <Field k="Invoice number" v={invoice.invoiceNumber} />
              <Field k="Payment request ID" v={invoice.paymentRequestId} />
              <Field k="Buyer" v={invoice.buyerCompany} />
              <Field k="Supplier" v={SUPPLIER_NAME} />
              <Field k="NGN amount paid" v={`₦${invoice.amountNgn.toLocaleString()}`} />
              <Field k="RMB amount settled" v={`¥${invoice.amountRmb.toLocaleString()}`} />
              <Field k="FX rate" v={`₦${invoice.fxRate} / ¥1`} />
              <Field k="Canta fee" v={`₦${invoice.feeNgn.toLocaleString()}`} />
              <Field k="Settlement bank account" v={bankLine} />
              <Field k="Provider confirmation" v={invoice.providerRef ?? "—"} />
              <Field k="Date" v={formatStamp(invoice.settledAt ?? Date.now())} />
              <Field k="Status" v="RMB Paid" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Payment matched and compliance review completed before conversion. Demo data.
            </p>
            <DialogFooter className="flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  copyText(receiptText(invoice, bankLine));
                  toast.success("Receipt summary copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy summary
              </Button>
              <Button size="sm" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" /> Download receipt
              </Button>
            </DialogFooter>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Receipt is available only after provider confirmation.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RefreshQuoteDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: SimpleInvoice;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const next = previewRefreshedQuote(invoice);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Refresh Quote</DialogTitle>
          <DialogDescription>
            Expired quotes cannot be paid or sent until they are refreshed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field k="RMB amount" v={`¥${invoice.amountRmb.toLocaleString()}`} />
          <Field k="Previous NGN amount (expired)" v={`₦${invoice.amountNgn.toLocaleString()}`} />
          <Field k="Previous rate" v={`₦${invoice.fxRate} / ¥1`} />
          <Field k="New rate" v={`₦${next.rate} / ¥1`} />
          <Field k="New NGN amount" v={`₦${next.amountNgn.toLocaleString()}`} />
          <Field k="New Canta fee" v={`₦${next.feeNgn.toLocaleString()}`} />
          <Field k="New quote expiry" v={`${formatStamp(next.expiresAt)} (15 minutes)`} />
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              simpleInvoiceStore.refreshQuote(invoice.id);
              onOpenChange(false);
              toast.success("Quote refreshed. You can now send the invoice to the buyer.");
            }}
          >
            Confirm new quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProviderConfirmDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: SimpleInvoice;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Simulate provider confirmation — demo only</DialogTitle>
          <DialogDescription>
            This demo action simulates provider payout confirmation. In production, this would come
            from the payout provider webhook.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const res = simpleInvoiceStore.confirmProviderPayout(invoice.id);
              onOpenChange(false);
              if (res.ok)
                toast.success("Provider confirmation received. Receipt is now available.");
              else toast.error(res.error ?? "Could not confirm payout");
            }}
          >
            Confirm payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
