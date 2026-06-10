import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/freight-invoices")({
  head: () => ({ meta: [{ title: "Freight Invoices — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Freight Invoices"
      icon={<Receipt className="h-5 w-5 text-primary" />}
      subtitle="Issue freight invoices to your customers and track collection — auto-linked to shipments and routes."
      bullets={[
        "Invoice per shipment or per customer",
        "Multi-currency: USD, NGN, EUR, GBP",
        "Auto-reminders on overdue invoices",
        "Partial payments and credit notes",
        "Export to accounting / ERP",
        "Bulk invoicing for monthly customers",
      ]}
      primaryAction={{ label: "Create freight invoice" }}
      learnMore={{ to: "/freight", label: "Open Freight Workspace" }}
    />
  ),
});
