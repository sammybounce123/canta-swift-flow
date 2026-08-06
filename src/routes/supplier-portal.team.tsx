import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/team")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/settings" }); },
});
