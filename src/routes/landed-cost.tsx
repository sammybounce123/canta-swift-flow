import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Calculator } from "lucide-react";

export const Route = createFileRoute("/landed-cost")({
  head: () => ({ meta: [{ title: "Landed Cost — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Landed Cost"
      icon={<Calculator className="h-5 w-5 text-accent" />}
      subtitle="Know your real cost before your goods arrive. Build landed-cost models per shipment, with expected sale price and profit."
      bullets={[
        "Estimated landed cost per shipment",
        "Expected selling price and projected profit",
        "Missing cost items flagged automatically",
        "Clearing estimate with 'prepare by' date",
        "FX-adjusted in NGN, USD, GHS, KES",
        "Risk warnings for delayed or partial shipments",
      ]}
      primaryAction={{ label: "Build new estimate" }}
      learnMore={{ to: "/importer", label: "Open Importer Portal" }}
    />
  ),
});
