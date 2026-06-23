import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard, Plus, Snowflake, Flame, Receipt, Clock, ArrowRight, TrendingUp,
  MoreHorizontal, Eye, Upload, Settings, Download,
} from "lucide-react";
import { toast } from "sonner";
import { fmtMoney } from "@/lib/mock";

export type WorkspaceCard = {
  id: string;
  label: string;
  holder: string;
  last4: string;
  status: "Active" | "Frozen" | "Pending";
  monthlySpend: number;
  limit: number;
  category: string;
  linked?: string;
};

export type WorkspaceCardsPanelProps = {
  title: string;
  subtitle: string;
  cards: WorkspaceCard[];
  categories: string[];
  /** spend grouped by some key like department / staff / shipment */
  groupedSpend?: { label: string; amount: number }[];
  groupedLabel?: string;
  pendingApprovals?: number;
  receiptsMissing?: number;
};

function tone(s: WorkspaceCard["status"]) {
  if (s === "Active") return "bg-success/15 text-success border-success/30";
  if (s === "Frozen") return "bg-primary/15 text-primary border-primary/30";
  return "bg-warning/15 text-warning border-warning/30";
}

export function WorkspaceCardsPanel(p: WorkspaceCardsPanelProps) {
  const totalSpend = p.cards.reduce((s, c) => s + c.monthlySpend, 0);
  const frozen = p.cards.filter((c) => c.status === "Frozen").length;
  const active = p.cards.filter((c) => c.status === "Active").length;
  const maxGroup = Math.max(1, ...(p.groupedSpend ?? []).map((g) => g.amount));

  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">{p.title}</div>
            <div className="text-xs text-muted-foreground">{p.subtitle}</div>
          </div>
        </div>
        <Link to="/cards">
          <Button size="sm" className="bg-primary"><Plus className="h-3.5 w-3.5 mr-1.5" /> Create card</Button>
        </Link>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-5">
        <Mini label="Active" value={String(active)} tone="bg-success/10 text-success" />
        <Mini label="Monthly spend" value={fmtMoney(totalSpend, "USD")} />
        <Mini label="Pending approvals" value={String(p.pendingApprovals ?? 0)} tone={(p.pendingApprovals ?? 0) > 0 ? "bg-warning/10 text-warning" : ""} />
        <Mini label="Frozen" value={String(frozen)} />
        <Mini label="Receipts missing" value={String(p.receiptsMissing ?? 0)} tone={(p.receiptsMissing ?? 0) > 0 ? "bg-warning/10 text-warning" : ""} />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {p.categories.map((c) => (
          <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {p.cards.slice(0, 6).map((c) => {
          const used = Math.min(100, Math.round((c.monthlySpend / Math.max(1, c.limit)) * 100));
          return (
            <div key={c.id} className="p-3 rounded-xl border border-border bg-secondary/30 hover:border-accent transition">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.holder}</div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${tone(c.status)}`}>{c.status}</Badge>
              </div>
              <div className="mt-2 font-mono text-[11px] tracking-widest text-muted-foreground">•••• {c.last4}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{fmtMoney(c.monthlySpend, "USD")} / {fmtMoney(c.limit, "USD")}</span>
                <span>{used}%</span>
              </div>
              <Progress value={used} className="h-1 mt-1" />
              {c.linked && (
                <div className="mt-2 text-[10px] text-muted-foreground truncate">↳ {c.linked}</div>
              )}
              <div className="mt-2 flex items-center gap-1">
                <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                  <Link to="/cards"><Eye className="h-3 w-3 mr-1" /> View</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => {
                    toast.success(c.status === "Frozen" ? "Card unfrozen successfully." : "Card frozen successfully.");
                    if (typeof window !== "undefined") window.location.assign("/cards");
                  }}
                >
                  {c.status === "Frozen"
                    ? <><Flame className="h-3 w-3 mr-1" /> Unfreeze Card</>
                    : <><Snowflake className="h-3 w-3 mr-1" /> Freeze Card</>}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 ml-auto">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast.success("Receipt uploaded")}>
                      <Upload className="h-3.5 w-3.5 mr-2" /> Upload Receipt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info("Open card to edit limits")}>
                      <Settings className="h-3.5 w-3.5 mr-2" /> Edit Limits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Receipts viewed")}>
                      <Receipt className="h-3.5 w-3.5 mr-2" /> View Receipts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Statement exported")}>
                      <Download className="h-3.5 w-3.5 mr-2" /> Export Statement
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
          );
        })}
        {p.cards.length === 0 && (
          <div className="col-span-full p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
            No cards yet. <Link to="/cards" className="text-accent">Create the first card →</Link>
          </div>
        )}
      </div>

      {/* Grouped spend */}
      {p.groupedSpend && p.groupedSpend.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-semibold flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Spend by {p.groupedLabel ?? "group"}
          </div>
          <div className="space-y-2">
            {p.groupedSpend.map((g) => (
              <div key={g.label}>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium">{g.label}</span>
                  <span className="tabular-nums text-muted-foreground">{fmtMoney(g.amount, "USD")}</span>
                </div>
                <Progress value={Math.round((g.amount / maxGroup) * 100)} className="h-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Cards are a shared capability across every Canta workspace.
        </div>
        <Link to="/cards" className="text-xs font-medium text-accent inline-flex items-center gap-1 hover:underline">
          Open card hub <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="p-2.5 rounded-lg border border-border">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-sm font-semibold tabular-nums mt-0.5 ${tone ? "" : ""}`}>{value}</div>
      {tone && <div className={`h-1 w-6 rounded-full mt-1 ${tone}`} />}
    </div>
  );
}
