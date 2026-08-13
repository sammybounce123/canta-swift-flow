import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSolicitor } from "@/lib/partner";
import {
  formatFx,
  formatNgn,
  partnerCaseTone,
  quoteExpired,
  usePartnerPayments,
} from "@/lib/partner-payments";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/payment-cases/")({
  head: () => ({
    meta: [
      { title: "Client Payment Cases — Kingsbridge Property Partners" },
      {
        name: "description",
        content: "Client payment cases mapped to solicitors, with NGN payment links and payouts.",
      },
      { property: "og:title", content: "Client Payment Cases — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Track client NGN payments through to verified solicitor payouts.",
      },
    ],
  }),
  component: PaymentCasesList,
});

function PaymentCasesList() {
  const { cases } = usePartnerPayments();

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo Preview"
        cue="Each case maps client → solicitor → settlement destination."
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Client Payment Cases</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cases created with solicitor mapping, FX quote and Client Payment Link.
          </p>
        </div>
        <Button asChild>
          <Link to="/partner/new-payment-case">
            <Plus className="h-4 w-4 mr-1.5" /> New Client Payment Case
          </Link>
        </Button>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3 text-right">Solicitor receives</th>
                <th className="py-3 px-3 text-right">Client pays NGN</th>
                <th className="py-3 px-3">Quote expiry</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs">{c.id}</td>
                  <td className="py-3 px-3">{c.clientName}</td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">{c.property}</td>
                  <td className="py-3 px-3 text-xs">{getSolicitor(c.solicitorId)?.firm}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatFx(c.quote.payoutAmount, c.payoutCurrency)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatNgn(c.quote.ngnTotal)}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {quoteExpired(c.quote)
                      ? "Expired — refresh"
                      : new Date(c.quote.expiresAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className={`text-[10px] ${partnerCaseTone(c.status)}`}>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/partner/payment-cases/$caseId" params={{ caseId: c.id }}>
                        View
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {cases.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No client payment cases yet. Create one to map a client to a solicitor.
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
