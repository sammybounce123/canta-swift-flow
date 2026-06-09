import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { leads, fmtMoney } from "@/lib/mock";
import { Brain, Sparkles, MessageCircle, FileSearch, Calculator, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-growth")({
  head: () => ({ meta: [{ title: "AI Growth — Canta" }] }),
  component: AIGrowth,
});

function AIGrowth() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Growth Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">Lead intelligence, sales copilot and AI document extraction.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Total leads", v: 248 },
          { l: "Hot leads", v: leads.filter((l) => l.stage === "Hot").length },
          { l: "Converted (30d)", v: 32 },
          { l: "Follow-ups due", v: 14 },
          { l: "Pipeline value", v: "$2.1M" },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="text-xl font-semibold mt-2 tabular-nums">{k.v}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4" /> Lead Finder</div>
            <Button size="sm" variant="outline" onClick={() => toast.success("Scoring 248 leads…")}><Brain className="h-3.5 w-3.5 mr-1" /> Re-score</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-3 py-2">Lead</th><th className="px-3 py-2">Segment</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Stage</th><th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-3 py-2"><div className="font-medium">{l.name}</div><div className="text-[11px] text-muted-foreground">{l.country}</div></td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-[10px]">{l.segment}</Badge></td>
                    <td className="px-3 py-2"><div className="font-semibold">{l.score}</div></td>
                    <td className="px-3 py-2 tabular-nums">{fmtMoney(l.value, "USD")}</td>
                    <td className="px-3 py-2"><Badge className={`text-[10px] ${l.stage === "Hot" ? "bg-destructive/15 text-destructive border-destructive/30" : l.stage === "Warm" ? "bg-amber-500/15 text-amber-700 border-amber-500/30" : "bg-secondary"}`}>{l.stage}</Badge></td>
                    <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => toast.success(`Copilot: ${l.name}`)}><Sparkles className="h-3.5 w-3.5" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 shadow-card border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="text-sm font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> AI Sales Copilot</div>
          <div className="mt-3 text-sm">
            <div className="font-medium">Mega Plaza Imports</div>
            <div className="text-xs text-muted-foreground">Importer · Hot · 92 score</div>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-card border border-border text-xs space-y-2">
            <div><span className="font-semibold">Pain point:</span> 5-day supplier settlement delays from Shenzhen.</div>
            <div><span className="font-semibold">Best pitch:</span> Same-day RMB settlement with escrow protection.</div>
            <div><span className="font-semibold">Next action:</span> WhatsApp follow-up with landed cost demo.</div>
            <div><span className="font-semibold">Probability:</span> <span className="text-success">68% conversion</span></div>
          </div>
          <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast.success("WhatsApp follow-up sent")}><MessageCircle className="h-4 w-4 mr-1.5" /> Send WhatsApp follow-up</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { i: FileSearch, t: "AI Document Extractor", d: "Pulls supplier, invoice, BL, container, ETA from uploaded files." },
          { i: Calculator, t: "AI Landed Cost Assistant", d: "Auto-estimates landed cost + margin from invoice + corridor data." },
          { i: Brain, t: "AI Supplier Matching", d: "Suggests supplier acquisition targets from repeat trade categories." },
        ].map((f) => (
          <Card key={f.t} className="p-5 shadow-card">
            <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center"><f.i className="h-4 w-4 text-primary" /></div>
            <div className="font-semibold mt-3">{f.t}</div>
            <div className="text-xs text-muted-foreground mt-1">{f.d}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
