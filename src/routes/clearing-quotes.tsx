import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck, Star, Clock, Truck, FileText, CheckCircle2, AlertTriangle,
  Send, Trophy, TrendingDown, Zap, Award, Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { ReadinessBar } from "@/components/ReadinessBar";
import {
  type ClearingBid, type ClearingRequest, type ServiceScope,
  getRequests, getBidsForRequest, createRequest, acceptBid,
  cancelRequest, reportIssue, loadDemoData,
  SERVICE_SCOPES, CLEARING_DISCLAIMER, WORKFLOW_STAGES,
} from "@/lib/clearing-store";
import { tradeFiles } from "@/lib/mock";
import { fmtMoney } from "@/lib/mock";

export const Route = createFileRoute("/clearing-quotes")({
  head: () => ({ meta: [{ title: "Clearing Agent Marketplace — Canta" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    file: typeof s.file === "string" ? s.file : undefined,
    request: typeof s.request === "string" ? s.request : undefined,
  }),
  component: ClearingQuotesPage,
});

function ClearingQuotesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ClearingRequest[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [activeReqId, setActiveReqId] = useState<string | null>(search.request ?? null);
  const [acceptBidState, setAcceptBidState] = useState<{ requestId: string; bid: ClearingBid } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setRequests(getRequests());
  }, [tick]);

  const filtered = useMemo(() => {
    if (!search.file) return requests;
    return requests.filter((r) => r.tradeFileId === search.file);
  }, [requests, search.file]);

  // Auto-select first request so smoke testers immediately see bid comparison, accept flow, and workflow tracker.
  useEffect(() => {
    if (!activeReqId && filtered.length > 0) setActiveReqId(filtered[0].id);
  }, [filtered, activeReqId]);

  const activeRequest = activeReqId ? requests.find((r) => r.id === activeReqId) : null;

  return (
    <div className="space-y-6">
      <ReadinessBar status="Demo Preview" cue="Canta verifies agent profiles and helps track the workflow. The clearing service is provided by the selected agent." />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Clearing Agent Marketplace</div>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">Compare Clearing Agent Bids</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Get quotes from verified clearing agents and compare fee, timeline, service scope, and rating before choosing who handles your clearing.
          </p>
          {search.file ? (
            <div className="text-xs text-muted-foreground mt-2">
              Filtered to trade file <span className="font-semibold text-foreground">{search.file}</span> ·{" "}
              <button onClick={() => navigate({ to: "/clearing-quotes" })} className="text-primary underline">Clear filter</button>
            </div>
          ) : null}
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Send className="h-4 w-4 mr-1.5" /> Request Clearing Quotes
        </Button>
      </header>

      <Card className="p-4 shadow-card border-amber-500/30 bg-amber-500/5 text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Disclaimer</div>
            <p className="text-xs text-muted-foreground mt-1">{CLEARING_DISCLAIMER}</p>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyRequests onCreate={() => setFormOpen(true)} onSeed={() => { loadDemoData(); setTick((t) => t + 1); toast.success("Demo data loaded"); }} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4">
          <Card className="p-3 shadow-card h-fit">
            <div className="text-xs uppercase tracking-widest text-muted-foreground px-2 pb-2">Quote requests</div>
            <div className="space-y-1.5">
              {filtered.map((r) => {
                const bids = getBidsForRequest(r.id);
                const active = r.id === activeReqId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveReqId(r.id)}
                    className={`w-full text-left rounded-md border px-3 py-2.5 transition ${
                      active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold truncate">{r.id}</span>
                      <Badge variant="outline" className="text-[10px]">{r.status}</Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {r.tradeFileId ? `${r.tradeFileId} · ` : ""}{r.portOfArrival}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {bids.length} bid{bids.length === 1 ? "" : "s"} · {r.serviceRequired}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-4">
            {activeRequest ? (
              <RequestDetail
                request={activeRequest}
                onAccept={(bid) => setAcceptBidState({ requestId: activeRequest.id, bid })}
                onRefresh={() => setTick((t) => t + 1)}
              />
            ) : (
              <Card className="p-10 text-center text-sm text-muted-foreground shadow-card">
                Select a quote request to compare bids.
              </Card>
            )}
          </div>
        </div>
      )}

      <RequestForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        defaultFile={search.file}
        onCreated={(req) => {
          setActiveReqId(req.id);
          setTick((t) => t + 1);
          toast.success("Clearing quote request sent to verified agents.");
        }}
      />

      <AcceptBidDialog
        state={acceptBidState}
        onClose={() => setAcceptBidState(null)}
        onConfirm={() => {
          if (!acceptBidState) return;
          acceptBid(acceptBidState.requestId, acceptBidState.bid.id);
          setAcceptBidState(null);
          setTick((t) => t + 1);
          toast.success("Clearing agent selected. Workflow started.");
        }}
      />
    </div>
  );
}

function EmptyRequests({ onCreate, onSeed }: { onCreate: () => void; onSeed: () => void }) {
  return (
    <Card className="p-10 text-center shadow-card">
      <Inbox className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
      <div className="text-base font-semibold">No clearing quotes yet</div>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        Request quotes from verified clearing agents to compare fee, timeline, service scope, and rating before choosing who handles your clearing.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
        <Button onClick={onCreate}>
          <Send className="h-4 w-4 mr-1.5" /> Request Clearing Quotes
        </Button>
        <Button variant="outline" onClick={onSeed}>Load demo data</Button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">Demo data shows a sample request, three agent bids, accept-bid confirmation, and the clearing workflow tracker.</p>
    </Card>
  );
}

function RequestDetail({
  request,
  onAccept,
  onRefresh,
}: {
  request: ClearingRequest;
  onAccept: (b: ClearingBid) => void;
  onRefresh: () => void;
}) {
  const bids = getBidsForRequest(request.id);
  const accepted = bids.find((b) => b.status === "Accepted");
  const cancelled = request.status === "Cancelled";
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueNote, setIssueNote] = useState("");

  return (
    <>
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{request.id} · created {new Date(request.createdAt).toLocaleDateString()}</div>
            <div className="text-lg font-semibold mt-1">{request.goodsDescription}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {request.portOfArrival} · {request.goodsCategory} · {request.serviceRequired}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{request.status}</Badge>
            {!accepted && !cancelled ? (
              <Button size="sm" variant="outline" onClick={() => {
                if (!confirm("Cancel this quote request? Agents will be notified.")) return;
                cancelRequest(request.id);
                toast.success("Quote request cancelled.");
                onRefresh();
              }}>Cancel Quote Request</Button>
            ) : null}
            {accepted ? (
              <Button size="sm" variant="outline" onClick={() => setIssueOpen(true)}>Report Issue</Button>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
          <Info label="Trade file" v={request.tradeFileId ?? "—"} />
          <Info label="BL number" v={request.blNumber ?? "—"} />
          <Info label="Container" v={request.containerNumber ?? "—"} />
          <Info label="Invoice value" v={fmtMoney(request.invoiceValue, request.currency)} />
          <Info label="Packages" v={request.packages ?? "—"} />
          <Info label="Weight" v={request.weight ?? "—"} />
          <Info label="CBM" v={request.cbm ?? "—"} />
          <Info label="Preferred timeline" v={request.preferredTimeline ?? "—"} />
        </div>
        {request.documents.length ? (
          <div className="mt-3 text-xs text-muted-foreground">
            Documents shared: {request.documents.join(", ")}
          </div>
        ) : null}
      </Card>

      {accepted ? <WorkflowCard request={request} bid={accepted} /> : null}

      {bids.length === 0 ? (
        <Card className="p-8 text-center shadow-card">
          <Inbox className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <div className="text-base font-semibold">No agent bids yet</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Your quote request has been sent. Bids from verified clearing agents will appear here once submitted.
          </p>
        </Card>
      ) : (
        <>
          {!accepted && !cancelled ? (
            <Card className="p-3 shadow-card border-primary/30 bg-primary/5 text-xs text-muted-foreground">
              Compare available bids and select a clearing agent when you are ready.
            </Card>
          ) : null}
          <BidComparison bids={bids} disabled={!!accepted || cancelled} onAccept={onAccept} />
        </>
      )}

      <Dialog open={issueOpen} onOpenChange={(o) => !o && setIssueOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report an issue with this clearing</DialogTitle>
            <DialogDescription>Canta will log the dispute and notify the clearing agent. Clearing outcome remains the agent's responsibility.</DialogDescription>
          </DialogHeader>
          <Textarea value={issueNote} onChange={(e) => setIssueNote(e.target.value)} placeholder="Describe the issue (e.g. duty mismatch, delay, missing docs)…" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!issueNote.trim()) return toast.error("Please describe the issue");
              reportIssue(request.id, issueNote.trim());
              setIssueOpen(false);
              setIssueNote("");
              toast.success("Issue reported. Canta has logged the dispute.");
              onRefresh();
            }}>Submit Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BidComparison({
  bids,
  disabled,
  onAccept,
}: {
  bids: ClearingBid[];
  disabled: boolean;
  onAccept: (b: ClearingBid) => void;
}) {
  const lowestFee = bids.reduce((m, b) => (b.clearingFee < m.clearingFee ? b : m), bids[0]);
  const fastest = bids.reduce((m, b) => (b.timelineDays < m.timelineDays ? b : m), bids[0]);
  const topRated = bids.reduce((m, b) => (b.rating > m.rating ? b : m), bids[0]);
  const bestValue = bids
    .slice()
    .sort((a, b) => (b.rating * 100 - b.clearingFee / 100) - (a.rating * 100 - a.clearingFee / 100))[0];

  return (
    <Card className="p-5 shadow-card">
      <div className="text-sm font-semibold">Compare Clearing Agent Bids</div>
      <p className="text-xs text-muted-foreground mt-1">
        The lowest quote may not always be the best option. Compare fee, timeline, rating, documents required, and service scope before selecting an agent.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
        <Highlight icon={<TrendingDown className="h-3.5 w-3.5" />} label="Lowest fee" v={lowestFee.agentName} sub={fmtMoney(lowestFee.clearingFee, "USD")} />
        <Highlight icon={<Zap className="h-3.5 w-3.5" />} label="Fastest" v={fastest.agentName} sub={`${fastest.timelineDays} days`} />
        <Highlight icon={<Star className="h-3.5 w-3.5" />} label="Highest rated" v={topRated.agentName} sub={`${topRated.rating} ★`} />
        <Highlight icon={<Trophy className="h-3.5 w-3.5" />} label="Best value" v={bestValue.agentName} sub="Balanced" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
        {bids.map((b) => (
          <BidCard key={b.id} bid={b} disabled={disabled} onAccept={() => onAccept(b)} />
        ))}
      </div>
    </Card>
  );
}

function BidCard({ bid, disabled, onAccept }: { bid: ClearingBid; disabled: boolean; onAccept: () => void }) {
  const accepted = bid.status === "Accepted";
  const inactive = bid.status === "Not Selected" || bid.status === "Declined" || bid.status === "Expired" || bid.status === "Withdrawn";
  return (
    <div className={`rounded-lg border p-4 ${accepted ? "border-success/50 bg-success/5" : inactive ? "border-border bg-muted/30 opacity-70" : "border-border bg-card"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate flex items-center gap-1.5">
            {bid.agentName}
            {bid.verified && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {bid.rating.toFixed(1)}</span>
            <span>· {bid.completedJobs} jobs</span>
            <span>· ⌁ {bid.responseTimeHrs}h response</span>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">{bid.status}</Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Info label="Clearing fee" v={fmtMoney(bid.clearingFee, "USD")} bold />
        <Info label="Timeline" v={`${bid.timelineDays} days`} />
        <Info label="Duty estimate" v={bid.dutyEstimate ? fmtMoney(bid.dutyEstimate, "USD") : "—"} />
        <Info label="Service" v={bid.serviceScope} />
      </div>

      <div className="mt-3 text-[11px] text-muted-foreground">
        <div><span className="font-semibold text-foreground">Documents required:</span> {bid.requiredDocs.join(", ")}</div>
        <div className="mt-1"><span className="font-semibold text-foreground">Terms:</span> {bid.terms}</div>
        {bid.notes ? <div className="mt-1"><span className="font-semibold text-foreground">Notes:</span> {bid.notes}</div> : null}
        <div className="mt-1">Bid expires {new Date(bid.expiresAt).toLocaleString()}</div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.info(`Contacting ${bid.agentName}…`)}>Contact</Button>
        <Button size="sm" disabled={disabled || accepted || inactive} onClick={onAccept}>
          {accepted ? "Accepted" : "Accept Bid"}
        </Button>
      </div>
    </div>
  );
}

function WorkflowCard({ request, bid }: { request: ClearingRequest; bid: ClearingBid }) {
  const stageIdxByStatus = (s: string) => WORKFLOW_STAGES.indexOf(s as never);
  const lastStageIdx = request.workflow
    .map((w) => stageIdxByStatus(w.status))
    .filter((i) => i >= 0)
    .reduce((m, i) => Math.max(m, i), 0);
  const isDisputed = request.workflow.some((w) => w.status === "Disputed");
  const isCancelled = request.status === "Cancelled";

  return (
    <Card className={`p-5 shadow-card ${isDisputed ? "border-amber-500/40 bg-amber-500/5" : isCancelled ? "border-destructive/40 bg-destructive/5" : "border-success/30 bg-success/5"}`}>
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Clearing workflow</div>
          <div className="text-base font-semibold mt-1 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-success" /> {bid.agentName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Clearing fee: {fmtMoney(bid.clearingFee, "USD")} · Timeline: {bid.timelineDays} days · {bid.serviceScope}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Next action: agent to request documents and start clearing.</div>
        </div>
        <Badge className={isDisputed ? "bg-amber-500/15 text-amber-700 border-amber-500/30" : isCancelled ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-success/15 text-success border-success/30"}>
          {isDisputed ? "Disputed" : isCancelled ? "Cancelled" : "Agent Selected"}
        </Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {WORKFLOW_STAGES.map((s, i) => {
          const reached = i <= lastStageIdx;
          return (
            <div key={s} className={`rounded-md border p-2 text-[11px] ${reached ? "border-success/40 bg-success/10 text-success" : "border-border bg-card text-muted-foreground"}`}>
              <div className="font-semibold flex items-center gap-1">
                {reached ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {i + 1}. {s}
              </div>
            </div>
          );
        })}
      </div>
      {request.workflow.length ? (
        <div className="mt-4 border-t border-border/60 pt-3">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Workflow history</div>
          <ul className="space-y-2">
            {request.workflow.slice().reverse().map((w, i) => (
              <li key={i} className="text-xs flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <div className="font-medium">{w.status} <span className="text-muted-foreground font-normal">· {new Date(w.at).toLocaleString()} · {w.actor ?? "System"}</span></div>
                  {w.note ? <div className="text-muted-foreground">{w.note}</div> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}

function Highlight({ icon, label, v, sub }: { icon: React.ReactNode; label: string; v: string; sub: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="text-xs font-semibold mt-1 truncate">{v}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function Info({ label, v, bold }: { label: string; v: string; bold?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-0.5 ${bold ? "text-sm font-semibold" : "text-xs font-medium"}`}>{v}</div>
    </div>
  );
}

function RequestForm({
  open, onClose, defaultFile, onCreated,
}: {
  open: boolean;
  onClose: () => void;
  defaultFile?: string;
  onCreated: (r: ClearingRequest) => void;
}) {
  const [f, setF] = useState({
    tradeFileId: defaultFile ?? "",
    blNumber: "",
    containerNumber: "",
    portOfArrival: "Apapa, Lagos",
    goodsCategory: "",
    goodsDescription: "",
    invoiceValue: "",
    currency: "USD",
    packages: "",
    weight: "",
    cbm: "",
    serviceRequired: "Clearing + delivery" as ServiceScope,
    preferredTimeline: "",
    notes: "",
  });
  const [docs, setDocs] = useState<string[]>(["Supplier invoice", "Packing list", "Bill of lading"]);

  useEffect(() => {
    if (!open) return;
    const tf = defaultFile ? tradeFiles.find((t) => t.id === defaultFile) : undefined;
    setF((p) => ({
      ...p,
      tradeFileId: defaultFile ?? p.tradeFileId,
      goodsDescription: tf?.goods ?? p.goodsDescription,
      invoiceValue: tf ? String(tf.invoiceValue) : p.invoiceValue,
      currency: tf?.ccy ?? p.currency,
      portOfArrival: tf?.destination ?? p.portOfArrival,
    }));
  }, [open, defaultFile]);

  const toggleDoc = (d: string) =>
    setDocs((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  const submit = () => {
    if (!f.portOfArrival || !f.goodsDescription) {
      toast.error("Port of arrival and goods description are required");
      return;
    }
    const req = createRequest({
      tradeFileId: f.tradeFileId || undefined,
      blNumber: f.blNumber || undefined,
      containerNumber: f.containerNumber || undefined,
      portOfArrival: f.portOfArrival,
      goodsCategory: f.goodsCategory || "—",
      goodsDescription: f.goodsDescription,
      invoiceValue: Number(f.invoiceValue) || 0,
      currency: f.currency,
      packages: f.packages || undefined,
      weight: f.weight || undefined,
      cbm: f.cbm || undefined,
      serviceRequired: f.serviceRequired,
      preferredTimeline: f.preferredTimeline || undefined,
      notes: f.notes || undefined,
      documents: docs,
    });
    onCreated(req);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Clearing Quotes</DialogTitle>
          <DialogDescription>
            Send this request to verified clearing agents. They will submit bids that include fee, timeline, service scope and required documents.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Trade file"><Input value={f.tradeFileId} onChange={(e) => setF({ ...f, tradeFileId: e.target.value })} placeholder="TR-2031" /></Field>
          <Field label="Port of arrival *"><Input value={f.portOfArrival} onChange={(e) => setF({ ...f, portOfArrival: e.target.value })} /></Field>
          <Field label="BL number"><Input value={f.blNumber} onChange={(e) => setF({ ...f, blNumber: e.target.value })} /></Field>
          <Field label="Container number"><Input value={f.containerNumber} onChange={(e) => setF({ ...f, containerNumber: e.target.value })} /></Field>
          <Field label="Goods category"><Input value={f.goodsCategory} onChange={(e) => setF({ ...f, goodsCategory: e.target.value })} placeholder="Consumer electronics" /></Field>
          <Field label="Cartons / packages"><Input value={f.packages} onChange={(e) => setF({ ...f, packages: e.target.value })} placeholder="240 cartons" /></Field>
          <Field label="Goods description *" wide>
            <Textarea value={f.goodsDescription} onChange={(e) => setF({ ...f, goodsDescription: e.target.value })} rows={2} />
          </Field>
          <Field label="Invoice value"><Input value={f.invoiceValue} onChange={(e) => setF({ ...f, invoiceValue: e.target.value })} placeholder="184000" /></Field>
          <Field label="Currency">
            <Select value={f.currency} onValueChange={(v) => setF({ ...f, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["USD","EUR","GBP","CNY","AED","NGN"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Weight (optional)"><Input value={f.weight} onChange={(e) => setF({ ...f, weight: e.target.value })} placeholder="3,200 kg" /></Field>
          <Field label="CBM (optional)"><Input value={f.cbm} onChange={(e) => setF({ ...f, cbm: e.target.value })} placeholder="32" /></Field>
          <Field label="Required service" wide>
            <Select value={f.serviceRequired} onValueChange={(v) => setF({ ...f, serviceRequired: v as ServiceScope })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICE_SCOPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Preferred timeline" wide>
            <Input value={f.preferredTimeline} onChange={(e) => setF({ ...f, preferredTimeline: e.target.value })} placeholder="Within 7 days of arrival" />
          </Field>
          <Field label="Documents to share" wide>
            <div className="flex flex-wrap gap-2">
              {["Supplier invoice","Packing list","Bill of lading","Form M","SONCAP / PAAR","Proof of payment","Insurance certificate"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDoc(d)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border ${docs.includes(d) ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Notes to agents" wide>
            <Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} placeholder="Anything agents should know before bidding…" />
          </Field>
        </div>

        <p className="text-[11px] text-muted-foreground mt-2">{CLEARING_DISCLAIMER}</p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}><Send className="h-4 w-4 mr-1.5" /> Send to Verified Agents</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function AcceptBidDialog({
  state, onClose, onConfirm,
}: {
  state: { requestId: string; bid: ClearingBid } | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm clearing agent selection</DialogTitle>
        </DialogHeader>
        {state ? (
          <div className="space-y-3 text-sm">
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Canta is not the clearing agent.</span> Canta connects you with verified clearing agents and helps track the workflow.
            </div>
            <p className="text-muted-foreground">
              You are selecting <span className="text-foreground font-semibold">{state.bid.agentName}</span> to handle clearing for this Trade File. Canta will help track the workflow, but clearing fees, timelines, duty estimates, and service delivery are provided by the clearing agent.
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
