import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Copy, Send, AlertTriangle } from "lucide-react";
import { usePartnerCases } from "@/hooks/usePartnerCases";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { visibleCases, formatGBP } from "@/lib/partner";
import { markLinkSent, partnerActorFromUser } from "@/lib/partner-store";
import { toast } from "sonner";

export const Route = createFileRoute("/partner/payment-links")({
  head: () => ({ meta: [{ title: "Payment Links — Baron & Cabot" }] }),
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
    toast.success("Payment link sent to client");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><LinkIcon className="h-5 w-5 text-primary" /> Payment Links</h1>
        <p className="text-sm text-muted-foreground mt-1">Secure Canta × Baron &amp; Cabot payment pages — one link per payment case.</p>
      </div>

      <Card className="p-0 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Case</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Link</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-4">
                    <div className="font-medium">{c.clientName}</div>
                    <div className="text-[11px] text-muted-foreground">{c.clientEmail}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Link to="/partner/cases/$caseId" params={{ caseId: c.id }} className="text-primary hover:underline">{c.ref}</Link>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium">{formatGBP(c.amountGBP)}</td>
                  <td className="py-3 px-4 font-mono text-xs truncate max-w-[200px]">{c.paymentLink!.url}</td>
                  <td className="py-3 px-4"><Badge variant="outline" className="text-[10px]">{c.paymentLink!.status}</Badge></td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => copy(c.paymentLink!.url)}><Copy className="h-3.5 w-3.5 mr-1" /> Copy</Button>
                    <Button size="sm" variant="outline" onClick={() => send(c.id)}><Send className="h-3.5 w-3.5 mr-1" /> Send</Button>
                    <Button asChild size="sm" variant="ghost"><a href={c.paymentLink!.url} target="_blank" rel="noreferrer">Preview</a></Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" /> No payment links yet. Generate an FX quote on a case, then create a link.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
