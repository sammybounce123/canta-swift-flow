import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { CheckSquare } from "lucide-react";

export const Route = createFileRoute("/reconciliation")({
  head: () => ({ meta: [{ title: "Reconciliation — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Reconciliation"
      icon={<CheckSquare className="h-5 w-5 text-success" />}
      subtitle="Auto-match incoming collections to invoices, payers and trade files. See exceptions in one place."
      bullets={[
        "Auto-match payments to invoices and payers",
        "Exception queue for unmatched items",
        "Split, merge and reassign collections",
        "Daily reconciliation reports",
        "Export to your accounting system",
        "Audit trail of every match decision",
      ]}
      primaryAction={{ label: "Run reconciliation" }}
    />
  ),
});
