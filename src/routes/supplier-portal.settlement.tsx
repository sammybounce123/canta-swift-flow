import { createFileRoute, redirect } from "@tanstack/react-router";

// Settlement tracking now lives at the simplified /supplier-portal/settlements page.
export const Route = createFileRoute("/supplier-portal/settlement")({
  beforeLoad: () => {
    throw redirect({ to: "/supplier-portal/settlements" });
  },
});
