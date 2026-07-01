import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  ShieldCheck, Building2, FileText, Upload, CheckCircle2, ArrowRight, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { SEGMENTS, type WorkspaceType } from "@/lib/profile";

const searchSchema = z.object({
  workspace: z.string().optional(),
});

export const Route = createFileRoute("/kyb-onboarding")({
  head: () => ({ meta: [{ title: "KYB Onboarding — Canta" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: KybOnboardingPage,
});

const KYB_KEY_PREFIX = "canta:kyb:";

export function isKybComplete(ws: WorkspaceType): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KYB_KEY_PREFIX + ws) === "done";
}
export function markKybComplete(ws: WorkspaceType) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KYB_KEY_PREFIX + ws, "done");
}

type StepKey = "business" | "directors" | "documents" | "review";
const STEPS: { key: StepKey; label: string; icon: typeof Building2 }[] = [
  { key: "business",  label: "Business details", icon: Building2 },
  { key: "directors", label: "Directors & ownership", icon: ShieldCheck },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "review",    label: "Review & submit", icon: CheckCircle2 },
];

function KybOnboardingPage() {
  const navigate = useNavigate();
  const { workspace } = Route.useSearch();
  const segment = useMemo(
    () => SEGMENTS.find((s) => s.id === (workspace as WorkspaceType)) ?? SEGMENTS[1],
    [workspace],
  );

  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const pct = Math.round(((stepIdx + 1) / STEPS.length) * 100);

  const [biz, setBiz] = useState({ name: "", regNo: "", country: "Nigeria", address: "" });
  const [director, setDirector] = useState({ name: "", email: "", role: "Director" });
  const [docs, setDocs] = useState<Record<string, string>>({});

  const requiredDocs = [
    { key: "cac", label: "Company registration (CAC / incorporation)" },
    { key: "id",  label: "Director ID" },
    { key: "addr", label: "Proof of business address" },
  ];

  function next() {
    if (step.key === "business" && (!biz.name || !biz.regNo)) {
      toast.error("Enter your business name and registration number.");
      return;
    }
    if (step.key === "directors" && (!director.name || !director.email)) {
      toast.error("Enter director name and email.");
      return;
    }
    if (step.key === "documents" && requiredDocs.some((d) => !docs[d.key])) {
      toast.error("Upload all required documents.");
      return;
    }
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }
  function back() { setStepIdx((i) => Math.max(0, i - 1)); }

  function submit() {
    markKybComplete(segment.id);
    toast.success("KYB submitted — welcome to your workspace.");
    setTimeout(() => navigate({ to: segment.route as never }), 400);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary grid place-items-center text-primary-foreground text-sm font-bold">C</div>
            <span className="font-semibold">Canta</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">KYB Onboarding</Badge>
          </Link>
          <Link to="/welcome" className="text-xs text-muted-foreground hover:text-foreground">Change workspace</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Badge variant="outline" className="mb-3">Step 2 · Verify your business</Badge>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Complete KYB to unlock {segment.shortLabel}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            We need a few details to verify your business before you enter your dashboard.
            You can save and continue anytime.
          </p>
        </div>

        <Card className="p-4 mb-4 shadow-card">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const active = i === stepIdx;
                const done = i < stepIdx;
                return (
                  <div key={s.key} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md border ${
                    active ? "border-primary text-primary bg-primary/5"
                    : done ? "border-success/30 text-success bg-success/10"
                    : "border-border text-muted-foreground"
                  }`}>
                    <Icon className="h-3.5 w-3.5" /> {s.label}
                  </div>
                );
              })}
            </div>
            <div className="min-w-[160px] flex-1 max-w-xs">
              <Progress value={pct} />
              <div className="text-[11px] text-muted-foreground mt-1">{pct}% complete</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          {step.key === "business" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Business name</Label><Input value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} placeholder="Acme Trading Ltd" /></div>
                <div><Label>Registration number</Label><Input value={biz.regNo} onChange={(e) => setBiz({ ...biz, regNo: e.target.value })} placeholder="RC-1234567" /></div>
                <div><Label>Country of incorporation</Label><Input value={biz.country} onChange={(e) => setBiz({ ...biz, country: e.target.value })} /></div>
                <div><Label>Registered address</Label><Input value={biz.address} onChange={(e) => setBiz({ ...biz, address: e.target.value })} placeholder="Street, City" /></div>
              </div>
            </div>
          )}

          {step.key === "directors" && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label>Director / owner name</Label><Input value={director.name} onChange={(e) => setDirector({ ...director, name: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={director.email} onChange={(e) => setDirector({ ...director, email: e.target.value })} /></div>
                <div><Label>Role</Label><Input value={director.role} onChange={(e) => setDirector({ ...director, role: e.target.value })} /></div>
              </div>
              <p className="text-[11px] text-muted-foreground">You can add more directors and beneficial owners after onboarding.</p>
            </div>
          )}

          {step.key === "documents" && (
            <div className="space-y-3">
              {requiredDocs.map((d) => (
                <div key={d.key} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border flex-wrap">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" /> {d.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {docs[d.key] ? (
                      <Badge variant="outline" className="text-[10px] bg-success/15 text-success border-success/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> {docs[d.key]}
                      </Badge>
                    ) : null}
                    <Label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setDocs((prev) => ({ ...prev, [d.key]: f.name }));
                        }}
                      />
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border border-border hover:bg-accent/10">
                        <Upload className="h-3.5 w-3.5" /> {docs[d.key] ? "Replace" : "Upload"}
                      </span>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step.key === "review" && (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg border border-border">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Business</div>
                <div>{biz.name || "—"} · {biz.regNo || "—"} · {biz.country}</div>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Director</div>
                <div>{director.name || "—"} · {director.email || "—"} · {director.role}</div>
              </div>
              <div className="p-3 rounded-lg border border-border">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Documents</div>
                <ul className="space-y-1">
                  {requiredDocs.map((d) => (
                    <li key={d.key} className="flex justify-between">
                      <span>{d.label}</span>
                      <span className="text-muted-foreground">{docs[d.key] ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] text-muted-foreground">
                By submitting you confirm the information provided is accurate. After submission you'll be taken to your {segment.shortLabel} dashboard.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={back} disabled={stepIdx === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step.key === "review" ? (
              <Button onClick={submit}>
                Submit & enter {segment.shortLabel} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={next}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
