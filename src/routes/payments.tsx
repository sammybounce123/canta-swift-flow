import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Receipt } from "lucide-react";

export const Route = createFileRoute("/payments")({
  head: () => ({ meta: [{ title: "Payments — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Payments"
      icon={<Receipt className="h-5 w-5 text-primary" />}
      subtitle="Pay suppliers, freight forwarders and partners. Track outgoing payments per trade file and shipment."
      bullets={[
        "Pay supplier invoices in their local currency",
        "Settle freight forwarder fees and port expenses",
        "Track every payment against its trade file or shipment",
        "Use FX-protected rates with Canta Treasury",
        "Schedule recurring payments to long-term suppliers",
        "Export payment reports for accounting",
      ]}
      primaryAction={{ label: "New payment" }}
      learnMore={{ to: "/trade-desk", label: "Open Trade Desk" }}
    />
  ),
});
