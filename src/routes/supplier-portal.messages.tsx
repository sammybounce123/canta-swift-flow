import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/supplier-portal/messages")({
  head: () => ({ meta: [{ title: "Messages — Supplier Portal — Canta" }] }),
  component: MessagesPanel,
});

function MessagesPanel() {
  return (
    <Card className="p-4 text-sm">
      <div className="text-muted-foreground mb-2">Messages are scoped to each Trade File. You only see communication related to your invoices.</div>
      <div className="border rounded-lg p-3">
        <div className="text-xs text-muted-foreground">TF-2026-0214 · Lagos Trade Holdings</div>
        <div className="text-sm mt-1">"Please confirm ETA for the second container." — buyer, 2h ago</div>
      </div>
    </Card>
  );
}
