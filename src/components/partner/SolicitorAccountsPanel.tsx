import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { SOLICITORS, getSolicitor } from "@/lib/partner";
import {
  PAYOUT_CURRENCIES,
  addSolicitorAccount,
  setSolicitorAccountStatus,
  usePartnerPayments,
  type PayoutCurrency,
} from "@/lib/partner-payments";
import {
  canReceivePayout,
  logPayoutEvent,
  maskAccountNumber,
  PAYOUT_STATUS_TONE,
} from "@/lib/payout-security";
import { requestStepUp } from "@/lib/step-up";

/** Solicitor payout accounts held per currency, with the global payout status model. */
export function SolicitorAccountsPanel() {
  const { accounts } = usePartnerPayments();
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    solicitorId: SOLICITORS[0]?.id ?? "",
    currency: "GBP" as PayoutCurrency,
    bank: "",
    accountName: "",
    accountNumber: "",
    swift: "",
    iban: "",
    proof: "",
  });

  const reveal = async (id: string, label: string) => {
    const r = await requestStepUp({
      title: "Security check required",
      action: `Reveal solicitor account details — ${label}`,
      requireReason: true,
    });
    if (!r.ok) return;
    logPayoutEvent({
      action: "Bank account details revealed",
      workspace: "Partner",
      entity: label,
      reason: r.reason,
    });
    setRevealed((s) => ({ ...s, [id]: true }));
  };

  const submit = async () => {
    if (!form.bank || !form.accountName || !form.accountNumber) {
      toast.error("Bank, account name and account number are required");
      return;
    }
    const r = await requestStepUp({
      title: "Security check required",
      action: "Add solicitor payout account",
    });
    if (!r.ok) return;
    addSolicitorAccount(form);
    toast.success("Account submitted — Pending Review before it can receive settlement");
    setOpen(false);
  };

  return (
    <Card className="p-5 shadow-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">Solicitor payout accounts by currency</h2>
          <p className="text-xs text-muted-foreground">
            Only Verified/Active accounts can receive a solicitor payout.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <Plus className="h-4 w-4 mr-1.5" /> Add payout account
        </Button>
      </div>

      {open && (
        <div className="grid gap-3 md:grid-cols-3 rounded-lg border p-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Solicitor</Label>
            <Select
              value={form.solicitorId}
              onValueChange={(v) => setForm((f) => ({ ...f, solicitorId: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOLICITORS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.firm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Currency</Label>
            <Select
              value={form.currency}
              onValueChange={(v) => setForm((f) => ({ ...f, currency: v as PayoutCurrency }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYOUT_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(
            [
              ["bank", "Bank name"],
              ["accountName", "Account name"],
              ["accountNumber", "Account number / IBAN"],
              ["swift", "SWIFT / BIC"],
              ["proof", "Proof of account (reference)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs">{label}</Label>
              <Input
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="md:col-span-3 flex gap-2">
            <Button size="sm" onClick={submit}>
              Submit for review
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-secondary/40">
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="py-2 px-3">Solicitor</th>
              <th className="py-2 px-3">Currency</th>
              <th className="py-2 px-3">Bank</th>
              <th className="py-2 px-3">Account</th>
              <th className="py-2 px-3">SWIFT</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="py-2 px-3 text-xs">{getSolicitor(a.solicitorId)?.firm}</td>
                <td className="py-2 px-3 text-xs">{a.currency}</td>
                <td className="py-2 px-3 text-xs">{a.bank}</td>
                <td className="py-2 px-3 text-xs font-mono">
                  {revealed[a.id] ? a.accountNumber : maskAccountNumber(a.accountNumber)}
                </td>
                <td className="py-2 px-3 text-xs">{a.swift}</td>
                <td className="py-2 px-3">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${PAYOUT_STATUS_TONE[a.status]}`}
                  >
                    {a.status}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => reveal(a.id, `${a.accountName} (${a.currency})`)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Reveal
                  </Button>
                  {!canReceivePayout(a.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSolicitorAccountStatus(a.id, "Verified", "Ops Reviewer");
                        toast.success("Account verified by Ops (demo)");
                      }}
                    >
                      Approve
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
