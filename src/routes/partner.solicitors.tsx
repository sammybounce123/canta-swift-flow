import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Star, Download, Edit3, ShieldCheck, History, Users } from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, formatGBP, type Solicitor } from "@/lib/partner";

export const Route = createFileRoute("/partner/solicitors")({
  head: () => ({ meta: [{ title: "Solicitors — Baron & Cabot" }] }),
  component: Solicitors,
});

function Solicitors() {
  const [, force] = useState(0);
  const [open, setOpen] = useState(false);

  const onAdd = (s: Solicitor) => {
    SOLICITORS.unshift(s);
    force((n) => n + 1);
    setOpen(false);
    toast.success(`${s.firm} added`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Solicitor directory</h1>
          <p className="text-sm text-muted-foreground mt-1">Saved solicitor beneficiaries linked to your Baron &amp; Cabot referrals.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary"><Plus className="h-4 w-4 mr-1.5" /> Add solicitor</Button>
          </DialogTrigger>
          <AddSolicitorDialog onAdd={onAdd} />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOLICITORS.map((s) => (
          <Card key={s.id} className="p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-semibold">{s.firm}</div>
                  {s.preferred && <Badge variant="outline" className="text-[10px] bg-warning/15 text-warning border-warning/30"><Star className="h-3 w-3 mr-1" /> Preferred</Badge>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.contact} · {s.country}</div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${
                s.verified === "Verified" ? "bg-success/15 text-success border-success/30"
                  : s.verified === "Pending" ? "bg-warning/15 text-warning border-warning/30"
                  : "bg-destructive/15 text-destructive border-destructive/30"
              }`}>
                <ShieldCheck className="h-3 w-3 mr-1" /> {s.verified}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <Info label="Email" value={s.email} />
              <Info label="Phone" value={s.phone} />
              <Info label="Bank" value={s.bank} />
              <Info label="Currency" value={s.currency} />
              <Info label="Account name" value={s.accountName} />
              <Info label="Account number" value={s.accountNumberMasked} />
              <Info label="Sort code" value={s.sortCode ?? "—"} />
              <Info label="SWIFT / BIC" value={s.swift} />
              <Info label="IBAN" value={s.iban ?? "—"} />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t text-center">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Clients</div>
                <div className="text-base font-semibold tabular-nums">{s.linkedClients}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total payouts</div>
                <div className="text-base font-semibold tabular-nums">{formatGBP(s.totalPayouts)}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Last payout</div>
                <div className="text-base font-semibold tabular-nums">{s.lastPayout}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toast("Opening solicitor profile…")}>View</Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Edits require re-verification")}><Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit</Button>
              <Button size="sm" variant="outline" onClick={() => { s.preferred = !s.preferred; force((n) => n + 1); toast.success(s.preferred ? "Marked as preferred" : "Removed preferred"); }}><Star className="h-3.5 w-3.5 mr-1.5" /> {s.preferred ? "Unpin" : "Preferred"}</Button>
              <Button size="sm" variant="ghost"><Users className="h-3.5 w-3.5 mr-1.5" /> Clients</Button>
              <Button size="sm" variant="ghost"><History className="h-3.5 w-3.5 mr-1.5" /> Payouts</Button>
              <Button size="sm" variant="ghost"><Download className="h-3.5 w-3.5 mr-1.5" /> Confirmation</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
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
      toast.error("Please fill firm, contact, email, bank, account name, account number and SWIFT");
      return;
    }
    const last4 = accountNumber.replace(/\s+/g, "").slice(-4).padStart(4, "•");
    const id = `SOL-${String(SOLICITORS.length + 1).padStart(3, "0")}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    onAdd({
      id,
      firm, contact, email, phone, country, currency,
      bank, accountName,
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
        <DialogDescription>New solicitors are saved as <strong>Pending</strong> until Canta verifies the bank details.</DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Firm name *"><Input value={firm} onChange={(e) => setFirm(e.target.value)} placeholder="e.g. Hartwell & Greaves LLP" /></Field>
        <Field label="Contact person *"><Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Full name" /></Field>
        <Field label="Email *"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="payments@firm.co.uk" /></Field>
        <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 …" /></Field>
        <Field label="Country"><Input value={country} onChange={(e) => setCountry(e.target.value)} /></Field>
        <Field label="Currency">
          <Select value={currency} onValueChange={(v) => setCurrency(v as "GBP" | "EUR" | "USD")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Bank *"><Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. Barclays Bank PLC" /></Field>
        <Field label="Account name *"><Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Firm Client Account" /></Field>
        <Field label="Account number *"><Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="12345678" /></Field>
        <Field label="Sort code"><Input value={sortCode} onChange={(e) => setSortCode(e.target.value)} placeholder="20-00-00" /></Field>
        <Field label="IBAN"><Input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="GB29 …" /></Field>
        <Field label="SWIFT / BIC *"><Input value={swift} onChange={(e) => setSwift(e.target.value)} placeholder="BARCGB22" /></Field>
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
