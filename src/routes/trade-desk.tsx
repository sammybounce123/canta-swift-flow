import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/trade-desk")({
  component: () => <Outlet />,
});
