import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/partner/payment-cases")({
  component: () => <Outlet />,
});
