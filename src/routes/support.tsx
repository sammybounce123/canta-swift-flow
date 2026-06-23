import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  LifeBuoy, Plus, MessageCircle, AlertTriangle, CheckCircle2, XCircle, UserCog, Reply, Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  listTickets, createTicket, updateTicketStatus, assignTicket, appendMessage, getTicket,
  subscribeSupport, TICKET_STATUSES, ISSUE_TYPES, type TicketStatus, type IssueType,
  type SupportTicket,
} from "@/lib/support-store";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — Canta" }] }),
  component: SupportPage,
});

const ASSIGNEES = ["Canta Ops", "Compliance", "Treasury", "Trade Desk", "Daniel Whitfield", "Ada Lovell"];

function SupportPage() {
  const [, force] = useState(0);
  useEffect(() => subscribeSupport(() => force((n) => n + 1)), []);
  const tickets = listTickets();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => (openId ? getTicket(openId) ?? null : null), [openId, tickets]);

  const filtered = statusFilter === "All" ? tickets : tickets.filter((t) => t.status === statusFilter);

  const tone = (s: TicketStatus) => ({
    "Open": "bg-primary/15 text-primary border-primary/30",
    "Waiting on Customer": "bg-accent/15 text-accent border-accent/30",
    "Waiting on Canta": "bg-warning/15 text-warning border-warning/30",
    "Escalated": "bg-destructive/15 text-destructive border-destructive/30",
    "Resolved": "bg-success/15 text-success border-success/30",
    "Closed": "bg-muted text-muted-foreground border-border",
  }[s]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-primary" /> Support tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Customer & partner support across every Canta workspace.</p>
        </div>
        <NewTicketDialog />
      </div>

      <Card className="p-3 shadow-card flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Filter:</span>
        {(["All", ...TICKET_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s as TicketStatus | "All")} className={`text-xs px-2.5 py-1 rounded-full border ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{s}</button>
        ))}
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Ref</th><th className="py-3 px-3">Customer</th><th className="py-3 px-3">Workspace</th>
                <th className="py-3 px-3">Linked</th><th className="py-3 px-3">Issue</th><th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Assigned</th><th className="py-3 px-3">Status</th><th className="py-3 px-3">Updated</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs">{t.ref}</td>
                  <td className="py-3 px-3">{t.customer}</td>
                  <td className="py-3 px-3 text-xs">{t.workspace}</td>
                  <td className="py-3 px-3 text-xs font-mono">{t.linkedRef ?? "—"}</td>
                  <td className="py-3 px-3 text-xs">{t.issueType}</td>
                  <td className="py-3 px-3 text-xs">{t.priority}</td>
                  <td className="py-3 px-3 text-xs">{t.assigned}</td>
                  <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${tone(t.status)}`}>{t.status}</Badge></td>
                  <td className="py-3 px-3 text-xs">{t.lastUpdate}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="outline" className="h-7" onClick={() => setOpenId(t.id)}>Open</Button>
                      {t.status !== "Resolved" && t.status !== "Closed" && (
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => { updateTicketStatus(t.id, "Resolved"); toast.success(`${t.ref} resolved`); }}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-10 text-center text-sm text-muted-foreground"><MessageCircle className="h-5 w-5 inline mr-1.5" /> No tickets match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <TicketDetailDialog ticket={open} onClose={() => setOpenId(null)} tone={tone} />
      )}
    </div>
  );
}

function TicketDetailDialog({ ticket, onClose, tone }: { ticket: SupportTicket; onClose: () => void; tone: (s: TicketStatus) => string | undefined }) {
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ticket.ref} <Badge variant="outline" className={`text-[10px] ${tone(ticket.status)}`}>{ticket.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Info label="Customer" value={ticket.customer} />
          <Info label="Organization" value={ticket.organization} />
          <Info label="Workspace" value={ticket.workspace} />
          <Info label="Linked reference" value={ticket.linkedRef ?? "—"} />
          <Info label="Issue type" value={ticket.issueType} />
          <Info label="Priority" value={ticket.priority} />
          <Info label="Assigned" value={ticket.assigned} />
          <Info label="Created" value={ticket.createdAt} />
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Select onValueChange={(v) => { assignTicket(ticket.id, v); toast.success(`Assigned to ${v}`); }}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><UserCog className="h-3.5 w-3.5 mr-1" /><SelectValue placeholder="Assign" /></SelectTrigger>
            <SelectContent>{ASSIGNEES.map((a) => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => { updateTicketStatus(ticket.id, "Escalated"); toast.success("Ticket escalated"); }}>
            <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Escalate
          </Button>
          <Button size="sm" variant="outline" onClick={() => { updateTicketStatus(ticket.id, "Resolved"); toast.success("Marked resolved"); }}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Resolved
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { updateTicketStatus(ticket.id, "Closed"); toast.success("Ticket closed"); onClose(); }}>
            <XCircle className="h-3.5 w-3.5 mr-1" /> Close
          </Button>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs font-semibold mb-2">Conversation</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ticket.messages.length === 0 && <div className="text-xs text-muted-foreground">No messages yet.</div>}
            {ticket.messages.map((m) => (
              <div key={m.id} className={`p-2 rounded-lg text-xs ${m.role === "canta" ? "bg-primary/10" : "bg-secondary/40"}`}>
                <div className="text-[10px] font-semibold text-muted-foreground">{m.author} · {new Date(m.at).toLocaleString()}</div>
                <div className="mt-1">{m.body}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to customer…" />
            <Button size="sm" onClick={() => {
              if (!reply.trim()) { toast.error("Type a reply"); return; }
              appendMessage(ticket.id, { author: "Canta Support", role: "canta", body: reply });
              updateTicketStatus(ticket.id, "Waiting on Customer");
              setReply("");
              toast.success("Reply sent");
            }}><Reply className="h-3.5 w-3.5 mr-1" /> Reply</Button>
          </div>
        </div>

        <div className="border-t pt-3">
          <Label className="text-xs">Internal note (not visible to customer)</Label>
          <div className="flex gap-2 mt-1">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[60px]" />
            <Button size="sm" variant="outline" onClick={() => {
              if (!note.trim()) { toast.error("Type a note"); return; }
              appendMessage(ticket.id, { author: "Internal", role: "canta", body: `[note] ${note}` });
              setNote("");
              toast.success("Note saved");
            }}><Send className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function NewTicketDialog() {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState("");
  const [organization, setOrganization] = useState("");
  const [workspace, setWorkspace] = useState("Global Merchant");
  const [linkedRef, setLinkedRef] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("General enquiry");
  const [priority, setPriority] = useState<"Low" | "Normal" | "High" | "Urgent">("Normal");
  const [body, setBody] = useState("");

  const submit = () => {
    if (!customer) { toast.error("Customer name required"); return; }
    createTicket({ customer, organization: organization || customer, workspace, linkedRef: linkedRef || undefined, priority, assigned: "Canta Ops", issueType, firstMessage: body || undefined });
    toast.success("Ticket created");
    setOpen(false);
    setCustomer(""); setOrganization(""); setLinkedRef(""); setBody("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> New ticket</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New support ticket</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Customer</Label><Input value={customer} onChange={(e) => setCustomer(e.target.value)} /></div>
          <div><Label className="text-xs">Organization</Label><Input value={organization} onChange={(e) => setOrganization(e.target.value)} /></div>
          <div><Label className="text-xs">Workspace</Label>
            <Select value={workspace} onValueChange={setWorkspace}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Enterprise", "Importer", "Freight", "Global Merchant", "Supplier", "Partner Property", "Cards"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Linked reference</Label><Input value={linkedRef} onChange={(e) => setLinkedRef(e.target.value)} placeholder="INV-… / SHP-… / BC-…" /></div>
          <div><Label className="text-xs">Issue type</Label>
            <Select value={issueType} onValueChange={(v) => setIssueType(v as IssueType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{ISSUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Low", "Normal", "High", "Urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label className="text-xs">Message</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe the issue…" /></div>
        </div>
        <DialogFooter><Button onClick={submit}>Create ticket</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
