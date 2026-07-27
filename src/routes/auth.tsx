import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User, IdCard, Mail, Loader2, Lock, MapPin } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { createRegistration, updateMyProfile, type RoleValue } from "@/lib/registrations.functions";
import { LocationPicker, EMPTY_LOCATION, type LocationValue } from "@/components/LocationPicker";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

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
          "Join Buy Africa Build Africa (BABA) for free. Register with your name, ID, and location — email is optional.",
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState<RoleValue>("artisan");
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = () =>
    sanitizeRedirect(new URLSearchParams(window.location.search).get("redirect"));

  const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  const finishRegistrationSetup = async (name: string, id: string, loc: LocationValue) => {
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
            country: loc.country,
            city: loc.city.trim(),
            area: loc.area.trim(),
            location: [loc.area, loc.city, loc.country].filter(Boolean).join(", "),
          },
        },
      });
      await saveProfile({
        data: {
          full_name: name,
          country: loc.country || undefined,
          city: loc.city.trim() || undefined,
          area: loc.area.trim() || undefined,
          location: [loc.area, loc.city, loc.country].filter(Boolean).join(", ") || undefined,
        },
      });
    } catch {
      // Non-fatal
    }
  };

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
    const pwd = password;
    if (!name) return setError("Please enter your name.");
    if (id.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
      return setError("Please enter a valid ID number.");
    }
    if (!pwd || pwd.length < 6) {
      return setError("Please enter a password (at least 6 characters).");
    }
    if (mode === "join") {
      if (scorePassword(pwd).score < 2) {
        return setError("Please choose a stronger password (add length, capitals, a number or symbol).");
      }
      if (pwd !== confirmPassword) {
        return setError("Passwords don't match — please re-type your password.");
      }
      if (!location.country || !location.city.trim()) {
        return setError("Please choose your country and city.");
      }
    }

    setLoading(true);
    try {
      const syntheticEmail = idToEmail(id);
      const legacyPassword = idToPassword(id);
      const destination = redirectTo();

      const signInWith = (p: string) =>
        supabase.auth.signInWithPassword({ email: syntheticEmail, password: p });

      if (mode === "signin") {
        let res = await signInWith(pwd);
        if (res.error) {
          const legacy = await signInWith(legacyPassword);
          if (!legacy.error) {
            res = legacy;
          } else {
            throw new Error(
              "Wrong ID or password. Check your details or tap Join if you don't have an account yet.",
            );
          }
        }
        await navigate({ to: destination, replace: true });
        return;
      }

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: pwd,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            national_id: id,
            contact_email: email.trim() || null,
            category,
            country: location.country,
            city: location.city.trim(),
            area: location.area.trim(),
          },
        },
      });
      if (signUpErr) {
        if (/already registered|already exists|user already/i.test(signUpErr.message)) {
          const existing = await signInWith(pwd);
          if (existing.error) {
            const legacy = await signInWith(legacyPassword);
            if (legacy.error) {
              throw new Error(
                "An account with that ID already exists. Tap Log in and enter your password.",
              );
            }
          }
          setNotice("You're already a member — we've signed you in. Welcome back!");
          await navigate({ to: destination, replace: true });
          return;
        }
        throw signUpErr;
      }

      if (!signUpData.session) {
        const { error: signInAfterJoinErr } = await signInWith(pwd);
        if (signInAfterJoinErr) {
          throw new Error("Your account was created, but we could not log you in automatically. Please tap Log in.");
        }
      }

      const setup = finishRegistrationSetup(name, id, location);
      await Promise.race([setup, pause(2500)]);
      await navigate({ to: destination, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-baba-blue">
            {mode === "join" ? "Join for free" : "Welcome back"}
          </h1>
          <p className="mt-2 text-baba-slate/70">
            {mode === "join"
              ? "Your name, ID, location and a password. Email is optional."
              : "Enter your ID and password."}
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

          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
              Password
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
              <Lock className="h-4 w-4 text-baba-slate/40" />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "join" ? "new-password" : "current-password"}
                minLength={6}
                className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                placeholder={mode === "join" ? "Create a password (min 6 characters)" : "Your password"}
              />
            </div>
            {mode === "join" && <PasswordStrength password={password} />}
          </label>

          {mode === "join" && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Confirm Password
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <Lock className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="Re-type your password"
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <span className="text-[0.7rem] text-red-500">Passwords don't match.</span>
              )}
            </label>
          )}

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

              <div className="grid gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  <MapPin className="h-3.5 w-3.5" /> Where are you?
                </span>
                <LocationPicker value={location} onChange={setLocation} required />
                <span className="text-[0.7rem] text-baba-slate/50">
                  Pick your country and city, then type your specific area (e.g. Westlands, South B, Lekki Phase 1).
                </span>
              </div>

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
                <span className="text-[0.7rem] text-baba-slate/50">
                  Add an email if you'd like to receive password reset links and updates.
                </span>
              </label>
            </>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {notice && (
            <p className="rounded-lg border border-baba-blue/20 bg-baba-blue/5 px-3.5 py-2.5 text-sm font-medium text-baba-blue">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "join" ? "Join for Free" : "Log In"}
          </button>
        </form>

        {mode === "signin" && (
          <p className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="font-semibold text-baba-blue hover:underline">
              Forgot your password?
            </Link>
          </p>
        )}

        <p className="mt-6 text-center text-sm text-baba-slate/70">
          {mode === "join" ? "Already registered?" : "New to BABA?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "join" ? "signin" : "join");
              setError("");
              setNotice("");
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
