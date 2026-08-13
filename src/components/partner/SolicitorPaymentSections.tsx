import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { getSolicitor } from "@/lib/partner";
import {
  formatFx,
  formatNgn,
  markCaseLinkSent,
  partnerCaseTone,
  partnerWalletSummary,
  paymentLinkUrl,
  quoteExpired,
  refreshCaseQuote,
  usePartnerPayments,
} from "@/lib/partner-payments";

function copyLink(linkId: string) {
  navigator.clipboard?.writeText(paymentLinkUrl(linkId));
  toast.success("Client Payment Link copied");
}

/** Client Payment Links generated from Client Payment Cases. */
export function ClientPaymentLinksTable() {
  const { cases } = usePartnerPayments();
  if (cases.length === 0) return null;
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-medium">Client Payment Links (solicitor payment cases)</h2>
        <p className="text-xs text-muted-foreground">
          Generated from Client Payment Cases mapped to a solicitor.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-secondary/40">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">Payment Link ID</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Solicitor</th>
              <th className="py-3 px-4 text-right">Solicitor receives</th>
              <th className="py-3 px-4 text-right">Client pays NGN</th>
              <th className="py-3 px-4">Quote expiry</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last activity</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className="border-t hover:bg-secondary/30">
                <td className="py-3 px-4 font-mono text-xs">{c.linkId}</td>
                <td className="py-3 px-4">{c.clientName}</td>
                <td className="py-3 px-4 font-mono text-xs">{c.id}</td>
                <td className="py-3 px-4 text-xs">{getSolicitor(c.solicitorId)?.firm}</td>
                <td className="py-3 px-4 text-right tabular-nums">
                  {formatFx(c.quote.payoutAmount, c.payoutCurrency)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums">{formatNgn(c.quote.ngnTotal)}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {quoteExpired(c.quote)
                    ? "Expired"
                    : new Date(c.quote.expiresAt).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className={`text-[10px] ${partnerCaseTone(c.status)}`}>
                    {c.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {new Date(c.timeline[c.timeline.length - 1]?.ts ?? c.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyLink(c.linkId)}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        markCaseLinkSent(c.id, "Reminder");
                        toast.info(
                          "Sending is not configured in demo. Copy the message and send manually.",
                        );
                      }}
                    >
                      <Send className="h-3.5 w-3.5 mr-1" /> Send reminder
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        refreshCaseQuote(c.id);
                        toast.success("Quote refreshed");
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh quote
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/partner/payment-cases/$caseId" params={{ caseId: c.id }}>
                        View case
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** FX quotes generated for solicitor payment cases. */
export function SolicitorQuotesTable() {
  const { cases } = usePartnerPayments();
  if (cases.length === 0) return null;
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-medium">Quotes for solicitor payment cases</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-secondary/40">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">Quote ID</th>
              <th className="py-3 px-4">Case ID</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Solicitor</th>
              <th className="py-3 px-4">From</th>
              <th className="py-3 px-4">To</th>
              <th className="py-3 px-4 text-right">Client pays NGN</th>
              <th className="py-3 px-4 text-right">Solicitor receives</th>
              <th className="py-3 px-4">Rate</th>
              <th className="py-3 px-4 text-right">Fee</th>
              <th className="py-3 px-4">Expiry</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => {
              const expired = quoteExpired(c.quote);
              return (
                <tr key={c.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-4 font-mono text-xs">Q-{c.id.slice(-4)}</td>
                  <td className="py-3 px-4 font-mono text-xs">{c.id}</td>
                  <td className="py-3 px-4">{c.clientName}</td>
                  <td className="py-3 px-4 text-xs">{getSolicitor(c.solicitorId)?.firm}</td>
                  <td className="py-3 px-4 text-xs">NGN</td>
                  <td className="py-3 px-4 text-xs">{c.payoutCurrency}</td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatNgn(c.quote.ngnTotal)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums">
                    {formatFx(c.quote.payoutAmount, c.payoutCurrency)}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    1 {c.payoutCurrency} = ₦{c.quote.rate}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-xs">
                    {formatNgn(c.quote.feeNgn)}
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">
                    {new Date(c.quote.expiresAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">
                      {expired ? "Expired" : "Active"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          refreshCaseQuote(c.id);
                          toast.success("Quote refreshed");
                        }}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh quote
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={expired}
                        onClick={() => copyLink(c.linkId)}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Payment link
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link to="/partner/payment-cases/$caseId" params={{ caseId: c.id }}>
                          View case
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** Partner NGN wallet + solicitor payout summary cards. */
export function PartnerWalletCards() {
  const { cases, fees } = usePartnerPayments();
  const s = partnerWalletSummary(cases, fees);
  const items: { label: string; value: string }[] = [
    { label: "Active client payment cases", value: String(s.activeCases) },
    { label: "Awaiting client NGN payment", value: String(s.pendingClientPayments) },
    { label: "NGN received in partner wallet", value: formatNgn(s.balanceNgn + s.convertedNgn) },
    { label: "NGN awaiting conversion", value: formatNgn(s.awaitingConversionNgn) },
    { label: "NGN converted", value: formatNgn(s.convertedNgn) },
    { label: "Solicitor payouts pending", value: String(s.settlementPending) },
    { label: "Solicitor paid this month", value: String(s.solicitorPaidThisMonth) },
    { label: "Partner fee payments pending", value: String(s.feesPending) },
    { label: "Partner fees received", value: formatFx(s.feesReceivedGbp, "GBP") },
  ];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Card key={i.label} className="p-4 shadow-card">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {i.label}
            </div>
            <div className="text-lg font-semibold mt-1 tabular-nums">{i.value}</div>
          </Card>
        ))}
      </div>
      {s.byCase.length > 0 && (
        <Card className="p-4 shadow-card">
          <h2 className="text-sm font-medium mb-2">Partner NGN Wallet — received by case</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Client NGN sits against its payment case, solicitor and settlement destination — it is
            never free wallet balance.
          </p>
          <div className="space-y-2">
            {s.byCase.map((b) => (
              <div key={b.caseId} className="flex items-center justify-between gap-3 text-sm">
                <Link
                  to="/partner/payment-cases/$caseId"
                  params={{ caseId: b.caseId }}
                  className="text-primary hover:underline text-xs font-mono"
                >
                  {b.caseId}
                </Link>
                <span className="text-xs text-muted-foreground flex-1 truncate">
                  {b.clientName} · {getSolicitor(b.solicitorId)?.firm}
                </span>
                <span className="tabular-nums">{formatNgn(b.ngn)}</span>
                <Badge variant="outline" className={`text-[10px] ${partnerCaseTone(b.status)}`}>
                  {b.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
