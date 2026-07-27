import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password | BABA" },
      { name: "description", content: "Reset your BABA account password using the email on your account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email. Please try again.");
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
        <h1 className="font-display text-3xl font-extrabold text-baba-blue">Forgot your password?</h1>
        <p className="mt-2 text-sm text-baba-slate/70">
          Enter the email address you saved on your account and we'll send a reset link.
        </p>

        {sent ? (
          <div className="mt-8 rounded-xl border border-baba-blue/20 bg-baba-blue/5 p-5 text-sm text-baba-slate">
            <p className="font-semibold text-baba-blue">Check your inbox.</p>
            <p className="mt-1">
              If an account exists for <strong>{email}</strong>, a password-reset link is on its way. It may take a
              minute or two to arrive. Check spam or junk if you don't see it.
            </p>
            <p className="mt-3 text-xs text-baba-slate/70">
              Didn't add an email when you joined? Message us via the{" "}
              <Link to="/contact" className="font-semibold text-baba-blue hover:underline">
                contact page
              </Link>{" "}
              with your name and ID number and we'll help you reset it manually.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Email</span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <Mail className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="you@example.com"
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
              Send reset link
            </button>
            <p className="text-xs text-baba-slate/50">
              Password reset needs a real email address. If you never added one, use the{" "}
              <Link to="/contact" className="font-semibold text-baba-blue hover:underline">
                contact page
              </Link>{" "}
              and our team will help.
            </p>
          </form>
        )}
      </section>
    </PageShell>
  );
}
