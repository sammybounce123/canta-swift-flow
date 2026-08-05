import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy supplier profile route. The Supplier Portal now owns the canonical,
 * receive-only profile at /supplier-portal/profile — this path only redirects.
 */
export const Route = createFileRoute("/suppliers/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/supplier-portal/profile" });
  },
});
