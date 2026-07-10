import { createFileRoute, redirect } from "@tanstack/react-router";

// Stable alias so /supplier-portal/settlements resolves the same view as
// /supplier-portal/settlement and preserves Supplier Mode.
export const Route = createFileRoute("/supplier-portal/settlements")({
  beforeLoad: () => { throw redirect({ to: "/supplier-portal/settlement" }); },
});
