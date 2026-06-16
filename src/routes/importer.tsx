import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { shipments, suppliers, freightInvoices, fmtMoney, type Shipment } from "@/lib/mock";
import { buildWhatsAppUrl, type WhatsAppTemplateKey } from "@/lib/whatsapp";
import { WorkspaceCardsPanel } from "@/components/CardsPanel";
import { WorkspaceWelcome } from "@/components/WorkspaceWelcome";
import {
  MessageCircle, Upload, Sparkles, FileQuestion, Ship, Calendar, Truck, Bell, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowRight, Receipt, Package, Send, Link as LinkIcon, Copy, Lock,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/importer")({
  head: () => ({ meta: [{ title: "Importer Portal — Canta" }] }),
  component: ImporterPortal,
});

// Pretend the logged-in importer is "ABC Electronics"
const ME = "ABC Electronics";

// Helpers
function simpleStatus(s: Shipment): string {
  switch (s.status) {
    case "Booked": return "Your goods are booked with the supplier.";
    case "At Origin": return "Your goods are at the supplier warehouse.";
    case "Loaded": return "Your goods have been loaded into the container.";
    case "On Vessel": return "Your goods are on the vessel.";
    case "Arrived": return "Your goods have arrived at the port.";
    case "Customs": return "Your goods are clearing customs.";
    case "Released": return "Your goods have been released from the port.";
    case "Delivered": return "Your goods have been delivered.";
    case "Delayed": return "Your shipment is delayed — our team is on it.";
  }
}

function daysUntil(eta: string): number {
  return Math.ceil((new Date(eta).getTime() - Date.now()) / 86400000);
}

function etaPhrase(s: Shipment): string {
  const d = daysUntil(s.eta);
  if (d < 0) return `Arrived ${Math.abs(d)} day${Math.abs(d) === 1 ? "" : "s"} ago`;
  if (d === 0) return "Arriving today";
  return `Expected to arrive in ${s.destination.split(",")[0]} in ${d} day${d === 1 ? "" : "s"}`;
}

function nextAction(s: Shipment): { text: string; tone: "primary" | "warn" | "ok" } {
  if (s.status === "Customs") return { text: "Prepare clearing documents", tone: "warn" };
  if (s.status === "Arrived") return { text: "Pay duty so we can release your goods", tone: "warn" };
  if (s.status === "Delayed") return { text: "Wait — we'll send a new ETA on WhatsApp", tone: "warn" };
  if (s.status === "At Origin") return { text: "Confirm payment so supplier can load", tone: "primary" };
  if (s.status === "Delivered" || s.status === "Released") return { text: "Nothing to do — goods delivered", tone: "ok" };
  return { text: "Sit back — we'll update you as your goods move", tone: "primary" };
}

// Demo docs per shipment
const REQUIRED_DOCS = ["Commercial Invoice", "Packing List", "Bill of Lading", "Form M", "SONCAP"];
function docState(s: Shipment) {
  const uploaded = s.documents;
  const missing = REQUIRED_DOCS.filter((d) => !uploaded.includes(d));
  return { uploaded, missing };
}

function ImporterPortal() {
  const mine = shipments.filter((s) => s.importer === ME);
  const inTransit = mine.filter((s) => !["Delivered", "Released"].includes(s.status));
  const soon = mine.filter((s) => {
    const d = daysUntil(s.eta);
    return d >= 0 && d <= 10;
  });
  const missingDocs = mine.reduce((n, s) => n + docState(s).missing.length, 0);
  const outstanding = freightInvoices
    .filter((i) => i.customer === ME && i.status !== "Paid")
    .reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <WorkspaceWelcome workspace="importer_portal" />
      <div>
        <h1 className="text-2xl font-semibold">Welcome back, Tunde 👋</h1>
        <p className="text-sm text-muted-foreground mt-1">Here's a simple view of your goods, suppliers and payments.</p>
      </div>

      {/* KPIs in plain language */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SimpleKpi label="Goods in transit" value={String(inTransit.length)} />
        <SimpleKpi label="Arriving soon" value={String(soon.length)} />
        <SimpleKpi label="Documents missing" value={String(missingDocs)} tone={missingDocs ? "warn" : undefined} />
        <SimpleKpi label="Money you owe" value={outstanding ? fmtMoney(outstanding, "USD") : "$0"} tone={outstanding ? "danger" : undefined} />
      </div>

      {/* WhatsApp-first action bar */}
      <WhatsAppActions />
      <EscrowSection />


      <Tabs defaultValue="shipments">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="shipments">My Shipments</TabsTrigger>
          <TabsTrigger value="documents">My Documents</TabsTrigger>
          <TabsTrigger value="suppliers">My Suppliers</TabsTrigger>
          <TabsTrigger value="landed">My Landed Cost</TabsTrigger>
          <TabsTrigger value="payments">My Payments</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="assistant">Ask Canta</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="mt-6">
          <MyShipments shipments={mine} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <MyDocuments shipments={mine} />
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
          <MySuppliers />
        </TabsContent>
        <TabsContent value="landed" className="mt-6">
          <MyLandedCost shipments={mine} />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <MyPayments />
        </TabsContent>
        <TabsContent value="alerts" className="mt-6">
          <MyAlerts shipments={mine} />
        </TabsContent>
        <TabsContent value="assistant" className="mt-6">
          <Assistant />
        </TabsContent>
      </Tabs>

      <WorkspaceCardsPanel
        title="Importer Cards"
        subtitle="Cards linked to trade files, shipments, supplier samples, inspections, logistics and ad spend."
        categories={["Trade file", "Shipment", "Supplier samples", "Inspection fees", "Business travel", "Logistics tools", "Ad spend"]}
        pendingApprovals={2}
        receiptsMissing={3}
        groupedLabel="trade file"
        groupedSpend={[
          { label: "TR-2031 · Guangzhou Q2", amount: 18_400 },
          { label: "TR-2042 · Yiwu Fashion", amount: 9_120 },
          { label: "TR-2055 · Dubai Spares",  amount: 5_200 },
        ]}
        cards={[
          { id: "I1", label: "Guangzhou Sourcing", holder: "Tunde B.", last4: "6601", status: "Active", monthlySpend: 4200, limit: 8000,  category: "Supplier samples", linked: "TR-2031" },
          { id: "I2", label: "QC Inspections",     holder: "Aisha B.", last4: "9912", status: "Active", monthlySpend: 1850, limit: 5000,  category: "Inspection fees", linked: "TR-2031" },
          { id: "I3", label: "Shipment SH-9012",   holder: "Ops Team", last4: "4471", status: "Active", monthlySpend: 6200, limit: 12000, category: "Logistics",       linked: "Shenzhen → Lagos" },
          { id: "I4", label: "Buyer Travel",       holder: "Adaeze O.",last4: "3326", status: "Active", monthlySpend: 2400, limit: 6000,  category: "Travel",          linked: "Trip: Yiwu" },
          { id: "I5", label: "Meta Ads — Store",   holder: "Marketing",last4: "1158", status: "Active", monthlySpend: 3100, limit: 5000,  category: "Ads",             linked: "Campaign: ABC-Q2" },
          { id: "I6", label: "Logistics SaaS",     holder: "Ops Team", last4: "2204", status: "Frozen", monthlySpend: 480,  limit: 1500,  category: "SaaS" },
        ]}
      />
    </div>
  );
}

function SimpleKpi({ label, value, tone }: { label: string; value: string; tone?: "warn" | "danger" }) {
  const cls = tone === "danger" ? "text-destructive" : tone === "warn" ? "text-amber-600" : "";
  return (
    <Card className="p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-2xl font-semibold mt-2 ${cls}`}>{value}</div>
    </Card>
  );
}

function WhatsAppActions() {
  const actions: { i: any; l: string; tpl: WhatsAppTemplateKey }[] = [
    { i: Upload,        l: "Send invoice on WhatsApp",      tpl: "sendInvoice" },
    { i: Upload,        l: "Upload shipment document",      tpl: "sendInvoice" },
    { i: FileQuestion,  l: "Request landed cost estimate",  tpl: "landedCost" },
    { i: ShieldCheck,   l: "Request supplier verification", tpl: "verifySupplier" },
    { i: Bell,          l: "Request shipment update",       tpl: "trackShipment" },
    { i: Sparkles,      l: "Ask Canta Assistant",           tpl: "general" },
  ];
  return (
    <Card className="p-5 shadow-card border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4 text-accent" /> WhatsApp Import Desk
      </div>
      <p className="text-sm text-muted-foreground mt-2">Don't worry about forms — just send us a message and we'll handle the rest.</p>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {actions.map((a) => (
          <Button asChild key={a.l} variant="outline" className="justify-start h-auto py-3 hover:border-[#25D366] hover:bg-[#25D366]/10 hover:text-foreground transition">
            <a href={buildWhatsAppUrl(a.tpl)} target="_blank" rel="noopener noreferrer">
              <a.i className="h-4 w-4 mr-2 shrink-0 text-[#25D366]" /><span className="text-xs text-left">{a.l}</span>
            </a>
          </Button>
        ))}
      </div>
    </Card>
  );
}

function MyShipments({ shipments: list }: { shipments: Shipment[] }) {
  if (list.length === 0) return <Empty msg="You don't have any shipments yet." />;
  const FX = 1612;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map((s) => {
        const docs = docState(s);
        const next = nextAction(s);
        const invoice = freightInvoices.find((i) => i.shipment === s.id);
        const goodsUSD = s.value;
        const freightUSD = Math.round(goodsUSD * 0.08);
        const dutyUSD = Math.round(goodsUSD * 0.15);
        const clearingUSD = Math.round(goodsUSD * 0.04);
        const totalUSD = goodsUSD + freightUSD + dutyUSD + clearingUSD;
        const totalNGN = totalUSD * FX;
        const expectedSale = Math.round(totalNGN * 1.28);
        const profit = expectedSale - totalNGN;
        const missing = docs.missing.length;
        return (
          <Card key={s.id} className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{s.shipmentNumber}</div>
                <div className="font-semibold mt-0.5 truncate">{s.name}</div>
              </div>
              <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-secondary/40 text-sm">
              <Ship className="h-3.5 w-3.5 inline mr-1 text-primary" /> {simpleStatus(s)}
            </div>
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> {etaPhrase(s)}
            </div>

            {/* PROMINENT LANDED COST */}
            <div className="mt-4 p-4 rounded-xl border-2 border-accent/30 bg-gradient-to-br from-accent/10 via-transparent to-primary/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <Sparkles className="h-3.5 w-3.5" /> Know your real cost before your goods arrive
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Landed cost</div>
                  <div className="text-base font-semibold tabular-nums mt-0.5">{fmtMoney(totalNGN, "NGN")}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Expected sale</div>
                  <div className="text-base font-semibold tabular-nums mt-0.5">{fmtMoney(expectedSale, "NGN")}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Expected profit</div>
                  <div className="text-base font-semibold tabular-nums mt-0.5 text-success">{fmtMoney(profit, "NGN")}</div>
                </div>
              </div>
              {missing > 0 && (
                <div className="mt-3 flex items-start gap-2 text-[11px] text-amber-700">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Missing cost items: {docs.missing.slice(0, 2).join(", ")}{missing > 2 ? ` +${missing - 2} more` : ""}. Add them for an accurate estimate.</span>
                </div>
              )}
              {s.status === "Delayed" && (
                <div className="mt-2 flex items-start gap-2 text-[11px] text-destructive">
                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>Risk warning: delay may increase demurrage and FX exposure.</span>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Row label="Goods" value={s.category} />
              <Row label="Supplier" value={s.supplier} />
              <Row label="Forwarder" value={s.forwarder} />
              <Row label="Last update" value="2 hours ago" />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {docs.uploaded.slice(0, 3).map((d) => (
                <Badge key={d} variant="outline" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1 text-success" /> {d}</Badge>
              ))}
              {docs.missing.slice(0, 2).map((d) => (
                <Badge key={d} variant="outline" className="text-[10px] border-amber-500/30 text-amber-700"><AlertCircle className="h-3 w-3 mr-1" /> {d} missing</Badge>
              ))}
            </div>

            {invoice && (
              <div className="mt-3 text-xs flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Freight payment: </span>
                <span className={invoice.status === "Paid" ? "text-success font-medium" : "text-amber-600 font-medium"}>
                  {invoice.status === "Paid" ? "Settled" : `${fmtMoney(invoice.amount, invoice.ccy)} pending`}
                </span>
              </div>
            )}

            <div className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
              next.tone === "warn" ? "bg-amber-500/10 text-amber-800"
              : next.tone === "ok" ? "bg-success/10 text-success"
              : "bg-primary/10 text-primary"}`}>
              <ArrowRight className="h-4 w-4 mt-0.5 shrink-0" /> <span><strong>Next step:</strong> {next.text}</span>
            </div>

            <div className="mt-4 flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => toast.success("Asked for landed cost")}>Ask for landed cost</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Asked for update")}>Request update</Button>
              <ShareLinkButton shipment={s} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}


function ShareLinkButton({ shipment }: { shipment: Shipment }) {
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/track/${shipment.id}` : `/track/${shipment.id}`;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="ghost"><LinkIcon className="h-3.5 w-3.5 mr-1" /> Tracking link</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Share tracking link</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">Anyone with this link can see the status of {shipment.shipmentNumber}. No login needed.</p>
        <div className="flex gap-2">
          <Input value={url} readOnly className="font-mono text-xs" />
          <Button onClick={() => { navigator.clipboard?.writeText(url); toast.success("Link copied"); }}><Copy className="h-3.5 w-3.5" /></Button>
        </div>
        <DialogFooter>
          <Link to="/track/$id" params={{ id: shipment.id }} target="_blank" className="text-sm text-primary underline">Open tracking page</Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><span className="text-muted-foreground">{label}:</span> <span className="truncate">{value}</span></div>;
}

function MyDocuments({ shipments: list }: { shipments: Shipment[] }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Shipment</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3">Missing</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr></thead>
          <tbody>
            {list.map((s) => {
              const d = docState(s);
              return (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-3"><div className="font-medium">{s.shipmentNumber}</div><div className="text-xs text-muted-foreground truncate max-w-[200px]">{s.name}</div></td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{d.uploaded.map((x) => <Badge key={x} variant="outline" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1 text-success" />{x}</Badge>)}</div></td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{d.missing.length ? d.missing.map((x) => <Badge key={x} variant="outline" className="text-[10px] border-amber-500/30 text-amber-700">{x}</Badge>) : <span className="text-xs text-success">All complete ✓</span>}</div></td>
                  <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => toast.success("Upload document")}><Upload className="h-3.5 w-3.5 mr-1" /> Upload</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MySuppliers() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((s) => (
        <Card key={s.name} className="p-4 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.country} · {s.category}</div>
            </div>
            {s.verified
              ? <Badge variant="outline" className="text-[10px] border-success/30 text-success"><ShieldCheck className="h-3 w-3 mr-1" /> Verified</Badge>
              : <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700">Unverified</Badge>}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{s.invoices} invoices on file</div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => toast.success("Verification requested")}>Verify supplier</Button>
            <Button size="sm" variant="ghost" onClick={() => toast.success("Message sent")}><MessageCircle className="h-3.5 w-3.5 mr-1" /> Message</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MyLandedCost({ shipments: list }: { shipments: Shipment[] }) {
  const FX = 1612;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {list.map((s) => {
        const goodsUSD = s.value;
        const freightUSD = Math.round(goodsUSD * 0.08);
        const dutyUSD = Math.round(goodsUSD * 0.15);
        const clearingUSD = Math.round(goodsUSD * 0.04);
        const totalUSD = goodsUSD + freightUSD + dutyUSD + clearingUSD;
        const totalNGN = totalUSD * FX;
        const expectedSale = Math.round(totalNGN * 1.28);
        const profit = expectedSale - totalNGN;
        return (
          <Card key={s.id} className="p-5 shadow-card">
            <div className="text-xs text-muted-foreground">{s.shipmentNumber}</div>
            <div className="font-semibold">{s.name}</div>
            <div className="mt-3 space-y-1.5 text-sm">
              <LR l="Goods cost" r={fmtMoney(goodsUSD, "USD")} />
              <LR l="Freight" r={fmtMoney(freightUSD, "USD")} />
              <LR l="Duty estimate" r={fmtMoney(dutyUSD, "USD")} />
              <LR l="Clearing & port" r={fmtMoney(clearingUSD, "USD")} />
              <div className="border-t border-border pt-2 mt-2">
                <LR l="Total landed cost" r={fmtMoney(totalUSD, "USD")} bold />
                <div className="text-xs text-muted-foreground text-right mt-0.5">≈ {fmtMoney(totalNGN, "NGN")} (FX {FX})</div>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-success/10 text-sm">
              <div className="text-success font-medium">Your estimated landed cost is {fmtMoney(totalNGN, "NGN")}.</div>
              <div className="text-success/90 mt-1">Your expected profit is <strong>{fmtMoney(profit, "NGN")}</strong> at a 28% markup.</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function LR({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{l}</span><span className={`tabular-nums ${bold ? "font-semibold" : ""}`}>{r}</span></div>;
}

function MyPayments() {
  const mine = freightInvoices.filter((i) => i.customer === ME);
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground bg-secondary/40">
            <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Shipment</th>
            <th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th>
          </tr></thead>
          <tbody>
            {mine.map((i) => (
              <tr key={i.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{i.shipment}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmtMoney(i.amount, i.ccy)}</td>
                <td className="px-4 py-3 text-xs">{i.due}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{i.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  {i.status === "Paid"
                    ? <span className="text-xs text-success">✓ Settled</span>
                    : <Button size="sm" className="bg-primary" onClick={() => toast.success("Pay screen opened")}>Pay now</Button>}
                </td>
              </tr>
            ))}
            {mine.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">You have no invoices yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MyAlerts({ shipments: list }: { shipments: Shipment[] }) {
  const items: { tone: string; icon: typeof Bell; text: string }[] = [];
  list.forEach((s) => {
    const d = docState(s);
    if (d.missing.length) items.push({ tone: "bg-amber-500/10 text-amber-800 border-amber-500/20", icon: AlertCircle, text: `${d.missing[0]} is missing for ${s.shipmentNumber}.` });
    if (s.status === "Customs") items.push({ tone: "bg-orange-500/10 text-orange-800 border-orange-500/20", icon: Package, text: `Prepare clearing documents for ${s.shipmentNumber}.` });
    if (s.status === "Delayed") items.push({ tone: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle, text: `${s.shipmentNumber} is delayed — we're confirming the new ETA.` });
    if (daysUntil(s.eta) >= 0 && daysUntil(s.eta) <= 7) items.push({ tone: "bg-primary/10 text-primary border-primary/20", icon: Truck, text: `${s.shipmentNumber} arriving in ${daysUntil(s.eta)} day${daysUntil(s.eta) === 1 ? "" : "s"}.` });
  });
  const invs = freightInvoices.filter((i) => i.customer === ME && i.status !== "Paid");
  invs.forEach((i) => items.push({ tone: "bg-amber-500/10 text-amber-800 border-amber-500/20", icon: Receipt, text: `Freight payment of ${fmtMoney(i.amount, i.ccy)} is pending for ${i.shipment}.` }));

  if (items.length === 0) return <Empty msg="No alerts — you're all caught up." />;
  return (
    <div className="space-y-2">
      {items.map((a, i) => (
        <Card key={i} className={`p-4 border ${a.tone} flex items-start gap-3 shadow-card`}>
          <a.icon className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="text-sm">{a.text}</div>
        </Card>
      ))}
    </div>
  );
}

function Assistant() {
  const [msgs, setMsgs] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi! I'm Canta Assistant. Ask me anything about your shipments, documents, landed cost, or payments — in simple English or pidgin." },
  ]);
  const [input, setInput] = useState("");
  const quick = [
    "Where are my goods?",
    "How much is my landed cost?",
    "What documents am I missing?",
    "When will my container arrive?",
  ];
  const send = (text: string) => {
    if (!text.trim()) return;
    const reply = text.toLowerCase().includes("landed")
      ? "Your landed cost for SHP-10421 is about ₦389,000,000 including freight, duty and clearing. Open the Landed Cost tab for a breakdown."
      : text.toLowerCase().includes("document")
      ? "You're missing the Packing List and SONCAP for SHP-10421. Tap Upload on the Documents tab or send them on WhatsApp."
      : text.toLowerCase().includes("when") || text.toLowerCase().includes("arrive")
      ? "Your container (SHP-10421) is on vessel and expected in Apapa in about 7 days."
      : "Your goods are on the vessel and expected in Lagos in about 7 days. I'll send a WhatsApp update when they arrive.";
    setMsgs((m) => [...m, { role: "user", text }, { role: "bot", text: reply }]);
    setInput("");
  };
  return (
    <Card className="p-5 shadow-card">
      <div className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Canta Assistant</div>
      <div className="mt-4 space-y-3 max-h-[360px] overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
            <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {quick.map((q) => <Button key={q} size="sm" variant="outline" onClick={() => send(q)} className="text-xs">{q}</Button>)}
      </div>
      <div className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Type your question…" />
        <Button onClick={() => send(input)} className="bg-primary"><Send className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}

function Empty({ msg }: { msg: string }) {
  return <Card className="p-12 text-center text-sm text-muted-foreground shadow-card">{msg}</Card>;
}
