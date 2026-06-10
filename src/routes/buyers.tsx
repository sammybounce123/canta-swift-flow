import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Users } from "lucide-react";

export const Route = createFileRoute("/buyers")({
  head: () => ({ meta: [{ title: "Buyers — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Buyers"
      icon={<Users className="h-5 w-5 text-primary" />}
      subtitle="Your active African buyers — invoices, escrow status, payment history and corridor performance."
      bullets={[
        "Private buyer records",
        "Open invoices and escrow status per buyer",
        "Corridor and payment history",
        "Credit terms and limit per buyer",
        "Promote a buyer into the verified directory",
        "Bulk WhatsApp / email outreach",
      ]}
      primaryAction={{ label: "Add buyer" }}
      learnMore={{ to: "/verified-buyers", label: "Browse Verified Buyers" }}
    />
  ),
});
