import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useRequireWorkspace } from "@/lib/workspace-guard";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Canta" }] }),
  component: MessagesRoute,
});

function MessagesRoute() {
  useRequireWorkspace();
  return <Navigate to="/whatsapp" replace />;
}
