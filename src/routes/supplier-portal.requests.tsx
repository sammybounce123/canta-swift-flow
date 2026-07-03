import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/requests")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/payment-requests" }); },
});
