import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User, IdCard, Mail, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { createRegistration, updateMyProfile, type RoleValue } from "@/lib/registrations.functions";

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
          "Join Buy Africa Build Africa (BABA) for free. Register with just your name and ID number — no email needed. Log back in anytime with your name and ID.",
      },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  component: AuthPage,
});

const CATEGORIES: { value: RoleValue; label: string }[] = [
  { value: "artisan", label: "Artisan / Skilled Trade" },
  { value: "professional_young", label: "Young Professional" },
  { value: "professional_exp", label: "Experienced Professional" },
  { value: "corporate", label: "Company / Organisation" },
];

function sanitizeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

// Turn an ID number into a stable synthetic email + password so people can log
// in with just their name and ID — no real email address required.
function idToEmail(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `id${clean}@baba.local`;
}
function idToPassword(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `baba-${clean}`;
}

function AuthPage() {
  const navigate = useNavigate();
  const submitRegistration = useServerFn(createRegistration);
  const saveProfile = useServerFn(updateMyProfile);

  const [mode, setMode] = useState<"join" | "signin">("join");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<RoleValue>("artisan");
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

    const name = fullName.trim();
    const id = idNumber.trim();
    if (!name) return setError("Please enter your name.");
    if (id.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
      return setError("Please enter a valid ID number.");
    }

    setLoading(true);
    try {
      const syntheticEmail = idToEmail(id);
      const password = idToPassword(id);

      if (mode === "signin") {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password,
        });
        if (signInErr) {
          throw new Error(
            "We couldn't find an account with that ID. Check your ID number or tap Join instead.",
          );
        }
        navigate({ to: redirectTo() });
        return;
      }

      // JOIN — create a free account keyed on the ID number.
      const { error: signUpErr } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            national_id: id,
            contact_email: email.trim() || null,
            category,
          },
        },
      });
      if (signUpErr) {
        if (/already registered|already exists/i.test(signUpErr.message)) {
          throw new Error("An account with that ID already exists. Tap Sign in instead.");
        }
        throw signUpErr;
      }

      // Ensure a session (auto-confirm is on, so this succeeds).
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        await supabase.auth.signInWithPassword({ email: syntheticEmail, password });
      }

      // Record the registration + profile so the dashboard and admin see it.
      const label = CATEGORIES.find((c) => c.value === category)?.label ?? category;
      try {
        await submitRegistration({
          data: {
            role: category,
            artisan_type: category === "artisan" ? "Skilled Trade" : undefined,
            data: {
              fullName: name,
              nationalId: id,
              email: email.trim() || null,
              category: label,
            },
          },
        });
        await saveProfile({ data: { full_name: name } });
      } catch {
        // Non-fatal — the account is already created; details can be added later.
      }

      navigate({ to: redirectTo() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-baba-blue">
            {mode === "join" ? "Join for free" : "Welcome back"}
          </h1>
          <p className="mt-2 text-baba-slate/70">
            {mode === "join"
              ? "No email needed — just your name and ID number. It's completely free."
              : "Enter the name and ID number you signed up with."}
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
              Full Name
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
              <User className="h-4 w-4 text-baba-slate/40" />
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                placeholder="e.g. Jane Wanjiru"
              />
            </div>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
              ID Number
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
              <IdCard className="h-4 w-4 text-baba-slate/40" />
              <input
                required
                inputMode="numeric"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                placeholder="National ID or other ID number"
              />
            </div>
            <span className="text-[0.7rem] text-baba-slate/50">
              You'll use this same ID number to log in next time.
            </span>
          </label>

          {mode === "join" && (
            <>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RoleValue)}
                  className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Email <span className="font-normal normal-case text-baba-slate/50">(optional)</span>
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <Mail className="h-4 w-4 text-baba-slate/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
            </>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "join" ? "Join for Free" : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-baba-slate/70">
          {mode === "join" ? "Already registered?" : "New to BABA?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "join" ? "signin" : "join");
              setError("");
            }}
            className="font-bold text-baba-copper-dark hover:underline"
          >
            {mode === "join" ? "Log in" : "Join for free"}
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
