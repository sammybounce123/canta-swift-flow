import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard, Plus, Snowflake, Flame, Receipt, ChevronLeft, Download,
  TrendingUp, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { fmtMoney } from "@/lib/mock";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/EmptyState";
import { CardPurposeWizard, type CardDraft, type CardLinkKind } from "@/components/CardPurposeWizard";
import { CardActions } from "@/components/CardActions";

type CardType = { key: string; label: string; desc: string };
type SpendDim = { key: string; label: string };
type IssuedCard = {
  id: string;
  type: string;
  typeLabel: string;
  holder: string;
  last4: string;
  status: "Active" | "Frozen" | "Pending Approval";
  dailyLimit: number;
  monthlyLimit: number;
  txLimit: number;
  monthlySpend: number;
  requireApproval: boolean;
  requireReceipts: boolean;
  linkedTo: string;
  linkedKind: string;
  receiptsMissing: number;
  spendByDim: Record<string, { label: string; amount: number }[]>;
};

let _idSeq = 1;
const nextId = () => `CRD-${(Math.floor(Math.random() * 90000) + 10000).toString()}`;

export function WorkspaceCardsHub({
  workspaceKey,
  title,
  subtitle,
  cardTypes,
  linkEntities,
  spendDimensions,
  backTo,
  cardHub,
  enableExport,
}: {
  workspaceKey: "importer" | "freight" | "enterprise";
  title: string;
  subtitle: string;
  cardTypes: CardType[];
  linkEntities: string[];
  spendDimensions: SpendDim[];
  backTo?: { to: string; label: string };
  cardHub?: ReactNode;
  enableExport?: boolean;
}) {
  // Seed a couple of demo cards
  const seed = useMemo<IssuedCard[]>(() => {
    return cardTypes.slice(0, 3).map((t, i) => ({
      id: nextId(),
      type: t.key,
      typeLabel: t.label,
      holder: i === 0 ? "Adaeze O." : i === 1 ? "Operations Team" : "Project Alpha",
      last4: String(1000 + Math.floor(Math.random() * 8999)).slice(-4),
      status: i === 2 ? "Frozen" : "Active",
      dailyLimit: 1500,
      monthlyLimit: 25000 + i * 5000,
      txLimit: 1000,
      monthlySpend: Math.round(Math.random() * 12000 + 2000),
      requireApproval: i !== 0,
      requireReceipts: true,
      linkedTo: linkEntities[i % linkEntities.length] + " · #" + (200 + i),
      linkedKind: linkEntities[i % linkEntities.length],
      receiptsMissing: i === 1 ? 3 : 0,
      spendByDim: Object.fromEntries(
        spendDimensions.map((d) => [
          d.key,
          [
            { label: `${d.label} A`, amount: Math.round(Math.random() * 5000) + 800 },
            { label: `${d.label} B`, amount: Math.round(Math.random() * 4000) + 500 },
            { label: `${d.label} C`, amount: Math.round(Math.random() * 3000) + 300 },
          ],
        ])
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cards, setCards] = useState<IssuedCard[]>(seed);

  const totalSpend = cards.reduce((s, c) => s + c.monthlySpend, 0);
  const active = cards.filter((c) => c.status === "Active").length;
  const pending = cards.filter((c) => c.status === "Pending Approval").length;
  const receiptsMissing = cards.reduce((s, c) => s + c.receiptsMissing, 0);

  // Map workspace-specific link entity strings to the wizard's canonical CardLinkKind.
  const defaultLinkKind: CardLinkKind = (() => {
    const m: Record<string, CardLinkKind> = {
      "Trade file": "Trade File", "Trade File": "Trade File",
      "Shipment": "Shipment", "Supplier": "Supplier",
      "Cost center": "Cost Center", "Cost Center": "Cost Center",
      "Department": "Department", "Project": "Project",
      "Freight route": "Freight Route", "Freight Route": "Freight Route",
      "Freight customer": "Freight Customer", "Freight Customer": "Freight Customer",
      "Event": "Event", "Property Case": "Property Case",
    };
    return m[linkEntities[0]] ?? "Department";
  })();

  function handleCreate(d: CardDraft) {
    const requireApproval = d.approvalAbove > 0;
    const newCard: IssuedCard = {
      id: nextId(),
      type: d.purpose,
      typeLabel: d.purpose,
      holder: d.who === "Me" ? "Me" : (d.holder || d.who),
      last4: String(1000 + Math.floor(Math.random() * 8999)).slice(-4),
      status: requireApproval ? "Pending Approval" : "Active",
      dailyLimit: d.dailyLimit,
      monthlyLimit: d.monthlyLimit,
      txLimit: d.singleTxLimit,
      monthlySpend: 0,
      requireApproval,
      requireReceipts: d.receiptsRequired,
      linkedTo: d.linkRef ? `${d.linkKind} · ${d.linkRef}` : `${d.linkKind} · unassigned`,
      linkedKind: d.linkKind,
      receiptsMissing: 0,
      spendByDim: Object.fromEntries(spendDimensions.map((dim) => [dim.key, []])),
    };
    setCards((c) => [newCard, ...c]);
    toast.success(requireApproval ? "Card request created — awaiting approval" : "Card issued and active");
  }
  }

  function toggleFreeze(id: string) {
    setCards((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "Frozen" ? "Active" : "Frozen" }
          : c
      )
    );
    toast.success("Card status updated");
  }

  function approve(id: string) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, status: "Active" } : c)));
    toast.success("Card approved & activated");
  }

  function exportCsv() {
    const rows = [
      ["Card", "Type", "Holder", "Last4", "Status", "Linked", "Monthly spend", "Limit"],
      ...cards.map((c) => [c.id, c.typeLabel, c.holder, c.last4, c.status, c.linkedTo, c.monthlySpend, c.monthlyLimit]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workspaceKey}-cards.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          {backTo && (
            <Link to={backTo.to} className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
              <ChevronLeft className="h-3 w-3" /> {backTo.label}
            </Link>
          )}
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {enableExport && (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" /> Export report
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Create card</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create {title.split(" ")[0]} card</DialogTitle>
                <DialogDescription>Limits, approvals and receipts are enforced per transaction.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Card type</Label>
                  <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {cardTypes.map((t) => (
                        <SelectItem key={t.key} value={t.key}>{t.label} — {t.desc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Cardholder</Label>
                  <Input value={draft.holder} onChange={(e) => setDraft({ ...draft, holder: e.target.value })} placeholder="Staff name or team" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Link to</Label>
                    <Select value={draft.linkKind} onValueChange={(v) => setDraft({ ...draft, linkKind: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {linkEntities.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Reference</Label>
                    <Input value={draft.linkTo} onChange={(e) => setDraft({ ...draft, linkTo: e.target.value })} placeholder={`${draft.linkKind} #...`} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Daily limit ($)</Label>
                    <Input type="number" value={draft.daily} onChange={(e) => setDraft({ ...draft, daily: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Monthly limit ($)</Label>
                    <Input type="number" value={draft.monthly} onChange={(e) => setDraft({ ...draft, monthly: Number(e.target.value) })} />
                  </div>
                  <div>
                    <Label className="text-xs">Per-tx limit ($)</Label>
                    <Input type="number" value={draft.tx} onChange={(e) => setDraft({ ...draft, tx: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={draft.requireApproval} onCheckedChange={(v) => setDraft({ ...draft, requireApproval: Boolean(v) })} />
                    Require approval before each spend over per-tx limit
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={draft.requireReceipts} onCheckedChange={(v) => setDraft({ ...draft, requireReceipts: Boolean(v) })} />
                    Require receipts for every transaction
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create}>Create card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Kpi label="Active cards" value={String(active)} tone="bg-success/10 text-success" />
        <Kpi label="Monthly spend" value={fmtMoney(totalSpend, "USD")} />
        <Kpi label="Pending approvals" value={String(pending)} tone={pending ? "bg-warning/10 text-warning" : ""} />
        <Kpi label="Receipts missing" value={String(receiptsMissing)} tone={receiptsMissing ? "bg-warning/10 text-warning" : ""} />
        <Kpi label="Card types" value={String(cardTypes.length)} />
      </div>

      <Tabs defaultValue="cards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="spend">Spend reporting</TabsTrigger>
          <TabsTrigger value="types">Card types</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-3">
          {cards.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-5 w-5" />}
              title={`No ${workspaceKey} cards yet`}
              description={`Create a ${cardTypes[0].label.toLowerCase()} to start tracking spend.`}
              action={{ label: "Create card", onClick: () => setOpen(true) }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cards.map((c) => {
                const used = Math.min(100, Math.round((c.monthlySpend / Math.max(1, c.monthlyLimit)) * 100));
                return (
                  <Card key={c.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.typeLabel}</div>
                        <div className="font-semibold truncate">{c.holder}</div>
                      </div>
                      <Badge variant="outline" className={
                        c.status === "Active" ? "bg-success/15 text-success border-success/30" :
                        c.status === "Frozen" ? "bg-muted text-muted-foreground" :
                        "bg-warning/15 text-warning border-warning/30"
                      }>{c.status}</Badge>
                    </div>
                    <div className="mt-2 font-mono text-sm tracking-widest text-muted-foreground">•••• {c.last4}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">↳ {c.linkedTo}</div>
                    <div className="mt-3 text-[11px] flex justify-between">
                      <span>{fmtMoney(c.monthlySpend, "USD")} / {fmtMoney(c.monthlyLimit, "USD")}</span>
                      <span>{used}%</span>
                    </div>
                    <Progress value={used} className="h-1 mt-1" />
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.requireApproval && <Badge variant="secondary" className="text-[10px]"><ShieldCheck className="h-3 w-3 mr-1" /> Approvals</Badge>}
                      {c.requireReceipts && <Badge variant="secondary" className="text-[10px]"><Receipt className="h-3 w-3 mr-1" /> Receipts</Badge>}
                      {c.receiptsMissing > 0 && (
                        <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                          <AlertTriangle className="h-3 w-3 mr-1" /> {c.receiptsMissing} missing
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      {c.status === "Pending Approval" ? (
                        <Button size="sm" className="h-7" onClick={() => approve(c.id)}>
                          Approve
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="h-7" onClick={() => toggleFreeze(c.id)}>
                          {c.status === "Frozen" ? <><Flame className="h-3 w-3 mr-1" /> Unfreeze</> : <><Snowflake className="h-3 w-3 mr-1" /> Freeze</>}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => toast.success("Receipts requested")}>
                        <Receipt className="h-3 w-3 mr-1" /> Receipts
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="spend" className="space-y-4">
          {spendDimensions.map((dim) => {
            const agg: Record<string, number> = {};
            cards.forEach((c) =>
              (c.spendByDim[dim.key] ?? []).forEach((row) => {
                agg[row.label] = (agg[row.label] ?? 0) + row.amount;
              })
            );
            const rows = Object.entries(agg).map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount);
            const max = Math.max(1, ...rows.map((r) => r.amount));
            return (
              <Card key={dim.key} className="p-4">
                <div className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-primary" /> Spend by {dim.label}
                </div>
                {rows.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No spend recorded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {rows.map((r) => (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{r.label}</span>
                          <span className="tabular-nums text-muted-foreground">{fmtMoney(r.amount, "USD")}</span>
                        </div>
                        <Progress value={Math.round((r.amount / max) * 100)} className="h-1" />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="types">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cardTypes.map((t) => (
              <Card key={t.key} className="p-4">
                <div className="font-semibold">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.desc}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => {
                    setDraft((d) => ({ ...d, type: t.key }));
                    setOpen(true);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Create {t.label.toLowerCase()}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {cardHub && <div className="text-right">{cardHub}</div>}
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-base font-semibold tabular-nums mt-0.5">{value}</div>
      {tone && <div className={`h-1 w-6 rounded-full mt-1 ${tone}`} />}
    </Card>
  );
}
