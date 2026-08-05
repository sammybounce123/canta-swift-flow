import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck, Upload, Download, CheckCircle2, Clock, AlertCircle, FileText, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import { isDemoApproved } from "@/lib/supplier-data";

export const Route = createFileRoute("/suppliers/kyb")({
  head: () => ({ meta: [{ title: "Supplier KYB — Canta" }] }),
  component: SupplierKybPage,
});

type KybStatus =
  | "Not Started" | "In Progress" | "Submitted" | "Approved"
  | "Rejected" | "More Info Required" | "Expired";

type Doc = { key: string; label: string; required: boolean; status: "Missing" | "Uploaded" | "Approved" | "Expired"; uploadedAt?: string; fileName?: string };

const SEED: Doc[] = [
  { key: "business-licence", label: "Business licence",              required: true, status: "Approved", uploadedAt: "2026-04-12", fileName: "BusinessLicense.pdf" },
  { key: "legal-rep-id",     label: "Legal representative ID",        required: true, status: "Approved", uploadedAt: "2026-04-12", fileName: "LegalRepID.pdf" },
  { key: "bank-confirmation",label: "Bank confirmation letter",       required: true, status: "Approved", uploadedAt: "2026-04-12", fileName: "BankConfirmationLetter.pdf" },
  { key: "export-licence",   label: "Export licence",                 required: true, status: "Approved", uploadedAt: "2026-04-12", fileName: "ExportLicence.pdf" },
];

const KEY = "canta:supplier:kyb:v1";

function loadDocs(): Doc[] {
  if (typeof window === "undefined") return SEED;
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : SEED; } catch { return SEED; }
}

function overallStatus(docs: Doc[]): "Incomplete" | "In Review" | "Approved" {
  if (docs.every((d) => d.status === "Approved")) return "Approved";
  if (docs.some((d) => d.status === "Uploaded")) return "In Review";
  return "Incomplete";
}

function SupplierKybPage() {
  const demo = isDemoApproved();
  const [docs, setDocs] = useState<Doc[]>(SEED);
  const [status, setStatus] = useState<KybStatus>(demo ? "Approved" : "Approved");
  const [uploadFor, setUploadFor] = useState<Doc | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [comments] = useState<string[]>([
    "2026-04-15 — Compliance: registration and director ID approved.",
    "2026-05-02 — Compliance: address proof received, under review.",
  ]);

  useEffect(() => { setDocs(loadDocs()); }, []);

  function save(next: Doc[]) {
    setDocs(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  function uploaded(key: string, name: string) {
    const next = docs.map((d) => d.key === key ? { ...d, status: "Uploaded" as const, uploadedAt: new Date().toISOString().slice(0, 10), fileName: name } : d);
    save(next);
    setUploadFor(null);
    setStatus(overallStatus(next) === "Approved" ? "Approved" : "In Progress");
    toast.success(`${name} uploaded`);
  }

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="KYB verification helps improve trust and unlocks more features." />
      <div className="flex justify-end"><Badge variant="outline" className="text-[10px]">Demo data</Badge></div>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0" /> Supplier KYB / Verification
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your verification documents. Keep them current to stay trade-ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("Verification summary downloaded")}>
            <Download className="h-4 w-4 mr-1.5" /> Download summary
          </Button>
          <Button onClick={() => { setReviewOpen(true); }}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Request review
          </Button>
        </div>
      </header>

      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Current status</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={statusTone(status)}>{statusIcon(status)} {overallStatus(docs)}</Badge>
              {demo && <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Demo verified</Badge>}
              {overallStatus(docs) === "Approved" && <span className="text-xs text-muted-foreground">You can still update documents or download your summary.</span>}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            <div>Last update: {new Date().toISOString().slice(0, 10)}</div>
            <div>Reviewed within 1 business day — demo</div>
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Documents</div>
        <div className="space-y-2">
          {docs.map((d) => (
            <div key={d.key} className="flex items-center justify-between gap-3 border-b border-border/40 py-2 flex-wrap">
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /> {d.label} {d.required && <span className="text-destructive">*</span>}</div>
                <div className="text-[11px] text-muted-foreground">{d.fileName ? `${d.fileName} · uploaded ${d.uploadedAt}` : "Not uploaded yet"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={docTone(d.status)}>{d.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => setUploadFor(d)}><Upload className="h-3.5 w-3.5 mr-1" /> {d.status === "Missing" ? "Upload" : "Replace"}</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-2">Verification comments</div>
        {comments.length === 0 ? (
          <div className="text-xs text-muted-foreground">No comments yet.</div>
        ) : (
          <ul className="text-xs text-muted-foreground space-y-1">
            {comments.map((c) => <li key={c}>• {c}</li>)}
          </ul>
        )}
      </Card>

      {uploadFor && (
        <UploadDocDialog
          label={uploadFor.label}
          onClose={() => setUploadFor(null)}
          onUpload={(name) => uploaded(uploadFor.key, name)}
        />
      )}

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Request verification review</DialogTitle></DialogHeader>
          <Textarea placeholder="Optional message to compliance reviewer..." />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button onClick={() => { setReviewOpen(false); setStatus("Submitted"); toast.success("Review requested — compliance has been notified."); }}>Submit request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function statusTone(s: KybStatus) {
  switch (s) {
    case "Approved": return "bg-success/15 text-success border-success/30";
    case "Submitted":
    case "In Progress": return "bg-primary/15 text-primary border-primary/30";
    case "Rejected":
    case "Expired": return "bg-destructive/15 text-destructive border-destructive/30";
    case "More Info Required": return "bg-amber-500/15 text-amber-700 border-amber-500/30";
    default: return "bg-muted text-muted-foreground";
  }
}
function statusIcon(s: KybStatus) {
  if (s === "Approved") return <CheckCircle2 className="h-3 w-3 mr-1" />;
  if (s === "Submitted" || s === "In Progress") return <Clock className="h-3 w-3 mr-1" />;
  return <AlertCircle className="h-3 w-3 mr-1" />;
}
function docTone(s: Doc["status"]) {
  if (s === "Approved") return "bg-success/15 text-success border-success/30 text-[10px]";
  if (s === "Uploaded") return "bg-primary/15 text-primary border-primary/30 text-[10px]";
  if (s === "Expired") return "bg-destructive/15 text-destructive border-destructive/30 text-[10px]";
  return "bg-muted text-muted-foreground text-[10px]";
}

function UploadDocDialog({ label, onClose, onUpload }: { label: string; onClose: () => void; onUpload: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Upload — {label}</DialogTitle></DialogHeader>
        <Input type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) setName(f.name); }} />
        {name && <div className="text-[11px] text-muted-foreground">{name}</div>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { if (!name) { toast.error("Choose a file"); return; } onUpload(name); }}>Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
