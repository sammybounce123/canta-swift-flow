import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LifeBuoy, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { listTickets, createTicket, updateTicketStatus, subscribeSupport, TICKET_STATUSES, ISSUE_TYPES, type TicketStatus, type IssueType } from "@/lib/support-store";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — Canta" }] }),
  component: SupportPage,
});

function SupportPage() {
  const [, force] = useState(0);
  useEffect(() => subscribeSupport(() => force((n) => n + 1)), []);
  const tickets = listTickets();
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
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
                <th className="py-3 px-3">Assigned</th><th className="py-3 px-3">Status</th><th className="py-3 px-3">Updated</th><th />
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
                    <Select value={t.status} onValueChange={(v) => { updateTicketStatus(t.id, v as TicketStatus); toast.success("Ticket updated"); }}>
                      <SelectTrigger className="h-7 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{TICKET_STATUSES.map((s) => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                    </Select>
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
