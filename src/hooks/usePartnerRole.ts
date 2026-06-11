import { useEffect, useState } from "react";
import { getActivePartnerRole, getActivePartnerUserId, getMarketer, MARKETERS, type PartnerRole } from "@/lib/partner";

// SSR-safe defaults to avoid hydration mismatch; sync from localStorage on mount.
const DEFAULT_ROLE: PartnerRole = "partner_admin";
const DEFAULT_USER_ID = MARKETERS[0]?.id ?? "U-ADMIN";

export function usePartnerRole() {
  const [role, setRole] = useState<PartnerRole>(DEFAULT_ROLE);
  const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);

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
