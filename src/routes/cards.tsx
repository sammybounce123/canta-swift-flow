import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, EyeOff } from "lucide-react";

export const Route = createFileRoute("/cards")({
  head: () => ({ meta: [{ title: "Feature unavailable — Canta" }] }),
  component: CardsUnavailable,
});

function CardsUnavailable() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <Card className="w-full max-w-lg p-8 text-center shadow-card">
        <div className="mx-auto h-12 w-12 rounded-xl bg-secondary grid place-items-center text-muted-foreground">
          <EyeOff className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">This feature is not available in this demo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This focused phase highlights Importer Trade Desk, Supplier Portal, Enterprise Treasury, and Partner Mode.
        </p>
        <Button asChild className="mt-6">
          <Link to="/welcome"><ArrowLeft className="h-4 w-4 mr-2" /> Back to workspace selection</Link>
        </Button>
      </Card>
    </div>
  );
}
