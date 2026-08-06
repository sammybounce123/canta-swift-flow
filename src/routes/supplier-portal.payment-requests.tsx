import { createFileRoute, redirect } from "@tanstack/react-router";

// Payment requests are created from the invoice flow; history lives in Invoice History.
export const Route = createFileRoute("/supplier-portal/payment-requests")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/invoices" }); },
});
