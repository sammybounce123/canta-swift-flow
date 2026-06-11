import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Building2 } from "lucide-react";
import { MARKETERS, PARTNER_ORG, setActivePartnerUser, PARTNER_ROLES } from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Baron & Cabot — Partner Property Payments" }] }),
  component: PartnerShell,
});

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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Sign in as</span>
          <Select value={userId} onValueChange={setActivePartnerUser}>
            <SelectTrigger className="w-[280px] h-8 text-xs">
              <SelectValue>
                {user ? `${user.name} · ${PARTNER_ROLES.find((r) => r.id === user.role)?.label}` : "Pick user"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MARKETERS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name} · {PARTNER_ROLES.find((r) => r.id === m.role)?.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
      <Outlet />
    </div>
  );
}
