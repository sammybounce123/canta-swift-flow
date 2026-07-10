import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ShieldAlert } from "lucide-react";
import { marketerPerformance, formatGBP, PARTNER_ROLES, MARKETERS, canSeeAllMarketers } from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/marketers")({
  head: () => ({ meta: [{ title: "Marketers — Kingsbridge Property Partners" }] }),
  component: Marketers,
});

function Marketers() {
  const { role, userId } = usePartnerRole();

  if (!canSeeAllMarketers(role)) {
    return (
      <Card className="p-10 text-center shadow-card">
        <ShieldAlert className="h-10 w-10 mx-auto text-muted-foreground" />
        <div className="mt-3 text-base font-semibold">Restricted view</div>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          Only Partner Admins and Partner Managers can view marketer performance. Ask Charlotte Baron for access.
        </p>
      </Card>
    );
  }

  let rows = marketerPerformance();
  if (role === "partner_manager") {
    const myTeam = MARKETERS.filter((m) => m.managerId === userId).map((m) => m.id);
    rows = rows.filter((r) => myTeam.includes(r.marketer.id));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="h-5 w-5" /> Marketer performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {role === "partner_manager" ? "Your assigned marketers and their pipelines." : "Every marketer at Kingsbridge Property Partners — referrals, payouts and conversion."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((r) => {
          const roleLabel = PARTNER_ROLES.find((x) => x.id === r.marketer.role)?.label;
          return (
            <Card key={r.marketer.id} className="p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
                    {r.marketer.avatarInitials}
                  </div>
                  <div>
                    <div className="font-semibold leading-none">{r.marketer.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{r.marketer.region}</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{roleLabel}</Badge>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-5 text-sm">
                <Cell label="Clients referred" value={r.clientsReferred.toString()} />
                <Cell label="Active leads" value={r.activeLeads.toString()} />
                <Cell label="Active cases" value={r.activeCases.toString()} />
                <Cell label="Successful payouts" value={r.successfulPayouts.toString()} />
                <Cell label="Total paid (GBP)" value={formatGBP(r.totalPaidGBP)} />
                <Cell label="Avg ticket" value={formatGBP(r.averageTicketGBP)} />
                <Cell label="Conversion" value={`${Math.round(r.conversionRate * 100)}%`} />
                <Cell label="Pending payouts" value={r.pendingPayouts.toString()} />
                <Cell label="Failed payouts" value={r.failedPayouts.toString()} tone={r.failedPayouts ? "text-destructive" : ""} />
                <Cell label="Last activity" value={r.lastActivity} />
              </dl>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">View clients</Button>
                <Button size="sm" variant="ghost">Message</Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className={`text-sm font-semibold tabular-nums mt-0.5 ${tone ?? ""}`}>{value}</dd>
    </div>
  );
}
