import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Link as LinkIcon } from "lucide-react";

export const Route = createFileRoute("/payment-links")({
  head: () => ({ meta: [{ title: "Payment Links — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Payment Links"
      icon={<LinkIcon className="h-5 w-5 text-primary" />}
      subtitle="Create shareable payment links for tuition, donations, events, products and bookings. Collect locally, settle globally."
      bullets={[
        "Generate one-off and recurring links",
        "Accept card, bank transfer and mobile money",
        "Auto-reconcile payments to the right invoice",
        "Multi-currency display with FX lock",
        "Branded checkout pages",
        "Share via WhatsApp, email or QR",
      ]}
      primaryAction={{ label: "Create payment link" }}
      learnMore={{ to: "/collections", label: "Open Global Collections" }}
    />
  ),
});
