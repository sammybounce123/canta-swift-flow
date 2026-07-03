import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/payment-requests")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/requests" }); },
});
