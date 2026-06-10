import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Reports"
      icon={<BarChart3 className="h-5 w-5 text-primary" />}
      subtitle="Operational and financial reports for your workspace. Export to PDF, Excel or share securely."
      bullets={[
        "Monthly volume, revenue and margin reports",
        "Shipments per route, lane and customer",
        "Settlements and FX exposure",
        "Card spend by department and cost center",
        "Compliance and audit reports",
        "Scheduled email / WhatsApp delivery",
      ]}
      primaryAction={{ label: "Generate report" }}
    />
  ),
});
