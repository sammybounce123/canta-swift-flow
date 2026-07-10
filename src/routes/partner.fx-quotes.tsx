import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Clock, AlertTriangle } from "lucide-react";
import { usePartnerCases } from "@/hooks/usePartnerCases";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { visibleCases, formatGBP } from "@/lib/partner";
import { useEffect, useState } from "react";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/fx-quotes")({
  head: () => ({ meta: [{ title: "FX Quotes — Kingsbridge Property Partners" }] }),
  component: FxQuotesPage,
});

function FxQuotesPage() {
  const cases = usePartnerCases();
  const { role, userId } = usePartnerRole();
  const allowed = new Set(visibleCases(userId, role).map((c) => c.id));
  const rows = cases
    .filter((c) => allowed.has(c.id))
    .flatMap((c) => c.quotes.map((q) => ({ q, c })))
    .sort((a, b) => b.q.generatedAt.localeCompare(a.q.generatedAt));

  const [, force] = useState(0);
  useEffect(() => { const i = setInterval(() => force((n) => n + 1), 1000); return () => clearInterval(i); }, []);

  return (
    <div className="space-y-5">
      <ReadinessBar status="Demo Preview" cue="FX quotes are indicative and subject to market movement until locked." />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-primary" /> FX Quotes</h1>
          <p className="text-sm text-muted-foreground mt-1">All FX quotes generated for client payment cases.</p>
        </div>
      </div>

      <Card className="p-0 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-4">Quote ref</th>
                <th className="py-3 px-4">Client / Case</th>
                <th className="py-3 px-4 text-right">GBP</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">NGN total</th>
                <th className="py-3 px-4">Expires</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ q, c }) => {
                const remaining = Math.max(0, new Date(q.expiresAt).getTime() - Date.now());
                const mm = Math.floor(remaining / 60000); const ss = Math.floor((remaining % 60000) / 1000);
                const expired = q.status === "Expired" || (q.status === "Active" && remaining === 0);
                const tone = expired ? "bg-destructive/15 text-destructive border-destructive/30" :
                  q.status === "Active" ? "bg-success/15 text-success border-success/30" :
                  "bg-muted text-muted-foreground";
                return (
                  <tr key={q.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-4 font-mono text-xs">{q.reference}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{c.clientName}</div>
                      <Link to="/partner/cases/$caseId" params={{ caseId: c.id }} className="text-[11px] text-primary hover:underline">{c.ref}</Link>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">{formatGBP(q.gbpAmount)}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{q.rate.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right tabular-nums">₦{q.ngnTotal.toLocaleString()}</td>
                    <td className="py-3 px-4 text-xs">
                      {q.status === "Active" && !expired ? (
                        <span className="inline-flex items-center gap-1 text-warning"><Clock className="h-3 w-3" /> {mm}m {ss}s</span>
                      ) : (
                        <span className="text-muted-foreground">{new Date(q.expiresAt).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-3 px-4"><Badge variant="outline" className={`text-[10px] ${tone}`}>{expired && q.status === "Active" ? "Expired" : q.status}</Badge></td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild size="sm" variant="outline"><Link to="/partner/cases/$caseId" params={{ caseId: c.id }}>Open case</Link></Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={8} className="py-10 text-center text-muted-foreground text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1" /> No FX quotes generated yet. Open a payment case and generate one.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
