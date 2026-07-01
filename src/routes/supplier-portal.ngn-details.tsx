import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { FileText, Phone, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { DetailRow, COMPLIANCE_DISCLAIMER } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/ngn-details")({
  head: () => ({ meta: [{ title: "NGN Payment Details — Supplier Portal — Canta" }] }),
  component: NgnDetailsPanel,
});

function NgnDetailsPanel() {
  return (
    <div className="space-y-3">
      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">Canta NGN payment details for your buyer</div>
        <div className="text-xs text-muted-foreground">
          Nigerian buyers pay NGN locally through Canta. Canta handles conversion and settlement backend, then pays the supplier in RMB or USD through approved payout rails.
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <DetailRow label="Account name" value="Canta Settlement / Guangzhou Tech Factory" />
          <DetailRow label="Bank name" value="Providus Bank" />
          <DetailRow label="Account number" value="9901234567" />
          <DetailRow label="Payment reference" value="CANTA-INV-2026-055" />
          <DetailRow label="NGN amount to pay" value="₦8,650,000" />
          <DetailRow label="Payment expiry" value="Today · 23:59 WAT" />
          <DetailRow label="Linked invoice" value="INV-2026-055" />
          <DetailRow label="Linked payment request" value="PR-3055" />
        </div>
        <Card className="p-3 bg-muted/40 text-xs">
          <div className="font-semibold mb-1">Buyer instructions</div>
          Pay the exact NGN amount into the Canta account using the payment reference. Your supplier will receive RMB/USD settlement after payment confirmation, compliance checks, and payout processing.
        </Card>
        <ButtonGroup label="Payment detail actions">
          <Button size="sm" onClick={() => toast.success("Payment details copied")}><FileText className="h-4 w-4 mr-2" /> Copy Payment Details</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Sent to buyer on WhatsApp")}><Phone className="h-4 w-4 mr-2" /> Send on WhatsApp</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Sent to buyer by email")}><Mail className="h-4 w-4 mr-2" /> Send by Email</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Payment instruction PDF downloaded")}><Download className="h-4 w-4 mr-2" /> Download Instruction</Button>
        </ButtonGroup>
      </Card>
      <Card className="p-3 text-[11px] text-muted-foreground italic border-l-4 border-primary/40">{COMPLIANCE_DISCLAIMER}</Card>
    </div>
  );
}
