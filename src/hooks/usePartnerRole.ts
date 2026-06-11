import { useEffect, useState } from "react";
import { getActivePartnerRole, getActivePartnerUserId, getMarketer, type PartnerRole } from "@/lib/partner";

export function usePartnerRole() {
  const [role, setRole] = useState<PartnerRole>(() => getActivePartnerRole());
  const [userId, setUserId] = useState<string>(() => getActivePartnerUserId());

  useEffect(() => {
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
