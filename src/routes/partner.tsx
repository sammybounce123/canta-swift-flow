import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [{ title: "Baron & Cabot — Partner Property Payments" }] }),
  component: () => <Outlet />,
});
