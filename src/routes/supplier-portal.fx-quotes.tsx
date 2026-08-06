import { createFileRoute, redirect } from "@tanstack/react-router";

// Complex FX quote table retired — quoting now happens inside Create Invoice.
export const Route = createFileRoute("/supplier-portal/fx-quotes")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/create-invoice" }); },
});
