import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/action-group";

export const Route = createFileRoute("/supplier-portal/support")({
  head: () => ({ meta: [{ title: "Support — Supplier Portal — Canta" }] }),
  component: SupportPanel,
});

function SupportPanel() {
  return (
    <Card className="p-4 space-y-3 text-sm">
      <div className="font-semibold">Supplier support</div>
      <div className="text-muted-foreground">
        Get help with buyer payment requests, invoice documents, verification, and RMB settlement
        receipts.
      </div>
      <ButtonGroup label="Supplier support actions">
        <Button size="sm" variant="outline">
          Open support ticket
        </Button>
        <Button size="sm" variant="outline">
          Message Canta
        </Button>
      </ButtonGroup>
    </Card>
  );
}
