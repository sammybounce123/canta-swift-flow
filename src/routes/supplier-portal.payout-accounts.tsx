import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/payout-accounts")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/rmb-bank-account" }); },
});
