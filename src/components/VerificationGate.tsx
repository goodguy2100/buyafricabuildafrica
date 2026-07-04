import { useCallback, useState } from "react";
import type React from "react";
import { useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Access is FREE for everyone. Before an apply/register action we only do a
// quick check that the person is signed in — if not, we gently ask them to
// sign in rather than blocking or forcing a full flow.

type GateVariant = "apply" | "organization";

export function useVerificationGate() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const requireVerification = useCallback(
    (_v: GateVariant, onProceed?: () => void) => {
      // Quick, non-blocking session check.
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          onProceed?.();
        } else {
          setOpen(true);
        }
      });
      return true;
    },
    [],
  );

  const GateModal: React.ReactNode = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription>
            It looks like you're not signed in yet. Please sign in (or create a free
            account) so we can link this to your profile.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg border border-baba-blue/20 px-5 py-2.5 text-sm font-semibold text-baba-slate/70 transition-colors hover:bg-baba-blue/5"
          >
            Not now
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate({ to: "/auth" });
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg baba-cta px-5 py-2.5 text-sm font-semibold text-white"
          >
            <LogIn className="h-4 w-4" /> Sign in
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { requireVerification, GateModal };
}
