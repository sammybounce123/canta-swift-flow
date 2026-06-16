import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceCardsHub } from "@/components/WorkspaceCardsHub";

export const Route = createFileRoute("/treasury/cards")({
  head: () => ({ meta: [{ title: "Company Cards — Canta" }] }),
  component: () => (
    <WorkspaceCardsHub
      workspaceKey="enterprise"
      title="Company Cards"
      subtitle="Issue cards to staff, departments and projects with approvals, receipt rules, and full spend reporting."
      cardTypes={[
        { key: "staff", label: "Staff Card", desc: "Per-employee company card" },
        { key: "department", label: "Department Card", desc: "Shared spend for a team or unit" },
        { key: "travel", label: "Travel Card", desc: "Trips, hotels, per-diem" },
        { key: "procurement", label: "Procurement Card", desc: "Office and vendor purchases" },
        { key: "project", label: "Project Card", desc: "Time-boxed initiative spend" },
        { key: "ads", label: "Ad Spend Card", desc: "Meta, Google, TikTok campaigns" },
      ]}
      linkEntities={["Staff member", "Department", "Project", "Cost center"]}
      spendDimensions={[
        { key: "department", label: "Department" },
        { key: "project", label: "Project" },
        { key: "staff", label: "Staff" },
      ]}
      backTo={{ to: "/treasury", label: "Back to Enterprise Treasury" }}
      cardHub={<Link to="/cards" className="text-xs text-accent hover:underline">Open shared card hub →</Link>}
      enableExport
    />
  ),
});
