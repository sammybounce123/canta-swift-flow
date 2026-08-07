import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert, Plus, Upload, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/partner/disputes")({
  head: () => ({ meta: [{ title: "Partner Disputes — Canta" }] }),
  component: PartnerDisputesPage,
});

type DisputeStatus =
  | "Open"
  | "Under Review"
  | "Waiting on Client"
  | "Waiting on Canta"
  | "Resolved"
  | "Closed";
type Dispute = {
  id: string;
  client: string;
  marketer: string;
  caseRef: string;
  solicitor: string;
  amount: number;
  issueType: string;
  status: DisputeStatus;
  owner: string;
  createdAt: string;
  lastUpdate: string;
  notes: string[];
  evidence: string[];
};

const SEED: Dispute[] = [
  {
    id: "DSP-001",
    client: "Mr. Adebayo",
    marketer: "Sade O.",
    caseRef: "KPP-CASE-4082",
    solicitor: "Howell & Sons",
    amount: 245_000,
    issueType: "Funding mismatch",
    status: "Under Review",
    owner: "Canta Compliance",
    createdAt: "2026-06-10",
    lastUpdate: "2026-06-18",
    notes: ["2026-06-10 — Opened by marketer", "2026-06-12 — Bank statement requested"],
    evidence: ["Bank_Statement_June.pdf"],
  },
  {
    id: "DSP-002",
    client: "Mrs. Okonkwo",
    marketer: "Sade O.",
    caseRef: "KPP-CASE-4101",
    solicitor: "Bryant Legal",
    amount: 88_500,
    issueType: "Document issue",
    status: "Waiting on Client",
    owner: "Sade O.",
    createdAt: "2026-06-15",
    lastUpdate: "2026-06-19",
    notes: ["2026-06-15 — Opened"],
    evidence: [],
  },
];

const KEY = "canta:partner:disputes:v1";

function loadList(): Dispute[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
}

const STATUS_TONE: Record<DisputeStatus, string> = {
  Open: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "Under Review": "bg-primary/15 text-primary border-primary/30",
  "Waiting on Client": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  "Waiting on Canta": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Resolved: "bg-success/15 text-success border-success/30",
  Closed: "bg-muted text-muted-foreground",
};

function PartnerDisputesPage() {
  const [list, setList] = useState<Dispute[]>(SEED);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Dispute | null>(null);

  useEffect(() => {
    setList(loadList());
  }, []);
  function save(next: Dispute[]) {
    setList(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }

  const stats = useMemo(
    () => ({
      open: list.filter((d) => d.status === "Open" || d.status === "Under Review").length,
      waiting: list.filter(
        (d) => d.status === "Waiting on Client" || d.status === "Waiting on Canta",
      ).length,
      resolved: list.filter((d) => d.status === "Resolved").length,
    }),
    [list],
  );

  function addDispute(
    d: Omit<Dispute, "id" | "createdAt" | "lastUpdate" | "notes" | "status" | "owner" | "evidence">,
  ) {
    const id = `DSP-${String(list.length + 1).padStart(3, "0")}`;
    const today = new Date().toISOString().slice(0, 10);
    const newD: Dispute = {
      ...d,
      id,
      status: "Open",
      owner: d.marketer,
      createdAt: today,
      lastUpdate: today,
      notes: [`${today} — Dispute opened`],
      evidence: [],
    };
    save([newD, ...list]);
    setOpen(false);
    toast.success(`${id} opened`);
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" /> Partner Case Disputes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Open, track and resolve disputes tied to your client payment cases.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1.5" /> Open dispute
            </Button>
          </DialogTrigger>
          <NewDisputeDialog onSubmit={addDispute} onClose={() => setOpen(false)} />
        </Dialog>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Open / under review" value={String(stats.open)} tone="text-primary" />
        <Stat label="Waiting" value={String(stats.waiting)} tone="text-amber-600" />
        <Stat label="Resolved" value={String(stats.resolved)} tone="text-success" />
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-3 px-3">Reference</th>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Marketer</th>
                <th className="py-3 px-3">Case</th>
                <th className="py-3 px-3">Solicitor</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3">Issue</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last update</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id} className="border-t hover:bg-secondary/30">
                  <td className="py-3 px-3 font-mono text-xs">{d.id}</td>
                  <td className="py-3 px-3">{d.client}</td>
                  <td className="py-3 px-3 text-xs">{d.marketer}</td>
                  <td className="py-3 px-3 text-xs">{d.caseRef}</td>
                  <td className="py-3 px-3 text-xs">{d.solicitor}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    £{d.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-xs">{d.issueType}</td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[d.status]}`}>
                      {d.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">
                    {d.lastUpdate}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setActive(d)}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {active && (
        <DisputeDetail
          dispute={active}
          onClose={() => setActive(null)}
          onUpdate={(updated) => {
            save(list.map((d) => (d.id === updated.id ? updated : d)));
            setActive(updated);
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold tabular-nums mt-1 ${tone ?? ""}`}>{value}</div>
    </Card>
  );
}

function NewDisputeDialog({
  onSubmit,
  onClose,
}: {
  onSubmit: (
    d: Omit<Dispute, "id" | "createdAt" | "lastUpdate" | "notes" | "status" | "owner" | "evidence">,
  ) => void;
  onClose: () => void;
}) {
  const [f, setF] = useState({
    client: "",
    marketer: "",
    caseRef: "",
    solicitor: "",
    amount: 0,
    issueType: "Funding mismatch",
  });
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Open dispute</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Label>Client</Label>
          <Input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} />
        </div>
        <div>
          <Label>Marketer</Label>
          <Input value={f.marketer} onChange={(e) => setF({ ...f, marketer: e.target.value })} />
        </div>
        <div>
          <Label>Case ref</Label>
          <Input
            value={f.caseRef}
            onChange={(e) => setF({ ...f, caseRef: e.target.value })}
            placeholder="KPP-CASE-..."
          />
        </div>
        <div>
          <Label>Solicitor</Label>
          <Input value={f.solicitor} onChange={(e) => setF({ ...f, solicitor: e.target.value })} />
        </div>
        <div>
          <Label>Amount (GBP)</Label>
          <Input
            type="number"
            value={f.amount}
            onChange={(e) => setF({ ...f, amount: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Issue type</Label>
          <Select value={f.issueType} onValueChange={(v) => setF({ ...f, issueType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Funding mismatch",
                "Name mismatch",
                "Document issue",
                "Solicitor beneficiary issue",
                "Expired quote payment",
                "Other",
              ].map((x) => (
                <SelectItem key={x} value={x}>
                  {x}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (!f.client.trim()) {
              toast.error("Client is required");
              return;
            }
            onSubmit(f);
          }}
        >
          Open dispute
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function DisputeDetail({
  dispute,
  onClose,
  onUpdate,
}: {
  dispute: Dispute;
  onClose: () => void;
  onUpdate: (d: Dispute) => void;
}) {
  const [note, setNote] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function addNote() {
    if (!note.trim()) return;
    onUpdate({ ...dispute, notes: [...dispute.notes, `${today} — ${note}`], lastUpdate: today });
    setNote("");
    toast.success("Note added");
  }
  function uploadEvidence() {
    const fileName = `Evidence_${dispute.evidence.length + 1}.pdf`;
    onUpdate({
      ...dispute,
      evidence: [...dispute.evidence, fileName],
      notes: [...dispute.notes, `${today} — Evidence uploaded: ${fileName}`],
      lastUpdate: today,
    });
    toast.success("Evidence uploaded");
  }
  function setStatus(s: DisputeStatus) {
    onUpdate({
      ...dispute,
      status: s,
      lastUpdate: today,
      notes: [...dispute.notes, `${today} — Status changed to ${s}`],
    });
    toast.success(`Status: ${s}`);
  }
  function resolve() {
    setStatus("Resolved");
  }
  function escalate() {
    onUpdate({
      ...dispute,
      status: "Waiting on Canta",
      owner: "Canta Compliance",
      lastUpdate: today,
      notes: [...dispute.notes, `${today} — Escalated to Canta Compliance`],
    });
    toast.success("Escalated to Canta Compliance");
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {dispute.id} · {dispute.client}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[dispute.status]}`}>
            {dispute.status}
          </Badge>
          <span className="text-xs text-muted-foreground">Owner: {dispute.owner}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs border rounded-lg p-3 bg-secondary/30">
          <div>
            <div className="text-muted-foreground">Reason</div>
            <div className="font-medium text-foreground">{dispute.issueType}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Amount</div>
            <div className="font-medium text-foreground tabular-nums">
              £{dispute.amount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Client</div>
            <div className="font-medium text-foreground">{dispute.client}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Marketer</div>
            <div className="font-medium text-foreground">{dispute.marketer}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Solicitor</div>
            <div className="font-medium text-foreground">{dispute.solicitor}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Case ref</div>
            <div className="font-medium text-foreground">{dispute.caseRef}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Evidence</div>
          {dispute.evidence.length === 0 ? (
            <div className="text-xs text-muted-foreground">No evidence uploaded yet.</div>
          ) : (
            <ul className="text-xs space-y-1">
              {dispute.evidence.map((e, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  {e}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Activity</div>
          <div className="max-h-48 overflow-y-auto text-xs space-y-1 border rounded p-2 bg-secondary/30">
            {dispute.notes.map((n, i) => (
              <div key={i} className="flex items-start gap-2">
                <FileText className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                {n}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Add note</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={addNote}>
              Add note
            </Button>
            <Button size="sm" variant="outline" onClick={uploadEvidence}>
              <Upload className="h-3.5 w-3.5 mr-1" /> Upload evidence
            </Button>
            <Button size="sm" variant="outline" onClick={() => setStatus("Waiting on Client")}>
              Request more info
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 flex-wrap">
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={escalate}>
              Escalate
            </Button>
            <Button size="sm" onClick={resolve}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Resolve
            </Button>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
