import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Plus, Star, CheckCircle2, Clock, XCircle, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import {
  payoutAccountsStore, usePayoutAccounts, maskAccountNumber,
  type PayoutAccountStatus,
} from "@/lib/supplier-payout-accounts";

export const Route = createFileRoute("/supplier-portal/payout-accounts")({
  head: () => ({ meta: [{ title: "Payout Accounts — Supplier Portal — Canta" }] }),
  component: PayoutAccountsPanel,
});

function statusTone(s: PayoutAccountStatus) {
  if (s === "Verified") return "bg-emerald-100 text-emerald-800";
  if (s === "Pending") return "bg-amber-100 text-amber-800";
  return "bg-destructive/10 text-destructive";
}
function statusIcon(s: PayoutAccountStatus) {
  if (s === "Verified") return <CheckCircle2 className="h-3 w-3 mr-1" />;
  if (s === "Pending") return <Clock className="h-3 w-3 mr-1" />;
  return <XCircle className="h-3 w-3 mr-1" />;
}

function PayoutAccountsPanel() {
  const accounts = usePayoutAccounts();
  const [addOpen, setAddOpen] = useState(false);

  function makeDefault(id: string) {
    const res = payoutAccountsStore.setDefault(id);
    if (!res.ok) {
      toast.error(res.error ?? "Unable to set as settlement destination");
      return;
    }
    toast.success("Settlement destination updated");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Badge variant="outline" className="text-[10px] inline-flex items-center gap-1"><FlaskConical className="h-3 w-3" /> Demo data</Badge>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-semibold">Supplier payout accounts</div>
            <div className="text-xs text-muted-foreground">
              Add RMB and USD accounts to <strong>receive</strong> settlement from Canta. These accounts are receive-only — suppliers cannot send funds out of Canta.
            </div>
          </div>
          <ButtonGroup label="Payout account actions">
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add payout account</Button>
          </ButtonGroup>
        </div>
        <div className="text-xs font-medium text-primary bg-primary/5 border border-primary/20 rounded p-2">
          Rule: settlement can only be sent to a <strong>Verified</strong> payout account. Pending or rejected accounts cannot be set as the settlement destination.
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {accounts.map((a) => (
          <Card key={a.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold flex items-center gap-1"><Landmark className="h-4 w-4" /> {a.currency} payout account</div>
              <div className="flex items-center gap-1.5">
                {a.isDefault && <Badge className="bg-primary/10 text-primary text-[10px]"><Star className="h-3 w-3 mr-1" /> Settlement destination</Badge>}
                <Badge className={`text-[10px] ${statusTone(a.status)}`}>{statusIcon(a.status)}{a.status}</Badge>
              </div>
            </div>
            <ul className="text-xs space-y-1.5">
              <li className="flex items-start justify-between gap-3 border-b pb-1"><span className="text-muted-foreground">Bank</span><span className="text-right font-medium">{a.bank}</span></li>
              <li className="flex items-start justify-between gap-3 border-b pb-1"><span className="text-muted-foreground">Account name</span><span className="text-right font-medium">{a.accountName}</span></li>
              <li className="flex items-start justify-between gap-3 pb-1"><span className="text-muted-foreground">Account number</span><span className="text-right font-medium font-mono">{maskAccountNumber(a.accountNumber)}</span></li>
            </ul>
            <ButtonGroup label={`${a.currency} account actions`}>
              <Button size="sm" variant="outline" disabled={a.isDefault} onClick={() => makeDefault(a.id)}>
                {a.isDefault ? "Current settlement destination" : "Set as settlement destination"}
              </Button>
            </ButtonGroup>
            {a.status !== "Verified" && (
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                This account cannot receive settlement until it is verified.
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-3 text-xs text-muted-foreground">
        Account statuses: Pending · Verified · Rejected. Suppliers cannot receive settlement into an unverified payout account.
      </Card>

      <AddAccountDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddAccountDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [bank, setBank] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [currency, setCurrency] = useState<"RMB" | "USD">("RMB");

  function reset() { setBank(""); setAccountName(""); setAccountNumber(""); setCurrency("RMB"); }

  function submit() {
    if (!bank.trim() || !accountName.trim() || accountNumber.replace(/\D/g, "").length < 8) {
      toast.error("Enter a valid bank, account name, and account number (min 8 digits)");
      return;
    }
    payoutAccountsStore.add({ bank: bank.trim(), accountName: accountName.trim(), accountNumber: accountNumber.trim(), currency });
    toast.success("Payout account added — pending verification");
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add payout account</DialogTitle>
          <DialogDescription>New accounts start as Pending until Canta compliance verifies them.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as "RMB" | "USD")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RMB">RMB</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Bank name</Label><Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. ICBC — Guangzhou Branch" /></div>
          <div className="space-y-1.5"><Label>Account name</Label><Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Beneficiary name" /></div>
          <div className="space-y-1.5"><Label>Account number</Label><Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account / IBAN number" /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={submit}>Add account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
