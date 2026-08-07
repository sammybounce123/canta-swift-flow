import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserPlus, Check, Search, Sparkles, Shield } from "lucide-react";
import { team } from "@/lib/mock";
import { useActions } from "@/components/ActionsProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMemo, useState, Fragment } from "react";
import { useActiveWorkspace, useRequireWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team & Roles — Canta" }] }),
  component: Team,
});

const roleGroups = [
  {
    id: "importer_portal",
    label: "Importer",
    roles: [
      "Importer Owner",
      "Importer Staff",
      "Procurement Officer",
      "Logistics Manager",
      "Accountant",
    ],
  },
  {
    id: "supplier_dashboard",
    label: "Supplier",
    roles: ["Supplier Admin", "Supplier Finance", "Supplier Operations"],
  },
  {
    id: "partner_property",
    label: "Partner",
    roles: ["Partner Admin", "Partner Marketer", "Partner Finance"],
  },
] as const;

const permissions = [
  {
    group: "Trade",
    items: [
      "create shipment",
      "edit shipment",
      "upload documents",
      "delete documents",
      "create trade file",
      "view landed cost",
      "send WhatsApp updates",
    ],
  },
  {
    group: "Finance",
    items: ["approve payments", "release escrow", "view financial data", "export reports"],
  },
  { group: "Counterparties", items: ["manage supplier", "manage customer"] },
  { group: "Compliance", items: ["view compliance pack", "approve KYB"] },
  { group: "Platform", items: ["manage API keys"] },
] as const;

// Role templates — default grants by role
const defaults: Record<string, string[]> = {
  "Importer Owner": [
    "create shipment",
    "edit shipment",
    "upload documents",
    "create trade file",
    "view landed cost",
    "approve payments",
    "manage supplier",
    "send WhatsApp updates",
  ],
  "Importer Staff": ["create shipment", "upload documents", "send WhatsApp updates"],
  "Procurement Officer": [
    "create trade file",
    "manage supplier",
    "upload documents",
    "view landed cost",
  ],
  "Logistics Manager": [
    "edit shipment",
    "create shipment",
    "send WhatsApp updates",
    "upload documents",
  ],
  Accountant: ["view financial data", "export reports", "view landed cost"],
  "Supplier Admin": ["upload documents", "manage customer", "view financial data"],
  "Supplier Finance": ["view financial data", "export reports"],
  "Supplier Operations": ["upload documents", "send WhatsApp updates"],
  "Partner Admin": ["manage customer", "view financial data", "export reports"],
  "Partner Marketer": ["manage customer", "send WhatsApp updates"],
  "Partner Finance": ["view financial data", "export reports"],
};

function Team() {
  useRequireWorkspace();
  const { openInvite } = useActions();
  const { workspace, workspaceLabel } = useActiveWorkspace();
  const activeGroup = roleGroups.find((g) => g.id === workspace) ?? roleGroups[0];
  const [q, setQ] = useState("");
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    for (const grant of Object.entries(defaults)) {
      const [role, perms] = grant;
      m[role] = {};
      for (const g of permissions) for (const p of g.items) m[role][p] = perms.includes(p);
    }
    return m;
  });

  const currentGroup = activeGroup;
  const filteredRoles = useMemo(
    () => currentGroup.roles.filter((r) => r.toLowerCase().includes(q.toLowerCase())),
    [currentGroup, q],
  );

  const toggle = (role: string, perm: string) => {
    setMatrix((m) => ({ ...m, [role]: { ...m[role], [perm]: !m[role]?.[perm] } }));
    toast.success(`${perm} ${matrix[role]?.[perm] ? "revoked" : "granted"} for ${role}`);
  };

  const applyTemplate = (role: string, tpl: "minimal" | "standard" | "full") => {
    const all = permissions.flatMap((g) => g.items);
    const next: Record<string, boolean> = {};
    if (tpl === "full") all.forEach((p) => (next[p] = true));
    else if (tpl === "minimal") all.forEach((p) => (next[p] = p.startsWith("view")));
    else (defaults[role] ?? []).concat(["view financial data"]).forEach((p) => (next[p] = true));
    setMatrix((m) => ({
      ...m,
      [role]: { ...Object.fromEntries(all.map((p) => [p, false])), ...next },
    }));
    toast.success(`${tpl} template applied to ${role}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{workspaceLabel} Team & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Invite teammates and manage role-based access for your {workspaceLabel.toLowerCase()}{" "}
            workspace.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Role template library opened")}>
            <Sparkles className="h-4 w-4 mr-1.5" /> Role Templates
          </Button>
          <Button className="bg-primary" onClick={openInvite}>
            <UserPlus className="h-4 w-4 mr-1.5" /> Invite Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions Matrix</TabsTrigger>
          <TabsTrigger value="templates">Role Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
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
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      {m.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{m.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className="border-border">
                        {m.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${m.status === "Active" ? "bg-success/15 text-success border-success/30" : "bg-warning/20 text-warning-foreground border-warning/40"}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Manage
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => toast.success(`Role updated for ${m.name}`)}
                          >
                            Change role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success(`Invite resent to ${m.email}`)}
                          >
                            Resend invite
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toast.success(`2FA reset for ${m.name}`)}
                          >
                            Reset 2FA
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => toast.success(`${m.name} removed`)}
                          >
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card className="shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-sm font-semibold">
                  {currentGroup.label} · Permissions Matrix
                </div>
                <div className="text-xs text-muted-foreground">
                  Toggle granular permissions per role. Changes apply immediately.
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 w-64"
                  placeholder="Search roles…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                    <th className="px-5 py-3 font-medium sticky left-0 bg-secondary/40 z-10 min-w-[220px]">
                      Permission
                    </th>
                    {filteredRoles.map((r) => (
                      <th key={r} className="px-3 py-3 font-medium text-center whitespace-nowrap">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((grp) => (
                    <Fragment key={grp.group}>
                      <tr className="bg-secondary/20">
                        <td
                          colSpan={filteredRoles.length + 1}
                          className="px-5 py-2 text-[11px] uppercase tracking-widest text-muted-foreground font-semibold"
                        >
                          {grp.group}
                        </td>
                      </tr>
                      {grp.items.map((p) => (
                        <tr key={p} className="border-t border-border">
                          <td className="px-5 py-2.5 font-medium sticky left-0 bg-card capitalize">
                            {p}
                          </td>
                          {filteredRoles.map((r) => (
                            <td key={r} className="px-3 py-2.5 text-center">
                              <Toggle on={!!matrix[r]?.[p]} onClick={() => toggle(r, p)} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentGroup.roles.map((r) => {
              const grants = Object.entries(matrix[r] ?? {}).filter(([, v]) => v).length;
              return (
                <Card key={r} className="p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{r}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {grants} permissions granted
                      </div>
                    </div>
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(defaults[r] ?? []).slice(0, 4).map((p) => (
                      <Badge
                        key={p}
                        variant="outline"
                        className="text-[10px] capitalize border-border"
                      >
                        {p}
                      </Badge>
                    ))}
                    {(defaults[r] ?? []).length > 4 && (
                      <Badge variant="outline" className="text-[10px] border-border">
                        +{(defaults[r] ?? []).length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-5">
                    <Button size="sm" variant="outline" onClick={() => applyTemplate(r, "minimal")}>
                      Minimal
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyTemplate(r, "standard")}
                    >
                      Standard
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary"
                      onClick={() => applyTemplate(r, "full")}
                    >
                      Full
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`h-5 w-9 rounded-full inline-flex items-center px-0.5 transition ${on ? "bg-accent justify-end" : "bg-secondary justify-start"}`}
    >
      <span className="h-4 w-4 rounded-full bg-white shadow grid place-items-center">
        {on && <Check className="h-2.5 w-2.5 text-accent" />}
      </span>
    </button>
  );
}
