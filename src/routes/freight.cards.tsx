import { createFileRoute, Link } from "@tanstack/react-router";
import { WorkspaceCardsHub } from "@/components/WorkspaceCardsHub";

export const Route = createFileRoute("/freight/cards")({
  head: () => ({ meta: [{ title: "Freight Cards — Canta" }] }),
  component: () => (
    <WorkspaceCardsHub
      workspaceKey="freight"
      title="Freight Cards"
      subtitle="Cards for port expenses, route costs, clearing staff, warehouse and operations — linked to shipments, customers and routes."
      cardTypes={[
        { key: "port", label: "Port Expense Card", desc: "Terminal handling, demurrage, gate-pass fees" },
        { key: "route", label: "Route Expense Card", desc: "Per-route tolls, fuel, escort costs" },
        { key: "clearing", label: "Clearing Staff Card", desc: "Brokers and customs runners" },
        { key: "warehouse", label: "Warehouse Expense Card", desc: "Storage, labour, equipment hire" },
        { key: "operations", label: "Operations Staff Card", desc: "Day-to-day ops team spend" },
        { key: "travel", label: "Travel Card", desc: "Site visits, port travel" },
      ]}
      linkEntities={["Shipment", "Customer", "Route", "Branch", "Staff member", "Cost center"]}
      spendDimensions={[
        { key: "route", label: "Route" },
        { key: "staff", label: "Staff" },
        { key: "shipment", label: "Shipment" },
      ]}
      backTo={{ to: "/freight", label: "Back to Freight Workspace" }}
      cardHub={<Link to="/cards" className="text-xs text-accent hover:underline">Open shared card hub →</Link>}
    />
  ),
});
