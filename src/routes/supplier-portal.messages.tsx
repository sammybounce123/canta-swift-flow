import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier-portal/messages")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/support" }); },
});
