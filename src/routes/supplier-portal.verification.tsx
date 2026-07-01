import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, FileText, UserCheck, Landmark, Upload, Lock } from "lucide-react";
import { toast } from "sonner";
import { Check, useVerified, verifiedStore } from "@/lib/supplier-data";

export const Route = createFileRoute("/supplier-portal/verification")({
  head: () => ({ meta: [{ title: "Verification — Supplier Portal — Canta" }] }),
  component: VerificationPanel,
});

function VerificationPanel() {
  const verified = useVerified();
  return (
    <div className="space-y-4">
      <Card className="p-4 border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
        <Lock className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="text-sm flex-1">
          <div className="font-semibold">Complete supplier verification to receive RMB settlement.</div>
          <div className="text-xs mt-1">You can view payment requests, upload invoices/documents, and message buyers or Canta before verification. RMB payouts unlock only after verification is approved.</div>
        </div>
        <Badge className={verified ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
          {verified ? "Verified" : "Submitted"}
        </Badge>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold flex items-center gap-1"><Building2 className="h-4 w-4" /> Business Information</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Legal name: Guangzhou Tech Factory Co., Ltd</li>
            <li>Registration #: 91440101MA9XXX</li>
            <li>Address: 88 Baiyun Rd, Guangzhou, China</li>
          </ul>
          <Button size="sm" variant="outline">Update business info</Button>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold flex items-center gap-1"><FileText className="h-4 w-4" /> Company Documents</div>
          <ul className="text-xs space-y-1">
            <li className="flex items-center justify-between">Business licence <Badge className="bg-emerald-100 text-emerald-800">Verified</Badge></li>
            <li className="flex items-center justify-between">Tax certificate <Badge className="bg-amber-100 text-amber-800">Pending</Badge></li>
            <li className="flex items-center justify-between">Export licence <Badge variant="outline">Required</Badge></li>
          </ul>
          <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1" /> Upload document</Button>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold flex items-center gap-1"><UserCheck className="h-4 w-4" /> Authorized Representative</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Name: Li Wei</li>
            <li>Role: Supplier Admin</li>
            <li>ID: Passport E12345678</li>
          </ul>
          <Button size="sm" variant="outline">Update representative</Button>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-sm font-semibold flex items-center gap-1"><Landmark className="h-4 w-4" /> Bank / RMB Payout Details</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>Bank: ICBC Guangzhou Branch</li>
            <li>Account: ****4821</li>
            <li>Beneficiary: Guangzhou Tech Factory Co., Ltd</li>
          </ul>
          <Button size="sm" variant="outline">Update payout details</Button>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">Verification Status</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {(["Not Submitted","Submitted","Under Review","Verified","Rejected","Update Required"]).map((s) => {
            const active = (verified && s === "Verified") || (!verified && s === "Under Review");
            return (
              <Badge key={s} className={active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}>{s}</Badge>
            );
          })}
        </div>
        <ul className="text-sm space-y-2">
          <Check item="Business registration" done />
          <Check item="Factory address proof" done={false} />
          <Check item="Bank account verification" done={false} />
          <Check item="Authorized representative ID" done />
        </ul>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-semibold">Required Actions</div>
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
          <li>Upload factory address proof.</li>
          <li>Upload bank statement (last 3 months).</li>
          <li>Confirm authorized representative contact.</li>
        </ul>
        {!verified && (
          <Button size="sm" onClick={() => { verifiedStore.set(true); toast.success("Verification submitted"); }}>
            Submit for review
          </Button>
        )}
      </Card>
    </div>
  );
}
