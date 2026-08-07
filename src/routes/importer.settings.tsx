import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/importer/settings")({
  beforeLoad: () => {
    throw redirect({ to: "/settings" });
  },
});
