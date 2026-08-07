import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Save, Send, UserPlus, Link2, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, MARKETERS, canSeeAllMarketers } from "@/lib/partner";
import { createCase, addDocument, partnerActorFromUser } from "@/lib/partner-store";
import { usePartnerRole } from "@/hooks/usePartnerRole";

export const Route = createFileRoute("/partner/new-referral")({
  head: () => ({ meta: [{ title: "New Payment Case — Kingsbridge Property Partners" }] }),
  component: NewReferral,
});

function NewReferral() {
  const navigate = useNavigate();
  const { role, userId, user } = usePartnerRole();
  const canAssign = canSeeAllMarketers(role);
  const DRAFT_KEY = "canta:partner:new-referral-draft:v1";
  type DraftForm = {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    property: string;
    location: string;
    amount: string;
    currency: string;
    purpose: string;
    solicitor: string;
    deadline: string;
    notes: string;
    assignedMarketerId: string;
  };
  const defaultForm = (): DraftForm => ({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    property: "",
    location: "",
    amount: "",
    currency: "GBP",
    purpose: "Property completion",
    solicitor: SOLICITORS[0]?.id ?? "",
    deadline: "",
    notes: "",
    assignedMarketerId: userId,
  });
  // Lazy-init: restore any in-progress draft from localStorage so the form
  // survives re-renders/remounts instead of resetting to blank defaults.
  const [form, setForm] = useState<DraftForm & { file: File | undefined }>(() => {
    if (typeof window === "undefined") return { ...defaultForm(), file: undefined };
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) return { ...defaultForm(), ...JSON.parse(raw), file: undefined };
    } catch {
      /* noop */
    }
    return { ...defaultForm(), file: undefined };
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  // Persist the draft (excluding the File object, which cannot be serialized)
  // on every change, so typed values are never lost.
  const hydrated = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { file: _file, ...serializable } = form;
    void _file;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(serializable));
    } catch {
      /* noop */
    }
  }, [form]);

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* noop */
    }
  }
  void hydrated;

  const validate = () => {
    const missing: string[] = [];
    if (!form.clientName.trim()) missing.push("Client name");
    if (!form.clientEmail.trim()) missing.push("Client email");
    if (!form.amount || Number(form.amount) <= 0) missing.push("Amount");
    if (!form.solicitor) missing.push("Solicitor");
    if (missing.length) {
      toast.error(`Please complete: ${missing.join(", ")}`);
      return false;
    }
    return true;
  };

  const buildCase = (status?: "draft") => {
    const actor = partnerActorFromUser(userId);
    const created = createCase({
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      property: form.property || "—",
      propertyLocation: form.location || "—",
      amountGBP: Number(form.amount),
      solicitorId: form.solicitor,
      paymentPurpose: form.purpose,
      paymentDeadline:
        form.deadline || new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10),
      assignedMarketerId: form.assignedMarketerId,
      notes: status === "draft" ? `[DRAFT] ${form.notes ?? ""}`.trim() : form.notes,
      createdBy: actor.id,
      createdByName: actor.name,
    });
    if (form.file) {
      addDocument(created.id, {
        type: "Property payment instruction",
        name: form.file.name,
        uploadedBy: actor.id,
        uploadedByName: actor.name,
        uploadedByRole: actor.role,
      });
    }
    return created;
  };

  const canCreateCase =
    !!form.clientName.trim() &&
    !!(form.clientEmail.trim() || form.clientPhone.trim()) &&
    !!form.property.trim() &&
    Number(form.amount) > 0 &&
    !!form.currency &&
    !!form.purpose.trim() &&
    !!form.solicitor;

  const submit = () => {
    if (!validate()) return;
    const created = buildCase();
    setCreatedCaseId(created.id);
    setCreatedRef(created.ref);
    toast.success("Payment case created", {
      description: `${created.ref} — ${created.clientName}. You can now generate an FX quote.`,
    });
    clearDraft();
  };

  const doQuote = () => {
    if (!createdCaseId) return;
    const q = generateQuote(createdCaseId, "1h", partnerActorFromUser(userId));
    if (q) {
      setQuoteId(q.id);
      toast.success("FX quote generated", {
        description: `${q.reference} · 1 GBP = ₦${q.rate.toLocaleString()}`,
      });
    }
  };

  const doLink = () => {
    if (!createdCaseId || !quoteId) return;
    const l = generatePaymentLink(createdCaseId, partnerActorFromUser(userId));
    toast.success(l ? `Payment link ${l.id} generated` : "Generate a valid FX quote first");
    if (l)
      setTimeout(
        () => navigate({ to: "/partner/cases/$caseId", params: { caseId: createdCaseId } }),
        500,
      );
  };

  const saveDraft = () => {
    if (!form.clientName.trim()) {
      toast.error("Add at least a client name to save a lead");
      return;
    }
    const created = buildCase("draft");
    toast.success("Saved as referral lead", {
      description: `${created.ref} kept as a lead — you can finish it from Cases.`,
    });
    clearDraft();
    setTimeout(() => navigate({ to: "/partner/cases" }), 500);
  };

  void MARKETERS;
  void user;

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">New Client Payment Case</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Refer a client, attach property/payment details, assign solicitor, and create a Canta
          payment case.
        </p>
      </div>


      <Card className="p-6 shadow-card space-y-6">
        <Section title="Referral owner">
          <div className="md:col-span-2 flex items-center gap-3 p-3 rounded-lg border bg-secondary/30">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
              {user?.avatarInitials ?? "—"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                {user?.name ?? "Current user"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Auto-tagged as the referral owner
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {user?.region}
            </Badge>
          </div>
          {canAssign && (
            <Field label="Assign to marketer">
              <Select
                value={form.assignedMarketerId}
                onValueChange={(v) => set("assignedMarketerId", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETERS.filter((m) => m.role === "marketer" || m.id === userId).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        </Section>
        <Section title="Client">
          <Field label="Client name" required>
            <Input
              value={form.clientName}
              onChange={(e) => set("clientName", e.target.value)}
              placeholder="Full name"
            />
          </Field>
          <Field label="Client email" required>
            <Input
              type="email"
              value={form.clientEmail}
              onChange={(e) => set("clientEmail", e.target.value)}
              placeholder="name@email.com"
            />
          </Field>
          <Field label="Client phone">
            <Input
              value={form.clientPhone}
              onChange={(e) => set("clientPhone", e.target.value)}
              placeholder="+234 …"
            />
          </Field>
        </Section>

        <Section title="Property">
          <Field label="Property / project">
            <Input
              value={form.property}
              onChange={(e) => set("property", e.target.value)}
              placeholder="The Wharf — Apt 14B"
            />
          </Field>
          <Field label="Property location">
            <Input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Manchester, UK"
            />
          </Field>
          <Field label="Payment deadline">
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Payment">
          <Field label="Amount" required>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="250000"
            />
          </Field>
          <Field label="Currency">
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Payment purpose">
            <Select value={form.purpose} onValueChange={(v) => set("purpose", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Select a solicitor" />
              </SelectTrigger>
              <SelectContent>
                {SOLICITORS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.firm}
                  </SelectItem>
                ))}
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
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => set("file", e.target.files?.[0])}
              />
            </label>
          </div>
        </Section>

        <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2 min-w-0">
            <Button variant="outline" onClick={saveDraft}>
              <Save className="h-4 w-4 mr-1.5" /> Save draft
            </Button>
            <Button variant="outline" onClick={sendPaymentLink}>
              <Link2 className="h-4 w-4 mr-1.5" /> Send client payment link
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.success("Solicitor assigned", {
                  description: SOLICITORS.find((s) => s.id === form.solicitor)?.firm ?? "—",
                })
              }
            >
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

function Section({
  title,
  children,
  cols = 3,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}) {
  const gridClass =
    cols === 1 ? "md:grid-cols-2" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </div>
      <div className={`grid grid-cols-1 ${gridClass} gap-4`}>{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
