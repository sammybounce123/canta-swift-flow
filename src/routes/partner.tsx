import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Building2, Check } from "lucide-react";
import {
  PARTNER_ORG,
  PARTNER_ROLES,
  MARKETERS,
  setActivePartnerUser,
  type PartnerRole,
} from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { toast } from "sonner";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Baron & Cabot — Partner Property Payments" }] }),
  component: PartnerShell,
});

const ROLE_GROUPS: { role: PartnerRole; label: string }[] = [
  { role: "partner_admin", label: "Partner Admin" },
  { role: "partner_manager", label: "Partner Managers" },
  { role: "marketer", label: "Marketers" },
  { role: "finance_viewer", label: "Finance" },
];

function PartnerShell() {
  const { role, userId, user } = usePartnerRole();
  const roleLabel = PARTNER_ROLES.find((r) => r.id === role)?.label ?? role;

  return (
    <div className="space-y-4">
      <Card className="p-3 shadow-card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">{PARTNER_ORG.name}</div>
            <div className="text-[11px] text-muted-foreground">{PARTNER_ORG.type} · {PARTNER_ORG.country}</div>
          </div>
        </div>
        <Badge variant="outline" className="ml-2 text-[10px]">
          <ShieldCheck className="h-3 w-3 mr-1" /> {roleLabel}
        </Badge>
        {user && (
          <span className="text-[11px] text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.name}</span>
          </span>
        )}
      </Card>

      <Card className="p-3 shadow-card">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
          Switch partner user (demo)
        </div>
        <div className="space-y-3">
          {ROLE_GROUPS.map((g) => {
            const users = MARKETERS.filter((m) => m.role === g.role);
            if (!users.length) return null;
            return (
              <div key={g.role}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{g.label}</div>
                <div className="flex flex-wrap gap-2">
                  {users.map((u) => {
                    const active = u.id === userId;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setActivePartnerUser(u.id);
                          toast.success(`Signed in as ${u.name}`);
                        }}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                          active
                            ? "bg-primary/10 border-primary text-foreground"
                            : "bg-card border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="h-6 w-6 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-[10px] font-semibold">
                          {u.avatarInitials}
                        </div>
                        <div className="text-left leading-tight">
                          <div className="font-medium text-foreground">{u.name}</div>
                          <div className="text-[10px] text-muted-foreground">{u.region}</div>
                        </div>
                        {active && <Check className="h-3.5 w-3.5 text-primary ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Outlet />
    </div>
  );
}
