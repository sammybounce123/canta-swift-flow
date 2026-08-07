import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/escrow")({
  head: () => ({ meta: [{ title: "Escrow — Canta" }] }),
  component: EscrowPage,
});

const LS_KEY = "canta:importer:escrowRequests";

type EscrowStatus = "Escrow Requested" | "Funded" | "Milestone Met" | "Released" | "Disputed";

type EscrowRow = {
  id: string;
  reference: string;
  supplier: string;
  amount: number;
  ccy: string;
  milestone: string;
  releaseCondition?: string;
  status: EscrowStatus;
  demo?: boolean;
};

const DEMO_ROWS: EscrowRow[] = [
  {
    id: "ESC-2041",
    reference: "PO-2031 · Guangzhou Q2",
    supplier: "Guangzhou Tech Factory",
    amount: 48000,
    ccy: "USD",
    milestone: "50% on BL, 50% on inspection signoff",
    status: "Funded",
    demo: true,
  },
  {
    id: "ESC-2042",
    reference: "PO-2042 · Yiwu Fashion",
    supplier: "Yiwu General Trading",
    amount: 19500,
    ccy: "USD",
    milestone: "100% on delivery acceptance",
    status: "Milestone Met",
    demo: true,
  },
  {
    id: "ESC-2043",
    reference: "PO-2018 · Shenzhen Electronics",
    supplier: "Shenzhen Bright Electronics",
    amount: 62000,
    ccy: "USD",
    milestone: "Performance bond, released on final signoff",
    status: "Escrow Requested",
    demo: true,
  },
];

const STATUS_TONE: Record<EscrowStatus, string> = {
  "Escrow Requested": "bg-primary/15 text-primary border-primary/30",
  Funded: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  "Milestone Met": "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Released: "bg-success/15 text-success border-success/30",
  Disputed: "bg-destructive/15 text-destructive border-destructive/30",
};

const NEXT_STEP: Record<EscrowStatus, string> = {
  "Escrow Requested": "Canta reviews the request and confirms funding instructions.",
  Funded: "Funds are held — release once the agreed milestone is met.",
  "Milestone Met": "Milestone evidence received — request release when ready.",
  Released: "Funds have been released to the supplier.",
  Disputed: "Under dispute review — Canta will contact both parties for evidence.",
};

function loadRows(): EscrowRow[] {
  if (typeof window === "undefined") return DEMO_ROWS;
  try {
    const stored = JSON.parse(window.localStorage.getItem(LS_KEY) ?? "[]");
    const mapped: EscrowRow[] = (Array.isArray(stored) ? stored : []).map((r: any, i: number) => ({
      // eslint-disable-line @typescript-eslint/no-explicit-any
      id: r.id ?? `ESC-${Date.now()}-${i}`,
      reference: r.reference ?? r.tradeFile ?? "—",
      supplier: r.supplier ?? "—",
      amount: Number(r.amount ?? r.escrowAmount ?? 0),
      ccy: r.ccy ?? "USD",
      milestone: r.milestone ?? r.milestones ?? "—",
      releaseCondition: r.releaseCondition,
      status: (r.status as EscrowStatus) ?? "Escrow Requested",
    }));
    return [...mapped, ...DEMO_ROWS];
  } catch {
    return DEMO_ROWS;
  }
}

function saveUserRows(rows: EscrowRow[]) {
  if (typeof window === "undefined") return;
  const userRows = rows.filter((r) => !r.demo);
  window.localStorage.setItem(LS_KEY, JSON.stringify(userRows));
}

function fmt(amount: number, ccy: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: ccy,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${ccy} ${amount.toLocaleString()}`;
  }
}

function EscrowPage() {
  const [rows, setRows] = useState<EscrowRow[]>(DEMO_ROWS);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    reference: "",
    supplier: "",
    amount: "",
    ccy: "USD",
    milestone: "",
    releaseCondition: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setRows(loadRows());
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.reference.trim()) e.reference = "Reference is required.";
    if (!form.supplier.trim()) e.supplier = "Supplier is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Enter a valid amount.";
    if (!form.milestone.trim()) e.milestone = "Milestone is required.";
    if (!form.releaseCondition.trim()) e.releaseCondition = "Release condition is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    const row: EscrowRow = {
      id: `ESC-${Math.floor(3000 + Math.random() * 900)}`,
      reference: form.reference,
      supplier: form.supplier,
      amount: Number(form.amount),
      ccy: form.ccy,
      milestone: form.milestone,
      releaseCondition: form.releaseCondition,
      status: "Escrow Requested",
    };
    const next = [row, ...rows];
    setRows(next);
    saveUserRows(next);
    toast.success("Escrow request submitted");
    setOpen(false);
    setForm({
      reference: "",
      supplier: "",
      amount: "",
      ccy: "USD",
      milestone: "",
      releaseCondition: "",
    });
    setErrors({});
  }

  function requestRelease(id: string) {
    const next = rows.map((r) => (r.id === id ? { ...r, status: "Released" as EscrowStatus } : r));
    setRows(next);
    saveUserRows(next);
    toast.success("Escrow release requested");
  }

  return (
    <div className="space-y-6">
      <ReadinessBar
        status="Demo Preview"
        cue="Escrow availability depends on transaction type, compliance review, and supported settlement rails."
      />
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Escrow</h1>
            <Badge variant="outline" className="text-[10px]">
              Demo data
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Hold buyer funds securely until trade milestones clear. Manage release conditions and
            disputes.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setErrors({});
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-1.5" /> Request escrow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Request escrow</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Reference</Label>
                <Input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="PO-2031 · Guangzhou Q2"
                  aria-invalid={!!errors.reference}
                />
                {errors.reference && (
                  <p className="text-[11px] text-destructive mt-1">{errors.reference}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Supplier</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  placeholder="Guangzhou Tech Factory"
                  aria-invalid={!!errors.supplier}
                />
                {errors.supplier && (
                  <p className="text-[11px] text-destructive mt-1">{errors.supplier}</p>
                )}
              </div>
              <div>
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="48000"
                  aria-invalid={!!errors.amount}
                />
                {errors.amount && (
                  <p className="text-[11px] text-destructive mt-1">{errors.amount}</p>
                )}
              </div>
              <div>
                <Label className="text-xs">Currency</Label>
                <Select value={form.ccy} onValueChange={(v) => setForm({ ...form, ccy: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "CNY", "AED"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Milestone</Label>
                <Textarea
                  value={form.milestone}
                  onChange={(e) => setForm({ ...form, milestone: e.target.value })}
                  placeholder="50% on BL issued, 50% on final inspection signoff"
                  aria-invalid={!!errors.milestone}
                />
                {errors.milestone && (
                  <p className="text-[11px] text-destructive mt-1">{errors.milestone}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Release condition</Label>
                <Input
                  value={form.releaseCondition}
                  onChange={(e) => setForm({ ...form, releaseCondition: e.target.value })}
                  placeholder="BL + inspection signoff"
                  aria-invalid={!!errors.releaseCondition}
                />
                {errors.releaseCondition && (
                  <p className="text-[11px] text-destructive mt-1">{errors.releaseCondition}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-primary" onClick={submit}>
                Submit escrow request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground bg-secondary/40">
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Milestone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Next step</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-medium flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {r.reference}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {r.id}
                      {r.demo ? " · demo" : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.supplier}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    {fmt(r.amount, r.ccy)}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[220px] truncate" title={r.milestone}>
                    {r.milestone}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[240px]">
                    {NEXT_STEP[r.status]}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.status === "Released" || r.status === "Disputed" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => requestRelease(r.id)}>
                        <Lock className="h-3.5 w-3.5 mr-1" /> Request release
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No escrow requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
