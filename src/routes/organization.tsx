import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, MapPin, Layers, Users2, Shield, KeySquare, Coins, Workflow,
  UserPlus, Plus, MoreHorizontal, ArrowRight, CheckCircle2, Trash2, Pause, Play,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/organization")({
  head: () => ({ meta: [{ title: "Organization Settings — Canta" }] }),
  component: OrganizationPage,
});

// ---------- Seed data ----------
const seedBranches = [
  { id: "B1", name: "Lagos HQ",      country: "Nigeria",  staff: 32, manager: "Adaeze Okonkwo" },
  { id: "B2", name: "Abuja Office",  country: "Nigeria",  staff: 12, manager: "Tunde Bakare" },
  { id: "B3", name: "Port Harcourt", country: "Nigeria",  staff: 8,  manager: "Femi Adeyemi" },
  { id: "B4", name: "Dubai Desk",    country: "UAE",      staff: 4,  manager: "Aisha Bello" },
];

const seedDepts = [
  { id: "D1", name: "Procurement",   branch: "Lagos HQ",      head: "Procurement Officer", users: 9 },
  { id: "D2", name: "Logistics",     branch: "Lagos HQ",      head: "Logistics Manager",   users: 7 },
  { id: "D3", name: "Finance",       branch: "Lagos HQ",      head: "Finance Officer",     users: 6 },
  { id: "D4", name: "Treasury",      branch: "Lagos HQ",      head: "Treasury Manager",    users: 4 },
  { id: "D5", name: "Compliance",    branch: "Abuja Office",  head: "Compliance Admin",    users: 3 },
  { id: "D6", name: "Sales",         branch: "Port Harcourt", head: "Sales Manager",       users: 5 },
];

const seedTeams = [
  { id: "T1", name: "Asia Sourcing",      dept: "Procurement", lead: "Tunde B.", members: 4 },
  { id: "T2", name: "Container Ops",      dept: "Logistics",   lead: "Femi A.",  members: 5 },
  { id: "T3", name: "Supplier Payments",  dept: "Finance",     lead: "Chiamaka E.", members: 3 },
  { id: "T4", name: "FX Desk",            dept: "Treasury",    lead: "Adaeze O.", members: 3 },
];

const seedUsers = [
  { id: "U1", name: "Adaeze Okonkwo", email: "adaeze@nigerdelta.ng",   role: "Owner",              branch: "Lagos HQ",      dept: "Treasury",     status: "Active"  as const, lastSeen: "2 min ago" },
  { id: "U2", name: "Tunde Bakare",   email: "tunde@nigerdelta.ng",    role: "Treasury Manager",   branch: "Lagos HQ",      dept: "Treasury",     status: "Active"  as const, lastSeen: "1 hour ago" },
  { id: "U3", name: "Femi Adeyemi",   email: "femi@nigerdelta.ng",     role: "Logistics Manager",  branch: "Lagos HQ",      dept: "Logistics",    status: "Active"  as const, lastSeen: "Today" },
  { id: "U4", name: "Chiamaka Eze",   email: "chiamaka@nigerdelta.ng", role: "Compliance Admin",   branch: "Abuja Office",  dept: "Compliance",   status: "Active"  as const, lastSeen: "Yesterday" },
  { id: "U5", name: "Ibrahim Lawal",  email: "ibrahim@nigerdelta.ng",  role: "Auditor",            branch: "Lagos HQ",      dept: "Finance",      status: "Active"  as const, lastSeen: "3 days ago" },
  { id: "U6", name: "Aisha Bello",    email: "aisha@nigerdelta.ng",    role: "Procurement Officer",branch: "Dubai Desk",    dept: "Procurement",  status: "Active"  as const, lastSeen: "1 day ago" },
  { id: "U7", name: "James Okafor",   email: "james@nigerdelta.ng",    role: "Cardholder",         branch: "Lagos HQ",      dept: "Sales",        status: "Pending" as const, lastSeen: "Never (invited)" },
  { id: "U8", name: "Ngozi Okeke",    email: "ngozi@nigerdelta.ng",    role: "Accountant",         branch: "Port Harcourt", dept: "Finance",      status: "Deactivated" as const, lastSeen: "30 days ago" },
];

const costCenters = [
  { id: "CC-100", name: "Asia Sourcing Q2",       owner: "Procurement", budget: 250_000, used: 162_000 },
  { id: "CC-200", name: "Dubai Travel",           owner: "Sales",       budget: 40_000,  used: 18_400 },
  { id: "CC-300", name: "Ad Spend — Brand Q2",    owner: "Marketing",   budget: 80_000,  used: 51_200 },
  { id: "CC-400", name: "Port Operations",        owner: "Logistics",   budget: 120_000, used: 96_800 },
];

// ---------- Role catalogue ----------
const ROLE_GROUPS = [
  {
    label: "Organization",
    roles: ["Owner", "Admin", "Finance Admin", "Compliance Admin", "Operations Admin", "Viewer"],
  },
  {
    label: "Enterprise",
    roles: ["Treasury Manager", "Finance Officer", "Approver", "Accountant", "Auditor"],
  },
  {
    label: "Importer",
    roles: ["Importer Owner", "Procurement Officer", "Logistics Manager", "Finance Officer", "Sales Manager"],
  },
  {
    label: "Freight",
    roles: ["Freight Admin", "Operations Staff", "Warehouse Staff", "Clearing Agent", "Customer Support"],
  },
  {
    label: "Cards",
    roles: ["Card Admin", "Cardholder", "Card Approver", "Spend Auditor"],
  },
];

const PERMISSIONS = [
  {
    group: "Universal",
    items: [
      "view dashboard", "manage users", "manage roles", "manage departments",
      "view wallets", "create payments", "approve payments",
      "create cards", "approve card requests",
      "view compliance pack", "export reports", "manage API keys", "view audit trail",
    ],
  },
  {
    group: "Cards & Spend",
    items: [
      "create card", "fund card", "freeze card",
      "view card details", "view masked card details only",
      "set card limits", "approve card requests", "assign cards to staff",
    ],
  },
  {
    group: "Trade & Shipments",
    items: [
      "create trade files", "edit trade files", "approve supplier payments",
      "view landed cost", "upload documents", "send WhatsApp updates",
    ],
  },
  {
    group: "Money & Treasury",
    items: [
      "view wallets", "approve FX conversions", "manage beneficiaries",
      "create payment links", "approve collections settlement",
    ],
  },
  {
    group: "Reporting & Compliance",
    items: ["export reports", "view compliance pack"],
  },
];

// Suggested role-permission templates (read-only preview)
const ROLE_TEMPLATES: Record<string, string[]> = {
  Owner: PERMISSIONS.flatMap((g) => g.items),
  Admin: PERMISSIONS.flatMap((g) => g.items).filter((p) => p !== "manage API keys"),
  "Finance Admin": ["view dashboard", "view wallets", "create payments", "approve payments", "approve supplier payments", "approve FX conversions", "manage beneficiaries", "approve collections settlement", "export reports", "view audit trail"],
  "Compliance Admin": ["view dashboard", "view compliance pack", "approve payments", "approve supplier payments", "export reports", "view audit trail", "view card details"],
  "Operations Admin": ["view dashboard", "manage departments", "create trade files", "edit trade files", "upload documents", "send WhatsApp updates", "view landed cost", "create cards"],
  Viewer: ["view dashboard", "view wallets", "view landed cost", "view compliance pack"],
  "Card Admin": ["view dashboard", "create cards", "create card", "fund card", "freeze card", "set card limits", "assign cards to staff", "view card details", "approve card requests"],
  Cardholder: ["view dashboard", "view masked card details only"],
  "Card Approver": ["view dashboard", "approve card requests", "view card details"],
  "Spend Auditor": ["view dashboard", "view card details", "export reports", "view audit trail"],
};

// ---------- Page ----------
function OrganizationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3.5 w-3.5" /> Organization Hierarchy
          </div>
          <h1 className="text-2xl font-semibold mt-1">Organization Settings</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Company → Branches → Departments → Teams → Users → Roles & Permissions.
            Cards, wallets, trade files and collections all attach to this hierarchy.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/team"><Button variant="outline">Team & Roles <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Button></Link>
          <Link to="/approvals"><Button variant="outline">Approvals</Button></Link>
        </div>
      </div>

      {/* Hierarchy summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={Building2} label="Organization" value="1" sub="Niger Delta Exploration Ltd" />
        <Stat icon={MapPin}    label="Branches"     value={String(seedBranches.length)} sub={`${seedBranches.reduce((s,b)=>s+b.staff,0)} staff`} />
        <Stat icon={Layers}    label="Departments"  value={String(seedDepts.length)} sub="across 4 branches" />
        <Stat icon={Users2}    label="Teams"        value={String(seedTeams.length)} sub="active squads" />
        <Stat icon={Shield}    label="Users"        value={String(seedUsers.length)} sub={`${seedUsers.filter(u=>u.status==="Active").length} active`} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile">Organization Profile</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="cost">Cost Centers</TabsTrigger>
          <TabsTrigger value="workflows">Approval Workflows</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="mt-4">
          <Card className="p-6 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Legal name" value="Niger Delta Exploration Ltd" />
              <Field label="Trading name" value="ND Exploration" />
              <Field label="Registration No." value="RC 1284502" />
              <Field label="Country of incorporation" value="Nigeria" />
              <Field label="Industry" value="Oil & Gas — Upstream" />
              <Field label="Tax ID (TIN)" value="01927384-0001" />
              <Field label="Primary contact" value="adaeze@nigerdelta.ng" />
              <Field label="Workspace tier" value="Enterprise" />
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => toast.success("Profile saved")}>Save changes</Button>
              <Button variant="ghost" onClick={() => toast.success("Logo upload opened")}>Upload logo</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Branches */}
        <TabsContent value="branches" className="mt-4">
          <SimpleSection
            title="Branches"
            description="Cards, cost centers and approvals can be scoped to a branch."
            addLabel="Add branch"
            onAdd={() => toast.success("Branch creation flow opened")}
            columns={["Branch", "Country", "Manager", "Staff"]}
            rows={seedBranches.map((b) => [b.name, b.country, b.manager, String(b.staff)])}
          />
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="mt-4">
          <SimpleSection
            title="Departments"
            description="Departments roll up to branches and own their own approval rules."
            addLabel="Add department"
            onAdd={() => toast.success("Department creation flow opened")}
            columns={["Department", "Branch", "Head", "Users"]}
            rows={seedDepts.map((d) => [d.name, d.branch, d.head, String(d.users)])}
          />
        </TabsContent>

        {/* Teams */}
        <TabsContent value="teams" className="mt-4">
          <SimpleSection
            title="Teams"
            description="Cross-functional squads — useful for shipment crews, sourcing pods, and FX desks."
            addLabel="Add team"
            onAdd={() => toast.success("Team creation flow opened")}
            columns={["Team", "Department", "Lead", "Members"]}
            rows={seedTeams.map((t) => [t.name, t.dept, t.lead, String(t.members)])}
          />
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-4">
          <UsersPanel />
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {ROLE_GROUPS.map((g) => (
              <Card key={g.label} className="p-5 shadow-card">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{g.label}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.roles.map((r) => (
                    <Badge key={r} variant="outline" className="text-[11px]">{r}</Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.success(`${g.label} template duplicated`)}>
                  <KeySquare className="h-3.5 w-3.5 mr-1.5" /> Use as template
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissions */}
        <TabsContent value="permissions" className="mt-4">
          <PermissionsMatrix />
        </TabsContent>

        {/* Cost centers */}
        <TabsContent value="cost" className="mt-4">
          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">Cost centers</div>
              </div>
              <Button size="sm" onClick={() => toast.success("Cost center created")}><Plus className="h-3.5 w-3.5 mr-1.5" /> New cost center</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2 text-right">Budget</th>
                    <th className="px-3 py-2 text-right">Used</th>
                    <th className="px-3 py-2">Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {costCenters.map((c) => {
                    const pct = Math.round((c.used / c.budget) * 100);
                    return (
                      <tr key={c.id} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-xs">{c.id}</td>
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{c.owner}</td>
                        <td className="px-3 py-2 text-right tabular-nums">${c.budget.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right tabular-nums">${c.used.toLocaleString()}</td>
                        <td className="px-3 py-2 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className={`h-full ${pct > 85 ? "bg-destructive" : pct > 60 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs tabular-nums w-9 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Workflows */}
        <TabsContent value="workflows" className="mt-4">
          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">Approval workflows</div>
              </div>
              <Link to="/approvals"><Button size="sm" variant="outline">Open approvals queue</Button></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Card creation",         threshold: "Always",         chain: "Manager → Finance Admin" },
                { name: "Card spend above $2k",  threshold: "USD 2,000",      chain: "Cardholder → Approver" },
                { name: "Supplier payment",      threshold: "USD 50,000",     chain: "Finance → Treasury → Compliance" },
                { name: "FX conversion",         threshold: "USD 250,000",    chain: "Treasury → Owner" },
                { name: "Trade file creation",   threshold: "Always",         chain: "Procurement → Logistics" },
                { name: "Collections settlement",threshold: "USD 100,000",    chain: "Reconciliation → Finance" },
              ].map((w) => (
                <div key={w.name} className="p-3 rounded-lg border border-border bg-secondary/30 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{w.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Trigger: <span className="text-foreground">{w.threshold}</span></div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{w.chain}</div>
                  </div>
                  <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px]">Active</Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Sub components ----------
function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-semibold mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}

function SimpleSection({
  title, description, addLabel, onAdd, columns, rows,
}: {
  title: string; description: string; addLabel: string; onAdd: () => void;
  columns: string[]; rows: string[][];
}) {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1.5" /> {addLabel}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              {columns.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                {r.map((cell, j) => (
                  <td key={j} className={`px-3 py-2 ${j === 0 ? "font-medium" : "text-muted-foreground"}`}>{cell}</td>
                ))}
                <td className="px-3 py-2"><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState(seedUsers);

  const toggleStatus = (id: string) => {
    setUsers((u) =>
      u.map((x) =>
        x.id === id
          ? { ...x, status: x.status === "Active" ? "Deactivated" : "Active" }
          : x,
      ),
    );
    toast.success("User status updated");
  };

  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <div className="text-sm font-semibold">Users & Sub-users</div>
          <div className="text-xs text-muted-foreground">
            Invite sub-users, assign them to branches/departments, and control what they can do.
          </div>
        </div>
        <InviteUserDialog />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Branch</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Last active</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center text-[10px] font-semibold">
                      {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div className="leading-tight">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{u.role}</Badge></td>
                <td className="px-3 py-2 text-muted-foreground">{u.branch}</td>
                <td className="px-3 py-2 text-muted-foreground">{u.dept}</td>
                <td className="px-3 py-2 text-muted-foreground text-[11px]">{u.lastSeen}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      u.status === "Active" ? "bg-success/15 text-success border-success/30"
                      : u.status === "Pending" ? "bg-warning/15 text-warning border-warning/30"
                      : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {u.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={() => toast.success("Activity log opened")}>Activity</Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggleStatus(u.id)}>
                      {u.status === "Active" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.success("User removed")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-primary"><UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite sub-user</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite sub-user</DialogTitle>
          <DialogDescription>They'll get a magic-link email and a WhatsApp prompt.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Full name</Label><Input placeholder="e.g. James Okafor" /></div>
          <div className="col-span-2"><Label>Work email</Label><Input type="email" placeholder="james@company.com" /></div>
          <div>
            <Label>Branch</Label>
            <Select defaultValue="Lagos HQ">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {seedBranches.map((b) => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Department</Label>
            <Select defaultValue="Procurement">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {seedDepts.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Role</Label>
            <Select defaultValue="Cardholder">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLE_GROUPS.flatMap((g) => g.roles).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 p-3 rounded-lg bg-secondary/40 border border-border text-xs">
            <div className="flex items-center gap-1.5 font-medium mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Approval required for spend over $500 by default.
            </div>
            <div className="text-muted-foreground">You can fine-tune permissions after the user accepts.</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { toast.success("Invite sent"); setOpen(false); }}>Send invite</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionsMatrix() {
  const roles = ["Owner", "Admin", "Finance Admin", "Compliance Admin", "Operations Admin", "Card Admin", "Cardholder", "Viewer"];
  return (
    <Card className="p-5 shadow-card overflow-x-auto">
      <div className="text-sm font-semibold mb-1">Permissions matrix</div>
      <div className="text-xs text-muted-foreground mb-4">Toggle defaults per role. Templates are a starting point — admins can override at the user level.</div>
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="text-left text-muted-foreground bg-secondary/40">
            <th className="px-3 py-2 sticky left-0 bg-secondary/40 z-10">Permission</th>
            {roles.map((r) => <th key={r} className="px-2 py-2 text-center whitespace-nowrap">{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((g) => (
            <>
              <tr key={g.group} className="bg-secondary/20">
                <td colSpan={roles.length + 1} className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">{g.group}</td>
              </tr>
              {g.items.map((p) => (
                <tr key={p} className="border-t border-border">
                  <td className="px-3 py-2 font-medium sticky left-0 bg-background">{p}</td>
                  {roles.map((r) => {
                    const has = ROLE_TEMPLATES[r]?.includes(p);
                    return (
                      <td key={r} className="px-2 py-2 text-center">
                        <span
                          role="button"
                          onClick={() => toast.success(`${r} · ${p}: toggled`)}
                          className={`inline-flex h-4 w-7 rounded-full px-0.5 items-center transition cursor-pointer ${has ? "bg-accent justify-end" : "bg-secondary justify-start"}`}
                        >
                          <span className="h-3 w-3 rounded-full bg-white shadow" />
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
