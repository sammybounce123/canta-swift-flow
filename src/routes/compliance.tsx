import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { complianceItems } from "@/lib/mock";
import { ShieldCheck, FileCheck2, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance Pack — Canta" }] }),
  component: Compliance,
});

function tone(s: string) {
  if (s === "Verified") return "bg-success/15 text-success border-success/30";
  if (s === "In Review") return "bg-amber-500/15 text-amber-700 border-amber-500/30";
  if (s === "Enhanced DD") return "bg-destructive/15 text-destructive border-destructive/30";
  if (s === "Rejected") return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-secondary text-secondary-foreground border-border";
}

function Compliance() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Compliance Pack</h1>
          <p className="text-sm text-muted-foreground mt-1">KYB, supplier verification, sanctions screening & audit trail.</p>
        </div>
        <Button variant="outline" onClick={() => toast.success("Compliance report exported")}><Download className="h-4 w-4 mr-1.5" /> Export report</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Pending reviews", v: complianceItems.filter((c) => c.status === "In Review").length, icon: FileCheck2 },
          { l: "High-risk flags", v: 2, icon: AlertTriangle },
          { l: "Verified entities", v: complianceItems.filter((c) => c.status === "Verified").length, icon: ShieldCheck },
          { l: "Incomplete KYB", v: complianceItems.filter((c) => c.status === "Not Started").length, icon: AlertTriangle },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
              <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-semibold mt-2">{k.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 shadow-card">
          <div className="text-sm font-semibold mb-3">KYB checklist</div>
          <div className="space-y-2 text-sm">
            {["Company registration (CAC)", "Beneficial owners", "Directors", "Proof of address", "Source of funds", "Tax ID (TIN)", "Bank reference"].map((c, i) => (
              <div key={c} className="flex items-center justify-between p-2 rounded-lg bg-secondary/40">
                <span>{c}</span>
                <Badge variant="outline" className={`text-[10px] ${i < 5 ? "bg-success/15 text-success border-success/30" : ""}`}>{i < 5 ? "Verified" : "Pending"}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 shadow-card overflow-hidden">
          <div className="p-4 border-b border-border text-sm font-semibold">Entities & reviews</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-4 py-3">ID</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-3 font-medium">{c.entity}</td>
                    <td className="px-4 py-3">{c.type}</td>
                    <td className="px-4 py-3">{c.owner}</td>
                    <td className="px-4 py-3">{c.updated}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${tone(c.status)}`}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card className="p-5 shadow-card">
        <div className="text-sm font-semibold mb-3">Approval workflow queue</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { t: "Supplier payment release · $48,000", req: "Tunde Bakare", risk: "Low" },
            { t: "New beneficiary: Yiwu General Trading", req: "Adaeze Okonkwo", risk: "Low" },
            { t: "Escrow release · TF-2026-0214", req: "Ops Team", risk: "Medium" },
            { t: "High-value FX: $1.2M USD→NGN", req: "Tunde Bakare", risk: "High" },
          ].map((a) => (
            <div key={a.t} className="p-4 rounded-xl border border-border bg-card">
              <div className="text-sm font-medium">{a.t}</div>
              <div className="text-xs text-muted-foreground mt-1">By {a.req} · Risk: {a.risk}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => toast.success("Approved")}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => toast.error("Rejected")}>Reject</Button>
                <Button size="sm" variant="ghost">Comments</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
