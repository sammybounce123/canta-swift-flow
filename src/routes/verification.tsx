import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActiveWorkspace, useRequireWorkspace } from "@/lib/workspace-guard";
import { CheckCircle2, FileText, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/verification")({
  head: () => ({ meta: [{ title: "Verification — Canta" }] }),
  component: VerificationPage,
});

function VerificationPage() {
  useRequireWorkspace();
  const ws = useActiveWorkspace();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> {ws.badge}</Badge>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">{ws.workspaceLabel} Verification</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Review required documents, business details, and settlement readiness for this workspace.
          </p>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge className="text-xs bg-primary/10 text-primary border-primary/30">{ws.name} · {ws.title}</Badge>
            <Badge variant="secondary" className="text-xs">{ws.workspaceLabel}</Badge>
          </div>
        </div>
        <Button onClick={() => toast.success("Verification documents submitted")}>Submit for review</Button>
      </header>

      <Card className="p-5 shadow-card space-y-4">
        <div className="text-sm font-semibold">Verification checklist</div>
        {[
          ["Business registration", true],
          ["Authorized representative ID", true],
          ["Bank or settlement account proof", false],
          ["Recent transaction document", false],
        ].map(([label, done]) => (
          <div key={String(label)} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm">
              {done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
              <span>{label}</span>
            </div>
            {done ? <Badge className="bg-success/10 text-success border-success/30">Verified</Badge> : <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload</Button>}
          </div>
        ))}
      </Card>
    </div>
  );
}