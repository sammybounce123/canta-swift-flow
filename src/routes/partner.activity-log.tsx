import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { PARTNER_ORG } from "@/lib/partner";

export const Route = createFileRoute("/partner/activity-log")({
  head: () => ({ meta: [{ title: "Activity Log — Partner — Canta" }] }),
  component: PartnerActivityLog,
});

const PARTNER_EVENTS = [
  {
    at: "Today · 09:42",
    actor: "Charlotte Hayes",
    action: "Approved payment case",
    ref: "KPP-2026-1001",
  },
  {
    at: "Today · 08:15",
    actor: "Quinn Solicitors",
    action: "Uploaded solicitor undertaking",
    ref: "KPP-2026-1001",
  },
  {
    at: "Yesterday · 17:04",
    actor: "Charlotte Hayes",
    action: "Created payment link",
    ref: "PL-2026-0342",
  },
  {
    at: "Yesterday · 11:22",
    actor: "Marketing Team",
    action: "Added referral lead",
    ref: "LEAD-2026-088",
  },
  {
    at: "2 days ago",
    actor: "Charlotte Hayes",
    action: "Updated commission split",
    ref: "COM-2026-014",
  },
];

function PartnerActivityLog() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Partner Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {PARTNER_ORG.name} · scoped to your partner workspace only.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">
          Illustrative demo data
        </Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        <ul className="divide-y">
          {PARTNER_EVENTS.map((e, i) => (
            <li key={i} className="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <div className="font-medium">{e.action}</div>
                <div className="text-xs text-muted-foreground">
                  {e.actor} · Ref {e.ref}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">{e.at}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
