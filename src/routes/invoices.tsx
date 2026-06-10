import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/invoices")({
  head: () => ({ meta: [{ title: "Invoices — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Invoices"
      icon={<Receipt className="h-5 w-5 text-primary" />}
      subtitle="Issue, track and reconcile invoices in any currency. Auto-link to trade files, payers and settlements."
      bullets={[
        "Branded multi-currency invoices",
        "Auto-attach to trade files or buyers",
        "Track viewed / paid / overdue status",
        "WhatsApp & email reminders",
        "Partial payments and credit notes",
        "Export ledgers to your accountant",
      ]}
      primaryAction={{ label: "Create invoice" }}
    />
  ),
});
