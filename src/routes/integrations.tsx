import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Plug, Key, Webhook, Search, Ship, CreditCard, Banknote, MessageCircle,
  ShieldCheck, Database, Calculator, Code2, Copy, RefreshCcw, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Clock, XCircle, BookOpen, Activity, Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/integrations")({
  head: () => ({ meta: [{ title: "Integrations Marketplace — Canta" }] }),
  component: Integrations,
});

// ---------- types ----------
type ConnStatus = "Connected" | "Not Connected" | "Pending" | "Error";
type CategoryKey =
  | "Shipment Tracking" | "Payments" | "FX & Settlement" | "Messaging"
  | "Compliance" | "Cards" | "Storage" | "Accounting/ERP" | "Developer Tools";

type Integration = {
  id: string; name: string; category: CategoryKey; desc: string;
  status: ConnStatus; logo: string;
};

// ---------- data ----------
const CATEGORIES: { key: CategoryKey; icon: any; tone: string }[] = [
  { key: "Shipment Tracking", icon: Ship, tone: "text-primary bg-primary/10" },
  { key: "Payments", icon: CreditCard, tone: "text-success bg-success/10" },
  { key: "FX & Settlement", icon: Banknote, tone: "text-accent-foreground bg-accent/15" },
  { key: "Messaging", icon: MessageCircle, tone: "text-success bg-success/10" },
  { key: "Compliance", icon: ShieldCheck, tone: "text-primary bg-primary/10" },
  { key: "Cards", icon: CreditCard, tone: "text-accent-foreground bg-accent/15" },
  { key: "Storage", icon: Database, tone: "text-primary bg-primary/10" },
  { key: "Accounting/ERP", icon: Calculator, tone: "text-warning bg-warning/15" },
  { key: "Developer Tools", icon: Code2, tone: "text-foreground bg-secondary" },
];

const integrations: Integration[] = [
  // Shipment Tracking
  { id: "vizion", name: "Vizion", category: "Shipment Tracking", desc: "Container tracking across 100+ carriers via single API.", status: "Connected", logo: "VZ" },
  { id: "shipsgo", name: "Shipsgo", category: "Shipment Tracking", desc: "Real-time container, vessel and BL tracking.", status: "Connected", logo: "SG" },
  { id: "searates", name: "SeaRates", category: "Shipment Tracking", desc: "Tracking + freight rates and route planning.", status: "Not Connected", logo: "SR" },
  { id: "gocomet", name: "GoComet", category: "Shipment Tracking", desc: "Predictive ETA and freight rate intelligence.", status: "Pending", logo: "GC" },
  { id: "maersk", name: "Maersk", category: "Shipment Tracking", desc: "Direct carrier API for Maersk shipments.", status: "Connected", logo: "MA" },
  { id: "cmacgm", name: "CMA CGM", category: "Shipment Tracking", desc: "Direct carrier API for CMA CGM line.", status: "Not Connected", logo: "CC" },
  { id: "msc", name: "MSC", category: "Shipment Tracking", desc: "Mediterranean Shipping Co. direct integration.", status: "Connected", logo: "MS" },
  { id: "hapag", name: "Hapag-Lloyd", category: "Shipment Tracking", desc: "Hapag-Lloyd container tracking and BL events.", status: "Error", logo: "HL" },

  // Payments
  { id: "flutterwave", name: "Flutterwave", category: "Payments", desc: "Pan-African card, bank transfer and USSD collections.", status: "Connected", logo: "FW" },
  { id: "paystack", name: "Paystack", category: "Payments", desc: "Card and bank transfer collections in NGN, GHS, ZAR.", status: "Connected", logo: "PS" },
  { id: "monnify", name: "Monnify", category: "Payments", desc: "Reserved virtual accounts and bank transfer.", status: "Connected", logo: "MN" },
  { id: "fincra", name: "Fincra", category: "Payments", desc: "Cross-border payments and collections.", status: "Not Connected", logo: "FC" },
  { id: "bank-transfer", name: "Direct Bank Transfer", category: "Payments", desc: "NIBSS-backed bank transfer rails.", status: "Connected", logo: "BT" },
  { id: "vacc", name: "Virtual Accounts", category: "Payments", desc: "Dedicated NGN virtual accounts per customer.", status: "Connected", logo: "VA" },

  // FX & Settlement
  { id: "bank-partner", name: "Banking Partner", category: "FX & Settlement", desc: "Tier-1 settlement bank for NGN and USD nostro.", status: "Connected", logo: "BP" },
  { id: "payout-partner", name: "Payout Partner", category: "FX & Settlement", desc: "Global SWIFT and SEPA payouts.", status: "Connected", logo: "PP" },
  { id: "liquidity", name: "Liquidity Provider", category: "FX & Settlement", desc: "USD/NGN, GBP, EUR, CNY liquidity sourcing.", status: "Connected", logo: "LP" },
  { id: "stables", name: "Stablecoin Settlement", category: "FX & Settlement", desc: "USDC/USDT settlement rails for global payouts.", status: "Pending", logo: "SC" },
  { id: "rmb", name: "RMB Settlement Partner", category: "FX & Settlement", desc: "Onshore RMB settlement to China suppliers.", status: "Connected", logo: "¥" },
  { id: "g10", name: "GBP/EUR/USD Settlement", category: "FX & Settlement", desc: "G10 currency settlement partner.", status: "Connected", logo: "G£" },

  // Messaging
  { id: "wa", name: "WhatsApp Business API", category: "Messaging", desc: "Official WhatsApp Cloud API for customer messaging.", status: "Connected", logo: "WA" },
  { id: "sms", name: "SMS Gateway", category: "Messaging", desc: "Bulk SMS across African networks.", status: "Connected", logo: "SM" },
  { id: "email", name: "Email", category: "Messaging", desc: "Transactional email with deliverability tracking.", status: "Connected", logo: "EM" },
  { id: "push", name: "Push Notifications", category: "Messaging", desc: "Web and mobile push notifications.", status: "Not Connected", logo: "PN" },

  // Compliance
  { id: "kyc", name: "KYC Provider", category: "Compliance", desc: "ID verification with liveness and biometrics.", status: "Connected", logo: "KC" },
  { id: "kyb", name: "KYB Provider", category: "Compliance", desc: "Business verification across 80+ jurisdictions.", status: "Connected", logo: "KB" },
  { id: "cac", name: "CAC Verification", category: "Compliance", desc: "Nigerian Corporate Affairs Commission lookups.", status: "Connected", logo: "CA" },
  { id: "sanctions", name: "Sanctions Screening", category: "Compliance", desc: "OFAC, EU, UN consolidated list checks.", status: "Connected", logo: "SN" },
  { id: "pep", name: "PEP Screening", category: "Compliance", desc: "Politically exposed persons screening.", status: "Connected", logo: "PE" },
  { id: "biz-verify", name: "Business Verification", category: "Compliance", desc: "Operational business legitimacy checks.", status: "Pending", logo: "BV" },

  // Cards
  { id: "issuer", name: "Card Issuing Provider", category: "Cards", desc: "BIN sponsorship and global card issuance.", status: "Connected", logo: "CI" },
  { id: "applepay", name: "Apple Pay", category: "Cards", desc: "Apple Pay tokenization for issued cards.", status: "Connected", logo: "AP" },
  { id: "gpay", name: "Google Pay", category: "Cards", desc: "Google Pay tokenization for issued cards.", status: "Connected", logo: "GP" },
  { id: "3ds", name: "3DS Provider", category: "Cards", desc: "3D Secure step-up authentication.", status: "Connected", logo: "3D" },
  { id: "card-hooks", name: "Card Webhooks", category: "Cards", desc: "Real-time authorization, capture and decline events.", status: "Connected", logo: "CW" },

  // Storage
  { id: "doc-store", name: "Document Storage", category: "Storage", desc: "Trade document storage with metadata indexing.", status: "Connected", logo: "DS" },
  { id: "cloud-store", name: "Cloud File Storage", category: "Storage", desc: "Object storage for invoices, BLs, packing lists.", status: "Connected", logo: "CS" },
  { id: "vault", name: "Secure Vault", category: "Storage", desc: "Encrypted vault for PII and KYC documents.", status: "Connected", logo: "SV" },

  // Accounting
  { id: "qb", name: "QuickBooks", category: "Accounting/ERP", desc: "Sync transactions, customers and invoices.", status: "Not Connected", logo: "QB" },
  { id: "xero", name: "Xero", category: "Accounting/ERP", desc: "Automated bookkeeping sync to Xero.", status: "Not Connected", logo: "XR" },
  { id: "csv", name: "CSV Export", category: "Accounting/ERP", desc: "Scheduled CSV exports of all transactions.", status: "Connected", logo: "CV" },
  { id: "erp-hook", name: "ERP Webhook", category: "Accounting/ERP", desc: "Push events to your ERP (SAP, Oracle, Odoo).", status: "Pending", logo: "EW" },

  // Developer
  { id: "api-keys", name: "API Keys", category: "Developer Tools", desc: "Manage live and test API credentials.", status: "Connected", logo: "AK" },
  { id: "webhooks", name: "Webhooks", category: "Developer Tools", desc: "Subscribe to platform events.", status: "Connected", logo: "WH" },
  { id: "logs", name: "Event Logs", category: "Developer Tools", desc: "Searchable log of all API and webhook events.", status: "Connected", logo: "LG" },
  { id: "docs", name: "Developer Documentation", category: "Developer Tools", desc: "API reference, SDKs and integration guides.", status: "Connected", logo: "DC" },
];

const webhookEvents = [
  { name: "payment.received", desc: "A payment was received and credited to a wallet" },
  { name: "shipment.updated", desc: "Container status, ETA or vessel position changed" },
  { name: "document.uploaded", desc: "A document was uploaded to a trade file" },
  { name: "tradefile.created", desc: "A trade file was created from intake" },
  { name: "card.transaction", desc: "A card authorization, capture or decline occurred" },
  { name: "settlement.completed", desc: "Settlement to a global beneficiary completed" },
  { name: "compliance.flagged", desc: "A compliance check returned a flag or hit" },
  { name: "escrow.released", desc: "Escrowed funds were released to the supplier" },
];

const recentEventLogs = [
  { t: "2026-06-09 09:42:11", type: "payment.received", ref: "PAY-9981", status: 200 },
  { t: "2026-06-09 09:41:55", type: "shipment.updated", ref: "SHP-10421", status: 200 },
  { t: "2026-06-09 09:38:01", type: "document.uploaded", ref: "DOC-7711", status: 200 },
  { t: "2026-06-09 09:30:24", type: "tradefile.created", ref: "TF-2026-0214", status: 200 },
  { t: "2026-06-09 09:18:09", type: "card.transaction", ref: "CARD-AUTH-66112", status: 200 },
  { t: "2026-06-09 09:01:48", type: "compliance.flagged", ref: "KYB-1050", status: 200 },
  { t: "2026-06-09 08:55:30", type: "settlement.completed", ref: "STL-3304", status: 200 },
  { t: "2026-06-09 08:40:02", type: "escrow.released", ref: "ESC-882", status: 500 },
];

// ---------- helpers ----------
function StatusBadge({ s }: { s: ConnStatus }) {
  const map: Record<ConnStatus, { cls: string; icon: any }> = {
    "Connected": { cls: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
    "Not Connected": { cls: "bg-secondary text-muted-foreground border-border", icon: XCircle },
    "Pending": { cls: "bg-warning/15 text-warning-foreground border-warning/30", icon: Clock },
    "Error": { cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
  };
  const { cls, icon: Icon } = map[s];
  return <Badge variant="outline" className={`${cls} gap-1`}><Icon className="h-3 w-3" /> {s}</Badge>;
}

function Kpi({ icon: Icon, label, value, tone = "primary" }: { icon: any; label: string; value: string | number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const toneMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/15",
    danger: "text-destructive bg-destructive/10",
  };
  return (
    <Card className="p-4 shadow-card">
      <div className={`h-9 w-9 grid place-items-center rounded-lg ${toneMap[tone]}`}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </Card>
  );
}

// ---------- page ----------
function Integrations() {
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<CategoryKey | "All">("All");
  const [configure, setConfigure] = useState<Integration | null>(null);
  const [logsFor, setLogsFor] = useState<Integration | null>(null);
  const [showLive, setShowLive] = useState(false);
  const [showTest, setShowTest] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const filtered = useMemo(
    () => integrations.filter(
      (i) => (activeCat === "All" || i.category === activeCat) &&
             (q === "" || `${i.name} ${i.category} ${i.desc}`.toLowerCase().includes(q.toLowerCase()))
    ),
    [q, activeCat]
  );

  const connected = integrations.filter((i) => i.status === "Connected").length;
  const errors = integrations.filter((i) => i.status === "Error").length;
  const pending = integrations.filter((i) => i.status === "Pending").length;

  const copy = (label: string, val: string) => {
    navigator.clipboard?.writeText(val);
    toast.success(`${label} copied`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-primary/10 text-primary"><Plug className="h-5 w-5" /></span>
            Integrations Marketplace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Connect tracking, payments, messaging, compliance, cards, storage and accounting in one place.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Opening developer docs")}><BookOpen className="h-4 w-4 mr-1.5" /> Documentation</Button>
          <Button size="sm" onClick={() => toast.success("Request submitted")}><Plug className="h-4 w-4 mr-1.5" /> Request integration</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={CheckCircle2} label="Active integrations" value={connected} tone="success" />
        <Kpi icon={Clock} label="Pending setup" value={pending} tone="warning" />
        <Kpi icon={AlertTriangle} label="Connections in error" value={errors} tone="danger" />
        <Kpi icon={Activity} label="Webhook events / 24h" value="12,481" tone="primary" />
      </div>

      <Tabs defaultValue="marketplace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="marketplace"><Plug className="h-3.5 w-3.5 mr-1.5" /> Marketplace</TabsTrigger>
          <TabsTrigger value="api"><Key className="h-3.5 w-3.5 mr-1.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="h-3.5 w-3.5 mr-1.5" /> Webhooks</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="h-3.5 w-3.5 mr-1.5" /> Event Logs</TabsTrigger>
        </TabsList>

        {/* ---------- Marketplace ---------- */}
        <TabsContent value="marketplace" className="space-y-4">
          <Card className="p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search integrations…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <button onClick={() => setActiveCat("All")} className={`text-xs px-2.5 py-1.5 rounded-full border ${activeCat === "All" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>All</button>
              {CATEGORIES.map((c) => (
                <button key={c.key} onClick={() => setActiveCat(c.key)} className={`text-xs px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 ${activeCat === c.key ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                  <c.icon className="h-3 w-3" /> {c.key}
                </button>
              ))}
            </div>
          </Card>

          {CATEGORIES.filter((c) => activeCat === "All" || c.key === activeCat).map((cat) => {
            const items = filtered.filter((i) => i.category === cat.key);
            if (items.length === 0) return null;
            const Icon = cat.icon;
            return (
              <div key={cat.key} className="space-y-3">
                <div className="flex items-center gap-2 mt-2">
                  <span className={`h-7 w-7 grid place-items-center rounded-lg ${cat.tone}`}><Icon className="h-3.5 w-3.5" /></span>
                  <h2 className="text-sm font-semibold">{cat.key}</h2>
                  <span className="text-[11px] text-muted-foreground">{items.length} providers</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((i) => (
                    <Card key={i.id} className="p-5 shadow-card flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-secondary border border-border grid place-items-center font-mono text-sm font-semibold text-foreground/80">{i.logo}</div>
                          <div>
                            <div className="text-sm font-semibold">{i.name}</div>
                            <div className="text-[11px] text-muted-foreground">{i.category}</div>
                          </div>
                        </div>
                        <StatusBadge s={i.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 flex-1">{i.desc}</p>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1" onClick={() => setConfigure(i)}>
                          <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                          {i.status === "Connected" ? "Configure" : i.status === "Error" ? "Reconnect" : "Connect"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setLogsFor(i)}><Activity className="h-3.5 w-3.5 mr-1.5" /> Logs</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* ---------- API Keys ---------- */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Live API Key</div>
                  <div className="text-[11px] text-muted-foreground">Use in production. Treat as a password.</div>
                </div>
                <Badge variant="outline" className="bg-success/15 text-success border-success/30">Live</Badge>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 font-mono text-xs">
                <span className="flex-1 truncate">{showLive ? "ck_live_8f29ab40c1d24e7b9a55d8e2f11c4b0e" : "ck_live_••••••••••••••••••••••••••••••"}</span>
                <Button size="sm" variant="ghost" onClick={() => setShowLive((v) => !v)}>{showLive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button>
                <Button size="sm" variant="ghost" onClick={() => copy("Live key", "ck_live_8f29ab40c1d24e7b9a55d8e2f11c4b0e")}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => toast.success("Live key regenerated")}><RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Regenerate</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Last used: 2 minutes ago")}>Usage</Button>
              </div>
            </Card>

            <Card className="p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Test API Key</div>
                  <div className="text-[11px] text-muted-foreground">Safe for sandbox and development.</div>
                </div>
                <Badge variant="outline" className="bg-warning/15 text-warning-foreground border-warning/30">Test</Badge>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 font-mono text-xs">
                <span className="flex-1 truncate">{showTest ? "ck_test_3a91be72f0d34c8a91e5af6e22b8c1f9" : "ck_test_••••••••••••••••••••••••••••••"}</span>
                <Button size="sm" variant="ghost" onClick={() => setShowTest((v) => !v)}>{showTest ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button>
                <Button size="sm" variant="ghost" onClick={() => copy("Test key", "ck_test_3a91be72f0d34c8a91e5af6e22b8c1f9")}><Copy className="h-3.5 w-3.5" /></Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => toast.success("Test key regenerated")}><RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Regenerate</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Last used: 14 minutes ago")}>Usage</Button>
              </div>
            </Card>
          </div>

          <Card className="p-5 shadow-card">
            <div className="text-sm font-semibold">Webhook endpoint</div>
            <div className="text-[11px] text-muted-foreground">We POST event payloads to this URL with HMAC SHA-256 signature.</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Webhook URL</div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 font-mono text-xs">
                  <span className="flex-1 truncate">https://api.acme.com/canta/webhook</span>
                  <Button size="sm" variant="ghost" onClick={() => copy("Webhook URL", "https://api.acme.com/canta/webhook")}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-muted-foreground mb-1">Webhook signing secret</div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 font-mono text-xs">
                  <span className="flex-1 truncate">{showSecret ? "whsec_a13bcd92e45f6789012345678abcdef0" : "whsec_••••••••••••••••••••••••••••••"}</span>
                  <Button size="sm" variant="ghost" onClick={() => setShowSecret((v) => !v)}>{showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</Button>
                  <Button size="sm" variant="ghost" onClick={() => copy("Webhook secret", "whsec_a13bcd92e45f6789012345678abcdef0")}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => toast.success("Secret rotated")}><RefreshCcw className="h-3.5 w-3.5 mr-1.5" /> Rotate secret</Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success("Test event sent")}>Send test event</Button>
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Webhooks ---------- */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <div className="text-sm font-semibold">Subscribed events</div>
              <div className="text-xs text-muted-foreground">Toggle the events you want delivered to your webhook URL.</div>
            </div>
            <div className="divide-y divide-border">
              {webhookEvents.map((e, idx) => (
                <div key={e.name} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 grid place-items-center rounded-lg bg-primary/10 text-primary"><Webhook className="h-4 w-4" /></span>
                    <div>
                      <div className="text-sm font-mono">{e.name}</div>
                      <div className="text-xs text-muted-foreground">{e.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={idx % 4 === 3 ? "bg-secondary text-muted-foreground border-border" : "bg-success/15 text-success border-success/30"}>{idx % 4 === 3 ? "Disabled" : "Enabled"}</Badge>
                    <Button size="sm" variant="outline" onClick={() => toast.success(`${e.name} test sent`)}>Send test</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ---------- Event Logs ---------- */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="p-0 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs text-muted-foreground">
                  <tr>
                    {["Timestamp", "Event", "Reference", "Status", ""].map((h) => (
                      <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEventLogs.map((l, i) => (
                    <tr key={i} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.t}</td>
                      <td className="px-4 py-3 font-mono text-xs">{l.type}</td>
                      <td className="px-4 py-3 font-mono text-xs">{l.ref}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={l.status === 200 ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>{l.status}</Badge>
                      </td>
                      <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => toast.success("Event replayed")}>Replay</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configure dialog */}
      <Dialog open={!!configure} onOpenChange={(o) => !o && setConfigure(null)}>
        <DialogContent>
          {configure && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-secondary border border-border grid place-items-center font-mono text-sm font-semibold">{configure.logo}</div>
                  <div>
                    <DialogTitle>{configure.name}</DialogTitle>
                    <DialogDescription>{configure.category} · {configure.desc}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase text-muted-foreground">API Key</label>
                  <Input placeholder={`${configure.id}_live_xxxxxxxxxxxxxxxxxxxxxxxx`} />
                </div>
                <div>
                  <label className="text-[11px] uppercase text-muted-foreground">Environment</label>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" variant="outline" className="flex-1">Sandbox</Button>
                    <Button size="sm" className="flex-1">Production</Button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase text-muted-foreground">Webhook URL</label>
                  <Input defaultValue={`https://api.canta.app/integrations/${configure.id}/webhook`} readOnly />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfigure(null)}>Cancel</Button>
                <Button onClick={() => { toast.success(`${configure.name} configured`); setConfigure(null); }}>Save & connect</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Logs dialog */}
      <Dialog open={!!logsFor} onOpenChange={(o) => !o && setLogsFor(null)}>
        <DialogContent className="max-w-2xl">
          {logsFor && (
            <>
              <DialogHeader>
                <DialogTitle>{logsFor.name} · Logs</DialogTitle>
                <DialogDescription>Recent API requests and webhook deliveries from {logsFor.name}.</DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/40 text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-3 py-2">Time</th>
                      <th className="text-left font-medium px-3 py-2">Endpoint</th>
                      <th className="text-left font-medium px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEventLogs.slice(0, 6).map((l, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-3 py-2 font-mono text-muted-foreground">{l.t}</td>
                        <td className="px-3 py-2 font-mono">/v1/{logsFor.id}/{l.type.split(".")[0]}</td>
                        <td className="px-3 py-2"><Badge variant="outline" className={l.status === 200 ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
