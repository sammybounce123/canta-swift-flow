import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Snowflake,
  Flame,
  Banknote,
  Receipt,
  Download,
  BarChart3,
  Users,
  Tag,
  FolderKanban,
  Link2,
  MoreHorizontal,
  Upload,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

export type CardActionsCardLike = {
  id: string;
  holder: string;
  monthlySpend?: number;
  monthlyLimit?: number;
  linkedTo?: string;
  status?: "Active" | "Frozen" | "Pending Approval" | "Expired";
};

export function CardActions({
  card,
  isFrozen,
  onFreezeToggle,
  compact,
}: {
  card: CardActionsCardLike;
  isFrozen?: boolean;
  onFreezeToggle?: () => void;
  compact?: boolean;
}) {
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmt, setTopUpAmt] = useState("500");
  const [txOpen, setTxOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const freezeLabel = isFrozen ? "Unfreeze" : "Freeze";
  const FreezeIcon = isFrozen ? Flame : Snowflake;

  function freezeAction() {
    onFreezeToggle?.();
    toast.success(isFrozen ? "Card unfrozen" : "Card frozen");
  }

  function exportReport() {
    const csv = [
      ["Card", "Holder", "Linked", "Monthly spend", "Monthly limit"].join(","),
      [
        card.id,
        card.holder,
        card.linkedTo ?? "—",
        card.monthlySpend ?? 0,
        card.monthlyLimit ?? 0,
      ].join(","),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.id}-spend.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Spend report exported");
  }

  const primary = (
    <>
      <Button size="sm" variant="outline" className="h-7" onClick={freezeAction}>
        <FreezeIcon className="h-3 w-3 mr-1" /> {freezeLabel}
      </Button>
      <Button size="sm" variant="outline" className="h-7" onClick={() => setTopUpOpen(true)}>
        <Banknote className="h-3 w-3 mr-1" /> Top up
      </Button>
      <Button size="sm" variant="ghost" className="h-7" onClick={() => setTxOpen(true)}>
        <ListChecks className="h-3 w-3 mr-1" /> Transactions
      </Button>
    </>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5">
        {primary}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 px-2">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-[10px] uppercase">Card actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setReceiptOpen(true)}>
              <Upload className="h-3.5 w-3.5 mr-2" /> Upload receipt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportReport}>
              <Download className="h-3.5 w-3.5 mr-2" /> Export spend report
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase">View spend by</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setReportOpen(true);
              }}
            >
              <Users className="h-3.5 w-3.5 mr-2" /> User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Tag className="h-3.5 w-3.5 mr-2" /> Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <FolderKanban className="h-3.5 w-3.5 mr-2" /> Project
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Link2 className="h-3.5 w-3.5 mr-2" /> Linked entity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Top up */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top up card</DialogTitle>
            <DialogDescription>Funds debit from the linked wallet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Amount (USD)</Label>
              <Input type="number" value={topUpAmt} onChange={(e) => setTopUpAmt(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground">
              Card: <span className="text-foreground">{card.holder}</span> · {card.id}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setTopUpOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setTopUpOpen(false);
                toast.success(`Top-up of $${Number(topUpAmt).toLocaleString()} queued`);
              }}
            >
              Top up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recent transactions</DialogTitle>
            <DialogDescription>
              {card.holder} · {card.id}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border divide-y divide-border max-h-80 overflow-y-auto">
            {[
              { m: "AWS", c: "SaaS / Software", a: 1240 },
              { m: "Emirates Airlines", c: "Travel", a: 1650 },
              { m: "Shenzhen Logistics", c: "Logistics", a: 2200 },
              { m: "Uber", c: "Transport", a: 38 },
            ].map((t, i) => (
              <div key={i} className="px-3 py-2 text-sm flex justify-between">
                <div>
                  <span className="font-medium">{t.m}</span>{" "}
                  <span className="text-muted-foreground text-xs">· {t.c}</span>
                </div>
                <div className="tabular-nums">${t.a.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload receipt */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload receipt</DialogTitle>
            <DialogDescription>Attach a receipt to a recent transaction.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input type="file" />
            <div className="text-xs text-muted-foreground">
              Accepts PDF, JPG, PNG. Receipts are auto-matched to the closest transaction.
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReceiptOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setReceiptOpen(false);
                toast.success("Receipt uploaded");
              }}
            >
              <Receipt className="h-3.5 w-3.5 mr-1.5" /> Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spend breakdown */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Spend breakdown</DialogTitle>
            <DialogDescription>
              {card.holder} · {card.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {[
              {
                t: "By user",
                rows: [
                  ["Adaeze O.", 4200],
                  ["James O.", 2100],
                  ["Ops Team", 1450],
                ] as [string, number][],
              },
              {
                t: "By category",
                rows: [
                  ["Logistics", 3500],
                  ["Travel", 2650],
                  ["Software", 1240],
                ] as [string, number][],
              },
              {
                t: "By project",
                rows: [
                  ["Project Alpha", 5200],
                  ["Sourcing Q2", 2100],
                  ["Trade File TR-2031", 1450],
                ] as [string, number][],
              },
              {
                t: "By linked entity",
                rows: [[card.linkedTo ?? "Unassigned", 6750]] as [string, number][],
              },
            ].map((sec) => {
              const max = Math.max(1, ...sec.rows.map((r) => r[1]));
              return (
                <div key={sec.t}>
                  <div className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> {sec.t}
                  </div>
                  <div className="space-y-1.5">
                    {sec.rows.map(([label, amount]) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span>{label}</span>
                          <span className="tabular-nums text-muted-foreground">
                            ${amount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={(amount / max) * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV
            </Button>
            <Button onClick={() => setReportOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
