import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePlaceholder } from "@/components/WorkspacePlaceholder";
import { ShieldCheck } from "lucide-react";
import { ReadinessBar } from "@/components/ReadinessBar";

export const Route = createFileRoute("/escrow")({
  head: () => ({ meta: [{ title: "Escrow — Canta" }] }),
  component: () => (
    <WorkspacePlaceholder
      readiness="Contact Canta to Activate"
      trustCue={`Escrow availability depends on transaction type, compliance review, and supported settlement rails.`}
      
      title="Escrow"
      icon={<ShieldCheck className="h-5 w-5 text-accent" />}
      subtitle="Hold buyer funds securely until trade milestones clear. Manage release conditions and disputes."
      bullets={[
        "Hold funds against signed trade contracts",
        "Release triggered by BL, delivery or signoff",
        "Partial and milestone-based releases",
        "Dispute window with evidence upload",
        "Escrow certificates issued by Canta",
        "Connect to specific trade files automatically",
      ]}
      primaryAction={{ label: "New escrow" }}
      learnMore={{ to: "/trade-desk", label: "Open Trade Desk" }}
    />
  ),
});
