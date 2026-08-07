import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/importer/cards")({
  head: () => ({ meta: [{ title: "Feature unavailable — Canta" }] }),
  component: () => (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <Card className="w-full max-w-lg p-8 text-center shadow-card">
        <h1 className="text-2xl font-semibold">This feature is not available in this demo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Importer Mode is focused on balances, supplier payments, documents, shipments and receipts.
        </p>
        <Button asChild className="mt-6">
          <Link to="/importer"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Importer Dashboard</Link>
        </Button>
      </Card>
    </div>
  ),
});
