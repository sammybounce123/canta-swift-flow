import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff, Landmark, ShieldCheck, Upload } from "lucide-react";
import {
  rmbBankStore,
  useRmbBanks,
  useAutoConvertPaused,
  autoConvertPause,
  nameMatchesSupplier,
  SUPPLIER_COMPANY,
  type RmbBankAccount,
} from "@/lib/supplier-simple";
import { useVerified } from "@/lib/supplier-data";
import {
  SECURITY_COPY,
  PAYOUT_STATUS_TONE,
  canReceivePayout,
  maskAccountNumber,
  logPayoutEvent,
  payoutBlockReason,
} from "@/lib/payout-security";
import { requestStepUp } from "@/lib/step-up";

export const Route = createFileRoute("/supplier-portal/rmb-bank-account")({
  head: () => ({
    meta: [
      { title: "RMB Bank Account — Supplier Portal — Canta" },
      {
        name: "description",
        content: "Add and verify the RMB bank account that receives your Canta settlement.",
      },
    ],
  }),
  component: RmbBankAccountPage,
});

const EMPTY = {
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  swift: "",
  cnaps: "",
  branch: "",
  bankAddress: "",
  province: "",
  currency: "RMB" as const,
  proofFileName: "",
};

function RmbBankAccountPage() {
  const banks = useRmbBanks();
  const kybApproved = useVerified();
  const paused = useAutoConvertPaused();
  const [form, setForm] = useState({ ...EMPTY });

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const hasVerified = banks.some((b) => canReceivePayout(b.status) && b.isSettlementDestination);

  const save = async (submit: boolean) => {
    if (!form.bankName.trim() || !form.accountHolder.trim() || !form.accountNumber.trim()) {
      toast.error("Bank name, account holder and account number are required.");
      return;
    }
    const step = await requestStepUp({
      title: "Security check required",
      action: "Add payout account",
    });
    if (!step.ok) {
      toast.info("Security check cancelled — no changes were saved.");
      return;
    }
    rmbBankStore.add({
      ...form,
      cnaps: form.cnaps || undefined,
      proofFileName: form.proofFileName || undefined,
    });
    setForm({ ...EMPTY });
    toast.success(
      submit ? "Bank account submitted — Pending Review" : "Bank account saved — Pending Review",
      { description: "Automatic Convert is paused until Canta verifies this account." },
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 text-sm">{SECURITY_COPY.supplier}</Card>

      {(!hasVerified || paused) && (
        <div
          role="status"
          className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" /> {SECURITY_COPY.supplierAutoConvertBlocked}
          </div>
          {paused && (
            <p className="mt-1 text-xs">
              {autoConvertPause.reason()} Existing settlements stay pending until Canta Ops approves
              the account.
            </p>
          )}
          {!kybApproved && (
            <p className="mt-1 text-xs">
              Your business verification (KYB) must be approved before an account can become Active.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        {banks.map((b) => (
          <BankCard key={b.id} bank={b} kybApproved={kybApproved} />
        ))}
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Landmark className="h-4 w-4" /> Add RMB bank account
        </div>
        <p className="text-xs text-muted-foreground">
          New accounts start as <strong>Pending Review</strong>. The account holder name must match{" "}
          {SUPPLIER_COMPANY} or an approved alias.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Bank name"
            value={form.bankName}
            onChange={set("bankName")}
            placeholder="ICBC"
          />
          <Field
            label="Account holder name"
            value={form.accountHolder}
            onChange={set("accountHolder")}
            placeholder="Guangzhou Tech Factory Co., Ltd"
          />
          <Field
            label="Account number"
            value={form.accountNumber}
            onChange={set("accountNumber")}
            placeholder="6222 0000 0000 0000"
          />
          <Field
            label="SWIFT / BIC"
            value={form.swift}
            onChange={set("swift")}
            placeholder="ICBKCNBJGDG"
          />
          <Field
            label="CNAPS code (if applicable)"
            value={form.cnaps}
            onChange={set("cnaps")}
            placeholder="102581000012"
          />
          <Field
            label="Bank branch"
            value={form.branch}
            onChange={set("branch")}
            placeholder="Guangzhou Baiyun Branch"
          />
          <Field
            label="Bank address"
            value={form.bankAddress}
            onChange={set("bankAddress")}
            placeholder="No. 118 Baiyun Avenue"
          />
          <Field
            label="Province / city"
            value={form.province}
            onChange={set("province")}
            placeholder="Guangdong / Guangzhou"
          />
          <div>
            <Label className="text-xs">Currency</Label>
            <Input value="RMB / CNY" readOnly className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Bank proof / document</Label>
            <div className="mt-1 flex gap-2">
              <Input
                value={form.proofFileName}
                onChange={set("proofFileName")}
                placeholder="bank-confirmation.pdf"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Attach bank proof"
                onClick={() => {
                  setForm((f) => ({ ...f, proofFileName: "bank-confirmation.pdf" }));
                  toast.success("Document attached");
                }}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {form.accountHolder.trim() && !nameMatchesSupplier(form.accountHolder) && (
          <p className="text-xs text-destructive">
            Account holder name does not match your registered company name — Canta Ops will flag
            this for review.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void save(false)}>
            Save bank account
          </Button>
          <Button size="sm" onClick={() => void save(true)}>
            Submit for verification
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BankCard({ bank, kybApproved }: { bank: RmbBankAccount; kybApproved: boolean }) {
  const [revealed, setRevealed] = useState(false);
  const blocked = payoutBlockReason(bank.status);

  const reveal = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }
    const step = await requestStepUp({
      title: "Security check required",
      action: "Reveal full account number",
      requireReason: true,
    });
    if (!step.ok) return;
    setRevealed(true);
    logPayoutEvent({
      action: "Bank account details revealed",
      workspace: "Supplier",
      entity: `${bank.id} · ${maskAccountNumber(bank.accountNumber)}`,
      actor: "Supplier admin",
      reason: step.reason ?? "Not provided",
    });
    toast.success("Full account number revealed — audit event recorded");
  };

  return (
    <Card className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{bank.bankName}</div>
          <div className="text-xs text-muted-foreground">
            {bank.accountHolder} ·{" "}
            <span className="font-mono">
              {revealed ? bank.accountNumber : maskAccountNumber(bank.accountNumber)}
            </span>{" "}
            · {bank.currency}
          </div>
          <div className="text-xs text-muted-foreground">
            {bank.branch} · {bank.province}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className={PAYOUT_STATUS_TONE[bank.status]}>{bank.status}</Badge>
          {bank.isSettlementDestination && (
            <Badge variant="outline" className="text-[10px]">
              Settlement destination
            </Badge>
          )}
        </div>
      </div>

      {bank.status === "Rejected" && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          {bank.rejectionReason ?? "Details could not be verified."}
        </div>
      )}
      {blocked && bank.status !== "Rejected" && (
        <div className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground">
          {blocked}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => void reveal()}>
          {revealed ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1.5" /> Hide account number
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 mr-1.5" /> Reveal full account number
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!canReceivePayout(bank.status) || bank.isSettlementDestination}
          onClick={async () => {
            const step = await requestStepUp({
              title: "Security check required",
              action: "Set default settlement account",
            });
            if (!step.ok) return;
            const res = rmbBankStore.setDestination(bank.id, { kybApproved });
            if (res.ok) toast.success("Settlement destination updated");
            else toast.error(res.error ?? "Could not update");
          }}
        >
          <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Set as settlement destination
        </Button>
        {(bank.status === "Rejected" ||
          bank.status === "More Info Required" ||
          bank.status === "Locked After Change") && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const step = await requestStepUp({
                title: "Security check required",
                action: "Edit payout account",
              });
              if (!step.ok) return;
              rmbBankStore.submitForVerification(bank.id);
              toast.success("Resubmitted for verification");
            }}
          >
            Update details
          </Button>
        )}
        {(bank.status === "Pending Review" || bank.status === "Submitted") && (
          <span className="self-center text-xs text-muted-foreground">
            Pending accounts cannot receive settlement.
          </span>
        )}
      </div>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}
