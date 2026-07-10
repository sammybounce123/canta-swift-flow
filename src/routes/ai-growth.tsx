import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { leads as baseLeads, fmtMoney } from "@/lib/mock";
import {
  Brain, Sparkles, MessageCircle, FileSearch, Calculator, Target, Users, Flame,
  TrendingUp, Clock, CheckCircle2, Ship, Truck, Building2, Landmark,
  ArrowRight, Send, Upload, Bot, Wand2, MapPin, Phone, Mail, ChevronRight, Search,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-growth")({
  head: () => ({ meta: [{ title: "AI Growth Engine — Canta" }] }),
  component: AIGrowth,
});

// ---------- Lead categories ----------
type Category = "Importers" | "Freight Forwarders" | "Suppliers" | "Global Merchants" | "Treasury Prospects" | "Institutional Partners";
const CATEGORIES: { l: Category; i: any; tone: string }[] = [
  { l: "Importers",              i: Ship,       tone: "bg-primary/10 text-primary" },
  { l: "Freight Forwarders",     i: Truck,      tone: "bg-accent/15 text-accent" },
  { l: "Suppliers",              i: Building2,  tone: "bg-warning/10 text-warning" },
  { l: "Global Merchants",       i: TrendingUp, tone: "bg-success/10 text-success" },
  { l: "Treasury Prospects",     i: Landmark,   tone: "bg-destructive/10 text-destructive" },
  { l: "Institutional Partners", i: Landmark,   tone: "bg-muted text-foreground" },
];

type Stage = "Hot Lead" | "Warm Lead" | "Cold Lead" | "Not Ready";
type RecProduct = "Trade Desk" | "Global Collections" | "Enterprise Treasury" | "Supplier Settlement" | "Freight Workspace";

type Lead = {
  id: string;
  business: string;
  contact: string;
  phone: string;
  email: string;
  category: Category;
  market: string;
  corridor: string;
  volume: number;
  source: string;
  status: Stage;
  agent: string;
  score: number;
  painPoint: string;
  recommended: RecProduct;
  followUp?: string;
};

const seedLeads: Lead[] = [
  { id: "LD-401", business: "Mega Plaza Imports",      contact: "Chuka Eze",      phone: "+234 803 221 0098", email: "chuka@megaplaza.ng",     category: "Importers",          market: "Lagos · Computer Village", corridor: "NG ↔ CN", volume: 280_000, source: "Inbound Web",   status: "Hot Lead",  agent: "Adaeze O.",  score: 92, painPoint: "5-day supplier settlement delays from Shenzhen", recommended: "Trade Desk",          followUp: "2026-06-09" },
  { id: "LD-402", business: "Africa Cargo Express",    contact: "Bola Adeniyi",   phone: "+234 802 110 8845", email: "ops@africargo.com",      category: "Freight Forwarders", market: "Apapa Port",                corridor: "NG ↔ AE", volume: 140_000, source: "Referral",      status: "Warm Lead", agent: "Kunle A.",   score: 81, painPoint: "Manual shipment updates to customers",            recommended: "Freight Workspace",   followUp: "2026-06-10" },
  { id: "LD-403", business: "Hangzhou Apparel Group",  contact: "Wei Liu",        phone: "+86 138 0011 4422", email: "wei@hzapparel.cn",       category: "Suppliers",          market: "Hangzhou Industrial",       corridor: "CN ↔ NG", volume: 95_000,  source: "Outbound",      status: "Warm Lead", agent: "Fatima M.",  score: 76, painPoint: "Unstable NGN→CNY settlement timing",                recommended: "Supplier Settlement", followUp: "2026-06-11" },
  { id: "LD-404", business: "Pan-African University",  contact: "Dr. Helen Otu",  phone: "+44 20 7946 0815",  email: "bursar@pau.edu",         category: "Global Merchants",   market: "London HQ",                 corridor: "GB ↔ Africa", volume: 410_000, source: "Partnership", status: "Hot Lead",  agent: "Tomiwa L.",  score: 88, painPoint: "Tuition collections from 4 African markets",         recommended: "Global Collections",  followUp: "2026-06-09" },
  { id: "LD-405", business: "Royal Dubai Motors",      contact: "Khalid R.",      phone: "+971 50 119 8842",  email: "sales@royaldxbmotors.ae",category: "Suppliers",          market: "Deira Auto Market",         corridor: "AE ↔ NG", volume: 60_000,  source: "Trade Fair",    status: "Cold Lead", agent: "Fatima M.",  score: 67, painPoint: "Buyers default on auction balances",                recommended: "Supplier Settlement", followUp: "2026-06-15" },
  { id: "LD-406", business: "Balogun Trade Hub",       contact: "Mama Risi",      phone: "+234 803 442 7765", email: "balogun@traders.ng",     category: "Importers",          market: "Lagos · Balogun",           corridor: "NG ↔ CN", volume: 320_000, source: "Field Sales",   status: "Hot Lead",  agent: "Chinedu E.", score: 90, painPoint: "Cash-based supplier payments to Yiwu",              recommended: "Trade Desk",          followUp: "2026-06-08" },
  { id: "LD-407", business: "Spark Media Africa",      contact: "Tomi Bello",     phone: "+234 805 220 9988", email: "tomi@sparkmedia.africa", category: "Treasury Prospects", market: "Lagos · VI",                corridor: "NG ↔ Global", volume: 48_000, source: "Inbound Web", status: "Warm Lead", agent: "Adaeze O.",  score: 73, painPoint: "Needs cleaner approvals for recurring international payments", recommended: "Enterprise Treasury", followUp: "2026-06-12" },
  { id: "LD-408", business: "Coastal Estates",         contact: "Bayo Coker",     phone: "+234 802 770 4421", email: "info@coastal.ng",        category: "Global Merchants",   market: "Lagos · Lekki",             corridor: "NG ↔ Diaspora", volume: 220_000, source: "Inbound Web", status: "Warm Lead", agent: "Tomiwa L.",  score: 79, painPoint: "Diaspora rent collection in FX",                    recommended: "Global Collections",  followUp: "2026-06-13" },
  { id: "LD-409", business: "Federal Polytechnic Co-op",contact: "Mr. Adekunle",  phone: "+234 803 119 6500", email: "coop@fedpoly.ng",        category: "Institutional Partners", market: "Ibadan", corridor: "NG",   volume: 90_000,  source: "Referral",      status: "Not Ready", agent: "Chinedu E.", score: 41, painPoint: "Procurement cycle just closed",                     recommended: "Enterprise Treasury", followUp: "2026-07-02" },
];

// Map base mock leads in too (already in mock.ts)
const allLeads: Lead[] = seedLeads;

// ---------- Helpers ----------
function stageTone(s: Stage) {
  return {
    "Hot Lead":  "bg-destructive/15 text-destructive border-destructive/30",
    "Warm Lead": "bg-warning/15 text-warning border-warning/30",
    "Cold Lead": "bg-primary/15 text-primary border-primary/30",
    "Not Ready": "bg-muted text-muted-foreground border-border",
  }[s];
}

function scoreColor(n: number) {
  if (n >= 85) return "text-destructive";
  if (n >= 70) return "text-warning";
  if (n >= 50) return "text-primary";
  return "text-muted-foreground";
}

function KPI({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: any; tone?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`h-7 w-7 rounded-lg grid place-items-center ${tone ?? "bg-primary/10 text-primary"}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-semibold mt-2 tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}

// ---------- Section components ----------
function LeadFinder({ onPick }: { onPick: (l: Lead) => void }) {
  const [cat, setCat] = useState<"All" | Category>("All");
  const [q, setQ] = useState("");
  const filtered = allLeads.filter(l =>
    (cat === "All" || l.category === cat) &&
    (!q || l.business.toLowerCase().includes(q.toLowerCase()) || l.contact.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4" /> Lead Finder</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input placeholder="Search leads..." value={q} onChange={e=>setQ(e.target.value)} className="pl-8 h-9 w-56" />
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Scoring 248 leads…")}>
            <Brain className="h-3.5 w-3.5 mr-1.5" /> Re-score all
          </Button>
        </div>
      </div>

      {/* Category chips */}
      <div className="px-4 pt-3 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES.map(c => c.l)] as ("All"|Category)[]).map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-accent"
            }`}>{c}</button>
        ))}
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Business</th><th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Corridor</th><th className="px-4 py-3 text-right">Est. Volume</th>
            <th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Agent</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} className="border-t border-border hover:bg-secondary/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{l.business}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> {l.market} · {l.contact}
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{l.category}</Badge></td>
                <td className="px-4 py-3 text-xs">{l.corridor}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtMoney(l.volume,"USD")}</td>
                <td className="px-4 py-3"><span className={`font-semibold tabular-nums ${scoreColor(l.score)}`}>{l.score}</span></td>
                <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${stageTone(l.status)}`}>{l.status}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{l.agent}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="ghost" onClick={() => onPick(l)}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function LeadScoring() {
  const factors = [
    { l: "Est. transaction volume", v: 88 },
    { l: "Import frequency",        v: 92 },
    { l: "Shipment activity",       v: 81 },
    { l: "Business category fit",   v: 76 },
    { l: "Urgency signals",         v: 64 },
    { l: "Pain-point clarity",      v: 85 },
    { l: "Documents shared",        v: 70 },
    { l: "Repeat shipment potential",v: 90 },
    { l: "Working-capital urgency", v: 58 },
    { l: "Likely payment volume",   v: 87 },
  ];
  const total = Math.round(factors.reduce((s,f) => s + f.v, 0) / factors.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="p-5 shadow-card lg:col-span-2">
        <div className="text-sm font-semibold flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Score breakdown — Mega Plaza Imports</div>
        <div className="space-y-3 mt-4">
          {factors.map(f => (
            <div key={f.l}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{f.l}</span><span className={`tabular-nums font-semibold ${scoreColor(f.v)}`}>{f.v}</span>
              </div>
              <Progress value={f.v} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5 shadow-card bg-gradient-to-br from-destructive/5 to-transparent">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Composite score</div>
        <div className="text-5xl font-bold tabular-nums mt-2">{total}</div>
        <Badge variant="outline" className={`mt-2 ${stageTone("Hot Lead")}`}>Hot Lead</Badge>
        <div className="mt-4 space-y-2 text-xs">
          {(["Hot Lead","Warm Lead","Cold Lead","Not Ready"] as Stage[]).map(s => (
            <div key={s} className="flex items-center justify-between">
              <Badge variant="outline" className={`text-[10px] ${stageTone(s)}`}>{s}</Badge>
              <span className="text-muted-foreground">
                {s === "Hot Lead" ? "85–100" : s === "Warm Lead" ? "70–84" : s === "Cold Lead" ? "50–69" : "0–49"}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SalesCopilot({ lead }: { lead: Lead }) {
  return (
    <Card className="p-5 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> AI Sales Copilot</div>
          <div className="mt-2 text-base font-semibold">{lead.business}</div>
          <div className="text-xs text-muted-foreground">{lead.category} · {lead.status} · Score {lead.score}</div>
        </div>
        <Badge variant="outline" className="text-[10px]">{lead.recommended}</Badge>
      </div>

      <div className="mt-4 space-y-3 text-xs">
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="font-semibold mb-1">Lead summary</div>
          <p className="text-muted-foreground">{lead.business} is a {lead.category.toLowerCase().replace(/s$/, "")} operating on the {lead.corridor} corridor with an estimated {fmtMoney(lead.volume,"USD")} annual volume.</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="font-semibold mb-1">Likely pain point</div>
          <p className="text-muted-foreground">{lead.painPoint}</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="font-semibold mb-1">Best pitch</div>
          <p className="text-muted-foreground">Position <span className="text-foreground font-medium">{lead.recommended}</span> as the fastest, safest way to solve this — lead with a 7-day pilot and reference a similar customer.</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="font-semibold mb-1">Objection handling</div>
          <p className="text-muted-foreground">"We already use a bank" → Show 60–90 second corridor settlement vs 3–5 day SWIFT delay. "Pricing concern" → Free during pilot, fee tier kicks in only after first successful shipment.</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="font-semibold mb-1">Next best action</div>
          <p className="text-muted-foreground">Send WhatsApp follow-up with landed-cost demo link and book a 20-min call this week.</p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card">
          <div className="font-semibold mb-1">Suggested WhatsApp follow-up</div>
          <p className="text-muted-foreground italic">
            "Hi {lead.contact.split(" ")[0]}, this is {lead.agent} from Canta 👋. Based on your {lead.corridor} shipments,
            I think {lead.recommended} can save you ~3 days per settlement. Quick 20-min call this week?"
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Probability of conversion</span>
          <span className="text-success font-semibold">{Math.min(95, lead.score - 10 + 25)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button onClick={() => toast.success("WhatsApp follow-up sent")} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <MessageCircle className="h-4 w-4 mr-1.5" /> Send WhatsApp
        </Button>
        <Button variant="outline" onClick={() => toast.success("Task created for " + lead.agent)}>
          <ArrowRight className="h-4 w-4 mr-1.5" /> Next action
        </Button>
      </div>
    </Card>
  );
}

function WhatsAppOnboarding() {
  const msgs = [
    { from: "importer", t: "Hello, I just paid for my goods today.", time: "09:12" },
    { from: "importer", t: "📎 invoice-CN-882.pdf", time: "09:12" },
    { from: "canta",    t: "Got it ✅ Extracting your invoice…", time: "09:12" },
    { from: "canta",    t: "Supplier: Hangzhou Apparel Group · USD 18,420 · 240 cartons.\nIs this your shipment?", time: "09:13" },
    { from: "importer", t: "Yes. Container MSCU9876543, ETA Apapa June 24.", time: "09:14" },
    { from: "importer", t: "📎 BL-FE-7711.pdf", time: "09:14" },
    { from: "canta",    t: "Trade File TR-2042 created. Tracking container live + clearing checklist sent.", time: "09:15" },
  ];

  return (
    <Card className="shadow-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Bot className="h-4 w-4 text-success" />
        <div className="text-sm font-semibold">AI WhatsApp Onboarding</div>
        <Badge variant="outline" className="text-[10px] ml-auto bg-success/15 text-success border-success/30">Demo</Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Chat */}
        <div className="p-4 bg-secondary/20 border-r border-border space-y-2 min-h-[420px]">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "importer" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs whitespace-pre-line shadow-sm ${
                m.from === "importer" ? "bg-card border border-border" : "bg-success/15 text-foreground border border-success/30"
              }`}>
                {m.t}
                <div className="text-[10px] text-muted-foreground mt-1 text-right">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Extracted Trade File */}
        <div className="p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Trade File draft</div>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">TR-2042 · Hangzhou Apparel</div>
              <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30">Draft</Badge>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mt-3">
              <div><div className="text-muted-foreground">Supplier</div><div className="font-medium">Hangzhou Apparel Group</div></div>
              <div><div className="text-muted-foreground">Invoice amount</div><div className="font-medium">USD 18,420</div></div>
              <div><div className="text-muted-foreground">Goods</div><div className="font-medium">Fashion · 240 cartons</div></div>
              <div><div className="text-muted-foreground">Container</div><div className="font-medium">MSCU9876543</div></div>
              <div><div className="text-muted-foreground">BL number</div><div className="font-medium">BL-FE-7711</div></div>
              <div><div className="text-muted-foreground">ETA</div><div className="font-medium">2026-06-24 · Apapa</div></div>
              <div><div className="text-muted-foreground">Payment ref</div><div className="font-medium">PAY-CN-0998</div></div>
              <div><div className="text-muted-foreground">Status</div><div className="font-medium">On vessel</div></div>
            </div>
            <Button size="sm" className="w-full mt-4" onClick={() => toast.success("Trade File TR-2042 promoted")}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Promote to Trade Desk
            </Button>
          </Card>
        </div>
      </div>
    </Card>
  );
}

function DocumentExtractor() {
  const [extracted, setExtracted] = useState(false);
  const fields = [
    ["Supplier name",   "Hangzhou Apparel Group"],
    ["Buyer name",      "Balogun Trade Hub"],
    ["Invoice amount",  "USD 18,420.00"],
    ["Currency",        "USD"],
    ["Goods description","Mixed apparel · 240 cartons"],
    ["Container number","MSCU9876543"],
    ["BL number",       "BL-FE-7711"],
    ["ETA",             "2026-06-24"],
    ["Payment amount",  "USD 9,210.00 (50%)"],
    ["Payment reference","PAY-CN-0998"],
    ["Freight amount",  "USD 2,180.00"],
    ["Shipment number", "SH-2042"],
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold flex items-center gap-2"><FileSearch className="h-4 w-4" /> Upload document</div>
        <div className="mt-4 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent transition cursor-pointer"
             onClick={() => { setExtracted(true); toast.success("Document parsed"); }}>
          <Upload className="h-7 w-7 text-muted-foreground mx-auto" />
          <div className="text-sm font-medium mt-2">Drop invoice, BL, packing list, freight invoice</div>
          <div className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · up to 25 MB</div>
        </div>
        <div className="mt-4 space-y-1.5 text-xs">
          {["Invoice","Bill of Lading","Packing List","Payment Receipt","Freight Invoice"].map(t => (
            <div key={t} className="flex items-center justify-between border-t border-border pt-1.5 first:border-0 first:pt-0">
              <span className="text-muted-foreground">{t}</span>
              <Badge variant="outline" className="text-[10px]">Supported</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2 p-5 shadow-card">
        <div className="text-sm font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4 text-accent" /> Extracted fields</div>
        {!extracted ? (
          <div className="mt-6 text-sm text-muted-foreground text-center py-12">Upload a document to see extracted structured data.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {fields.map(([k,v]) => (
              <div key={k} className="p-3 rounded-lg border border-border bg-card">
                <div className="text-[10px] uppercase text-muted-foreground">{k}</div>
                <div className="text-sm font-medium mt-1">{v}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LandedCostAssistant() {
  const [goods, setGoods] = useState(18_420);
  const [fx, setFx] = useState(1612);
  const [freight, setFreight] = useState(2180);
  const [duty, setDuty] = useState(0.20);
  const [clearing, setClearing] = useState(380_000);
  const [port, setPort] = useState(220_000);
  const [delivery, setDelivery] = useState(160_000);
  const [sell, setSell] = useState(42_500_000);

  const goodsNGN     = goods * fx;
  const freightNGN   = freight * fx;
  const dutyNGN      = Math.round((goodsNGN + freightNGN) * duty);
  const total        = goodsNGN + freightNGN + dutyNGN + clearing + port + delivery;
  const profit       = sell - total;
  const margin       = sell ? (profit / sell) * 100 : 0;

  const row = (l: string, v: string, mono = true) => (
    <div className="flex items-center justify-between text-xs border-t border-border pt-2 first:border-0 first:pt-0">
      <span className="text-muted-foreground">{l}</span>
      <span className={`font-semibold ${mono ? "tabular-nums" : ""}`}>{v}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold flex items-center gap-2"><Calculator className="h-4 w-4" /> Inputs</div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div><Label>Goods cost (USD)</Label><Input type="number" value={goods} onChange={e=>setGoods(+e.target.value)} /></div>
          <div><Label>FX rate (USD→NGN)</Label><Input type="number" value={fx} onChange={e=>setFx(+e.target.value)} /></div>
          <div><Label>Freight (USD)</Label><Input type="number" value={freight} onChange={e=>setFreight(+e.target.value)} /></div>
          <div><Label>Duty %</Label><Input type="number" step="0.01" value={duty} onChange={e=>setDuty(+e.target.value)} /></div>
          <div><Label>Clearing (NGN)</Label><Input type="number" value={clearing} onChange={e=>setClearing(+e.target.value)} /></div>
          <div><Label>Port charges (NGN)</Label><Input type="number" value={port} onChange={e=>setPort(+e.target.value)} /></div>
          <div><Label>Local delivery (NGN)</Label><Input type="number" value={delivery} onChange={e=>setDelivery(+e.target.value)} /></div>
          <div><Label>Expected selling (NGN)</Label><Input type="number" value={sell} onChange={e=>setSell(+e.target.value)} /></div>
        </div>
      </Card>
      <Card className="p-5 shadow-card bg-gradient-to-br from-primary/5 to-transparent">
        <div className="text-sm font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" /> AI estimate</div>
        <div className="space-y-2 mt-4">
          {row("Goods (NGN)",      fmtMoney(goodsNGN, "NGN"))}
          {row("Freight (NGN)",    fmtMoney(freightNGN, "NGN"))}
          {row("Duty estimate",    fmtMoney(dutyNGN, "NGN"))}
          {row("Clearing",         fmtMoney(clearing, "NGN"))}
          {row("Port charges",     fmtMoney(port, "NGN"))}
          {row("Local delivery",   fmtMoney(delivery, "NGN"))}
        </div>
        <div className="mt-4 pt-3 border-t-2 border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Total landed cost</span>
            <span className="font-bold tabular-nums">{fmtMoney(total, "NGN")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Expected profit</span>
            <span className={`font-bold tabular-nums ${profit >= 0 ? "text-success" : "text-destructive"}`}>{fmtMoney(profit, "NGN")}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Margin</span>
            <span className={`font-bold tabular-nums ${margin >= 20 ? "text-success" : margin >= 10 ? "text-warning" : "text-destructive"}`}>{margin.toFixed(1)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SupplierMatching() {
  const insights = [
    { n: 30, cat: "Electronics",       origin: "Guangzhou, CN", action: "Onboard 3 Guangzhou electronics suppliers" },
    { n: 18, cat: "Auto parts",        origin: "Dubai, AE",     action: "Sign Deira auto-parts supplier cluster" },
    { n: 25, cat: "Fashion goods",     origin: "Yiwu, CN",      action: "Bulk supplier partnership for Yiwu fashion" },
    { n: 14, cat: "Industrial machinery", origin: "Istanbul, TR", action: "Acquire Turkey machinery supplier rep" },
    { n: 11, cat: "Pharma & medical",  origin: "Mumbai, IN",    action: "Compliance-vetted India pharma supplier" },
    { n: 9,  cat: "Building materials",origin: "Tema, GH",      action: "Regional supplier for West Africa demand" },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold flex items-center gap-2"><Brain className="h-4 w-4 text-accent" /> Repeated supplier demand across importers</div>
        <div className="text-xs text-muted-foreground mt-1">Categories where multiple importers buy from the same origin — supplier acquisition targets.</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {insights.map(i => (
            <Card key={i.cat} className="p-4 shadow-card">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">{i.cat}</Badge>
                <span className="text-[10px] text-muted-foreground">{i.origin}</span>
              </div>
              <div className="text-2xl font-bold mt-3 tabular-nums">{i.n}</div>
              <div className="text-xs text-muted-foreground">importers buying</div>
              <div className="text-xs mt-3 flex items-start gap-1.5">
                <ChevronRight className="h-3 w-3 mt-0.5 text-accent" />
                <span>{i.action}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => toast.success("Supplier outreach queued")}>
                Queue outreach
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Recommended trade corridors to prioritize</div>
        <div className="space-y-2">
          {[
            { corridor: "CN → NG (Guangzhou ↔ Lagos)", strength: 92 },
            { corridor: "AE → NG (Dubai ↔ Lagos)",      strength: 81 },
            { corridor: "CN → NG (Yiwu ↔ Lagos)",       strength: 88 },
            { corridor: "TR → NG (Istanbul ↔ Lagos)",   strength: 64 },
            { corridor: "IN → NG (Mumbai ↔ Lagos)",     strength: 58 },
          ].map(c => (
            <div key={c.corridor}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{c.corridor}</span>
                <span className="tabular-nums text-muted-foreground">{c.strength}/100</span>
              </div>
              <Progress value={c.strength} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------- Page ----------
function AIGrowth() {
  const [activeLead, setActiveLead] = useState<Lead>(allLeads[0]);

  const kpis = useMemo(() => {
    const hot = allLeads.filter(l => l.status === "Hot Lead").length;
    const pipeline = allLeads.reduce((s, l) => s + l.volume, 0);
    const importers = allLeads.filter(l => l.category === "Importers").length;
    const freight = allLeads.filter(l => l.category === "Freight Forwarders").length;
    const suppliers = allLeads.filter(l => l.category === "Suppliers").length;
    return { hot, pipeline, importers, freight, suppliers };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Brain className="h-3.5 w-3.5" /> Internal Sales Command Center
          </div>
          <h1 className="text-2xl font-semibold mt-1">AI Growth Engine</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Find, score, and convert customers across Canta's products — with AI copilots for sales,
            WhatsApp onboarding, document extraction, landed cost, and supplier matching.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Lead list exported")}>Export leads</Button>
          <Button className="bg-primary" onClick={() => toast.success("New lead added")}>
            <Users className="h-4 w-4 mr-1.5" /> Add lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPI label="Total Leads"        value={String(allLeads.length + 239)}                     icon={Users} />
        <KPI label="Hot Leads"          value={String(kpis.hot)}                                  icon={Flame}        tone="bg-destructive/10 text-destructive" />
        <KPI label="Converted (30d)"    value="32"                                                icon={CheckCircle2} tone="bg-success/10 text-success" />
        <KPI label="Follow-ups Due"     value="14"                                                icon={Clock}        tone="bg-warning/10 text-warning" />
        <KPI label="Revenue Pipeline"   value={`$${(kpis.pipeline/1_000_000).toFixed(2)}M`} sub="Estimated" icon={TrendingUp} />
        <KPI label="Active Importers"   value={String(kpis.importers)}                            icon={Ship} />
        <KPI label="Freight Leads"      value={String(kpis.freight)}                              icon={Truck}        tone="bg-accent/15 text-accent" />
        <KPI label="Supplier Leads"     value={String(kpis.suppliers)}                            icon={Building2}    tone="bg-warning/10 text-warning" />
      </div>

      {/* Category strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map(c => {
          const count = allLeads.filter(l => l.category === c.l).length;
          return (
            <Card key={c.l} className="p-4 shadow-card">
              <div className={`h-8 w-8 rounded-lg grid place-items-center ${c.tone}`}><c.i className="h-4 w-4" /></div>
              <div className="text-sm font-semibold mt-2">{c.l}</div>
              <div className="text-xs text-muted-foreground">{count} active leads</div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="finder" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="finder">Lead Finder</TabsTrigger>
          <TabsTrigger value="scoring">Lead Scoring</TabsTrigger>
          <TabsTrigger value="copilot">AI Sales Copilot</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Onboarding</TabsTrigger>
          <TabsTrigger value="docs">Document Extractor</TabsTrigger>
          <TabsTrigger value="landed">Landed Cost AI</TabsTrigger>
          <TabsTrigger value="matching">Supplier Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="finder">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2"><LeadFinder onPick={setActiveLead} /></div>
            <SalesCopilot lead={activeLead} />
          </div>
        </TabsContent>

        <TabsContent value="scoring"><LeadScoring /></TabsContent>

        <TabsContent value="copilot">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-4 lg:col-span-1 shadow-card">
              <div className="text-sm font-semibold mb-3">Pick a lead</div>
              <div className="space-y-2 max-h-[520px] overflow-y-auto">
                {allLeads.map(l => (
                  <button key={l.id} onClick={() => setActiveLead(l)}
                    className={`w-full text-left p-3 rounded-lg border transition ${activeLead.id === l.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{l.business}</div>
                      <span className={`text-xs font-semibold tabular-nums ${scoreColor(l.score)}`}>{l.score}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{l.category} · {l.corridor}</div>
                  </button>
                ))}
              </div>
            </Card>
            <div className="lg:col-span-2"><SalesCopilot lead={activeLead} /></div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp"><WhatsAppOnboarding /></TabsContent>
        <TabsContent value="docs"><DocumentExtractor /></TabsContent>
        <TabsContent value="landed"><LandedCostAssistant /></TabsContent>
        <TabsContent value="matching"><SupplierMatching /></TabsContent>
      </Tabs>
    </div>
  );
}
