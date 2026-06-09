import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { whatsappThreads } from "@/lib/mock";
import { MessageCircle, Send, Sparkles, FileText, Bell, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp Desk — Canta" }] }),
  component: WhatsAppDesk,
});

const templates = [
  { i: Bell, l: "Shipment added", t: "Your shipment has been added to Canta Import Desk." },
  { i: Calendar, l: "ETA update", t: "Your goods are expected to arrive in Lagos on {date}." },
  { i: FileText, l: "Missing document", t: "Packing list is missing. Please upload before arrival." },
  { i: DollarSign, l: "Landed cost", t: "Your estimated landed cost is {amount}." },
  { i: DollarSign, l: "Payment status", t: "Supplier payment marked as {status}." },
  { i: Bell, l: "Arrival readiness", t: "Your shipment is arriving soon. Prepare clearing documents." },
];

function WhatsAppDesk() {
  const [active, setActive] = useState(whatsappThreads[0].id);
  const thread = whatsappThreads.find((t) => t.id === active)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2"><MessageCircle className="h-6 w-6 text-success" /> WhatsApp Import Desk</h1>
        <p className="text-sm text-muted-foreground mt-1">Importers send documents on WhatsApp. AI extracts and creates trade files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 p-2 shadow-card max-h-[640px] overflow-y-auto">
          {whatsappThreads.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)} className={`w-full text-left p-3 rounded-lg ${active === t.id ? "bg-primary/5 border border-primary" : "hover:bg-secondary"}`}>
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{t.from}</div>
                {t.unread > 0 && <span className="h-5 w-5 rounded-full bg-success text-white text-[10px] grid place-items-center">{t.unread}</span>}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-0.5">{t.last}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{t.time}</div>
            </button>
          ))}
        </Card>

        <Card className="lg:col-span-2 p-0 shadow-card flex flex-col h-[640px] overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">{thread.from}</div>
              <div className="text-[11px] text-muted-foreground">Online</div>
            </div>
            <Badge className="bg-accent/15 text-accent-foreground border-accent/30"><Sparkles className="h-3 w-3 mr-1" /> AI-assisted</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
            <Msg from="them">Hi, I sent the BL for my Guangzhou shipment.</Msg>
            <Msg from="ai">📎 BL extracted — Container MSCU7762213, Vessel MSC ANTONIA. Created Trade File <span className="font-mono">TF-2026-0214</span>.</Msg>
            <Msg from="us">Confirmed. Your shipment is on vessel, ETA Lagos 18 June.</Msg>
            <Msg from="them">When should I prepare clearing money?</Msg>
            <Msg from="ai">Estimated clearing for SHP-10421 is <b>₦8.4M</b> (duty + clearing + delivery). Recommend preparing 5 days before ETA.</Msg>
          </div>
          <div className="p-3 border-t border-border flex gap-2 items-center">
            <input placeholder="Type a message…" className="flex-1 bg-secondary/60 rounded-lg px-3 py-2 text-sm outline-none" />
            <Button size="sm" className="bg-success text-white hover:bg-success/90" onClick={() => toast.success("Sent")}><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Message templates</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <button key={t.l} onClick={() => toast.success(`${t.l} template inserted`)} className="text-left p-4 rounded-xl border border-border hover:border-accent hover:shadow-card transition">
              <div className="flex items-center gap-2">
                <t.i className="h-4 w-4 text-accent" />
                <div className="text-sm font-semibold">{t.l}</div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">{t.t}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Msg({ from, children }: { from: "us" | "them" | "ai"; children: React.ReactNode }) {
  const cls = from === "us" ? "ml-auto bg-success text-white" : from === "ai" ? "bg-accent/15 text-foreground border border-accent/30" : "bg-card border border-border";
  return <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
