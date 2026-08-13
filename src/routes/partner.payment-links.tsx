import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Copy, Send, AlertTriangle } from "lucide-react";
import { usePartnerCases } from "@/hooks/usePartnerCases";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { visibleCases, formatGBP, getSolicitor } from "@/lib/partner";
import { markLinkSent, appendActivity, partnerActorFromUser } from "@/lib/partner-store";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { ClientPaymentLinksTable } from "@/components/partner/SolicitorPaymentSections";

export const Route = createFileRoute("/partner/payment-links")({
  head: () => ({
    meta: [
      { title: "Payment Links — Kingsbridge Property Partners" },
      {
        name: "description",
        content:
          "Secure client payment links for Kingsbridge Property Partners property payment cases.",
      },
      { property: "og:title", content: "Payment Links — Kingsbridge Property Partners" },
      {
        property: "og:description",
        content: "Copy, send and track client payment links per payment case.",
      },
    ],
  }),
  component: PaymentLinksPage,
});

function PaymentLinksPage() {
  const cases = usePartnerCases();
  const { role, userId } = usePartnerRole();
  const allowed = new Set(visibleCases(userId, role).map((c) => c.id));
  const rows = cases.filter((c) => allowed.has(c.id) && c.paymentLink);

  const copy = (url: string) => {
    if (typeof window === "undefined") return;
    const full = window.location.origin + url;
    navigator.clipboard?.writeText(full);
    toast.success("Payment link copied");
  };
  const send = (caseId: string) => {
    markLinkSent(caseId, partnerActorFromUser(userId));
    toast.success("Payment link marked as sent", {
      description: "Sending is not configured in demo. Copy the message and send manually.",
    });
  };
  const remind = (caseId: string) => {
    appendActivity(caseId, "Payment reminder logged", partnerActorFromUser(userId));
    toast.success("Reminder logged", {
      description: "Sending is not configured in demo. Copy the message and send manually.",
    });
  };

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo data"
        cue="Payment links include payer and reconciliation references."
      />
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" /> Payment Links
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Secure Canta × Kingsbridge Property Partners payment pages — one link per payment case.
        </p>
      </div>

      <ClientPaymentLinksTable />


      <Card className="p-0 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Link ID</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Link status</th>
                <th className="py-3 px-4">Funding</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Last activity</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const link = c.paymentLink!;
                const quote = c.quotes.find((q) => q.id === link.quoteId);
                const closed =
                  link.status === "Expired" ||
                  link.status === "Completed" ||
                  link.status === "Funded";
                const funding = c.funding?.receivedNGN
                  ? `₦${c.funding.receivedNGN.toLocaleString()} received`
                  : link.status === "Expired"
                    ? "Not funded"
                    : "Awaiting funds";
                const last = link.openedAt ?? link.sentAt ?? link.createdAt;
                return (
                  <tr key={c.id} className="border-t hover:bg-secondary/30 align-top">
                    <td className="py-3 px-4 font-mono text-xs">{link.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.clientName}</div>
                      <div className="text-[11px] text-muted-foreground">{c.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to="/partner/cases/$caseId"
                        params={{ caseId: c.id }}
                        className="text-primary hover:underline text-[12px]"
                      >
                        {c.ref}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-[180px]">
                      {c.property}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {formatGBP(c.amountGBP)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {getSolicitor(c.solicitorId)?.currency ?? "GBP"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {link.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs">{funding}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {quote ? new Date(quote.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(last).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => copy(link.url)}>
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                        </Button>
                        {closed ? (
                          <Button size="sm" variant="outline" disabled>
                            <Send className="h-3.5 w-3.5 mr-1" /> Reminder unavailable
                          </Button>
                        ) : link.status === "Active" ? (
                          <Button size="sm" onClick={() => send(c.id)}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Send
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => remind(c.id)}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Send reminder
                          </Button>
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
                  <td colSpan={11} className="py-10 text-center text-muted-foreground text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-1" /> No payment links yet. Generate
                    an FX quote on a case, then create a link.
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
