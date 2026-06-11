import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, FileCheck2, Users, Banknote, ShieldCheck, Check,
  ArrowRight, ArrowLeft, Upload, Trash2, Plus, Sparkles, CircleCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Enterprise Onboarding — Canta" },
      { name: "description", content: "Activate your Canta enterprise workspace in minutes — KYB, beneficial owners, treasury setup and team invites." },
    ],
  }),
  component: Onboarding,
});

const STORAGE_KEY = "canta.onboarding.v1";

type Director = { id: string; name: string; role: string; idType: string; ownership: string };
type Teammate = { id: string; email: string; role: string };
type Doc = { key: string; label: string; required: boolean; fileName?: string };

type State = {
  step: number;
  company: {
    legalName: string; tradingName: string; rcNumber: string; tin: string;
    industry: string; size: string; country: string; address: string; website: string;
  };
  docs: Doc[];
  directors: Director[];
  treasury: {
    baseCurrency: string; volume: string; corridors: string[]; useCase: string;
  };
  team: Teammate[];
  completedAt?: string;
};

const initialState: State = {
  step: 0,
  company: {
    legalName: "", tradingName: "", rcNumber: "", tin: "",
    industry: "", size: "", country: "Nigeria", address: "", website: "",
  },
  docs: [
    { key: "cac", label: "CAC Certificate of Incorporation", required: true },
    { key: "memart", label: "MEMART", required: true },
    { key: "tin", label: "TIN Certificate", required: true },
    { key: "address", label: "Proof of business address", required: true },
    { key: "board", label: "Board resolution (optional)", required: false },
  ],
  directors: [{ id: crypto.randomUUID(), name: "", role: "Director", idType: "NIN", ownership: "" }],
  treasury: { baseCurrency: "NGN", volume: "", corridors: [], useCase: "" },
  team: [{ id: crypto.randomUUID(), email: "", role: "Treasury" }],
};

const steps = [
  { key: "company", title: "Company profile", icon: Building2, desc: "Tell us about your business" },
  { key: "docs", title: "KYB documents", icon: FileCheck2, desc: "Upload verification documents" },
  { key: "owners", title: "Owners & directors", icon: Users, desc: "Disclose beneficial owners" },
  { key: "treasury", title: "Treasury & team", icon: Banknote, desc: "Configure flows and invite teammates" },
  { key: "review", title: "Review & submit", icon: ShieldCheck, desc: "Confirm and activate workspace" },
];

const corridors = ["USD", "EUR", "GBP", "CNY", "ZAR", "KES", "GHS", "AED"];
const industries = ["Oil & Gas", "Manufacturing", "Trading & Commodities", "Technology", "Logistics", "Financial Services", "Agriculture", "Other"];
const sizes = ["1–50", "51–200", "201–1,000", "1,001–5,000", "5,000+"];
const countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "UAE"];

function Onboarding() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return initialState;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...initialState, ...JSON.parse(raw) };
    } catch {}
    return initialState;
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const progress = useMemo(() => Math.round(((state.step + 1) / steps.length) * 100), [state.step]);

  const update = <K extends keyof State>(key: K, value: State[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const next = () => {
    if (!validate(state)) return;
    setState((s) => ({ ...s, step: Math.min(s.step + 1, steps.length - 1) }));
  };
  const back = () => setState((s) => ({ ...s, step: Math.max(s.step - 1, 0) }));

  const submit = () => {
    setState((s) => ({ ...s, completedAt: new Date().toISOString() }));
    let to = "/dashboard";
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("canta:profile") : null;
      if (raw) {
        const p = JSON.parse(raw) as { workspace_type?: string };
        const map: Record<string, string> = {
          enterprise_treasury: "/treasury",
          importer_portal: "/importer",
          freight_workspace: "/freight",
          supplier_dashboard: "/suppliers",
          global_collections: "/collections",
          global_spend_cards: "/cards",
          partner_property: "/partner",
        };
        if (p.workspace_type && map[p.workspace_type]) to = map[p.workspace_type];
      }
    } catch {}
    toast.success("Onboarding submitted", { description: "Welcome to your Canta workspace." });
    setTimeout(() => navigate({ to: to as never }), 800);
  };

  const Step = steps[state.step];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary grid place-items-center text-primary-foreground text-sm font-bold">C</div>
            <span className="font-semibold">Canta</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">Enterprise onboarding</Badge>
          </Link>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Need help? <a className="text-primary font-medium" href="mailto:onboarding@canta.app">onboarding@canta.app</a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Stepper */}
        <aside className="space-y-1 lg:sticky lg:top-6 self-start">
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Step {state.step + 1} of {steps.length}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === state.step;
            const done = i < state.step;
            return (
              <button
                key={s.key}
                onClick={() => setState((p) => ({ ...p, step: i }))}
                className={`w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 transition ${
                  active ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"
                }`}
              >
                <div className={`mt-0.5 h-7 w-7 rounded-full grid place-items-center text-xs font-semibold flex-shrink-0 ${
                  done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}>
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground/80"}`}>{s.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{s.desc}</div>
                </div>
              </button>
            );
          })}

          <Card className="mt-6 p-4 bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Why this matters
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Canta is licensed and operates under strict CBN, FinCEN and FCA-aligned KYB rules. Verified
              workspaces unlock institutional FX, multi-entity treasury and unlimited corridors.
            </p>
          </Card>
        </aside>

        {/* Form */}
        <main>
          <Card className="p-6 lg:p-8 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center">
                <Step.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{Step.title}</h1>
                <p className="text-sm text-muted-foreground">{Step.desc}</p>
              </div>
            </div>

            {state.step === 0 && <CompanyStep state={state} setState={setState} />}
            {state.step === 1 && <DocsStep state={state} setState={setState} />}
            {state.step === 2 && <OwnersStep state={state} setState={setState} />}
            {state.step === 3 && <TreasuryStep state={state} setState={setState} />}
            {state.step === 4 && <ReviewStep state={state} />}

            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <Button variant="ghost" onClick={back} disabled={state.step === 0}>
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
              </Button>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link to="/dashboard">Save & exit</Link>
                </Button>
                {state.step < steps.length - 1 ? (
                  <Button onClick={next} className="bg-primary hover:bg-primary/90">
                    Continue <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button onClick={submit} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <CircleCheck className="h-4 w-4 mr-1.5" /> Submit for review
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

function validate(s: State): boolean {
  if (s.step === 0) {
    const c = s.company;
    if (!c.legalName || !c.rcNumber || !c.industry || !c.size || !c.country) {
      toast.error("Please complete the required company fields.");
      return false;
    }
  }
  if (s.step === 1) {
    const missing = s.docs.filter((d) => d.required && !d.fileName);
    if (missing.length) {
      toast.error(`Upload required documents: ${missing.map((d) => d.label).join(", ")}`);
      return false;
    }
  }
  if (s.step === 2) {
    if (s.directors.some((d) => !d.name || !d.ownership)) {
      toast.error("Each director needs a name and ownership %.");
      return false;
    }
  }
  if (s.step === 3) {
    if (!s.treasury.volume || s.treasury.corridors.length === 0) {
      toast.error("Select expected volume and at least one corridor.");
      return false;
    }
  }
  return true;
}

/* ---------------- Step components ---------------- */

type Setter = React.Dispatch<React.SetStateAction<State>>;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
    </div>
  );
}

function CompanyStep({ state, setState }: { state: State; setState: Setter }) {
  const c = state.company;
  const set = (k: keyof State["company"], v: string) =>
    setState((p) => ({ ...p, company: { ...p.company, [k]: v } }));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Legal entity name" required>
        <Input value={c.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="Acme Holdings Ltd." maxLength={120} />
      </Field>
      <Field label="Trading / brand name">
        <Input value={c.tradingName} onChange={(e) => set("tradingName", e.target.value)} placeholder="Acme" maxLength={120} />
      </Field>
      <Field label="RC number / Reg. number" required>
        <Input value={c.rcNumber} onChange={(e) => set("rcNumber", e.target.value)} placeholder="RC-1234567" maxLength={40} />
      </Field>
      <Field label="Tax ID (TIN)">
        <Input value={c.tin} onChange={(e) => set("tin", e.target.value)} placeholder="12345678-0001" maxLength={40} />
      </Field>
      <Field label="Industry" required>
        <Select value={c.industry} onValueChange={(v) => set("industry", v)}>
          <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
          <SelectContent>{industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Company size" required>
        <Select value={c.size} onValueChange={(v) => set("size", v)}>
          <SelectTrigger><SelectValue placeholder="Employees" /></SelectTrigger>
          <SelectContent>{sizes.map((i) => <SelectItem key={i} value={i}>{i} employees</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Country of incorporation" required>
        <Select value={c.country} onValueChange={(v) => set("country", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{countries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
        </Select>
      </Field>
      <Field label="Website">
        <Input value={c.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" maxLength={200} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Registered address">
          <Input value={c.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, city, state, postal code" maxLength={250} />
        </Field>
      </div>
    </div>
  );
}

function DocsStep({ state, setState }: { state: State; setState: Setter }) {
  const onFile = (key: string, file?: File) =>
    setState((p) => ({
      ...p,
      docs: p.docs.map((d) => d.key === key ? { ...d, fileName: file?.name } : d),
    }));
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">PDF, JPG or PNG · Max 10MB per file. Documents are encrypted at rest.</p>
      {state.docs.map((d) => (
        <div key={d.key} className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border hover:border-primary/30 transition">
          <div className="min-w-0">
            <div className="text-sm font-medium flex items-center gap-2">
              {d.label}
              {d.required ? <Badge variant="secondary" className="text-[10px]">Required</Badge> : <Badge variant="outline" className="text-[10px]">Optional</Badge>}
            </div>
            {d.fileName ? (
              <div className="text-xs text-success mt-0.5 flex items-center gap-1"><Check className="h-3 w-3" /> {d.fileName}</div>
            ) : (
              <div className="text-xs text-muted-foreground mt-0.5">No file selected</div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {d.fileName && (
              <Button size="sm" variant="ghost" onClick={() => onFile(d.key, undefined)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <label>
              <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => onFile(d.key, e.target.files?.[0])} />
              <span className="inline-flex items-center text-xs font-medium px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 cursor-pointer">
                <Upload className="h-3.5 w-3.5 mr-1.5" />{d.fileName ? "Replace" : "Upload"}
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnersStep({ state, setState }: { state: State; setState: Setter }) {
  const setDirs = (fn: (d: Director[]) => Director[]) =>
    setState((p) => ({ ...p, directors: fn(p.directors) }));
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">List all individuals owning ≥10% or with material control. Required for AML/CTF compliance.</p>
      {state.directors.map((d, i) => (
        <Card key={d.id} className="p-4 space-y-3 bg-secondary/30">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Person {i + 1}</div>
            {state.directors.length > 1 && (
              <Button size="sm" variant="ghost" onClick={() => setDirs((arr) => arr.filter((x) => x.id !== d.id))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Full legal name" required>
              <Input value={d.name} maxLength={120}
                onChange={(e) => setDirs((arr) => arr.map((x) => x.id === d.id ? { ...x, name: e.target.value } : x))} />
            </Field>
            <Field label="Role">
              <Select value={d.role}
                onValueChange={(v) => setDirs((arr) => arr.map((x) => x.id === d.id ? { ...x, role: v } : x))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Director", "CEO", "CFO", "Shareholder", "UBO"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="ID type">
              <Select value={d.idType}
                onValueChange={(v) => setDirs((arr) => arr.map((x) => x.id === d.id ? { ...x, idType: v } : x))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["NIN", "International Passport", "Driver's License", "Voter's Card"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Ownership %" required>
              <Input type="number" min={0} max={100} value={d.ownership} placeholder="e.g. 25"
                onChange={(e) => setDirs((arr) => arr.map((x) => x.id === d.id ? { ...x, ownership: e.target.value } : x))} />
            </Field>
          </div>
        </Card>
      ))}
      <Button variant="outline" onClick={() =>
        setDirs((arr) => [...arr, { id: crypto.randomUUID(), name: "", role: "Director", idType: "NIN", ownership: "" }])
      }>
        <Plus className="h-4 w-4 mr-1.5" /> Add another person
      </Button>
    </div>
  );
}

function TreasuryStep({ state, setState }: { state: State; setState: Setter }) {
  const t = state.treasury;
  const setT = (k: keyof State["treasury"], v: any) =>
    setState((p) => ({ ...p, treasury: { ...p.treasury, [k]: v } }));
  const toggleCorridor = (c: string) =>
    setT("corridors", t.corridors.includes(c) ? t.corridors.filter((x) => x !== c) : [...t.corridors, c]);

  const setTeam = (fn: (t: Teammate[]) => Teammate[]) =>
    setState((p) => ({ ...p, team: fn(p.team) }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Base reporting currency" required>
          <Select value={t.baseCurrency} onValueChange={(v) => setT("baseCurrency", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["NGN", "USD", "EUR", "GBP"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Expected monthly volume (USD)" required>
          <Select value={t.volume} onValueChange={(v) => setT("volume", v)}>
            <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
            <SelectContent>
              {["< $100K", "$100K – $1M", "$1M – $10M", "$10M – $50M", "$50M+"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div>
        <Label className="text-xs font-medium">Active corridors <span className="text-destructive">*</span></Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {corridors.map((c) => {
            const on = t.corridors.includes(c);
            return (
              <button key={c} onClick={() => toggleCorridor(c)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition ${
                  on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
                }`}>
                NGN ↔ {c} {on && <Check className="h-3 w-3 inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Primary use case">
        <Select value={t.useCase} onValueChange={(v) => setT("useCase", v)}>
          <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
          <SelectContent>
            {["Supplier payments", "Export proceeds repatriation", "Payroll", "Treasury hedging", "Group intercompany"].map((c) =>
              <SelectItem key={c} value={c}>{c}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </Field>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-semibold">Invite teammates</div>
            <div className="text-xs text-muted-foreground">Add finance, treasury and compliance colleagues. You can change roles later.</div>
          </div>
          <Button variant="outline" size="sm"
            onClick={() => setTeam((arr) => [...arr, { id: crypto.randomUUID(), email: "", role: "Finance" }])}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {state.team.map((m) => (
            <div key={m.id} className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-2">
              <Input type="email" placeholder="colleague@company.com" value={m.email} maxLength={120}
                onChange={(e) => setTeam((arr) => arr.map((x) => x.id === m.id ? { ...x, email: e.target.value } : x))} />
              <Select value={m.role}
                onValueChange={(v) => setTeam((arr) => arr.map((x) => x.id === m.id ? { ...x, role: v } : x))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Admin", "Treasury", "Finance", "Compliance", "Viewer"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => setTeam((arr) => arr.filter((x) => x.id !== m.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ state }: { state: State }) {
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between gap-6 py-2 border-b border-border last:border-0">
      <div className="text-xs text-muted-foreground">{k}</div>
      <div className="text-sm font-medium text-right">{v || <span className="text-muted-foreground italic">—</span>}</div>
    </div>
  );
  const c = state.company; const t = state.treasury;
  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Company</div>
        <Row k="Legal name" v={c.legalName} />
        <Row k="RC number" v={c.rcNumber} />
        <Row k="Industry" v={c.industry} />
        <Row k="Size" v={c.size && `${c.size} employees`} />
        <Row k="Country" v={c.country} />
      </Card>
      <Card className="p-4">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-primary" /> Documents</div>
        {state.docs.map((d) => (
          <Row key={d.key} k={d.label} v={d.fileName ? <span className="text-success inline-flex items-center gap-1"><Check className="h-3 w-3" />Uploaded</span> : "—"} />
        ))}
      </Card>
      <Card className="p-4">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Owners ({state.directors.length})</div>
        {state.directors.map((d, i) => (
          <Row key={d.id} k={`${i + 1}. ${d.name || "Unnamed"} · ${d.role}`} v={`${d.ownership || 0}%`} />
        ))}
      </Card>
      <Card className="p-4">
        <div className="text-sm font-semibold mb-2 flex items-center gap-2"><Banknote className="h-4 w-4 text-primary" /> Treasury</div>
        <Row k="Base currency" v={t.baseCurrency} />
        <Row k="Monthly volume" v={t.volume} />
        <Row k="Corridors" v={t.corridors.length ? t.corridors.join(", ") : ""} />
        <Row k="Use case" v={t.useCase} />
        <Row k="Team invites" v={`${state.team.filter((m) => m.email).length} pending`} />
      </Card>
      <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-4">
        By submitting, you certify the information is accurate and authorise Canta to perform sanctions,
        PEP and AML screening on the disclosed parties under Nigerian, EU and US regulations.
      </div>
    </div>
  );
}
