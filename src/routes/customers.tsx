import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Users } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Customers"
      icon={<Users className="h-5 w-5 text-primary" />}
      subtitle="Manage your importer customers — shipments, invoices, documents and WhatsApp updates in one place."
      bullets={[
        "Full profile per customer",
        "Shipments, invoices and outstanding balance",
        "Document checklist per shipment",
        "Bulk WhatsApp updates",
        "Branch and route assignment",
        "Customer-specific pricing & terms",
      ]}
      primaryAction={{ label: "Add customer" }}
      learnMore={{ to: "/freight", label: "Open Freight Workspace" }}
    />
  ),
});
