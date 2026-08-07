import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/ngn-details")({
  beforeLoad: () => {
    throw redirect({ to: "/supplier-portal/ngn-balance" });
  },
});
