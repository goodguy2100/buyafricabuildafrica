import { useState, useCallback, useEffect } from "react";
import { ShieldCheck, Lock, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyRegistrations } from "@/lib/registrations.functions";

// Verification gate — shows a one-time payment prompt when a logged-in user
// tries an action that requires a verified account. Payment integration is
// NOT built yet; the button is intentionally disabled.

type GateVariant = "apply" | "organization";

const COPY: Record<GateVariant, { title: string; fee: string; body: string }> = {
  apply: {
    title: "Verify your account to apply",
    fee: "KSh 100 one-time fee",
    body: "A one-time verification lets you apply to courses and job listings across the BABA network.",
  },
  organization: {
    title: "Verify your organization",
    fee: "KSh 23,000 registration fee",
    body: "Verify your organization to post jobs and access the BABA talent pool.",
  },
};

export function useVerificationGate() {
  // Free access for everyone for now — no payment/verification required.
  const requireVerification = useCallback(
    (_v: GateVariant, onProceed?: () => void) => {
      onProceed?.();
      return true;
    },
    [],
  );

  return { requireVerification, GateModal: null as React.ReactNode };
}


function VerificationGateModal({
  variant,
  onClose,
}: {
  variant: GateVariant;
  onClose: () => void;
}) {
  const copy = COPY[variant];
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-baba-slate/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-baba-blue/10 bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
            <ShieldCheck className="h-6 w-6 text-baba-blue" />
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-baba-slate/50 transition-colors hover:bg-secondary hover:text-baba-slate"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold text-baba-blue">
          {copy.title} — {copy.fee}
        </h2>
        <p className="mt-2 text-sm text-baba-slate/70">{copy.body}</p>
        <button
          disabled
          className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-baba-slate/20 py-3 text-sm font-bold text-baba-slate/60"
        >
          <Lock className="h-4 w-4" /> Payment Integration Coming Soon
        </button>
        <p className="mt-3 text-center text-[0.7rem] text-baba-slate/50">
          We'll enable secure checkout as soon as our payment partner is live.
        </p>
      </div>
    </div>
  );
}
