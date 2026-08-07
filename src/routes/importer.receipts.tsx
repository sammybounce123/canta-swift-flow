import { createFileRoute, redirect } from "@tanstack/react-router";

// Receipts are a tab inside /importer/payments, not a separate page.
export const Route = createFileRoute("/importer/receipts")({
  beforeLoad: () => {
    throw redirect({ to: "/importer/payments", search: { tab: "receipts" } });
  },
});
