import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MessageCircle, Send, Upload, Bell, FileText, Ship, DollarSign,
  LifeBuoy, Paperclip, Plus, FilePlus2, Link2,
} from "lucide-react";
import { toast } from "sonner";
import { useRequireWorkspace, useActiveWorkspace } from "@/lib/workspace-guard";
import { openWhatsApp } from "@/lib/whatsapp";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp Updates — Canta" }] }),
  component: WhatsAppCustomer,
});

type Convo = {
  id: string;
  with: string;
  kind: "Shipment" | "Trade File" | "Missing Document" | "Support" | "Payment";
  linked?: string;
  last: string;
  time: string;
  status: "Active" | "Awaiting reply" | "Resolved";
};

const SEED_BY_WS: Record<string, Convo[]> = {
  importer_portal: [
    { id: "C-01", with: "Shenzhen LedTech", kind: "Trade File", linked: "TF-2026-0214", last: "Proforma invoice received — please confirm.", time: "12m ago", status: "Awaiting reply" },
    { id: "C-02", with: "Canta Support", kind: "Shipment", linked: "SHP-10421", last: "BL uploaded. Vessel ETA 18 Jun.", time: "1h ago", status: "Active" },
    { id: "C-03", with: "Yiwu PolyPack", kind: "Missing Document", linked: "TF-2026-0208", last: "Reminder: packing list still missing.", time: "Yesterday", status: "Awaiting reply" },
  ],
  freight_workspace: [
    { id: "C-01", with: "ABC Electronics", kind: "Shipment", linked: "SHP-10421", last: "ETA update sent to customer.", time: "20m ago", status: "Active" },
    { id: "C-02", with: "Balogun Trade", kind: "Missing Document", linked: "SHP-10388", last: "Awaiting Form M from customer.", time: "2h ago", status: "Awaiting reply" },
    { id: "C-03", with: "Dav Excel", kind: "Payment", linked: "INV-FF-2204", last: "Invoice paid. Receipt issued.", time: "Yesterday", status: "Resolved" },
  ],
  global_collections: [
    { id: "C-01", with: "Lagos Med Clinic", kind: "Payment", linked: "INV-2034", last: "Payment link delivered.", time: "30m ago", status: "Active" },
    { id: "C-02", with: "Cambridge Int'l", kind: "Support", linked: "SUP-9008", last: "Need help reconciling payment.", time: "3h ago", status: "Awaiting reply" },
  ],
  supplier_dashboard: [
    { id: "C-01", with: "ABC Electronics", kind: "Payment", linked: "INV-2030", last: "Buyer requested escrow release.", time: "1h ago", status: "Awaiting reply" },
    { id: "C-02", with: "Trade Fair Imports", kind: "Trade File", linked: "TF-2026-0199", last: "Shipment delivered. Thanks.", time: "Yesterday", status: "Resolved" },
  ],
  enterprise_treasury: [
    { id: "C-01", with: "Canta Support", kind: "Support", linked: "SUP-9101", last: "FX rate confirmation requested.", time: "45m ago", status: "Active" },
  ],
  global_spend_cards: [
    { id: "C-01", with: "Canta Support", kind: "Support", linked: "SUP-9202", last: "Card declined at merchant — investigating.", time: "10m ago", status: "Awaiting reply" },
  ],
  partner_property: [
    { id: "C-01", with: "Quinn Solicitors", kind: "Payment", linked: "BC-2026-1001", last: "Solicitor confirmed receipt of funds.", time: "1h ago", status: "Resolved" },
  ],
};

function WhatsAppCustomer() {
  useRequireWorkspace();
  const ws = useActiveWorkspace();
  const seed = SEED_BY_WS[ws.workspace] ?? SEED_BY_WS.enterprise_treasury;
  const [convos, setConvos] = useState<Convo[]>(seed);
  const [active, setActive] = useState<string>(seed[0]?.id ?? "");
  const [reply, setReply] = useState("");

  useEffect(() => { setConvos(seed); setActive(seed[0]?.id ?? ""); }, [ws.workspace]);

  const current = convos.find((c) => c.id === active);

  const statusTone = (s: Convo["status"]) =>
    s === "Active" ? "bg-primary/10 text-primary border-primary/30"
    : s === "Awaiting reply" ? "bg-warning/15 text-warning border-warning/30"
    : "bg-success/15 text-success border-success/30";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <span className="h-9 w-9 grid place-items-center rounded-xl bg-success/15 text-success"><MessageCircle className="h-5 w-5" /></span>
            WhatsApp Updates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your WhatsApp conversations with suppliers, customers and Canta — all in one place.
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant="outline" className="text-xs">{ws.badge}</Badge>
            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">{ws.name} · {ws.title}</Badge>
            <Badge variant="secondary" className="text-xs">{ws.workspaceLabel}</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => openWhatsApp("general")}>
            <MessageCircle className="h-4 w-4 mr-1.5" /> Message Canta
          </Button>
          <Button size="sm" onClick={() => toast.success("Opening new conversation…")}>
            <Plus className="h-4 w-4 mr-1.5" /> New conversation
          </Button>
        </div>
      </div>

      {/* Quick customer-facing actions */}
      <Card className="p-4 shadow-card">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Quick actions</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <Button size="sm" variant="outline" asChild className="justify-start"><Link to="/trade-desk"><FilePlus2 className="h-3.5 w-3.5 mr-1.5" /> Create Trade File</Link></Button>
          <Button size="sm" variant="outline" className="justify-start" onClick={() => toast.success("Upload dialog opened")}><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Document</Button>
          <Button size="sm" variant="outline" className="justify-start" onClick={() => openWhatsApp("missingDocumentReminder")}><Bell className="h-3.5 w-3.5 mr-1.5" /> Request Missing Document</Button>
          <Button size="sm" variant="outline" className="justify-start" onClick={() => openWhatsApp("trackShipment")}><Ship className="h-3.5 w-3.5 mr-1.5" /> Request Shipment Update</Button>
          <Button size="sm" variant="outline" className="justify-start" onClick={() => { setReply(""); toast.success("Reply box focused"); }}><Send className="h-3.5 w-3.5 mr-1.5" /> Send Reply</Button>
          <Button size="sm" variant="outline" asChild className="justify-start"><Link to="/support"><LifeBuoy className="h-3.5 w-3.5 mr-1.5" /> Contact Support</Link></Button>
          <Button size="sm" variant="outline" asChild className="justify-start"><Link to="/shipments"><Link2 className="h-3.5 w-3.5 mr-1.5" /> Link to Shipment</Link></Button>
          <Button size="sm" variant="outline" className="justify-start" onClick={() => openWhatsApp("landedCost")}><DollarSign className="h-3.5 w-3.5 mr-1.5" /> Request Landed Cost</Button>
        </div>
      </Card>


      <Tabs defaultValue="all" className="space-y-3">
        <TabsList>
          <TabsTrigger value="all">My WhatsApp Updates</TabsTrigger>
          <TabsTrigger value="ship">Shipment Conversations</TabsTrigger>
          <TabsTrigger value="trade">Trade File Conversations</TabsTrigger>
          <TabsTrigger value="docs">Missing Document Requests</TabsTrigger>
        </TabsList>

        {(["all", "ship", "trade", "docs"] as const).map((tab) => {
          const list = convos.filter((c) =>
            tab === "all" ? true :
            tab === "ship" ? c.kind === "Shipment" :
            tab === "trade" ? c.kind === "Trade File" :
            c.kind === "Missing Document"
          );
          return (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1 p-2 shadow-card max-h-[600px] overflow-y-auto">
                  {list.length === 0 && <div className="p-6 text-sm text-muted-foreground text-center">No conversations.</div>}
                  {list.map((c) => (
                    <button key={c.id} onClick={() => setActive(c.id)} className={`w-full text-left p-3 rounded-lg ${active === c.id ? "bg-primary/5 border border-primary" : "hover:bg-secondary"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm truncate">{c.with}</div>
                        <span className="text-[10px] text-muted-foreground">{c.time}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{c.kind}{c.linked ? ` · ${c.linked}` : ""}</div>
                      <div className="text-xs text-muted-foreground truncate mt-1">{c.last}</div>
                      <div className="mt-2"><Badge variant="outline" className={`text-[10px] ${statusTone(c.status)}`}>{c.status}</Badge></div>
                    </button>
                  ))}
                </Card>

                <Card className="lg:col-span-2 p-0 shadow-card flex flex-col h-[600px] overflow-hidden">
                  {current ? (
                    <>
                      <div className="p-4 border-b border-border">
                        <div className="font-semibold text-sm">{current.with}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{current.kind}</span>
                          {current.linked && <Badge variant="outline" className="text-[10px]">{current.linked}</Badge>}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/20">
                        <div className="bg-card border border-border rounded-2xl px-3 py-2 text-sm max-w-[78%]">{current.last}</div>
                        <div className="ml-auto bg-success text-white rounded-2xl px-3 py-2 text-sm max-w-[78%]">Thanks — we'll get back to you shortly.</div>
                      </div>
                      <div className="p-3 border-t border-border space-y-2">
                        <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" className="min-h-[60px]" />
                        <div className="flex justify-between items-center">
                          <Button size="sm" variant="ghost"><Paperclip className="h-3.5 w-3.5 mr-1" /> Attach</Button>
                          <Button size="sm" onClick={() => { if (!reply.trim()) return toast.error("Type a reply"); setReply(""); toast.success("Reply sent"); }}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Send
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 grid place-items-center text-sm text-muted-foreground">Select a conversation</div>
                  )}
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
