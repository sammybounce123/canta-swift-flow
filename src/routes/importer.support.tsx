import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LifeBuoy, MessageCircle, Mail, Ticket, Send, Wallet, RefreshCw, Banknote, Upload, Ship, Receipt, ShieldCheck } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";
import { CANTA_WHATSAPP_NUMBER, WHATSAPP_SUPPORT_CONFIGURED } from "@/lib/whatsapp";
import { createTicket, listTickets, subscribeSupport, type SupportTicket, type IssueType } from "@/lib/support-store";
import { useImporter } from "@/lib/importer-store";

export const Route = createFileRoute("/importer/support")({
  head: () => ({
    meta: [
      { title: "Importer Support — Canta" },
      { name: "description", content: "Help with supplier payments, funding, FX quotes, documents, BL uploads, shipment tracking, receipts and WhatsApp updates." },
      { property: "og:title", content: "Importer Support — Canta" },
      { property: "og:description", content: "Help with supplier payments, funding, FX quotes, documents, BL uploads, shipment tracking, receipts and WhatsApp updates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ImporterSupportPage,
});

type Topic = {
  key: string;
  title: string;
  desc: string;
  icon: typeof Wallet;
  issueType: IssueType;
};

const TOPICS: Topic[] = [
  { key: "payment", title: "Supplier payment issue", desc: "A payment is stuck, delayed or sent with the wrong details.", icon: Send, issueType: "Payment issue" },
  { key: "funding", title: "Wallet funding issue", desc: "You funded your balance but it has not been credited yet.", icon: Wallet, issueType: "Funding mismatch" },
  { key: "fx", title: "FX quote expired", desc: "Your rate expired before you accepted it and you need a new quote.", icon: RefreshCw, issueType: "Payment issue" },
  { key: "bank", title: "Supplier bank details correction", desc: "Correct a supplier account number, SWIFT code or bank name.", icon: Banknote, issueType: "Payment issue" },
  { key: "upload", title: "Upload invoice or BL", desc: "You cannot upload an invoice, packing list or Bill of Lading.", icon: Upload, issueType: "Technical issue" },
  { key: "shipment", title: "Shipment tracking / WhatsApp bot", desc: "Tracking is not updating or the WhatsApp bot is not replying.", icon: Ship, issueType: "Shipment issue" },
  { key: "receipt", title: "Receipt or settlement confirmation", desc: "You need proof of payment or confirmation the supplier was paid.", icon: Receipt, issueType: "Payment issue" },
  { key: "compliance", title: "Compliance review / missing documents", desc: "Your payment is under review or a document was requested.", icon: ShieldCheck, issueType: "KYC/KYB issue" },
];

const WORKSPACE = "Importer";

function useImporterTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  useEffect(() => {
    const sync = () => setTickets(listTickets(WORKSPACE));
    sync();
    return subscribeSupport(sync);
  }, []);
  return tickets;
}

function ImporterSupportPage() {
  const s = useImporter();
  const tickets = useImporterTickets();
  const [openTopic, setOpenTopic] = useState<Topic | null>(null);

  const openCount = tickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed").length;

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Support tickets created here are illustrative and stay inside this demo." />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-primary" /> Importer Support
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Get help with supplier payments, funding, FX quotes, documents, BL uploads, shipment tracking, receipts, and WhatsApp updates.
        </p>
      </header>

      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          <TicketDialog
            topic={openTopic}
            onOpenChange={(v) => { if (!v) setOpenTopic(null); }}
            business={s.business}
            trigger={<Button><Ticket className="h-4 w-4" /> Create support ticket</Button>}
          />
          <Button variant="outline" asChild>
            <a href="mailto:support@canta.demo?subject=Importer%20support%20request">
              <Mail className="h-4 w-4" /> Contact Canta support
            </a>
          </Button>
          {WHATSAPP_SUPPORT_CONFIGURED ? (
            <Button
              variant="outline"
              onClick={() => window.open(`https://wa.me/${CANTA_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Canta support, I need help with my supplier payment.")}`, "_blank", "noopener")}
            >
              <MessageCircle className="h-4 w-4" /> Open WhatsApp support
            </Button>
          ) : (
            <span className="text-xs rounded-md border border-border bg-muted/40 px-3 py-2 text-muted-foreground">
              WhatsApp support number not configured in demo.
            </span>
          )}
          <Button variant="ghost" asChild className="sm:ml-auto">
            <a href="#previous-tickets">View previous tickets{openCount ? ` (${openCount} open)` : ""}</a>
          </Button>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">What do you need help with?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {TOPICS.map((t) => (
            <Card key={t.key} className="p-4 shadow-card flex flex-col gap-2">
              <t.icon className="h-4 w-4 text-primary" />
              <div className="font-medium text-sm">{t.title}</div>
              <p className="text-xs text-muted-foreground flex-1">{t.desc}</p>
              <Button size="sm" variant="outline" className="mt-1 w-full" onClick={() => setOpenTopic(t)}>
                Get help
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section id="previous-tickets" className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Previous tickets</h2>
        <div className="space-y-2">
          {tickets.map((t) => (
            <Card key={t.id} className="p-3 shadow-card flex flex-wrap items-center gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{t.ref} · {t.issueType}</div>
                <div className="text-xs text-muted-foreground">
                  Opened {t.createdAt}{t.linkedRef ? ` · linked to ${t.linkedRef}` : ""}
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] ml-auto">{t.status}</Badge>
            </Card>
          ))}
          {tickets.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-10">No support tickets yet.</div>
          )}
        </div>
      </section>

      <Card className="p-4 shadow-card text-xs text-muted-foreground">
        Quick links:{" "}
        <Link to="/importer/payments" className="text-primary underline">Payments</Link> ·{" "}
        <Link to="/importer/shipments" className="text-primary underline">Shipments</Link> ·{" "}
        <Link to="/importer/documents" className="text-primary underline">Documents</Link> ·{" "}
        <Link to="/importer/balance" className="text-primary underline">Balance</Link>
      </Card>
    </div>
  );
}

function TicketDialog({
  topic,
  onOpenChange,
  business,
  trigger,
}: {
  topic: Topic | null;
  onOpenChange: (v: boolean) => void;
  business: { name: string; contact: string };
  trigger: React.ReactNode;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>("Payment issue");
  const [linkedRef, setLinkedRef] = useState("");
  const [message, setMessage] = useState("");

  const open = manualOpen || topic !== null;

  useEffect(() => {
    if (topic) {
      setIssueType(topic.issueType);
      setMessage(`${topic.title}: `);
    }
  }, [topic]);

  function close(v: boolean) {
    setManualOpen(v);
    onOpenChange(v);
    if (!v) { setLinkedRef(""); setMessage(""); }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogTrigger asChild onClick={() => setManualOpen(true)}>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{topic ? topic.title : "Create support ticket"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Issue type</Label>
            <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(["Payment issue", "Funding mismatch", "Shipment issue", "KYC/KYB issue", "Technical issue", "General enquiry"] as IssueType[]).map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment or shipment reference (optional)</Label>
            <Input value={linkedRef} onChange={(e) => setLinkedRef(e.target.value)} placeholder="e.g. SP-2026-0140 or MSCUNG2291" />
          </div>
          <div className="space-y-1.5">
            <Label>Describe the issue</Label>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what happened so we can help faster." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => close(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const t = createTicket({
                customer: business.contact,
                organization: business.name,
                workspace: WORKSPACE,
                linkedRef: linkedRef || undefined,
                priority: "Normal",
                assigned: "Canta Support",
                issueType,
                firstMessage: message || undefined,
              });
              toast.success(`Ticket ${t.ref} created`, { description: "Canta support will reply in this demo workspace." });
              close(false);
            }}
          >
            Submit ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
