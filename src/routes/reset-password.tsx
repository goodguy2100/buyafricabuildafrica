import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password | BABA" },
      { name: "description", content: "Choose a new password for your BABA account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !cancelled) setReady(true);
    });

    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));

      // Supabase sends either an error, a PKCE ?code=, or #access_token/#token_hash.
      const errDesc = url.searchParams.get("error_description") ?? hash.get("error_description");
      if (errDesc) {
        setError(
          errDesc.includes("expired")
            ? "That link has expired. Please ask for a new one."
            : errDesc,
        );
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr && !cancelled) {
          setError("That link is no longer valid. Please ask for a new one.");
          return;
        }
      }

      const tokenHash = url.searchParams.get("token_hash") ?? hash.get("token_hash");
      if (!code && tokenHash) {
        await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
      }

      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) setReady(true);
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw.length < 6) return setError("Password must be at least 6 characters.");
    if (scorePassword(pw).score < 2) {
      return setError("Please choose a stronger password.");
    }
    if (pw !== pw2) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password: pw });
      if (updErr) throw updErr;
      setSuccess(true);
      setTimeout(() => navigate({ to: "/dashboard", replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8">
        <Link to="/auth" className="mb-6 inline-flex items-center gap-1 text-sm text-baba-slate/70 hover:text-baba-blue">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <h1 className="font-display text-3xl font-extrabold text-baba-blue">Choose a new password</h1>

        {success ? (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-semibold">Password updated.</p>
              <p>Taking you to your dashboard…</p>
            </div>
          </div>
        ) : !ready ? (
          <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            Waiting for your reset link. Open this page from the email we sent you — if you got here another way,
            request a new link from the{" "}
            <Link to="/forgot-password" className="font-semibold underline">
              forgot password page
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">New password</span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <Lock className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                />
              </div>
              <PasswordStrength password={pw} />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Confirm new password
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <Lock className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                />
              </div>
            </label>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>
        )}
      </section>
    </PageShell>
  );
}
