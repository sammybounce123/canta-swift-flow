import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plug, Search, RefreshCcw, Settings2, Activity, AlertTriangle, CheckCircle2, Clock, XCircle, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { PROVIDERS, CATEGORY_ORDER, type Provider, type ConnStatus, type IntegrationCategory } from "@/lib/integrations-catalog";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations — Canta" }] }),
  component: IntegrationsPage,
});

const STATUS_ICON: Record<ConnStatus, any> = { "Connected": CheckCircle2, "Not Connected": XCircle, "Pending": Clock, "Error": AlertTriangle };
const STATUS_TONE: Record<ConnStatus, string> = {
  "Connected": "bg-success/15 text-success border-success/30",
  "Not Connected": "bg-secondary text-muted-foreground border-border",
  "Pending": "bg-warning/15 text-warning border-warning/30",
  "Error": "bg-destructive/15 text-destructive border-destructive/30",
};

function IntegrationsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<IntegrationCategory | "All">("All");
  const [config, setConfig] = useState<Provider | null>(null);
  const [logsOf, setLogsOf] = useState<Provider | null>(null);

  const filtered = useMemo(() => PROVIDERS.filter((p) =>
    (cat === "All" || p.category === cat) &&
    (!q || `${p.name} ${p.category} ${p.modules.join(" ")}`.toLowerCase().includes(q.toLowerCase()))
  ), [q, cat]);

  const stats = useMemo(() => ({
    total: PROVIDERS.length,
    connected: PROVIDERS.filter((p) => p.status === "Connected").length,
    errors: PROVIDERS.filter((p) => p.status === "Error").length,
    failed: PROVIDERS.reduce((s, p) => s + p.failedWebhooks, 0),
  }), []);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Plug className="h-5 w-5 text-primary" /> Integrations</h1>
          <p className="text-sm text-muted-foreground mt-1">External providers powering Canta — payments, FX, tracking, KYC, AI, messaging, CRM and more.</p>
        </div>
        <Button onClick={() => toast.success("Integration request submitted")}>Request integration</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Providers" value={stats.total} />
        <Stat label="Connected" value={stats.connected} tone="text-success" />
        <Stat label="In error" value={stats.errors} tone="text-destructive" />
        <Stat label="Failed webhooks 24h" value={stats.failed} tone="text-warning" />
      </div>

      <Card className="p-3 shadow-card flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Search providers…" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button onClick={() => setCat("All")} className={chip(cat === "All")}>All</button>
        {CATEGORY_ORDER.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={chip(cat === c)}>{c}</button>
        ))}
      </Card>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid"><Plug className="h-3.5 w-3.5 mr-1.5" /> Providers</TabsTrigger>
          <TabsTrigger value="webhooks"><Activity className="h-3.5 w-3.5 mr-1.5" /> Webhook log</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {CATEGORY_ORDER.filter((c) => cat === "All" || c === cat).map((c) => {
            const list = filtered.filter((p) => p.category === c);
            if (!list.length) return null;
            return (
              <div key={c} className="space-y-2">
                <div className="text-sm font-semibold mt-2">{c} <span className="text-[11px] text-muted-foreground ml-1">{list.length} providers</span></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((p) => <ProviderCard key={p.id} p={p} onConfig={() => setConfig(p)} onLogs={() => setLogsOf(p)} />)}
                </div>
              </div>
            );
          })}
        </TabsContent>
        <TabsContent value="webhooks">
          <Card className="p-4 shadow-card">
            <div className="text-sm font-semibold mb-3">Recent webhook events</div>
            <div className="space-y-1.5 text-xs font-mono">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex justify-between border-b py-1.5">
                  <span>2026-06-15 {String(11 - Math.floor(i / 2)).padStart(2, "0")}:{String((i * 7) % 60).padStart(2, "0")}</span>
                  <span>{["payment.received", "shipment.updated", "settlement.approved", "kyc.completed"][i % 4]}</span>
                  <span className={i % 6 === 0 ? "text-destructive" : "text-success"}>{i % 6 === 0 ? "500" : "200"}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!config} onOpenChange={(o) => !o && setConfig(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{config?.name} — Configure</DialogTitle></DialogHeader>
          {config && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{config.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span><Badge variant="outline" className="text-[10px]">{config.env}</Badge></span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Enabled</span><Switch defaultChecked={config.status === "Connected"} onCheckedChange={(v) => toast.success(v ? "Enabled" : "Disabled")} /></div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => toast.success("Connection retried")}><RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Retry</Button>
                <Button variant="outline" size="sm" onClick={() => { setLogsOf(config); setConfig(null); }}><ScrollText className="h-3.5 w-3.5 mr-1.5" /> View logs</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!logsOf} onOpenChange={(o) => !o && setLogsOf(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{logsOf?.name} — Logs</DialogTitle></DialogHeader>
          <div className="space-y-1.5 text-xs font-mono max-h-[420px] overflow-y-auto">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex justify-between border-b py-1">
                <span>2026-06-15 {String(11 - Math.floor(i / 3)).padStart(2, "0")}:{String((i * 13) % 60).padStart(2, "0")}</span>
                <span>{i % 5 === 0 ? "webhook.failed" : "webhook.delivered"}</span>
                <span className={i % 5 === 0 ? "text-destructive" : "text-success"}>{i % 5 === 0 ? "500" : "200"}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProviderCard({ p, onConfig, onLogs }: { p: Provider; onConfig: () => void; onLogs: () => void }) {
  const Icon = STATUS_ICON[p.status];
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{p.name}</div>
          <div className="text-[11px] text-muted-foreground">{p.category}</div>
        </div>
        <Badge variant="outline" className={`text-[10px] gap-1 ${STATUS_TONE[p.status]}`}><Icon className="h-3 w-3" /> {p.status}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <Meta k="Env" v={p.env} />
        <Meta k="Last sync" v={p.lastSync ?? "—"} />
        <Meta k="Last webhook" v={p.lastWebhook ?? "—"} />
        <Meta k="Failed webhooks" v={String(p.failedWebhooks)} />
        <Meta k="Modules" v={p.modules.join(", ")} />
        <Meta k="Fallback" v={p.fallback ?? "—"} />
      </div>
      {p.errorReason && <div className="mt-2 text-[11px] text-destructive">⚠ {p.errorReason}</div>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={onConfig}><Settings2 className="h-3.5 w-3.5 mr-1.5" /> Configure</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Connection retried")}><RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Retry</Button>
        <Button size="sm" variant="ghost" onClick={onLogs}><ScrollText className="h-3.5 w-3.5 mr-1.5" /> Logs</Button>
        <Switch className="ml-auto" defaultChecked={p.status === "Connected"} onCheckedChange={(v) => toast.success(v ? "Enabled" : "Disabled")} />
      </div>
    </Card>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div><div className="truncate">{v}</div></div>;
}
function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return <Card className="p-4 shadow-card"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div><div className={`text-xl font-semibold tabular-nums mt-1 ${tone ?? ""}`}>{value}</div></Card>;
}
function chip(active: boolean) { return `text-xs px-2.5 py-1.5 rounded-full border ${active ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`; }
