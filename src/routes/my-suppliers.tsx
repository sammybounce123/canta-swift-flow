import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Factory } from "lucide-react";

export const Route = createFileRoute("/my-suppliers")({
  head: () => ({ meta: [{ title: "My Suppliers — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="My Suppliers"
      icon={<Factory className="h-5 w-5 text-primary" />}
      subtitle="Your private supplier list — relationships, contracts, payment terms and trade history."
      bullets={[
        "Private supplier records (not shared)",
        "Trade history with each supplier",
        "Outstanding balances and payment terms",
        "Contracts and price lists on file",
        "Notes from your team",
        "Promote a supplier into Trade Network",
      ]}
      primaryAction={{ label: "Add supplier" }}
      learnMore={{ to: "/verified-suppliers", label: "Browse Verified Suppliers" }}
    />
  ),
});
