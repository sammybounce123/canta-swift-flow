// Demo-safe helpers for Partner Mode actions: CSV downloads and clear
// "not connected in the demo" feedback so no button is dead.
import { toast } from "sonner";

export const DEMO_MSG = "This action is not connected in the demo yet.";

export function demoToast(label?: string) {
  toast.info(label ?? "Demo action", { description: DEMO_MSG });
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  if (typeof window === "undefined") return;
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded`);
}
