import { useEffect, useState } from "react";
import {
  getActivePartnerRole,
  getActivePartnerUserId,
  getMarketer,
  type PartnerRole,
} from "@/lib/partner";

// SSR-safe: start from server-side defaults, then hydrate from localStorage after mount
// to avoid React hydration mismatches.
export function usePartnerRole() {
  const [role, setRole] = useState<PartnerRole>("partner_admin");
  const [userId, setUserId] = useState<string>("U-ADMIN");

  useEffect(() => {
    setRole(getActivePartnerRole());
    setUserId(getActivePartnerUserId());
    const handler = () => {
      setRole(getActivePartnerRole());
      setUserId(getActivePartnerUserId());
    };
    window.addEventListener("partner-role-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("partner-role-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return { role, userId, user: getMarketer(userId) };
}
