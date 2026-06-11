import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, Save, Send, UserPlus, Link2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, MARKETERS, canSeeAllMarketers } from "@/lib/partner";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/new-referral")({
  head: () => ({ meta: [{ title: "New Referral — Baron & Cabot" }] }),
  component: NewReferral,
});

function NewReferral() {
  const navigate = useNavigate();
  const { role, userId, user } = usePartnerRole();
  const canAssign = canSeeAllMarketers(role);
  const [form, setForm] = useState({
    clientName: "", clientEmail: "", clientPhone: "",
    property: "", location: "", amount: "", currency: "GBP",
    purpose: "Property completion", solicitor: "", deadline: "", notes: "",
    assignedMarketerId: userId,
    file: undefined as File | undefined,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.clientName || !form.clientEmail || !form.amount || !form.solicitor) {
      toast.error("Please fill the required fields.");
      return;
    }
    const owner = MARKETERS.find((m) => m.id === form.assignedMarketerId)?.name ?? user?.name ?? "you";
    toast.success("Referral created", { description: `${form.clientName} — owner: ${owner}` });
    setTimeout(() => navigate({ to: "/partner/cases" }), 600);
  };


  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">New client referral</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit a Baron &amp; Cabot client for property payment processing.</p>
      </div>

      <Card className="p-6 shadow-card space-y-6">
        <Section title="Client">
          <Field label="Client name" required><Input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Full name" /></Field>
          <Field label="Client email" required><Input type="email" value={form.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} placeholder="name@email.com" /></Field>
          <Field label="Client phone"><Input value={form.clientPhone} onChange={(e) => set("clientPhone", e.target.value)} placeholder="+234 …" /></Field>
        </Section>

        <Section title="Property">
          <Field label="Property / project"><Input value={form.property} onChange={(e) => set("property", e.target.value)} placeholder="The Wharf — Apt 14B" /></Field>
          <Field label="Property location"><Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Manchester, UK" /></Field>
          <Field label="Payment deadline"><Input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
        </Section>

        <Section title="Payment">
          <Field label="Amount" required><Input type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="250000" /></Field>
          <Field label="Currency">
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Payment purpose">
            <Select value={form.purpose} onValueChange={(v) => set("purpose", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Property completion">Property completion</SelectItem>
                <SelectItem value="Deposit">Deposit</SelectItem>
                <SelectItem value="Stamp duty">Stamp duty</SelectItem>
                <SelectItem value="Solicitor fees">Solicitor fees</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Solicitor beneficiary" required>
            <Select value={form.solicitor} onValueChange={(v) => set("solicitor", v)}>
              <SelectTrigger><SelectValue placeholder="Select a solicitor" /></SelectTrigger>
              <SelectContent>
                {SOLICITORS.map((s) => <SelectItem key={s.id} value={s.id}>{s.firm}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        <Section title="Attachments & notes" cols={1}>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium">Notes</Label>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything Canta needs to know about this completion…"
              className="mt-1.5 w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium">Upload payment instruction</Label>
            <label className="mt-1.5 flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed border-border hover:border-primary/40 cursor-pointer">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Upload className="h-4 w-4" /> {form.file?.name ?? "Choose PDF / image (optional)"}
              </div>
              <span className="text-xs font-medium text-primary">Browse</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(e) => set("file", e.target.files?.[0])} />
            </label>
          </div>
        </Section>

        <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("Draft saved")}>
              <Save className="h-4 w-4 mr-1.5" /> Save draft
            </Button>
            <Button variant="outline" onClick={() => toast.success("Client payment link sent")}>
              <Link2 className="h-4 w-4 mr-1.5" /> Send client payment link
            </Button>
            <Button variant="outline" onClick={() => toast.success("Solicitor assigned")}>
              <UserPlus className="h-4 w-4 mr-1.5" /> Assign solicitor
            </Button>
          </div>
          <Button className="bg-primary" onClick={submit}>
            <Send className="h-4 w-4 mr-1.5" /> Create referral
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Section({ title, children, cols = 3 }: { title: string; children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const gridClass = cols === 1 ? "md:grid-cols-2" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</div>
      <div className={`grid grid-cols-1 ${gridClass} gap-4`}>{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}
