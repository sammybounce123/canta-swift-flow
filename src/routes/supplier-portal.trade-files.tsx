import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/trade-files")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/requests" }); },
});
