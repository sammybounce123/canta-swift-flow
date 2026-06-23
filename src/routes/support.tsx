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
import { LifeBuoy, Plus, MessageCircle, CheckCircle2, XCircle, Reply, RefreshCw, Paperclip, Clock3 } from "lucide-react";
import { toast } from "sonner";
import {
  listTickets, createTicket, updateTicketStatus, appendMessage, getTicket,
  subscribeSupport, ISSUE_TYPES, type TicketStatus, type IssueType,
  type SupportTicket,
} from "@/lib/support-store";
import { useRequireWorkspace, useActiveWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — Canta" }] }),
  component: SupportPage,
});

// Customer-facing status labels (mapped from store's internal status set).
const CUSTOMER_STATUSES = ["Open", "Waiting for Canta", "Waiting for You", "Resolved", "Closed"] as const;
type CustomerStatus = typeof CUSTOMER_STATUSES[number];

function toCustomerStatus(s: TicketStatus): CustomerStatus {
  if (s === "Waiting on Canta" || s === "Escalated") return "Waiting for Canta";
  if (s === "Waiting on Customer") return "Waiting for You";
  if (s === "Resolved") return "Resolved";
  if (s === "Closed") return "Closed";
  return "Open";
}

function SupportPage() {
  useRequireWorkspace();
  const ws = useActiveWorkspace();
  const [, force] = useState(0);
  useEffect(() => subscribeSupport(() => force((n) => n + 1)), []);
  const tickets = listTickets(ws.workspaceLabel).slice(0, 50);
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(() => (openId ? getTicket(openId) ?? null : null), [openId, tickets]);

  const filtered = statusFilter === "All" ? tickets : tickets.filter((t) => toCustomerStatus(t.status) === statusFilter);

  const tone = (s: CustomerStatus) => ({
    "Open":              "bg-primary/15 text-primary border-primary/30",
    "Waiting for Canta": "bg-warning/15 text-warning border-warning/30",
    "Waiting for You":   "bg-accent/15 text-accent border-accent/30",
    "Resolved":          "bg-success/15 text-success border-success/30",
    "Closed":            "bg-muted text-muted-foreground border-border",
  }[s]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-primary" /> My support tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">Open a ticket, message the Canta team and track responses.</p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant="outline" className="text-xs">{ws.badge}</Badge>
            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">{ws.name} · {ws.title}</Badge>
            <Badge variant="secondary" className="text-xs">{ws.workspaceLabel}</Badge>
          </div>
        </div>
        <NewTicketDialog workspaceLabel={ws.workspaceLabel} customer={ws.name} organization={ws.workspaceLabel} />
      </div>


      <Card className="p-3 shadow-card flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground">Filter:</span>
        {(["All", ...CUSTOMER_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s as CustomerStatus | "All")} className={`text-xs px-2.5 py-1 rounded-full border ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>{s}</button>
        ))}
      </Card>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Ref</th>
                <th className="py-3 px-3">Issue</th>
                <th className="py-3 px-3">Linked</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Updated</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const cs = toCustomerStatus(t.status);
                return (
                  <tr key={t.id} className="border-t hover:bg-secondary/30">
                    <td className="py-3 px-3 font-mono text-xs">{t.ref}</td>
                    <td className="py-3 px-3 text-xs">{t.issueType}</td>
                    <td className="py-3 px-3 text-xs font-mono">{t.linkedRef ?? "—"}</td>
                    <td className="py-3 px-3 text-xs">{t.priority}</td>
                    <td className="py-3 px-3"><Badge variant="outline" className={`text-[10px] ${tone(cs)}`}>{cs}</Badge></td>
                    <td className="py-3 px-3 text-xs">{t.lastUpdate}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex flex-wrap gap-1 justify-end">
                        <Button size="sm" variant="outline" className="h-7" onClick={() => setOpenId(t.id)}>Open</Button>
                        <Button size="sm" variant="outline" className="h-7" onClick={() => setOpenId(t.id)}><Reply className="h-3 w-3 mr-1" />Reply</Button>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => {
                          if (cs === "Closed") return toast.info("Ticket is already closed");
                          updateTicketStatus(t.id, "Closed");
                          toast.success("Ticket closed");
                        }}><XCircle className="h-3 w-3 mr-1" />Close Ticket</Button>
                        <Button size="sm" variant="ghost" className="h-7" onClick={() => {
                          if (cs !== "Closed" && cs !== "Resolved") return toast.info("Ticket is already open");
                          updateTicketStatus(t.id, "Open");
                          toast.success("Ticket reopened");
                        }}><RefreshCw className="h-3 w-3 mr-1" />Reopen Ticket</Button>
                      </div>
                    </td>

                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground"><MessageCircle className="h-5 w-5 inline mr-1.5" /> No {ws.workspaceLabel.toLowerCase()} tickets match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {open && <TicketDetailDialog ticket={open} onClose={() => setOpenId(null)} tone={tone} />}
    </div>
  );
}

function TicketDetailDialog({ ticket, onClose, tone }: { ticket: SupportTicket; onClose: () => void; tone: (s: CustomerStatus) => string | undefined }) {
  const [reply, setReply] = useState("");
  const cs = toCustomerStatus(ticket.status);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ticket.ref} <Badge variant="outline" className={`text-[10px] ${tone(cs)}`}>{cs}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Info label="Ticket reference" value={ticket.ref} />
          <Info label="Issue type" value={ticket.issueType} />
          <Info label="Status" value={cs} />
          <Info label="Linked reference" value={ticket.linkedRef ?? "—"} />
          <Info label="Priority" value={ticket.priority} />
          <Info label="Opened" value={ticket.createdAt} />
        </div>

        <div className="border-t pt-3">
          <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Paperclip className="h-3.5 w-3.5" /> Attachments</div>
          <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
            No attachments yet. Add files from the reply box when Canta asks for documents or receipts.
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs font-semibold mb-2">Messages</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {ticket.messages.length === 0 && <div className="text-xs text-muted-foreground">No messages yet.</div>}
            {ticket.messages
              .filter((m) => !m.body.startsWith("[note]"))
              .map((m) => (
                <div key={m.id} className={`p-2 rounded-lg text-xs ${m.role === "canta" ? "bg-primary/10" : "bg-secondary/40"}`}>
                  <div className="text-[10px] font-semibold text-muted-foreground">{m.role === "canta" ? "Canta Support" : "You"} · {new Date(m.at).toLocaleString()}</div>
                  <div className="mt-1">{m.body}</div>
                </div>
              ))}
          </div>
          <div className="mt-2 space-y-2">
            <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply to Canta…" className="min-h-[70px]" />
            <div className="flex flex-wrap gap-2 justify-end">
              {(cs === "Resolved" || cs === "Closed") && (
                <Button size="sm" variant="outline" onClick={() => { updateTicketStatus(ticket.id, "Open"); toast.success("Ticket reopened"); }}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reopen ticket
                </Button>
              )}
              {cs !== "Closed" && (
                <Button size="sm" variant="ghost" onClick={() => { updateTicketStatus(ticket.id, "Closed"); toast.success("Ticket closed"); onClose(); }}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Close ticket
                </Button>
              )}
              {cs !== "Resolved" && cs !== "Closed" && (
                <Button size="sm" variant="outline" onClick={() => { updateTicketStatus(ticket.id, "Resolved"); toast.success("Marked resolved"); }}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark resolved
                </Button>
              )}
              <Button size="sm" onClick={() => {
                if (!reply.trim()) return toast.error("Type a reply");
                appendMessage(ticket.id, { author: "You", role: "customer", body: reply });
                updateTicketStatus(ticket.id, "Waiting on Canta");
                setReply("");
                toast.success("Reply sent to Canta");
              }}><Reply className="h-3.5 w-3.5 mr-1" /> Send reply</Button>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Timeline</div>
          <div className="space-y-2 text-xs">
            <div className="rounded-lg bg-secondary/40 p-2">{ticket.createdAt} · Ticket opened for {ticket.linkedRef ?? ticket.issueType}</div>
            <div className="rounded-lg bg-secondary/40 p-2">{ticket.lastUpdate} · Status is {cs}</div>
            {ticket.messages.filter((m) => !m.body.startsWith("[note]")).map((m) => (
              <div key={`tl-${m.id}`} className="rounded-lg bg-secondary/40 p-2">
                {new Date(m.at).toLocaleDateString()} · {m.role === "canta" ? "Canta Support replied" : "Customer message added"}
              </div>
            ))}
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

function NewTicketDialog({ workspaceLabel, customer, organization }: { workspaceLabel: string; customer: string; organization: string }) {
  const [open, setOpen] = useState(false);
  const [linkedRef, setLinkedRef] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("General enquiry");
  const [priority, setPriority] = useState<"Low" | "Normal" | "High" | "Urgent">("Normal");
  const [body, setBody] = useState("");

  const submit = () => {
    createTicket({
      customer, organization, workspace: workspaceLabel,
      linkedRef: linkedRef || undefined, priority,
      assigned: "Canta Support", issueType, firstMessage: body || undefined,
    });
    toast.success("Ticket opened — Canta will reply soon");
    setOpen(false); setLinkedRef(""); setBody("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Open new ticket</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Open a new support ticket</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
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
          <div className="col-span-2"><Label className="text-xs">Linked reference (Trade File / Shipment / Payment / Card)</Label>
            <Input value={linkedRef} onChange={(e) => setLinkedRef(e.target.value)} placeholder="TF-… / SHP-… / INV-… / CARD-…" />
          </div>
          <div className="col-span-2"><Label className="text-xs">Describe the issue</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Tell us what happened so we can help…" />
          </div>
        </div>
        <DialogFooter><Button onClick={submit}>Submit ticket</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
