import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceCardsHub } from "@/components/WorkspaceCardsHub";

export const Route = createFileRoute("/importer/cards")({
  head: () => ({ meta: [{ title: "Importer Cards — Canta" }] }),
  component: () => (
    <WorkspaceCardsHub
      workspaceKey="importer"
      title="Importer Cards"
      subtitle="Spend cards for procurement, inspections, samples and trade expenses — linked to trade files, shipments and suppliers."
      cardTypes={[
        { key: "procurement", label: "Procurement Staff Card", desc: "Day-to-day purchasing for your buyers" },
        { key: "inspection", label: "Inspection Fees Card", desc: "QC visits, factory audits, lab tests" },
        { key: "samples", label: "Supplier Samples Card", desc: "Sample orders before bulk POs" },
        { key: "trade", label: "Trade Expenses Card", desc: "Freight, customs, ad-hoc trade costs" },
      ]}
      linkEntities={["Trade file", "Shipment", "Supplier", "Cost center"]}
      spendDimensions={[
        { key: "trade-file", label: "Trade file" },
        { key: "shipment", label: "Shipment" },
        { key: "supplier", label: "Supplier" },
      ]}
      backTo={{ to: "/importer", label: "Back to Importer Workspace" }}
      cardHub={<Link to="/cards" className="text-xs text-accent hover:underline">Open shared card hub →</Link>}
    />
  ),
});
