import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { whatsappThreads } from "@/lib/mock";
import {
  MessageCircle, Send, Sparkles, FileText, Bell, Calendar, DollarSign,
  Inbox as InboxIcon, FilePlus2, FileCheck2, MessageSquareText, Users,
  AlertTriangle, Phone, Paperclip, CheckCircle2, Clock, Upload, Edit3,
  TrendingUp, ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp Import Desk — Canta" }] }),
  component: WhatsAppDesk,
});

// ---------- mock data ----------
type ThreadStatus = "New" | "In Progress" | "Waiting for Importer" | "Completed";
type Thread = {
  id: string; importer: string; phone: string; last: string; time: string;
  unread: number; agent: string; score: number; file?: string; status: ThreadStatus;
};

const threads: Thread[] = [
  { id: "WA-01", importer: "ABC Electronics · Tunde", phone: "+234 803 411 2280", last: "Sent BL for SHP-10421", time: "2m ago", unread: 1, agent: "Amaka O.", score: 92, file: "TF-2026-0214", status: "In Progress" },
  { id: "WA-02", importer: "Balogun Trade · Risikat", phone: "+234 815 220 7741", last: "When will my goods arrive?", time: "11m ago", unread: 2, agent: "Chiamaka E.", score: 74, file: "TF-2026-0211", status: "Waiting for Importer" },
  { id: "WA-03", importer: "Dav Excel · Bayo", phone: "+234 802 887 1190", last: "Uploaded packing list", time: "1h ago", unread: 0, agent: "Amaka O.", score: 81, file: "TF-2026-0208", status: "In Progress" },
  { id: "WA-04", importer: "Global Motors · Ngozi", phone: "+234 809 661 4422", last: "Need landed cost estimate", time: "3h ago", unread: 1, agent: "Yusuf A.", score: 88, status: "New" },
  { id: "WA-05", importer: "Mama Risi Foods", phone: "+234 706 220 1188", last: "Thanks, received the goods", time: "1d ago", unread: 0, agent: "Chiamaka E.", score: 67, file: "TF-2026-0199", status: "Completed" },
  { id: "WA-06", importer: "Onitsha Plastics · Emeka", phone: "+234 813 552 9081", last: "Sent supplier invoice", time: "5h ago", unread: 3, agent: "Yusuf A.", score: 79, status: "New" },
];

const intakeDocs = [
  { id: "DOC-7711", thread: "WA-01", kind: "Bill of Lading", file: "BL-FE-7711.pdf", extracted: { Container: "MSCU7762213", Vessel: "MSC ANTONIA", ETA: "18 Jun 2026" }, status: "Awaiting confirm" },
  { id: "DOC-7710", thread: "WA-03", kind: "Packing List", file: "PL-DAV-0921.pdf", extracted: { Cartons: 142, Weight: "2,180 kg", HS: "8517.62" }, status: "Awaiting confirm" },
  { id: "DOC-7708", thread: "WA-06", kind: "Supplier Invoice", file: "INV-YIWU-3320.pdf", extracted: { Supplier: "Yiwu PolyPack", Amount: "$18,420", Currency: "USD" }, status: "Awaiting confirm" },
  { id: "DOC-7705", thread: "WA-01", kind: "Container Photo", file: "container.jpg", extracted: { Container: "MSCU7762213" }, status: "Confirmed" },
  { id: "DOC-7702", thread: "WA-02", kind: "Payment Receipt", file: "wise-receipt.pdf", extracted: { Amount: "$9,800", Beneficiary: "Guangzhou Trading" }, status: "Confirmed" },
  { id: "DOC-7699", thread: "WA-04", kind: "Freight Invoice", file: "freight-msc.pdf", extracted: { Amount: "₦1,840,000", Route: "Shanghai → Lagos" }, status: "Awaiting confirm" },
];

const drafts = [
  { id: "TF-DR-019", importer: "Global Motors", supplier: "Dubai Auto Spares", goods: "Auto parts", invoice: "$26,400 USD", shipment: "SHP-10502", container: "—", eta: "—", docs: 2, next: "Request BL" },
  { id: "TF-DR-018", importer: "Onitsha Plastics", supplier: "Yiwu PolyPack", goods: "Plastic granules", invoice: "$18,420 USD", shipment: "SHP-10498", container: "TBA", eta: "TBA", docs: 1, next: "Request packing list" },
  { id: "TF-DR-017", importer: "ABC Electronics", supplier: "Shenzhen LedTech", goods: "LED panels", invoice: "$42,800 USD", shipment: "SHP-10421", container: "MSCU7762213", eta: "18 Jun 2026", docs: 4, next: "Confirm with importer" },
];

const alerts = [
  { id: "A-1", kind: "ETA approaching", file: "TF-2026-0214", msg: "ABC Electronics — SHP-10421 arriving in 4 days", severity: "warn" },
  { id: "A-2", kind: "Missing document", file: "TF-DR-018", msg: "Onitsha Plastics — packing list missing", severity: "warn" },
  { id: "A-3", kind: "Payment pending", file: "TF-2026-0211", msg: "Balogun Trade — supplier payment not confirmed", severity: "warn" },
  { id: "A-4", kind: "Shipment delayed", file: "TF-2026-0208", msg: "Dav Excel — vessel rerouted, ETA +3 days", severity: "danger" },
  { id: "A-5", kind: "Clearing readiness", file: "TF-2026-0214", msg: "ABC Electronics — clearing funds not confirmed", severity: "warn" },
  { id: "A-6", kind: "Trade file incomplete", file: "TF-DR-019", msg: "Global Motors — supplier invoice missing", severity: "info" },
];

const agents = [
  { name: "Amaka O.", role: "Trade Officer", convos: 18, follow: 6, files: 24, conv: 62 },
  { name: "Chiamaka E.", role: "Trade Officer", convos: 14, follow: 4, files: 19, conv: 58 },
  { name: "Yusuf A.", role: "Trade Officer", convos: 22, follow: 9, files: 17, conv: 47 },
  { name: "Ibrahim K.", role: "Trade Officer Lead", convos: 11, follow: 2, files: 31, conv: 71 },
];

const initialTemplates = [
  { id: "A", icon: Bell, label: "Shipment Added", body: "Your shipment has been added to Canta Import Desk. We will keep you updated here on WhatsApp." },
  { id: "B", icon: Calendar, label: "ETA Update", body: "Your goods are expected to arrive in Lagos on {date}. We will message you 48 hours before arrival." },
  { id: "C", icon: FileText, label: "Missing Document", body: "{document} is missing. Please upload it before arrival so clearing is not delayed." },
  { id: "D", icon: DollarSign, label: "Landed Cost", body: "Your estimated landed cost is {amount}. This includes duty, clearing and local delivery." },
  { id: "E", icon: DollarSign, label: "Payment Status", body: "Supplier payment is marked as {status}. Reply YES if you want us to send the proof of payment." },
  { id: "F", icon: Bell, label: "Arrival Readiness", body: "Your shipment is arriving soon. Please prepare clearing documents and the estimated clearing amount." },
  { id: "G", icon: ShieldCheck, label: "Supplier Verification", body: "We can help verify this supplier before you make payment. Reply VERIFY and we will start the check." },
];

// ---------- helpers ----------
const statusTone: Record<ThreadStatus, string> = {
  "New": "bg-primary/10 text-primary border-primary/30",
  "In Progress": "bg-accent/15 text-accent-foreground border-accent/30",
  "Waiting for Importer": "bg-warning/15 text-warning-foreground border-warning/30",
  "Completed": "bg-success/15 text-success border-success/30",
};

function Kpi({ icon: Icon, label, value, hint, tone = "primary" }: { icon: any; label: string; value: string; hint?: string; tone?: "primary" | "success" | "warning" | "danger" | "accent" }) {
  const toneMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/15",
    danger: "text-destructive bg-destructive/10",
    accent: "text-accent-foreground bg-accent/15",
  };
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`h-9 w-9 grid place-items-center rounded-lg ${toneMap[tone]}`}><Icon className="h-4 w-4" /></span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}

function Msg({ from, children }: { from: "us" | "them" | "ai"; children: React.ReactNode }) {
  const cls = from === "us"
    ? "ml-auto bg-success text-white"
    : from === "ai"
      ? "bg-accent/15 text-foreground border border-accent/30"
      : "bg-card border border-border";
  return <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${cls}`}>{children}</div>;
}

// ---------- page ----------
function WhatsAppDesk() {
  const [active, setActive] = useState(threads[0].id);
  const [query, setQuery] = useState("");
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingTpl, setEditingTpl] = useState<string | null>(null);

  const thread = threads.find((t) => t.id === active)!;
  const filtered = useMemo(
    () => threads.filter((t) => t.importer.toLowerCase().includes(query.toLowerCase()) || t.phone.includes(query)),
    [query]
  );

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-success/15 text-success"><MessageCircle className="h-5 w-5" /></span>
            WhatsApp Import Desk
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Human-assisted, WhatsApp-first workspace for Canta Trade Officers managing importer conversations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Broadcast queued")}><Send className="h-4 w-4 mr-1.5" /> Broadcast update</Button>
          <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => toast.success("New WhatsApp lead created")}><MessageCircle className="h-4 w-4 mr-1.5" /> New lead</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Kpi icon={MessageCircle} label="WhatsApp Leads" value="248" hint="this week" tone="success" />
        <Kpi icon={Paperclip} label="New Documents Received" value="63" hint="today" tone="primary" />
        <Kpi icon={FileCheck2} label="Trade Files Created" value="41" hint="this week" tone="accent" />
        <Kpi icon={Clock} label="Pending Replies" value="17" hint="< 1h SLA" tone="warning" />
        <Kpi icon={Send} label="Shipment Updates Sent" value="312" hint="this week" tone="success" />
        <Kpi icon={AlertTriangle} label="Missing Document Alerts" value="9" tone="danger" />
        <Kpi icon={DollarSign} label="Landed Cost Requests" value="22" tone="accent" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="inbox"><InboxIcon className="h-3.5 w-3.5 mr-1.5" /> Inbox</TabsTrigger>
          <TabsTrigger value="intake"><Paperclip className="h-3.5 w-3.5 mr-1.5" /> Document Intake</TabsTrigger>
          <TabsTrigger value="drafts"><FilePlus2 className="h-3.5 w-3.5 mr-1.5" /> Trade File Drafts</TabsTrigger>
          <TabsTrigger value="templates"><MessageSquareText className="h-3.5 w-3.5 mr-1.5" /> Message Templates</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" /> Alerts</TabsTrigger>
          <TabsTrigger value="agents"><Users className="h-3.5 w-3.5 mr-1.5" /> Assigned Agents</TabsTrigger>
        </TabsList>

        {/* ------------- INBOX ------------- */}
        <TabsContent value="inbox" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* List */}
            <Card className="lg:col-span-1 p-2 shadow-card max-h-[680px] overflow-y-auto">
              <div className="p-2">
                <Input placeholder="Search by name or phone…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9" />
              </div>
              {filtered.map((t) => (
                <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left p-3 rounded-lg ${active === t.id ? "bg-primary/5 border border-primary" : "hover:bg-secondary"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm truncate">{t.importer}</div>
                    {t.unread > 0 && <span className="h-5 min-w-5 px-1 rounded-full bg-success text-white text-[10px] grid place-items-center">{t.unread}</span>}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {t.phone}</div>
                  <div className="text-xs text-muted-foreground truncate mt-1">{t.last}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className={`text-[10px] ${statusTone[t.status]}`}>{t.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{t.time}</span>
                  </div>
                </button>
              ))}
            </Card>

            {/* Conversation */}
            <Card className="lg:col-span-2 p-0 shadow-card flex flex-col h-[680px] overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-sm">{thread.importer}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {thread.phone}
                    <span>·</span>
                    <span>Agent: <b className="text-foreground">{thread.agent}</b></span>
                    {thread.file && (<><span>·</span><span className="font-mono text-foreground">{thread.file}</span></>)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]"><TrendingUp className="h-3 w-3 mr-1" /> Lead score {thread.score}</Badge>
                  <Badge className="bg-accent/15 text-accent-foreground border-accent/30"><Sparkles className="h-3 w-3 mr-1" /> AI-assisted</Badge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
                <Msg from="them">Hi, I sent the BL for my Guangzhou shipment.</Msg>
                <Msg from="ai">📎 BL extracted — Container MSCU7762213, Vessel MSC ANTONIA. Created Trade File <span className="font-mono">TF-2026-0214</span>.</Msg>
                <Msg from="us">Confirmed. Your shipment is on vessel, ETA Lagos 18 June.</Msg>
                <Msg from="them">When should I prepare clearing money?</Msg>
                <Msg from="ai">Estimated clearing for SHP-10421 is <b>₦8.4M</b> (duty + clearing + delivery). Recommend preparing 5 days before ETA.</Msg>
                <Msg from="them">Thanks. Please also verify my new supplier in Yiwu.</Msg>
              </div>

              {/* Quick template chips */}
              <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto border-t border-border">
                {templates.slice(0, 5).map((t) => (
                  <button key={t.id} onClick={() => toast.success(`${t.label} inserted`)} className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-border hover:border-accent hover:bg-accent/10">
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-3 flex gap-2 items-center">
                <Button size="sm" variant="ghost"><Paperclip className="h-4 w-4" /></Button>
                <input placeholder="Type a WhatsApp message…" className="flex-1 bg-secondary/60 rounded-lg px-3 py-2 text-sm outline-none" />
                <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => toast.success("Sent via WhatsApp")}><Send className="h-4 w-4" /></Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ------------- DOCUMENT INTAKE ------------- */}
        <TabsContent value="intake" className="space-y-4">
          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Documents received on WhatsApp</div>
                <div className="text-xs text-muted-foreground">AI extracts fields. Confirm to attach to a trade file.</div>
              </div>
              <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-1.5" /> Upload manually</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intakeDocs.map((d) => (
                <Card key={d.id} className="p-4 border border-border shadow-none">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-9 w-9 grid place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></span>
                      <div>
                        <div className="text-sm font-semibold">{d.kind}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{d.file} · from {d.thread}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={d.status === "Confirmed" ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning-foreground border-warning/30"}>{d.status}</Badge>
                  </div>
                  <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-accent-foreground flex items-center gap-1 mb-2"><Sparkles className="h-3 w-3" /> AI extracted</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(d.extracted).map(([k, v]) => (
                        <div key={k}>
                          <div className="text-muted-foreground text-[10px]">{k}</div>
                          <div className="font-medium">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => toast.success("Confirmed & attached to trade file")}><CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm</Button>
                    <Button size="sm" variant="outline" onClick={() => toast.success("Marked for review")}>Edit fields</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ------------- TRADE FILE DRAFTS ------------- */}
        <TabsContent value="drafts" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-border">
              <div>
                <div className="text-sm font-semibold">Trade File drafts created from WhatsApp</div>
                <div className="text-xs text-muted-foreground">Auto-drafted from incoming documents. Promote to active trade file when complete.</div>
              </div>
              <Button size="sm" variant="outline"><FilePlus2 className="h-4 w-4 mr-1.5" /> New draft</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    {["Draft", "Importer", "Supplier", "Goods", "Invoice", "Shipment", "Container", "ETA", "Docs", "Next action", ""].map((h) => (
                      <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((d) => (
                    <tr key={d.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                      <td className="px-4 py-3 font-medium">{d.importer}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.supplier}</td>
                      <td className="px-4 py-3">{d.goods}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.invoice}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.shipment}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.container}</td>
                      <td className="px-4 py-3">{d.eta}</td>
                      <td className="px-4 py-3"><Badge variant="outline">{d.docs} files</Badge></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.next}</td>
                      <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => toast.success(`${d.id} promoted to trade file`)}>Promote</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ------------- TEMPLATES ------------- */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => {
              const Icon = t.icon;
              const isEditing = editingTpl === t.id;
              return (
                <Card key={t.id} className="p-4 shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-8 grid place-items-center rounded-lg bg-accent/15 text-accent-foreground"><Icon className="h-4 w-4" /></span>
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground">Template {t.id}</div>
                        <div className="text-sm font-semibold">{t.label}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setEditingTpl(isEditing ? null : t.id)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  </div>
                  {isEditing ? (
                    <Textarea
                      className="mt-3 text-xs"
                      value={t.body}
                      onChange={(e) => setTemplates((arr) => arr.map((x) => x.id === t.id ? { ...x, body: e.target.value } : x))}
                      rows={4}
                    />
                  ) : (
                    <div className="mt-3 text-xs text-muted-foreground rounded-lg bg-secondary/40 p-3 border border-border">{t.body}</div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => toast.success(`${t.label} sent to importer`)}><Send className="h-3.5 w-3.5 mr-1.5" /> Send via WhatsApp</Button>
                    {isEditing && <Button size="sm" variant="outline" onClick={() => { setEditingTpl(null); toast.success("Template saved"); }}>Save</Button>}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ------------- ALERTS ------------- */}
        <TabsContent value="alerts" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="text-sm font-semibold">Operational alerts</div>
              <div className="text-xs text-muted-foreground">Things that need an agent to act on a WhatsApp conversation now.</div>
            </div>
            <div className="divide-y divide-border">
              {alerts.map((a) => {
                const tone = a.severity === "danger" ? "text-destructive bg-destructive/10" : a.severity === "warn" ? "text-warning bg-warning/15" : "text-primary bg-primary/10";
                return (
                  <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-9 w-9 grid place-items-center rounded-lg ${tone}`}><AlertTriangle className="h-4 w-4" /></span>
                      <div>
                        <div className="text-sm font-medium">{a.kind}</div>
                        <div className="text-xs text-muted-foreground">{a.msg} · <span className="font-mono">{a.file}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.success("Reminder sent on WhatsApp")}><Send className="h-3.5 w-3.5 mr-1.5" /> Send reminder</Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Resolved")}>Resolve</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* ------------- AGENTS ------------- */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((a) => (
              <Card key={a.name} className="p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center font-semibold">
                      {a.name.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{a.name}</div>
                      <div className="text-[11px] text-muted-foreground">{a.role}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">{a.conv}% conversion</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Conversations</div>
                    <div className="text-lg font-semibold">{a.convos}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Follow-ups</div>
                    <div className="text-lg font-semibold">{a.follow}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Trade files</div>
                    <div className="text-lg font-semibold">{a.files}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] text-muted-foreground mb-1 flex items-center justify-between">
                    <span>Workload</span><span>{Math.min(100, a.convos * 4)}%</span>
                  </div>
                  <Progress value={Math.min(100, a.convos * 4)} className="h-1.5" />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// re-export to keep mock data import (unused after refactor)
void whatsappThreads;
