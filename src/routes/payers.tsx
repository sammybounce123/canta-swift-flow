import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { Users } from "lucide-react";

export const Route = createFileRoute("/payers")({
  head: () => ({ meta: [{ title: "Payers — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      title="Payers"
      icon={<Users className="h-5 w-5 text-primary" />}
      subtitle="Manage students, parents, donors and customers that pay you. See history, status and outstanding balances."
      bullets={[
        "Unified profile per payer",
        "Full payment history and receipts",
        "Outstanding balances and reminders",
        "Bulk import from CSV / Excel",
        "Tags and segments for campaigns",
        "WhatsApp & email follow-ups",
      ]}
      primaryAction={{ label: "Add payer" }}
      learnMore={{ to: "/collections", label: "Open Global Collections" }}
    />
  ),
});
