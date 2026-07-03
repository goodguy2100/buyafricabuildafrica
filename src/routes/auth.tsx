import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Join | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Sign in or create your free Buy Africa Build Africa (BABA) account to register, track your submissions and access opportunities.",
      },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

function sanitizeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = () =>
    sanitizeRedirect(new URLSearchParams(window.location.search).get("redirect"));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        const { data: sess } = await supabase.auth.getSession();
        if (sess.session) {
          navigate({ to: redirectTo() });
        } else {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirectTo() });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "apple") => {
    setError("");
    const dest = redirectTo();
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(dest)}`,
    });
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: dest });
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-baba-blue">
            {mode === "signin" ? "Welcome back" : "Create your free account"}
          </h1>
          <p className="mt-2 text-baba-slate/70">
            {mode === "signin"
              ? "Sign in to continue your BABA journey."
              : "Signing up is completely free."}
          </p>
        </div>

        <div className="mt-8 grid gap-3">
          <button
            onClick={() => oauth("google")}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-baba-blue/15 bg-card py-2.5 text-sm font-semibold text-baba-slate transition-colors hover:border-baba-blue"
          >
            Continue with Google
          </button>
          <button
            onClick={() => oauth("apple")}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-baba-blue/15 bg-card py-2.5 text-sm font-semibold text-baba-slate transition-colors hover:border-baba-blue"
          >
            Continue with Apple
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-baba-slate/50">
          <span className="h-px flex-1 bg-baba-blue/10" /> or <span className="h-px flex-1 bg-baba-blue/10" />
        </div>

        <form onSubmit={submit} className="grid gap-4">
          {mode === "signup" && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Full Name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
              />
            </label>
          )}
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Email</span>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
              <Mail className="h-4 w-4 text-baba-slate/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
              />
            </div>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Password</span>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
              <Lock className="h-4 w-4 text-baba-slate/40" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
              />
            </div>
          </label>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {notice && <p className="text-sm font-medium text-baba-blue">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign In" : "Create Free Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-baba-slate/70">
          {mode === "signin" ? "New to BABA?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setNotice("");
            }}
            className="font-bold text-baba-copper-dark hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
        <p className="mt-4 text-center text-xs text-baba-slate/50">
          <Link to="/" className="hover:underline">
            Back to home
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
