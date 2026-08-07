import { useState, type ReactNode } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Plane,
  Ship,
  GraduationCap,
  Megaphone,
  Users,
  Globe,
  Building2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export type CardPurpose =
  | "Business Expenses"
  | "Travel"
  | "Import / Trade Expenses"
  | "Student Abroad"
  | "Online Ads"
  | "Team Spending"
  | "Personal Global Spend"
  | "Shipment / Project Expense";

export type CardWho =
  | "Me"
  | "Staff member"
  | "Student"
  | "Family member"
  | "Team member"
  | "Department";

export type CardLinkKind =
  | "Department"
  | "Project"
  | "Cost Center"
  | "Trade File"
  | "Shipment"
  | "Supplier"
  | "Freight Route"
  | "Freight Customer"
  | "Event"
  | "Property Case";

export type CardDraft = {
  purpose: CardPurpose;
  who: CardWho;
  holder: string;
  linkKind: CardLinkKind;
  linkRef: string;
  dailyLimit: number;
  monthlyLimit: number;
  totalLimit: number;
  singleTxLimit: number;
  approvalAbove: number;
  receiptsRequired: boolean;
  allowedCategories: string[];
  blockedCategories: string[];
};

const PURPOSES: { l: CardPurpose; i: any; d: string; tone: string }[] = [
  {
    l: "Business Expenses",
    i: Briefcase,
    d: "Day-to-day company spend",
    tone: "bg-primary/10 text-primary",
  },
  { l: "Travel", i: Plane, d: "Trips, hotels, per-diem", tone: "bg-accent/15 text-accent" },
  {
    l: "Import / Trade Expenses",
    i: Ship,
    d: "Samples, inspection, logistics",
    tone: "bg-warning/10 text-warning",
  },
  {
    l: "Student Abroad",
    i: GraduationCap,
    d: "Allowance & emergencies",
    tone: "bg-success/10 text-success",
  },
  {
    l: "Online Ads",
    i: Megaphone,
    d: "Meta, Google, TikTok",
    tone: "bg-destructive/10 text-destructive",
  },
  {
    l: "Team Spending",
    i: Users,
    d: "Staff cards with approvals",
    tone: "bg-primary/10 text-primary",
  },
  {
    l: "Personal Global Spend",
    i: Globe,
    d: "Worldwide personal use",
    tone: "bg-muted text-foreground",
  },
  {
    l: "Shipment / Project Expense",
    i: Building2,
    d: "Linked to a shipment / project",
    tone: "bg-warning/10 text-warning",
  },
];

const WHO_OPTIONS: CardWho[] = [
  "Me",
  "Staff member",
  "Student",
  "Family member",
  "Team member",
  "Department",
];

const LINK_OPTIONS: CardLinkKind[] = [
  "Department",
  "Project",
  "Cost Center",
  "Trade File",
  "Shipment",
  "Supplier",
  "Freight Route",
  "Freight Customer",
  "Event",
  "Property Case",
];

const CATEGORIES = [
  "Travel",
  "Hotels",
  "Restaurants",
  "Groceries",
  "Transport",
  "Logistics",
  "Inspection",
  "Samples",
  "SaaS / Software",
  "Ads",
  "Office",
  "Cash / ATM",
  "Crypto",
  "Gambling",
];

export function CardPurposeWizard({
  trigger,
  defaultLinkKind,
  onCreate,
}: {
  trigger?: ReactNode;
  defaultLinkKind?: CardLinkKind;
  onCreate?: (draft: CardDraft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CardDraft>({
    purpose: "Business Expenses",
    who: "Me",
    holder: "",
    linkKind: defaultLinkKind ?? "Department",
    linkRef: "",
    dailyLimit: 1000,
    monthlyLimit: 20000,
    totalLimit: 100000,
    singleTxLimit: 2000,
    approvalAbove: 500,
    receiptsRequired: true,
    allowedCategories: [],
    blockedCategories: ["Cash / ATM", "Gambling", "Crypto"],
  });

  const TOTAL = 5;
  const titles = [
    "What is this card for?",
    "Who will use this card?",
    "What should this card be linked to?",
    "Set controls",
    "Review & create",
  ];

  function reset() {
    setStep(1);
    setDraft({
      purpose: "Business Expenses",
      who: "Me",
      holder: "",
      linkKind: defaultLinkKind ?? "Department",
      linkRef: "",
      dailyLimit: 1000,
      monthlyLimit: 20000,
      totalLimit: 100000,
      singleTxLimit: 2000,
      approvalAbove: 500,
      receiptsRequired: true,
      allowedCategories: [],
      blockedCategories: ["Cash / ATM", "Gambling", "Crypto"],
    });
  }

  function toggleCat(list: "allowedCategories" | "blockedCategories", cat: string) {
    setDraft((d) => {
      const set = new Set(d[list]);
      if (set.has(cat)) set.delete(cat);
      else set.add(cat);
      return { ...d, [list]: Array.from(set) };
    });
  }

  function finish() {
    if (onCreate) {
      onCreate(draft);
    } else {
      toast.success(`${draft.purpose} card created`, {
        description: `${draft.who === "Me" ? "Me" : draft.holder || draft.who} · linked to ${draft.linkKind}${draft.linkRef ? ` · ${draft.linkRef}` : ""}`,
      });
    }
    setOpen(false);
    reset();
  }

  const canNext =
    step === 1 ||
    (step === 2 && (draft.who === "Me" || draft.holder.trim().length > 0)) ||
    step === 3 ||
    step === 4;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Create card
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[step - 1]}</DialogTitle>
          <DialogDescription>
            Step {step} of {TOTAL} · Card purpose wizard
          </DialogDescription>
        </DialogHeader>

        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(step / TOTAL) * 100}%` }}
          />
        </div>

        <div className="min-h-[260px]">
          {step === 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {PURPOSES.map((p) => (
                <button
                  key={p.l}
                  onClick={() => {
                    setDraft({ ...draft, purpose: p.l });
                    setStep(2);
                  }}
                  className={`text-left p-3 rounded-xl border transition ${draft.purpose === p.l ? "border-accent bg-accent/5" : "border-border hover:border-accent"}`}
                >
                  <div className={`h-8 w-8 rounded-lg grid place-items-center ${p.tone}`}>
                    <p.i className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold mt-2">{p.l}</div>
                  <div className="text-[11px] text-muted-foreground">{p.d}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {WHO_OPTIONS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setDraft({ ...draft, who: w })}
                    className={`p-3 rounded-lg border text-sm text-left transition ${draft.who === w ? "border-accent bg-accent/5 font-semibold" : "border-border hover:border-accent"}`}
                  >
                    {w}
                  </button>
                ))}
              </div>
              {draft.who !== "Me" && (
                <div>
                  <Label className="text-xs">Cardholder name</Label>
                  <Input
                    value={draft.holder}
                    onChange={(e) => setDraft({ ...draft, holder: e.target.value })}
                    placeholder={
                      draft.who === "Department" ? "e.g. Sales Department" : "e.g. James Okafor"
                    }
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {LINK_OPTIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setDraft({ ...draft, linkKind: l })}
                    className={`p-2.5 rounded-lg border text-xs text-left transition ${draft.linkKind === l ? "border-accent bg-accent/5 font-semibold" : "border-border hover:border-accent"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div>
                <Label className="text-xs">Reference (optional)</Label>
                <Input
                  value={draft.linkRef}
                  onChange={(e) => setDraft({ ...draft, linkRef: e.target.value })}
                  placeholder={`${draft.linkKind} #...`}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Daily limit (USD)</Label>
                  <Input
                    type="number"
                    value={draft.dailyLimit}
                    onChange={(e) => setDraft({ ...draft, dailyLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Monthly limit (USD)</Label>
                  <Input
                    type="number"
                    value={draft.monthlyLimit}
                    onChange={(e) => setDraft({ ...draft, monthlyLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Total card limit (USD)</Label>
                  <Input
                    type="number"
                    value={draft.totalLimit}
                    onChange={(e) => setDraft({ ...draft, totalLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Single transaction limit (USD)</Label>
                  <Input
                    type="number"
                    value={draft.singleTxLimit}
                    onChange={(e) => setDraft({ ...draft, singleTxLimit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Approval required above (USD)</Label>
                  <Input
                    type="number"
                    value={draft.approvalAbove}
                    onChange={(e) => setDraft({ ...draft, approvalAbove: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Receipts required</Label>
                  <Select
                    value={draft.receiptsRequired ? "yes" : "no"}
                    onValueChange={(v) => setDraft({ ...draft, receiptsRequired: v === "yes" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes — required</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Allowed categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mt-1.5">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center gap-1.5 text-xs">
                      <Checkbox
                        checked={draft.allowedCategories.includes(c)}
                        onCheckedChange={() => toggleCat("allowedCategories", c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Leave empty to allow all categories not in the blocked list.
                </div>
              </div>
              <div>
                <Label className="text-xs">Blocked categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mt-1.5">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="flex items-center gap-1.5 text-xs">
                      <Checkbox
                        checked={draft.blockedCategories.includes(c)}
                        onCheckedChange={() => toggleCat("blockedCategories", c)}
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="p-4 rounded-lg bg-secondary/40 border border-border text-sm space-y-2">
              <div className="font-semibold">Review</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Purpose:</span> {draft.purpose}
                </div>
                <div>
                  <span className="text-muted-foreground">User:</span>{" "}
                  {draft.who === "Me" ? "Me" : `${draft.holder || draft.who} (${draft.who})`}
                </div>
                <div>
                  <span className="text-muted-foreground">Linked to:</span> {draft.linkKind}
                  {draft.linkRef ? ` · ${draft.linkRef}` : ""}
                </div>
                <div>
                  <span className="text-muted-foreground">Daily / Monthly:</span> $
                  {draft.dailyLimit.toLocaleString()} / ${draft.monthlyLimit.toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Total / per-tx:</span> $
                  {draft.totalLimit.toLocaleString()} / ${draft.singleTxLimit.toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Approval above:</span> $
                  {draft.approvalAbove.toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Receipts:</span>{" "}
                  {draft.receiptsRequired ? "Required" : "Optional"}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Allowed:</span>{" "}
                  {draft.allowedCategories.length
                    ? draft.allowedCategories.join(", ")
                    : "All (except blocked)"}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Blocked:</span>{" "}
                  {draft.blockedCategories.length ? draft.blockedCategories.join(", ") : "None"}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
            </Button>
          )}
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {step > 1 && step < TOTAL && (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>
              Next
            </Button>
          )}
          {step === TOTAL && <Button onClick={finish}>Create card</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
