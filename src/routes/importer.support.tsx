import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/importer/support")({
  beforeLoad: () => {
    throw redirect({ to: "/support" });
  },
});
