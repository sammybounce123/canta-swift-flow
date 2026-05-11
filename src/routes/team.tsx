import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Check } from "lucide-react";
import { team } from "@/lib/mock";
import { useActions } from "@/components/ActionsProvider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const permissions = [
  { name: "View dashboard", roles: { Admin: true, Treasury: true, Finance: true, Compliance: true, Viewer: true } },
  { name: "Initiate transactions", roles: { Admin: true, Treasury: true, Finance: true, Compliance: false, Viewer: false } },
  { name: "Approve transactions", roles: { Admin: true, Treasury: true, Finance: false, Compliance: true, Viewer: false } },
  { name: "Manage beneficiaries", roles: { Admin: true, Treasury: true, Finance: true, Compliance: false, Viewer: false } },
  { name: "Manage team & roles", roles: { Admin: true, Treasury: false, Finance: false, Compliance: false, Viewer: false } },
  { name: "Export reports", roles: { Admin: true, Treasury: true, Finance: true, Compliance: true, Viewer: true } },
];
const roles = ["Admin", "Treasury", "Finance", "Compliance", "Viewer"] as const;

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team & Roles — Canta" }] }),
  component: Team,
});

function Team() {
  const { openInvite } = useActions();
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Team & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">Granular permissions for finance, treasury and compliance.</p>
        </div>
        <Button className="bg-primary" onClick={openInvite}><UserPlus className="h-4 w-4 mr-1.5" /> Invite Member</Button>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="p-5 border-b border-border text-sm font-semibold">Members</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.email} className="border-t border-border hover:bg-secondary/30">
                <td className="px-5 py-3 font-medium flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  {m.name}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-5 py-3">
                  <Badge variant="outline" className="border-border">{m.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${m.status === "Active" ? "bg-success/15 text-success border-success/30" : "bg-warning/20 text-warning-foreground border-warning/40"}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">Manage</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success(`Role updated for ${m.name}`)}>Change role</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`Invite resent to ${m.email}`)}>Resend invite</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`2FA reset for ${m.name}`)}>Reset 2FA</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => toast.success(`${m.name} removed`)}>Remove member</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <div className="text-sm font-semibold">Permissions Matrix</div>
          <div className="text-xs text-muted-foreground">Toggle permissions per role. Changes apply immediately.</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-5 py-3 font-medium">Permission</th>
                {roles.map((r) => <th key={r} className="px-5 py-3 font-medium text-center">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  {roles.map((r) => (
                    <td key={r} className="px-5 py-3 text-center">
                      <Toggle initial={p.roles[r]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import { useState } from "react";
function Toggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => { setOn(!on); toast.success(on ? "Permission revoked" : "Permission granted"); }}
      className={`h-5 w-9 rounded-full inline-flex items-center px-0.5 transition ${on ? "bg-accent justify-end" : "bg-secondary justify-start"}`}
    >
      <span className="h-4 w-4 rounded-full bg-white shadow grid place-items-center">
        {on && <Check className="h-2.5 w-2.5 text-accent" />}
      </span>
    </button>
  );
}
