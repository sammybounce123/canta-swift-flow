import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { MARKETERS, PARTNER_ROLES, PARTNER_ORG } from "@/lib/partner";

export const Route = createFileRoute("/partner/team")({
  head: () => ({ meta: [{ title: "Team — Baron & Cabot" }] }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team</h1>
        <p className="text-sm text-muted-foreground mt-1">{PARTNER_ORG.name} workspace — admins, managers, marketers and finance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MARKETERS.map((m) => {
          const role = PARTNER_ROLES.find((r) => r.id === m.role);
          return (
            <Card key={m.id} className="p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">{m.avatarInitials}</div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-[10px]">{role?.label}</Badge>
                <Badge variant="outline" className="text-[10px]">{m.region}</Badge>
                <Badge variant="outline" className={`text-[10px] ${m.status === "Active" ? "text-success border-success/30" : "text-muted-foreground"}`}>{m.status}</Badge>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">Joined {m.joined} · Last active {m.lastActivity}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
