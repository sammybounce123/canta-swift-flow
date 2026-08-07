import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/reports")({
  beforeLoad: () => {
    throw redirect({ to: "/supplier-portal/settlements" });
  },
});
