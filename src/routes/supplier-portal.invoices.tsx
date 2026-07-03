import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/supplier-portal/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Supplier Portal — Canta" }] }),
  component: InvoicesPanel,
});

function InvoicesPanel() {
  return (
    <Card className="p-4 space-y-3">
      <div className="text-sm font-semibold">Invoices &amp; shipping documents</div>
      <div className="text-xs text-muted-foreground">Invoices link to each payment request. Upload proforma invoice, commercial invoice, and packing list for each buyer payment.</div>
      <ButtonGroup label="Invoice actions">
        <Button size="sm" variant="outline" onClick={() => toast.success("Proforma invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload proforma invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Commercial invoice uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload commercial invoice</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Packing list uploaded")}><Upload className="h-4 w-4 mr-2" /> Upload packing list</Button>
      </ButtonGroup>
    </Card>
  );
}
