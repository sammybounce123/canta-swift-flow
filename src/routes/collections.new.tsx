import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Stethoscope, Home, Plane, ShoppingBag, Briefcase, Receipt, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATES, getTemplate, type CollectionTemplate, type TemplateField } from "@/lib/collection-templates";

export const Route = createFileRoute("/collections/new")({
  head: () => ({ meta: [{ title: "New Collection — Canta" }] }),
  component: NewCollectionPage,
});

const ICON: Record<string, any> = {
  tuition: GraduationCap, medical: Stethoscope, property: Home, travel: Plane,
  ecommerce: ShoppingBag, services: Briefcase, supplier: Receipt,
};

function NewCollectionPage() {
  const [tplId, setTplId] = useState<string | null>(null);
  const tpl = tplId ? getTemplate(tplId) : null;
  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <Link to="/collections" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Back to Collections</Link>
        <h1 className="text-2xl font-semibold mt-2">Start a guided collection</h1>
        <p className="text-sm text-muted-foreground mt-1">Pick a template — each creates an invoice, payment link, payer record, reconciliation reference and settlement batch entry.</p>
      </div>

      {!tpl ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => {
            const Icon = ICON[t.id] ?? Receipt;
            return (
              <button key={t.id} onClick={() => setTplId(t.id)} className="text-left">
                <Card className="p-4 shadow-card hover:shadow-elevate hover:border-primary/40 transition">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
                  <div className="mt-3 text-sm font-semibold">{t.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                </Card>
              </button>
            );
          })}
        </div>
      ) : (
        <TemplateForm tpl={tpl} onBack={() => setTplId(null)} />
      )}
    </div>
  );
}

function TemplateForm({ tpl, onBack }: { tpl: CollectionTemplate; onBack: () => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const nav = useNavigate();
  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const submit = () => {
    const missing = tpl.fields.filter((f) => f.required && !values[f.key]);
    if (missing.length) { toast.error(`Required: ${missing.map((m) => m.label).join(", ")}`); return; }
    toast.success(`${tpl.label} created — invoice, payment link, payer & settlement batch generated`);
    setTimeout(() => nav({ to: "/collections" }), 600);
  };
  return (
    <Card className="p-6 shadow-card space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">{tpl.purpose}</Badge>
        <div className="text-sm font-semibold">{tpl.label}</div>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onBack}>Change template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tpl.fields.map((f) => <FormField key={f.key} f={f} value={values[f.key] ?? ""} onChange={(v) => set(f.key, v)} />)}
      </div>
      <div className="border-t pt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle2 className="h-4 w-4 text-success" /> On submit Canta will create: invoice, payment link, payer record, reconciliation reference and settlement batch entry.
        <Button className="ml-auto" onClick={submit}>Create collection</Button>
      </div>
    </Card>
  );
}

function FormField({ f, value, onChange }: { f: TemplateField; value: string; onChange: (v: string) => void }) {
  return (
    <div className={f.type === "textarea" ? "md:col-span-2" : ""}>
      <Label className="text-xs">{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
      {f.type === "textarea" ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
      ) : f.type === "select" ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>{(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      ) : f.type === "file" ? (
        <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">Drag & drop file or click to upload</div>
      ) : (
        <Input type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />
      )}
    </div>
  );
}
