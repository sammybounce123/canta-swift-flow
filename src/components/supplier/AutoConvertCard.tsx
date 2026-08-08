import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  autoConvertStore,
  useAutoConvert,
  useAutoConvertPaused,
  autoConvertPause,
  useRmbBanks,
  useSimpleInvoices,
  isInvoiceQuoteExpired,
} from "@/lib/supplier-simple";
import { useVerified } from "@/lib/supplier-data";
import { useT } from "@/lib/supplier-lang";
import { canReceivePayout, SECURITY_COPY } from "@/lib/payout-security";

/**
 * Account-level requirements that must be met before Canta can auto-convert.
 * Pass an invoice to also include that invoice's own quote freshness.
 */
export function useConversionBlockers(invoice?: { quoteExpiresAt: number; status: string }) {
  const verified = useVerified();
  const banks = useRmbBanks();
  const invoices = useSimpleInvoices();
  const paused = useAutoConvertPaused();
  const blockers: Array<{ label: string; to: string }> = [];
  if (!verified)
    blockers.push({ label: "Complete verification", to: "/supplier-portal/verification" });
  if (!banks.some((b) => canReceivePayout(b.status) && b.isSettlementDestination)) {
    blockers.push({
      label: "Add or verify an RMB bank account",
      to: "/supplier-portal/rmb-bank-account",
    });
  }
  if (paused) {
    blockers.push({
      label: "Payout account changed — awaiting Canta review",
      to: "/supplier-portal/rmb-bank-account",
    });
  }
  const expired = invoice
    ? isInvoiceQuoteExpired(invoice as never) && invoice.status !== "Cancelled"
    : invoices.some((i) => isInvoiceQuoteExpired(i) && i.status !== "Cancelled");
  if (expired) blockers.push({ label: "Refresh expired quote", to: "/supplier-portal/invoices" });
  return blockers;
}

export function AutoConvertCard() {
  const on = useAutoConvert();
  const t = useT();
  const blockers = useConversionBlockers();
  const paused = useAutoConvertPaused();


  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{t("autoConvert")}</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{t("autoConvertDesc")}</p>
        </div>
        <Switch
          checked={on && blockers.length === 0}
          disabled={blockers.length > 0}
          aria-label="Automatic Convert"
          onCheckedChange={(v) => {
            if (blockers.length > 0) {
              toast.error(SECURITY_COPY.supplierAutoConvertBlocked);
              return;
            }
            autoConvertStore.set(v);
            toast.success(v ? "Automatic Convert is ON" : "Automatic Convert is OFF");
          }}
        />
      </div>
      <div className="rounded-md border bg-muted/30 p-3 text-xs">
        <Badge variant="outline" className="mr-2 text-[10px]">
          {blockers.length > 0 ? "BLOCKED" : on ? "ON" : "OFF"}
        </Badge>
        {blockers.length > 0
          ? SECURITY_COPY.supplierAutoConvertBlocked
          : on
            ? t("autoConvertOn")
            : t("autoConvertOff")}
      </div>

      {blockers.length > 0 && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" /> {t("actionNeeded")}
          </div>
          {paused && <p className="mt-1 text-xs">{autoConvertPause.reason()}</p>}
          <ul className="mt-1 list-disc pl-5 text-xs space-y-0.5">
            {blockers.map((b) => (
              <li key={b.label}>
                <Link to={b.to} className="underline underline-offset-2">
                  {b.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

    </Card>
  );
}
