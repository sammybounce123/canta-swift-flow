import { useEffect, useState, useCallback } from "react";
import {
  listCases, getExtendedCase, subscribe, expireQuoteIfNeeded, type ExtendedCase,
} from "@/lib/partner-store";

export function usePartnerCases(): ExtendedCase[] {
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force((n) => n + 1)), []);
  return listCases();
}

export function usePartnerCase(caseId: string): ExtendedCase | undefined {
  const [, force] = useState(0);
  const refresh = useCallback(() => force((n) => n + 1), []);
  useEffect(() => subscribe(refresh), [refresh]);
  // expiry watcher
  useEffect(() => {
    const id = setInterval(() => {
      expireQuoteIfNeeded(caseId);
    }, 5000);
    return () => clearInterval(id);
  }, [caseId]);
  return getExtendedCase(caseId);
}
