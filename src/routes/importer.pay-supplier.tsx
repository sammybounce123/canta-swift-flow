import { createFileRoute, redirect } from "@tanstack/react-router";

// Pay Supplier is no longer a standalone page — it lives as the
// "New supplier payment" tab inside /importer/payments.
export const Route = createFileRoute("/importer/pay-supplier")({
  beforeLoad: () => {
    throw redirect({ to: "/importer/payments", search: { tab: "new" } });
  },
});
