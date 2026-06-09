import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fmtMoney } from "@/lib/mock";
import {
  Crown, Users, FileText, ShieldCheck, Wallet, MessageCircle, CreditCard,
  AlertTriangle, ClipboardList, TrendingUp, Search, ArrowRight, CheckCircle2,
  Clock, UserCheck, Ship, Truck, Globe, Activity,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Canta Admin — Internal Operations" }] }),
  component: AdminDashboard,
});

const kpis = [
  { l: "New importer leads",          v: "27", sub: "WhatsApp & web · 7d",            i: Users,          tone: "bg-primary/10 text-primary" },
  { l: "Active trade files",          v: "184", sub: "across 62 customers",           i: FileText,       tone: "bg-accent/15 text-accent" },
  { l: "Pending compliance reviews",  v: "12", sub: "4 high-priority",                i: ShieldCheck,    tone: "bg-warning/15 text-warning" },
  { l: "Pending settlements",         v: fmtMoney(2_840_000, "USD"), sub: "9 batches", i: Wallet,         tone: "bg-success/10 text-success" },
  { l: "WhatsApp conversations waiting", v: "31", sub: "avg wait 4m",                 i: MessageCircle,  tone: "bg-success/10 text-success" },
  { l: "Card issues",                 v: "5",  sub: "3 disputes · 2 freezes",         i: CreditCard,     tone: "bg-amber-500/15 text-amber-700" },
  { l: "High-risk transactions",      v: "3",  sub: "flagged in last 24h",            i: AlertTriangle,  tone: "bg-destructive/15 text-destructive" },
  { l: "Assigned tasks",              v: "48", sub: "across Canta team",              i: ClipboardList,  tone: "bg-primary/10 text-primary" },
  { l: "Revenue pipeline (MTD)",      v: fmtMoney(412_000, "USD"), sub: "fees + FX margin", i: TrendingUp, tone: "bg-success/10 text-success" },
];

const leads = [
  { co: "Lagos Auto Imports",     country: "Nigeria", channel: "WhatsApp", agent: "Unassigned", status: "New",        value: 180_000 },
  { co: "Accra Lighting Co",      country: "Ghana",   channel: "Web",      agent: "Tola O.",    status: "Qualifying", value: 64_000 },
  { co: "Nairobi Electronics",    country: "Kenya",   channel: "Referral", agent: "Wale B.",    status: "Demo",       value: 240_000 },
  { co: "Dakar Tex SARL",         country: "Senegal", channel: "WhatsApp", agent: "Unassigned", status: "New",        value: 92_000 },
];

const tradeFiles = [
  { ref: "TR-2031", customer: "Niger Delta Exploration", route: "Guangzhou → Lagos", officer: "Tola O.", value: 412_000, status: "In production" },
  { ref: "TR-2034", customer: "Balogun Trade Hub",       route: "Shenzhen → Apapa",  officer: "Wale B.", value: 187_500, status: "Awaiting BL" },
  { ref: "TR-2038", customer: "Accra Imports Ltd",       route: "Istanbul → Tema",   officer: "Tola O.", value: 96_400,  status: "In transit" },
  { ref: "TR-2041", customer: "ABC Electronics",         route: "Yiwu → Lagos",      officer: "Bisi A.", value: 58_700,  status: "Settlement queued" },
];

const compliance = [
  { ref: "KYB-9012", customer: "Lagos Auto Imports",  type: "KYB review",    risk: "Medium", age: "2h" },
  { ref: "KYB-9013", customer: "Dakar Tex SARL",      type: "KYB review",    risk: "Low",    age: "5h" },
  { ref: "TX-7740",  customer: "Trade Fair Imports",  type: "Sanctions hit", risk: "High",   age: "20m" },
  { ref: "TX-7741",  customer: "Nairobi Tech Hub",    type: "Velocity flag", risk: "Medium", age: "1d" },
];

const settlementsQueue = [
  { id: "SET-9901", supplier: "Guangzhou Electronics", currency: "RMB", amount: 482_300, due: "2026-06-14", status: "Scheduled" },
  { id: "SET-9902", supplier: "Dubai Auto Parts",      currency: "AED", amount: 153_900, due: "2026-06-12", status: "Processing" },
  { id: "SET-9904", supplier: "Shenzhen Mobile",       currency: "RMB", amount: 1_317_400, due: "2026-06-22", status: "Awaiting approval" },
];

const whatsAppQueue = [
  { from: "+234 803 ••• 4421", co: "Lagos Auto Imports", topic: "Quote for 40ft container",       wait: "4m",  pri: "High" },
  { from: "+233 24 •••• 901",  co: "Accra Lighting Co",  topic: "Need BL update",                 wait: "12m", pri: "Medium" },
  { from: "+254 71 ••• 7732",  co: "Nairobi Tech Hub",   topic: "Card declined — Shopify ads",    wait: "1h",  pri: "Medium" },
];

const cardIssues = [
  { id: "CRD-002", holder: "Tunde Bakare",   issue: "Disputed charge $1,650",  status: "Investigating" },
  { id: "CRD-014", holder: "James Okafor",   issue: "Multiple declines",       status: "Auto-frozen" },
  { id: "CRD-027", holder: "Ngozi Okeke",    issue: "Receipt missing >7 days", status: "Reminder sent" },
];

const myTasks = [
  { l: "Review KYB-9012 for Lagos Auto Imports",        owner: "Compliance", due: "Today" },
  { l: "Approve settlement batch SET-9904",             owner: "Treasury",   due: "Today" },
  { l: "Respond to WhatsApp — Nairobi Tech Hub",        owner: "Support",    due: "Today" },
  { l: "Onboard Niger Delta Exploration sub-users",     owner: "Sales",      due: "Tomorrow" },
];

function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Crown className="h-3.5 w-3.5" /> Canta Internal · Admin Operations
          </div>
          <h1 className="text-2xl font-semibold mt-1">Canta Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Operational view for Canta staff — customers, trade files, compliance, settlements,
            WhatsApp onboarding, cards and support tickets in one place.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search customers, files, transactions…" className="pl-8 w-72" />
          </div>
          <Link to="/organization"><Button variant="outline">Roles & Permissions <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Button></Link>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className={`h-8 w-8 rounded-lg grid place-items-center ${k.tone}`}><k.i className="h-4 w-4" /></div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">live</span>
            </div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-3">{k.l}</div>
            <div className="text-2xl font-semibold tabular-nums mt-0.5">{k.v}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Quick links into operational surfaces */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          { to: "/ai-growth",   l: "AI Growth",    i: Activity },
          { to: "/whatsapp",    l: "WhatsApp Desk",i: MessageCircle },
          { to: "/trade-desk",  l: "Trade Desk",   i: FileText },
          { to: "/shipments",   l: "Shipments",    i: Ship },
          { to: "/freight",     l: "Freight",      i: Truck },
          { to: "/suppliers",   l: "Suppliers",    i: UserCheck },
          { to: "/collections", l: "Collections",  i: Globe },
          { to: "/cards",       l: "Cards",        i: CreditCard },
        ].map((q) => (
          <Link key={q.to} to={q.to as never} className="p-3 rounded-xl border border-border bg-card hover:border-accent hover:shadow-card transition flex items-center gap-2">
            <q.i className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium">{q.l}</span>
          </Link>
        ))}
      </div>

      <Tabs defaultValue="leads">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="leads">Importer Leads</TabsTrigger>
          <TabsTrigger value="files">Active Trade Files</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Queue</TabsTrigger>
          <TabsTrigger value="settlements">Settlements Queue</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Queue</TabsTrigger>
          <TabsTrigger value="cards">Card Issues</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="mt-4">
          <TableCard title="New importer leads" cols={["Company", "Country", "Channel", "Assigned to", "Status", "Est. value", ""]}>
            {leads.map((l) => (
              <tr key={l.co} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{l.co}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.country}</td>
                <td className="px-4 py-3">{l.channel}</td>
                <td className="px-4 py-3">{l.agent === "Unassigned" ? <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30">Unassigned</Badge> : l.agent}</td>
                <td className="px-4 py-3"><Badge variant="outline">{l.status}</Badge></td>
                <td className="px-4 py-3 tabular-nums">{fmtMoney(l.value, "USD")}</td>
                <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => toast.success(`${l.co} assigned`)}>Assign</Button></td>
              </tr>
            ))}
          </TableCard>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <TableCard title="Active trade files" cols={["Ref", "Customer", "Route", "Officer", "Value", "Status", ""]}>
            {tradeFiles.map((f) => (
              <tr key={f.ref} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{f.ref}</td>
                <td className="px-4 py-3 font-medium">{f.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.route}</td>
                <td className="px-4 py-3">{f.officer}</td>
                <td className="px-4 py-3 tabular-nums">{fmtMoney(f.value, "USD")}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{f.status}</Badge></td>
                <td className="px-4 py-3 text-right"><Link to="/trade-desk"><Button size="sm" variant="ghost">Open</Button></Link></td>
              </tr>
            ))}
          </TableCard>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <TableCard title="Compliance queue" cols={["Ref", "Customer", "Type", "Risk", "Age", ""]}>
            {compliance.map((c) => {
              const tone = c.risk === "High" ? "bg-destructive/15 text-destructive border-destructive/30"
                : c.risk === "Medium" ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                : "bg-success/15 text-success border-success/30";
              return (
                <tr key={c.ref} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{c.ref}</td>
                  <td className="px-4 py-3 font-medium">{c.customer}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3"><Badge variant="outline" className={tone}>{c.risk}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground"><Clock className="h-3 w-3 inline mr-1" />{c.age}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${c.ref} approved`)}>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => toast.error(`${c.ref} flagged`)}>Flag</Button>
                  </td>
                </tr>
              );
            })}
          </TableCard>
        </TabsContent>

        <TabsContent value="settlements" className="mt-4">
          <TableCard title="Settlements queue" cols={["Batch", "Supplier", "Currency", "Amount", "Due", "Status", ""]}>
            {settlementsQueue.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{s.id}</td>
                <td className="px-4 py-3 font-medium">{s.supplier}</td>
                <td className="px-4 py-3">{s.currency}</td>
                <td className="px-4 py-3 tabular-nums">{fmtMoney(s.amount, s.currency)}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.due}</td>
                <td className="px-4 py-3"><Badge variant="outline">{s.status}</Badge></td>
                <td className="px-4 py-3 text-right"><Button size="sm" onClick={() => toast.success(`${s.id} processed`)}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Process payout</Button></td>
              </tr>
            ))}
          </TableCard>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4">
          <TableCard title="WhatsApp queue" cols={["From", "Customer", "Topic", "Waiting", "Priority", ""]}>
            {whatsAppQueue.map((w) => (
              <tr key={w.from} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{w.from}</td>
                <td className="px-4 py-3 font-medium">{w.co}</td>
                <td className="px-4 py-3 text-muted-foreground">{w.topic}</td>
                <td className="px-4 py-3">{w.wait}</td>
                <td className="px-4 py-3"><Badge variant="outline" className={w.pri === "High" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-amber-500/15 text-amber-700 border-amber-500/30"}>{w.pri}</Badge></td>
                <td className="px-4 py-3 text-right"><Link to="/whatsapp"><Button size="sm" variant="outline">Open chat</Button></Link></td>
              </tr>
            ))}
          </TableCard>
        </TabsContent>

        <TabsContent value="cards" className="mt-4">
          <TableCard title="Card issues" cols={["Card", "Holder", "Issue", "Status", ""]}>
            {cardIssues.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.holder}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.issue}</td>
                <td className="px-4 py-3"><Badge variant="outline">{c.status}</Badge></td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${c.id} frozen`)}>Freeze</Button>
                  <Link to="/cards"><Button size="sm" variant="ghost">Open</Button></Link>
                </td>
              </tr>
            ))}
          </TableCard>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card className="p-5 shadow-card divide-y divide-border">
            {myTasks.map((t) => (
              <div key={t.l} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium">{t.l}</div>
                  <div className="text-xs text-muted-foreground">{t.owner} · due {t.due}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success("Task completed")}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Mark done</Button>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TableCard({ title, cols, children }: { title: string; cols: string[]; children: React.ReactNode }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border text-sm font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-xs text-muted-foreground">
            <tr>{cols.map((c) => <th key={c} className="px-4 py-2 text-left">{c}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </Card>
  );
}
