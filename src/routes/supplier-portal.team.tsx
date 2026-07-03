import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/supplier-portal/team")({
  head: () => ({ meta: [{ title: "Supplier Team — Supplier Portal — Canta" }] }),
  component: SupplierTeam,
});

const TEAM = [
  { name: "Li Wei",       email: "li.wei@gztechfactory.cn",   role: "Owner",       status: "Active" },
  { name: "Chen Jing",    email: "chen.jing@gztechfactory.cn", role: "Finance",     status: "Active" },
  { name: "Zhang Hao",    email: "zhang.hao@gztechfactory.cn", role: "Sales",       status: "Invited" },
  { name: "Wang Mei",     email: "wang.mei@gztechfactory.cn",  role: "Compliance",  status: "Active" },
];

function SupplierTeam() {
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold">Supplier team — Guangzhou Tech Factory</div>
            <div className="text-xs text-muted-foreground">Only your factory team members. No importer, ops, or Enterprise Treasury users are shown here.</div>
          </div>
          <ButtonGroup label="Team actions">
            <Button size="sm" onClick={() => toast.success("Invite sent")}><UserPlus className="h-4 w-4 mr-2" /> Invite member</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Team notified")}><Mail className="h-4 w-4 mr-2" /> Notify all</Button>
          </ButtonGroup>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3">Email</th>
                <th className="text-left py-2 px-3">Role</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((m) => (
                <tr key={m.email} className="border-t">
                  <td className="py-2 px-3">{m.name}</td>
                  <td className="py-2 px-3 text-xs">{m.email}</td>
                  <td className="py-2 px-3 text-xs">{m.role}</td>
                  <td className="py-2 px-3"><Badge variant={m.status === "Active" ? "default" : "secondary"}>{m.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
