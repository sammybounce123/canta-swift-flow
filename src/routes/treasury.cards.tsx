import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceCardsHub } from "@/components/WorkspaceCardsHub";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/treasury/cards")({
  head: () => ({ meta: [{ title: "Company Cards — Canta" }] }),
  component: () => (
    <div className="space-y-6">
      <ReadinessBar status="Requires Setup" cue="Card issuing requires KYB and activation by Canta." />
      <WorkspaceCardsHub
        workspaceKey="enterprise"
        title="Company Cards"
        subtitle="Optional treasury spend controls for staff, departments and projects."
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
        enableExport
      />
    </div>
  ),
});
