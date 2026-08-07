import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Landmark, Upload } from "lucide-react";
import { rmbBankStore, useRmbBanks, maskAccount, type RmbBankAccount } from "@/lib/supplier-simple";

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
  const [form, setForm] = useState({ ...EMPTY });

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (submit: boolean) => {
    if (!form.bankName.trim() || !form.accountHolder.trim() || !form.accountNumber.trim()) {
      toast.error("Bank name, account holder and account number are required.");
      return;
    }
    rmbBankStore.add({
      ...form,
      cnaps: form.cnaps || undefined,
      proofFileName: form.proofFileName || undefined,
    });
    setForm({ ...EMPTY });
    toast.success(submit ? "Bank account submitted for verification" : "Bank account saved");
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 text-sm">
        Canta pays converted RMB only to verified bank accounts owned by your business.
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {banks.map((b) => (
          <BankCard key={b.id} bank={b} />
        ))}
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Landmark className="h-4 w-4" /> Add RMB bank account
        </div>
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
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => save(false)}>
            Save bank account
          </Button>
          <Button size="sm" onClick={() => save(true)}>
            Submit for verification
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BankCard({ bank }: { bank: RmbBankAccount }) {
  const tone =
    bank.status === "Verified"
      ? "bg-emerald-100 text-emerald-800"
      : bank.status === "Rejected"
        ? "bg-destructive/10 text-destructive"
        : "bg-amber-100 text-amber-800";

  return (
    <Card className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold">{bank.bankName}</div>
          <div className="text-xs text-muted-foreground">
            {bank.accountHolder} · {maskAccount(bank.accountNumber)} · {bank.currency}
          </div>
          <div className="text-xs text-muted-foreground">
            {bank.branch} · {bank.province}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge className={tone}>{bank.status}</Badge>
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
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={bank.status !== "Verified" || bank.isSettlementDestination}
          onClick={() => {
            const res = rmbBankStore.setDestination(bank.id);
            if (res.ok) toast.success("Settlement destination updated");
            else toast.error(res.error ?? "Could not update");
          }}
        >
          Set as settlement destination
        </Button>
        {bank.status === "Rejected" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              rmbBankStore.submitForVerification(bank.id);
              toast.success("Resubmitted for verification");
            }}
          >
            Update details
          </Button>
        )}
        {bank.status === "Pending" && (
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
