import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Star,
  Download,
  Edit3,
  ShieldCheck,
  History,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, formatGBP, type Solicitor } from "@/lib/partner";
import {
  getSolicitorState,
  setSolicitorStatus,
  toggleSolicitorPin,
  recordSolicitorBankEdit,
  canRevealSolicitorBank,
  SOLICITOR_STATUSES,
  subscribeExtras,
  type SolicitorVStatus,
} from "@/lib/partner-extras";
import { usePartnerRole } from "@/hooks/usePartnerRole";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/partner/solicitors")({
  head: () => ({ meta: [{ title: "Solicitors — Kingsbridge Property Partners" }] }),
  component: Solicitors,
});

function Solicitors() {
  const [, force] = useState(0);
  useEffect(() => subscribeExtras(() => force((n) => n + 1)), []);
  const { role, userId, user } = usePartnerRole();
  const canReveal = canRevealSolicitorBank(role);
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  const onAdd = (s: Solicitor) => {
    SOLICITORS.unshift(s);
    force((n) => n + 1);
    setOpen(false);
    toast.success(`${s.firm} added — Pending Verification`);
  };

  const statusTone = (s: SolicitorVStatus) =>
    ({
      Verified: "bg-success/15 text-success border-success/30",
      "Pending Verification": "bg-warning/15 text-warning border-warning/30",
      "More Info Required": "bg-accent/15 text-accent border-accent/30",
      Rejected: "bg-destructive/15 text-destructive border-destructive/30",
      Suspended: "bg-destructive/15 text-destructive border-destructive/30",
      Draft: "bg-muted text-muted-foreground border-border",
    })[s];

  return (
    <div className="space-y-5">
      <ReadinessBar
        status="Demo Preview"
        cue="Verify solicitor account details before initiating payouts."
      />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Solicitor directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Saved solicitor beneficiaries linked to your Baron &amp; Cabot referrals. Bank details
            are masked by default.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary">
              <Plus className="h-4 w-4 mr-1.5" /> Add solicitor
            </Button>
          </DialogTrigger>
          <AddSolicitorDialog onAdd={onAdd} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOLICITORS.map((s) => {
          const state = getSolicitorState(s.id, { verified: s.verified, preferred: s.preferred });
          const revealed = reveal[s.id] && canReveal;
          return (
            <Card key={s.id} className="p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-semibold">{s.firm}</div>
                    {state.pinned && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-warning/15 text-warning border-warning/30"
                      >
                        <Star className="h-3 w-3 mr-1" /> Pinned
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.contact} · {s.country}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${statusTone(state.status)}`}>
                  <ShieldCheck className="h-3 w-3 mr-1" /> {state.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <Info label="Email" value={s.email} />
                <Info label="Phone" value={s.phone} />
                <Info label="Bank" value={revealed ? s.bank : s.bank} />
                <Info label="Currency" value={s.currency} />
                <Info
                  label="Account name"
                  value={revealed ? s.accountName : maskMid(s.accountName)}
                />
                <Info
                  label="Account number"
                  value={
                    revealed
                      ? s.accountNumberMasked.replace(/•/g, "9").slice(-8)
                      : s.accountNumberMasked
                  }
                />
                <Info
                  label="Sort code"
                  value={revealed ? (s.sortCode ?? "—") : maskMid(s.sortCode ?? "—")}
                />
                <Info label="SWIFT / BIC" value={s.swift} />
                <Info label="IBAN" value={revealed ? (s.iban ?? "—") : maskMid(s.iban ?? "—")} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t text-center">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Clients
                  </div>
                  <div className="text-base font-semibold tabular-nums">{s.linkedClients}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total payouts
                  </div>
                  <div className="text-base font-semibold tabular-nums">
                    {formatGBP(s.totalPayouts)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Last verified
                  </div>
                  <div className="text-base font-semibold tabular-nums">
                    {state.lastVerifiedAt?.slice(0, 10) ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {canReveal ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReveal((r) => ({ ...r, [s.id]: !r[s.id] }))}
                  >
                    {revealed ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide bank
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 mr-1.5" /> Reveal bank
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    title="Only Partner Admin & Finance Viewer can reveal"
                  >
                    <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Bank hidden
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!canReveal) {
                      toast.error("Only Partner Admin or Finance Viewer can edit bank details");
                      return;
                    }
                    recordSolicitorBankEdit(
                      s.id,
                      { id: userId, name: user?.name ?? "Partner user", role },
                      { verified: s.verified, preferred: s.preferred },
                    );
                    toast.info("Bank edit recorded — solicitor moved to Pending Verification");
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit bank
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toggleSolicitorPin(s.id, { verified: s.verified, preferred: s.preferred });
                    toast.success("Pin toggled");
                  }}
                >
                  <Star className="h-3.5 w-3.5 mr-1.5" /> {state.pinned ? "Unpin" : "Pin"}
                </Button>
                <Select
                  value={state.status}
                  onValueChange={(v) => {
                    setSolicitorStatus(s.id, v as SolicitorVStatus, {
                      verified: s.verified,
                      preferred: s.preferred,
                    });
                    toast.success("Status updated");
                  }}
                >
                  <SelectTrigger className="h-8 w-[170px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOLICITOR_STATUSES.map((x) => (
                      <SelectItem key={x} value={x} className="text-xs">
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost">
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Clients
                </Button>
                <Button size="sm" variant="ghost">
                  <History className="h-3.5 w-3.5 mr-1.5" /> Payouts
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Confirmation
                </Button>
              </div>
              {state.status !== "Verified" && (
                <div className="mt-3 text-[11px] text-warning border-t pt-3">
                  Payouts to this solicitor are blocked until verification is complete.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function maskMid(v: string) {
  if (v === "—") return v;
  if (v.length <= 4) return "••••";
  return `${v.slice(0, 2)}${"•".repeat(Math.max(3, v.length - 4))}${v.slice(-2)}`;
}

function AddSolicitorDialog({ onAdd }: { onAdd: (s: Solicitor) => void }) {
  const [firm, setFirm] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [currency, setCurrency] = useState<"GBP" | "EUR" | "USD">("GBP");
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [sortCode, setSortCode] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const submit = () => {
    if (!firm || !contact || !email || !bank || !accountName || !accountNumber || !swift) {
      toast.error("Please fill all required fields");
      return;
    }
    const last4 = accountNumber.replace(/\s+/g, "").slice(-4).padStart(4, "•");
    const id = `SOL-${String(SOLICITORS.length + 1).padStart(3, "0")}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    onAdd({
      id,
      firm,
      contact,
      email,
      phone,
      country,
      currency,
      bank,
      accountName,
      accountNumberMasked: `•••• ${last4}`,
      sortCode: sortCode || undefined,
      iban: iban || undefined,
      swift,
      verified: "Pending",
      preferred: false,
      linkedClients: 0,
      totalPayouts: 0,
      lastPayout: "—",
    });
  };
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Add solicitor beneficiary</DialogTitle>
        <DialogDescription>
          New solicitors are saved as <strong>Pending Verification</strong> until Canta verifies the
          bank details.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Firm name *">
          <Input value={firm} onChange={(e) => setFirm(e.target.value)} />
        </Field>
        <Field label="Contact person *">
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </Field>
        <Field label="Email *">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Country">
          <Input value={country} onChange={(e) => setCountry(e.target.value)} />
        </Field>
        <Field label="Currency">
          <Select value={currency} onValueChange={(v) => setCurrency(v as "GBP" | "EUR" | "USD")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Bank *">
          <Input value={bank} onChange={(e) => setBank(e.target.value)} />
        </Field>
        <Field label="Account name *">
          <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} />
        </Field>
        <Field label="Account number *">
          <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
        </Field>
        <Field label="Sort code">
          <Input value={sortCode} onChange={(e) => setSortCode(e.target.value)} />
        </Field>
        <Field label="IBAN">
          <Input value={iban} onChange={(e) => setIban(e.target.value)} />
        </Field>
        <Field label="SWIFT / BIC *">
          <Input value={swift} onChange={(e) => setSwift(e.target.value)} />
        </Field>
      </div>
      <DialogFooter>
        <Button onClick={submit}>Save solicitor</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium truncate">{value}</div>
    </div>
  );
}
