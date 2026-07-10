import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, FileText, Search,
  ThumbsUp, ThumbsDown, MessageCircle, Paperclip, TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/approvals")({
  head: () => ({ meta: [{ title: "Approvals — Canta" }] }),
  component: Approvals,
});

type Status = "Pending" | "Approved" | "Rejected" | "Info Requested";

type Request = {
  id: string;
  type: string;
  requester: string;
  amount?: number;
  currency?: string;
  customer?: string;
  riskScore: number;
  tradeFile?: string;
  documents: string[];
  status: Status;
  submitted: string;
  due: string;
  overdue?: boolean;
  comments: { who: string; when: string; note: string }[];
};

const seed: Request[] = [
  { id: "APR-9821", type: "Supplier payment", requester: "Adaeze Okonkwo", amount: 184_300, currency: "USD", customer: "Guangzhou Electronics Co.", riskScore: 42, tradeFile: "TF-2418", documents: ["Pro-forma Invoice", "BL Draft", "Packing List"], status: "Pending", submitted: "Jun 8, 09:12", due: "Jun 9, 17:00", comments: [{ who: "Compliance Bot", when: "Jun 8, 09:14", note: "Sanctions screening clear." }] },
  { id: "APR-9820", type: "Escrow release", requester: "Tunde Bakare", amount: 92_500, currency: "USD", customer: "Shenzhen LED Ltd", riskScore: 28, tradeFile: "TF-2410", documents: ["BL Final", "Inspection Report"], status: "Pending", submitted: "Jun 8, 08:40", due: "Jun 8, 17:00", overdue: true, comments: [] },
  { id: "APR-9818", type: "New beneficiary", requester: "Femi Adeyemi", customer: "Yiwu Fashion Trading", riskScore: 35, documents: ["KYB Pack", "Bank Confirmation"], status: "Pending", submitted: "Jun 7, 16:20", due: "Jun 9, 12:00", comments: [] },
  { id: "APR-9815", type: "High-value FX conversion", requester: "Tunde Bakare", amount: 2_400_000, currency: "USD", riskScore: 18, documents: ["Rate Quote"], status: "Pending", submitted: "Jun 8, 07:55", due: "Jun 8, 14:00", overdue: true, comments: [] },
  { id: "APR-9814", type: "Expense policy update", requester: "Chiamaka Eze", customer: "Marketing Team · Lagos", riskScore: 12, documents: ["Expense Policy Ack"], status: "Pending", submitted: "Jun 8, 11:02", due: "Jun 10, 17:00", comments: [] },
  { id: "APR-9810", type: "Freight invoice approval", requester: "Ibrahim Lawal", amount: 18_400, currency: "USD", customer: "Maersk Lagos", riskScore: 22, tradeFile: "TF-2401", documents: ["Freight Invoice", "Arrival Notice"], status: "Pending", submitted: "Jun 7, 14:11", due: "Jun 9, 17:00", comments: [] },
  { id: "APR-9805", type: "Global collection settlement", requester: "Merchant Admin", amount: 412_000, currency: "USD", customer: "Pan-African University", riskScore: 31, documents: ["Reconciliation Report"], status: "Pending", submitted: "Jun 8, 06:30", due: "Jun 9, 17:00", comments: [] },
  { id: "APR-9802", type: "Document approval", requester: "Procurement Officer", customer: "TF-2392 · Auto Parts", riskScore: 14, tradeFile: "TF-2392", documents: ["Revised Invoice", "HS Code Update"], status: "Pending", submitted: "Jun 7, 18:05", due: "Jun 9, 17:00", comments: [] },
  { id: "APR-9800", type: "Compliance approval", requester: "Canta Trade Officer", customer: "New Importer · Lagos Hardware", riskScore: 78, documents: ["CAC", "MEMART", "UBO Form"], status: "Pending", submitted: "Jun 8, 09:50", due: "Jun 9, 17:00", comments: [{ who: "Compliance Bot", when: "Jun 8, 09:52", note: "PEP screening flag — enhanced DD recommended." }] },
  { id: "APR-9795", type: "Trade finance request", requester: "Importer Owner", amount: 350_000, currency: "USD", customer: "Lagos Hardware Imports", riskScore: 55, tradeFile: "TF-2388", documents: ["Financials FY25", "Trade History"], status: "Pending", submitted: "Jun 8, 10:14", due: "Jun 11, 17:00", comments: [] },
  { id: "APR-9790", type: "Supplier payment", requester: "Adaeze Okonkwo", amount: 62_000, currency: "USD", customer: "Dubai Auto Spares LLC", riskScore: 24, tradeFile: "TF-2380", documents: ["Invoice"], status: "Approved", submitted: "Jun 7, 11:30", due: "Jun 8, 17:00", comments: [] },
  { id: "APR-9788", type: "Marketing budget approval", requester: "Femi Adeyemi", customer: "Online Ads · Q3", riskScore: 9, documents: [], status: "Approved", submitted: "Jun 7, 10:00", due: "Jun 8, 17:00", comments: [] },
  { id: "APR-9784", type: "New beneficiary", requester: "Procurement Officer", customer: "Suspicious Holdings Ltd", riskScore: 82, documents: ["KYB Pack"], status: "Rejected", submitted: "Jun 7, 09:00", due: "Jun 8, 17:00", comments: [{ who: "Chiamaka Eze", when: "Jun 7, 14:20", note: "Failed adverse media screening." }] },
];

const workflowDefs = [
  { type: "Supplier payment", steps: ["Finance review", "Treasury approval", "Compliance check"] },
  { type: "New beneficiary", steps: ["Compliance KYB", "Treasury approval"] },
  { type: "Escrow release", steps: ["Document review", "Treasury approval"] },
  { type: "Freight invoice approval", steps: ["Operations check", "Finance approval"] },
  { type: "Expense policy update", steps: ["Admin approval", "Finance check"] },
  { type: "High-value FX conversion", steps: ["Treasury", "Owner sign-off"] },
  { type: "Global collection settlement", steps: ["Reconciliation", "Finance"] },
  { type: "Document approval", steps: ["Trade Officer", "Compliance"] },
  { type: "Compliance approval", steps: ["Compliance Officer", "Super Admin"] },
  { type: "Trade finance request", steps: ["Credit review", "Risk", "Treasury"] },
];

function riskTone(s: number) {
  if (s >= 70) return "bg-destructive/15 text-destructive border-destructive/30";
  if (s >= 40) return "bg-warning/20 text-warning-foreground border-warning/40";
  return "bg-success/15 text-success border-success/30";
}

function statusTone(s: Status) {
  switch (s) {
    case "Approved": return "bg-success/15 text-success border-success/30";
    case "Rejected": return "bg-destructive/15 text-destructive border-destructive/30";
    case "Info Requested": return "bg-warning/20 text-warning-foreground border-warning/40";
    default: return "bg-secondary text-foreground border-border";
  }
}

function Approvals() {
  const [items, setItems] = useState<Request[]>(seed);
  const [q, setQ] = useState("");
  const [openItem, setOpenItem] = useState<Request | null>(null);
  const [comment, setComment] = useState("");

  const filtered = useMemo(
    () => items.filter((r) => `${r.id} ${r.type} ${r.requester} ${r.customer ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  const pending = items.filter((r) => r.status === "Pending");
  const approvedToday = items.filter((r) => r.status === "Approved").length;
  const rejectedToday = items.filter((r) => r.status === "Rejected").length;
  const highRisk = items.filter((r) => r.status === "Pending" && r.riskScore >= 70).length;
  const overdue = items.filter((r) => r.status === "Pending" && r.overdue).length;

  const act = (id: string, status: Status, note?: string) => {
    setItems((prev) => prev.map((r) => r.id === id ? {
      ...r,
      status,
      comments: note ? [...r.comments, { who: "You", when: "now", note }] : r.comments,
    } : r));
    toast.success(`${id} · ${status}`);
    setOpenItem(null);
    setComment("");
  };

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Approvals enforce dual control on high-value actions." />
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">Cross-product approval workflows for trade, payments, escrow, FX and compliance.</p>
        </div>
        <Button className="bg-primary" onClick={() => toast.success("Workflow rules opened")}>
          <ShieldCheck className="h-4 w-4 mr-1.5" /> Configure Workflows
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { l: "Pending approvals", v: pending.length, icon: Clock, tone: "text-primary" },
          { l: "Approved today", v: approvedToday, icon: CheckCircle2, tone: "text-success" },
          { l: "Rejected today", v: rejectedToday, icon: XCircle, tone: "text-destructive" },
          { l: "High-risk approvals", v: highRisk, icon: AlertTriangle, tone: "text-warning-foreground" },
          { l: "Overdue", v: overdue, icon: TrendingUp, tone: "text-destructive" },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.l} className="p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{k.l}</div>
                <Icon className={`h-4 w-4 ${k.tone}`} />
              </div>
              <div className="text-2xl font-semibold mt-2 tabular-nums">{k.v}</div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="queue">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="queue">Approval Queue</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Rules</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 w-72" placeholder="Search requests…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        <TabsContent value="queue" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.filter((r) => r.status === "Pending").map((r) => (
              <Card key={r.id} className="p-5 shadow-card hover:shadow-elegant transition cursor-pointer" onClick={() => setOpenItem(r)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">{r.id}</div>
                    <div className="text-sm font-semibold mt-0.5">{r.type}</div>
                  </div>
                  <Badge variant="outline" className={`${riskTone(r.riskScore)} text-[10px]`}>Risk {r.riskScore}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <div className="text-muted-foreground">Requester</div>
                    <div className="font-medium mt-0.5">{r.requester}</div>
                  </div>
                  {r.amount != null && (
                    <div>
                      <div className="text-muted-foreground">Amount</div>
                      <div className="font-medium mt-0.5 tabular-nums">{r.currency} {r.amount.toLocaleString()}</div>
                    </div>
                  )}
                  {r.customer && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground">Customer</div>
                      <div className="font-medium mt-0.5">{r.customer}</div>
                    </div>
                  )}
                  {r.tradeFile && (
                    <div>
                      <div className="text-muted-foreground">Trade file</div>
                      <div className="font-medium mt-0.5">{r.tradeFile}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">Due</div>
                    <div className={`font-medium mt-0.5 ${r.overdue ? "text-destructive" : ""}`}>{r.due}{r.overdue && " · overdue"}</div>
                  </div>
                </div>

                {r.documents.length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    {r.documents.map((d) => (
                      <Badge key={d} variant="outline" className="text-[10px] border-border">{d}</Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <Badge variant="outline" className={`${statusTone(r.status)} text-[10px]`}>{r.status}</Badge>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); act(r.id, "Info Requested"); }}>
                      <MessageCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); act(r.id, "Rejected"); }}>
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" className="bg-success text-success-foreground hover:bg-success/90" onClick={(e) => { e.stopPropagation(); act(r.id, "Approved"); }}>
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowDefs.map((w) => (
              <Card key={w.type} className="p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold">{w.type}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{w.steps.length}-step approval chain</div>
                  </div>
                  <Badge variant="outline" className="border-border text-[10px]">Active</Badge>
                </div>
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {w.steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <Badge variant="outline" className="border-border text-[11px]">{i + 1}. {s}</Badge>
                      {i < w.steps.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-5">
                  <Button size="sm" variant="outline" onClick={() => toast.success(`${w.type} workflow edited`)}>Edit chain</Button>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Thresholds updated`)}>Set thresholds</Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Requester</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Risk</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.filter((r) => r.status !== "Pending").map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-5 py-3 font-medium">{r.type}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.requester}</td>
                    <td className="px-5 py-3 tabular-nums">{r.amount ? `${r.currency} ${r.amount.toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-3"><Badge variant="outline" className={`${riskTone(r.riskScore)} text-[10px]`}>{r.riskScore}</Badge></td>
                    <td className="px-5 py-3"><Badge variant="outline" className={`${statusTone(r.status)} text-[10px]`}>{r.status}</Badge></td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{r.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <DialogContent className="max-w-2xl">
          {openItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {openItem.type} · {openItem.id}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Detail label="Requester" value={openItem.requester} />
                <Detail label="Customer" value={openItem.customer ?? "—"} />
                <Detail label="Amount" value={openItem.amount ? `${openItem.currency} ${openItem.amount.toLocaleString()}` : "—"} />
                <Detail label="Trade file" value={openItem.tradeFile ?? "—"} />
                <Detail label="Risk score" value={String(openItem.riskScore)} />
                <Detail label="Due" value={openItem.due} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Attached documents</div>
                <div className="flex flex-wrap gap-1.5">
                  {openItem.documents.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                  {openItem.documents.map((d) => (
                    <Badge key={d} variant="outline" className="border-border text-[11px]">{d}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">Comments</div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {openItem.comments.length === 0 && <div className="text-xs text-muted-foreground">No comments yet.</div>}
                  {openItem.comments.map((c, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-secondary/40 border border-border">
                      <div className="font-medium">{c.who} <span className="text-muted-foreground font-normal">· {c.when}</span></div>
                      <div className="mt-0.5">{c.note}</div>
                    </div>
                  ))}
                </div>
                <Textarea className="mt-3" placeholder="Add a comment for the approval log…" value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => act(openItem.id, "Info Requested", comment || "More information requested")}>
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Request info
                </Button>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => act(openItem.id, "Rejected", comment || "Rejected")}>
                  <ThumbsDown className="h-3.5 w-3.5 mr-1.5" /> Reject
                </Button>
                <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => act(openItem.id, "Approved", comment || "Approved")}>
                  <ThumbsUp className="h-3.5 w-3.5 mr-1.5" /> Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
