import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, FileCheck2, Download, Upload, CheckCircle2,
  Clock, AlertTriangle, FileText, Users, Settings2, BadgeCheck, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRequireWorkspace, useActiveWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance Pack — Canta" }] }),
  component: CompliancePack,
});

type DocState = "Verified" | "Pending Review" | "More Info Required" | "Missing";

const REQUIRED_DOCS: { code: string; label: string; required: boolean }[] = [
  { code: "CAC",    label: "Company Registration (CAC / Incorporation)", required: true },
  { code: "MEMART", label: "MEMART / Articles of Association",           required: true },
  { code: "DIR",    label: "Director IDs",                               required: true },
  { code: "ADDR",   label: "Proof of Address",                           required: true },
  { code: "UBO",    label: "Beneficial Ownership Declaration",           required: true },
  { code: "SOF",    label: "Source of Funds Declaration",                required: true },
  { code: "PP",     label: "Payment Purpose Statement",                  required: false },
  { code: "BEN",    label: "Beneficiary Verification",                   required: false },
  { code: "SUPP",   label: "Supplier Verification",                      required: false },
];

const MY_DOCS: Record<string, DocState> = {
  CAC: "Verified", MEMART: "Verified", DIR: "Verified", ADDR: "Verified",
  UBO: "Pending Review", SOF: "Verified", PP: "Verified",
  BEN: "More Info Required", SUPP: "Missing",
};

const docTone = (s: DocState) => ({
  "Verified":            "bg-success/15 text-success border-success/30",
  "Pending Review":      "bg-warning/15 text-warning border-warning/30",
  "More Info Required":  "bg-accent/15 text-accent border-accent/30",
  "Missing":             "bg-destructive/10 text-destructive border-destructive/30",
}[s]);

const docIcon = (s: DocState) =>
  s === "Verified" ? CheckCircle2 :
  s === "Pending Review" ? Clock :
  s === "More Info Required" ? AlertTriangle : Upload;

function CompliancePack() {
  useRequireWorkspace();
  const ws = useActiveWorkspace();

  const verifiedCount = Object.values(MY_DOCS).filter((s) => s === "Verified").length;
  const progress = Math.round((verifiedCount / REQUIRED_DOCS.length) * 100);
  const overallStatus: DocState =
    Object.values(MY_DOCS).some((s) => s === "Missing") ? "More Info Required" :
    Object.values(MY_DOCS).some((s) => s === "Pending Review") ? "Pending Review" :
    Object.values(MY_DOCS).some((s) => s === "More Info Required") ? "More Info Required" :
    "Verified";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Compliance Pack</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your account verification, documents, beneficiaries and supplier checks — all in one place.
          </p>
          <div className="text-[11px] text-muted-foreground mt-1">Signed in as <span className="font-semibold text-foreground">{ws.name}</span> · {ws.title} · <Badge variant="outline" className="ml-1 text-[10px]">{ws.badge}</Badge></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success("Compliance Pack PDF queued")}>
            <Download className="h-4 w-4 mr-1.5" /> Download Compliance Pack
          </Button>
        </div>
      </div>

      {/* Top status card */}
      <Card className="p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">My KYC / KYB Status</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${docTone(overallStatus)}`}>{overallStatus === "Verified" ? "Approved" : overallStatus}</Badge>
              <span className="text-sm text-muted-foreground">{verifiedCount} of {REQUIRED_DOCS.length} required items verified</span>
            </div>
          </div>
          <div className="min-w-[240px] flex-1 max-w-md">
            <Progress value={progress} />
            <div className="text-[11px] text-muted-foreground mt-1">{progress}% complete</div>
          </div>
        </div>
      </Card>

      {/* Required documents */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center gap-2 mb-3"><FileCheck2 className="h-4 w-4 text-primary" /><div className="text-sm font-semibold">Required documents</div></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {REQUIRED_DOCS.map((d) => {
            const state = MY_DOCS[d.code] ?? "Missing";
            const Icon = docIcon(state);
            return (
              <div key={d.code} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-8 w-8 rounded-lg bg-secondary grid place-items-center"><FileText className="h-4 w-4 text-muted-foreground" /></span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{d.label}</div>
                    <div className="text-[11px] text-muted-foreground">{d.required ? "Required" : "Optional"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${docTone(state)}`}><Icon className="h-3 w-3 mr-1 inline" /> {state}</Badge>
                  {state !== "Verified" && (
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Upload dialog opened for ${d.label}`)}>
                      <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Settlement processing */}
      <Card className="p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">Settlement processing</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Settlement batches, treasury sweeps and payout processing are managed from the Ops Console, not here.
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/ops">
              Open Ops Console <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* Buyer verification review queue */}
      <Card className="p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">Buyer verification review queue</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Review and action pending buyer identity/KYC checks in the Verification Center.
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/verification-center">
              Open Verification Center <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </Card>

      {/* Verification summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3"><Users className="h-4 w-4 text-primary" /><div className="text-sm font-semibold">Beneficiary verification</div></div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Quinn Solicitors LLP</span><Badge variant="outline" className={`text-[10px] ${docTone("Verified")}`}>Verified</Badge></li>
            <li className="flex justify-between"><span>Shenzhen LedTech</span><Badge variant="outline" className={`text-[10px] ${docTone("Pending Review")}`}>Pending Review</Badge></li>
          </ul>
        </Card>
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="h-4 w-4 text-primary" /><div className="text-sm font-semibold">Supplier verification</div></div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Yiwu PolyPack Trading</span><Badge variant="outline" className={`text-[10px] ${docTone("More Info Required")}`}>More Info Required</Badge></li>
            <li className="flex justify-between"><span>Dubai Auto Parts Hub</span><Badge variant="outline" className={`text-[10px] ${docTone("Verified")}`}>Verified</Badge></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
