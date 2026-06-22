import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceCardsHub } from "@/components/WorkspaceCardsHub";

export const Route = createFileRoute("/importer/cards")({
  head: () => ({ meta: [{ title: "Importer Cards — Canta" }] }),
  component: () => (
    <WorkspaceCardsHub
      workspaceKey="importer"
      title="Cards for your import business"
      subtitle="Pay for goods, inspections, samples and shipping with cards that track every spend to the right trade file or shipment."
      cardTypes={[
        { key: "buying", label: "Buying Card", desc: "Pay suppliers and place orders" },
        { key: "inspection", label: "Inspection Card", desc: "Pay for QC checks, lab tests and factory visits" },
        { key: "samples", label: "Samples Card", desc: "Order product samples before bulk orders" },
        { key: "shipping", label: "Shipping & Clearing Card", desc: "Pay freight, customs and clearing fees" },
      ]}
      linkEntities={["Trade file", "Shipment", "Supplier", "Cost center"]}
      spendDimensions={[
        { key: "trade-file", label: "Trade file" },
        { key: "shipment", label: "Shipment" },
        { key: "supplier", label: "Supplier" },
      ]}
      backTo={{ to: "/importer", label: "Back to Importer Workspace" }}
      cardHub={<Link to="/cards" className="text-xs text-accent hover:underline">See all cards →</Link>}
    />
  ),
});
