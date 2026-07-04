import { useCallback } from "react";
import type React from "react";

// Verification gate — historically showed a one-time payment prompt. Access is
// now FREE for everyone, so the gate always allows the action to proceed.

type GateVariant = "apply" | "organization";

export function useVerificationGate() {
  const requireVerification = useCallback(
    (_v: GateVariant, onProceed?: () => void) => {
      onProceed?.();
      return true;
    },
    [],
  );

  return { requireVerification, GateModal: null as React.ReactNode };
}
