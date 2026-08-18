import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  PARTNER_FEE_ACCOUNT,
  clientEmailMessage,
  clientWhatsAppMessage,
  formatFx,
  formatNgn,
  isFeeCase,
  partnerCaseTone,
  paymentLinkUrl,
  quoteExpired,
  usePartnerPayments,
} from "@/lib/partner-payments";
import { maskAccountNumber, PAYOUT_STATUS_TONE } from "@/lib/payout-security";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/fee-payments")({
  head: () => ({
    meta: [
      { title: "Partner Fee Payments — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "Partner fee payments follow the same client payment flow and settle to the verified Partner GBP account, never mixed with solicitor remittances.",
      },
      { property: "og:title", content: "Partner Fee Payments — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Create and track partner fee payments separate from solicitor payouts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FeePaymentsPage,
});

function copyText(text: string, label: string) {
  if (typeof navigator === "undefined") return;
  navigator.clipboard?.writeText(text);
  toast.success(`${label} copied`);
}

function FeePaymentsPage() {
  const { cases } = usePartnerPayments();
  const feeCases = cases.filter(isFeeCase);

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo Preview"
        cue="Partner fees use the same consent-first client payment flow as client payment cases."
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Partner Fee Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Same journey as a client payment case — client consents, verifies identity and pays NGN
            into a case-specific account. Fees settle only to the verified Partner GBP account.
          </p>
        </div>
        <Button asChild>
          <Link to="/partner/new-fee-payment">
            <Plus className="h-4 w-4 mr-1.5" /> New Partner Fee Payment
          </Link>
        </Button>
      </div>

      <Card className="p-4 shadow-card text-xs text-muted-foreground">
        Destination: {PARTNER_FEE_ACCOUNT.label} · {PARTNER_FEE_ACCOUNT.bank} ·{" "}
        {maskAccountNumber(PARTNER_FEE_ACCOUNT.accountNumber)}{" "}
        <Badge
          variant="outline"
          className={`ml-1 text-[10px] ${PAYOUT_STATUS_TONE[PARTNER_FEE_ACCOUNT.status]}`}
        >
          {PARTNER_FEE_ACCOUNT.status}
        </Badge>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Fee case</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3 text-right">Partner receives</th>
                <th className="py-3 px-3 text-right">Client pays NGN</th>
                <th className="py-3 px-3">Quote expiry</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {feeCases.map((f) => (
                <tr key={f.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs">{f.id}</td>
                  <td className="py-3 px-3">{f.clientName}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{f.property || "—"}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatFx(f.quote.payoutAmount, f.payoutCurrency)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatNgn(f.quote.ngnTotal)}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {quoteExpired(f.quote)
                      ? "Expired — refresh"
                      : new Date(f.quote.expiresAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className={`text-[10px] ${partnerCaseTone(f.status)}`}>
                      {f.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyText(paymentLinkUrl(f.linkId), "Fee payment link")}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyText(
                            clientWhatsAppMessage(f, PARTNER_FEE_ACCOUNT.label),
                            "WhatsApp message",
                          )
                        }
                      >
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyText(clientEmailMessage(f, PARTNER_FEE_ACCOUNT.label), "Email message")
                        }
                      >
                        Email
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/partner/payment-cases/$caseId" params={{ caseId: f.id }}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {feeCases.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No partner fee payments yet. Create one to send a client fee payment link.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
