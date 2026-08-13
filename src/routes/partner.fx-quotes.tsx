import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight, Clock, AlertTriangle, RefreshCw, Link as LinkIcon } from "lucide-react";
import { usePartnerCases } from "@/hooks/usePartnerCases";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { visibleCases, formatGBP, getSolicitor } from "@/lib/partner";
import {
  generateQuote,
  generatePaymentLink,
  partnerActorFromUser,
  type FxQuote,
} from "@/lib/partner-store";
import { toast } from "sonner";
import { useState } from "react";
import { countdownTo, formatIsoDate, formatIsoDateTime, useNow } from "@/lib/hydration-time";
import { ReadinessBar } from "@/components/ReadinessBar";
import { SolicitorQuotesTable } from "@/components/partner/SolicitorPaymentSections";

export const Route = createFileRoute("/partner/fx-quotes")({
  head: () => ({
    meta: [
      { title: "FX Quotes — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "FX quotes generated for Kingsbridge Property Partners client property payment cases.",
      },
      { property: "og:title", content: "FX Quotes — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Track NGN to GBP quotes, expiry and payment link generation per payment case.",
      },
    ],
  }),
  component: FxQuotesPage,
});

function FxQuotesPage() {
  const cases = usePartnerCases();
  const { role, userId } = usePartnerRole();
  const allowed = new Set(visibleCases(userId, role).map((c) => c.id));
  const [view, setView] = useState<{ q: FxQuote; client: string; ref: string } | null>(null);

  const scoped = cases.filter((c) => allowed.has(c.id));
  const rows = scoped
    .flatMap((c) => c.quotes.map((q) => ({ q, c })))
    .sort((a, b) => b.q.generatedAt.localeCompare(a.q.generatedAt));
  const noQuote = scoped.filter((c) => c.quotes.length === 0);

  // Countdown ticks only after hydration so SSR and first client render match.
  const now = useNow(1000);

  const refresh = (caseId: string) => {
    generateQuote(caseId, "1h", partnerActorFromUser(userId));
    toast.success("FX quote refreshed");
  };
  const makeLink = (caseId: string) => {
    const l = generatePaymentLink(caseId, partnerActorFromUser(userId));
    toast.success(l ? `Payment link ${l.id} generated` : "Generate a valid FX quote first");
  };

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo data"
        cue="FX quotes are indicative and subject to market movement until locked."
      />
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" /> FX Quotes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All FX quotes generated for Kingsbridge Property Partners client payment cases.
        </p>
      </div>

      <SolicitorQuotesTable />

      <Card className="p-0 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Quote ref</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">FX rate</th>
                <th className="py-3 px-4 text-right">Fee</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ q, c }) => {
                const cd = countdownTo(q.expiresAt, now);
                const expired = q.status === "Expired" || (cd?.expired ?? false);
                const tone = expired
                  ? "bg-destructive/15 text-destructive border-destructive/30"
                  : q.status === "Active"
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-muted text-muted-foreground";
                const dest = getSolicitor(c.solicitorId)?.currency ?? "GBP";
                return (
                  <tr key={q.id} className="border-t hover:bg-secondary/30 align-top">
                    <td className="py-3 px-4 font-mono text-xs">{q.reference}</td>
                    <td className="py-3 px-4 font-medium">{c.clientName}</td>
                    <td className="py-3 px-4">
                      <Link
                        to="/partner/cases/$caseId"
                        params={{ caseId: c.id }}
                        className="text-[12px] text-primary hover:underline"
                      >
                        {c.ref}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-[180px]">
                      {c.property}
                    </td>
                    <td className="py-3 px-4 text-xs">NGN</td>
                    <td className="py-3 px-4 text-xs">{dest}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {formatGBP(q.gbpAmount)}
                      <div className="text-[11px] text-muted-foreground">
                        ₦{q.ngnTotal.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">{q.rate.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{formatGBP(q.feeGBP)}</td>
                    <td className="py-3 px-4 text-xs">
                      {q.status === "Active" && cd && !expired ? (
                        <span className="inline-flex items-center gap-1 text-warning">
                          <Clock className="h-3 w-3" /> {cd.minutes}m {cd.seconds}s
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{formatIsoDate(q.expiresAt)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={`text-[10px] ${tone}`}>
                        {expired && q.status === "Active" ? "Expired" : q.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setView({ q, client: c.clientName, ref: c.ref })}
                        >
                          View quote
                        </Button>
                        {expired ? (
                          <Button size="sm" variant="outline" onClick={() => refresh(c.id)}>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh quote
                          </Button>
                        ) : (
                          !c.paymentLink && (
                            <Button size="sm" onClick={() => makeLink(c.id)}>
                              <LinkIcon className="h-3.5 w-3.5 mr-1" /> Generate payment link
                            </Button>
                          )
                        )}
                        <Button asChild size="sm" variant="ghost">
                          <Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>
                            View case
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-muted-foreground text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-1" /> No FX quotes generated yet.
                    Open a payment case and generate one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {noQuote.length > 0 && (
        <Card className="p-5 shadow-card">
          <div className="text-sm font-semibold">Cases without an FX quote</div>
          <p className="text-xs text-muted-foreground mt-1">
            Generate a quote to move these cases forward.
          </p>
          <div className="mt-3 space-y-2">
            {noQuote.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 border rounded-lg px-3 py-2"
              >
                <div className="text-sm">
                  <span className="font-medium">{c.clientName}</span>{" "}
                  <span className="text-muted-foreground text-xs">
                    {c.ref} · {formatGBP(c.amountGBP)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => refresh(c.id)}>
                    Generate FX Quote
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>
                      View case
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>FX quote {view?.q.reference}</DialogTitle>
            <DialogDescription>
              {view?.client} · {view?.ref}
            </DialogDescription>
          </DialogHeader>
          {view && (
            <div className="space-y-2 text-sm">
              <Row k="Amount (GBP)" v={formatGBP(view.q.gbpAmount)} />
              <Row k="FX rate" v={`1 GBP = ₦${view.q.rate.toLocaleString()}`} />
              <Row k="Fee" v={formatGBP(view.q.feeGBP)} />
              <Row k="Client pays (NGN)" v={`₦${view.q.ngnTotal.toLocaleString()}`} />
              <Row k="Generated by" v={view.q.generatedByName} />
              <Row k="Expires" v={formatIsoDateTime(view.q.expiresAt)} />
              <Row k="Status" v={view.q.status} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-1 last:border-0">
      <span className="text-muted-foreground text-xs">{k}</span>
      <span className="font-medium tabular-nums">{v}</span>
    </div>
  );
}
