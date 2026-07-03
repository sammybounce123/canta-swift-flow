import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/wallet")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/rmb-wallet" }); },
});
