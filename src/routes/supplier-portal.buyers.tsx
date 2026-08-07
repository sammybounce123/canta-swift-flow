import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/buyers")({
  beforeLoad: () => {
    throw redirect({ to: "/supplier-portal/invoices" });
  },
});
