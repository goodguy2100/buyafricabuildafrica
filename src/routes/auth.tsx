import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User, IdCard, Mail, Loader2, Lock, MapPin, Users, Building2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { createRegistration, updateMyProfile, type RoleValue } from "@/lib/registrations.functions";
import { lookupLoginEmail } from "@/lib/login-lookup.functions";
import { LocationPicker, EMPTY_LOCATION, type LocationValue } from "@/components/LocationPicker";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Join Us or Log In | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Join Buy Africa Build Africa (BABA). Pick your work, add your name and a password. Log in with your full name and password.",
      },
      { property: "og:title", content: "Join Us or Log In | Buy Africa Build Africa" },
      {
        property: "og:description",
        content: "Pick your work, add your name and a password.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),

  component: AuthPage,
});

/* ------------------------------- categories ------------------------------- */

type Category = { label: string; role: RoleValue; trade?: string; orgType?: string };

/** "Join us" — people who work with their hands, study, or practise a profession. */
const JOIN_CATEGORIES: Category[] = [
  { label: "Carpenter", role: "artisan", trade: "carpenter" },
  { label: "Mason", role: "artisan", trade: "mason" },
  { label: "Plumber", role: "artisan", trade: "plumber" },
  { label: "Electrician", role: "artisan", trade: "electrician" },
  { label: "Painter", role: "artisan", trade: "painter" },
  { label: "Welder", role: "artisan", trade: "welder" },
  { label: "Tiler", role: "artisan", trade: "tiler" },
  { label: "Gypsum Fabricator", role: "artisan", trade: "gypsum_installer" },
  { label: "Steel Fixer", role: "artisan", trade: "other" },
  { label: "Roofer", role: "artisan", trade: "other" },
  { label: "Glass & Aluminium Fitter", role: "artisan", trade: "other" },
  { label: "Metal Fabricator", role: "artisan", trade: "other" },
  { label: "Landscaper", role: "artisan", trade: "other" },
  { label: "Interior Designer", role: "professional_exp" },
  { label: "Architect", role: "professional_exp" },
  { label: "Engineer", role: "professional_exp" },
  { label: "Quantity Surveyor", role: "professional_exp" },
  { label: "Project Manager", role: "professional_exp" },
  { label: "Contractor", role: "professional_exp" },
  { label: "Student", role: "professional_young" },
  { label: "Other (type it below)", role: "artisan", trade: "other" },
];

/** "Partner with us" — organisations. */
const PARTNER_CATEGORIES: Category[] = [
  { label: "Financial Institution", role: "corporate", orgType: "Financial Institution" },
  { label: "Corporate", role: "corporate", orgType: "Private Company" },
  { label: "Government Entity", role: "corporate", orgType: "Government Institution" },
  { label: "Association", role: "corporate", orgType: "Association" },
  { label: "NGO", role: "corporate", orgType: "NGO" },
  { label: "Private Entity", role: "corporate", orgType: "Private Company" },
  { label: "Development Partner", role: "corporate", orgType: "Development Partner" },
  { label: "Learning Institution", role: "corporate", orgType: "Learning Institution" },
  { label: "Other (type it below)", role: "corporate", orgType: "Other" },
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
/** Members can join without an ID number, so build a login address from the name. */
function nameToEmail(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "member";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slug}${suffix}@baba.local`;
}


function AuthPage() {
  const navigate = useNavigate();
  const submitRegistration = useServerFn(createRegistration);
  const saveProfile = useServerFn(updateMyProfile);
  const findLogin = useServerFn(lookupLoginEmail);

  const [mode, setMode] = useState<"join" | "signin">("join");
  const [intent, setIntent] = useState<"member" | "partner">("member");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [categoryLabel, setCategoryLabel] = useState(JOIN_CATEGORIES[0].label);
  const [otherCategory, setOtherCategory] = useState("");
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [askForId, setAskForId] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const list = intent === "member" ? JOIN_CATEGORIES : PARTNER_CATEGORIES;
  const chosen = list.find((c) => c.label === categoryLabel) ?? list[0];
  const isOther = chosen.label.startsWith("Other");

  const redirectTo = () =>
    sanitizeRedirect(new URLSearchParams(window.location.search).get("redirect"));

  const pause = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  const finishRegistrationSetup = async (name: string, id: string, loc: LocationValue) => {
    const label = isOther && otherCategory.trim() ? otherCategory.trim() : chosen.label;
    try {
      await submitRegistration({
        data: {
          role: chosen.role,
          artisan_type: chosen.role === "artisan" ? (chosen.trade ?? "other") : undefined,
          data: {
            fullName: name,
            nationalId: id,
            email: email.trim() || null,
            category: label,
            occupation: label,
            trade: chosen.role === "artisan" ? label : undefined,
            corporateType: chosen.orgType,
            corporateName: intent === "partner" ? name : undefined,
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
    if (!name) return setError("Please type your full name.");
    if (!pwd || pwd.length < 6) {
      return setError("Please type your password (6 letters or numbers or more).");
    }
    if (mode === "join") {
      if (id && id.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
        return setError("That National Identification No looks too short. Leave it blank if unsure.");
      }
      if (scorePassword(pwd).score < 2) {
        return setError("Please pick a stronger password. Make it longer, or add a number.");
      }
      if (pwd !== confirmPassword) {
        return setError("The two passwords are not the same. Please type them again.");
      }
      if (isOther && !otherCategory.trim()) {
        return setError("Please type the work you do.");
      }
    }


    setLoading(true);
    try {
      const destination = redirectTo();
      const signInWith = (loginEmail: string, p: string) =>
        supabase.auth.signInWithPassword({ email: loginEmail, password: p });

      if (mode === "signin") {
        const found = await findLogin({ data: { fullName: name, nationalId: id || undefined } });
        if (found.needsId) {
          setAskForId(true);
          throw new Error(
            "More than one person uses that name. Please also type your National Identification No.",
          );
        }
        if (!found.email) {
          throw new Error(
            "We could not find that name. Check the spelling, or tap Join us to make an account.",
          );
        }
        let res = await signInWith(found.email, pwd);
        if (res.error && id) {
          const legacy = await signInWith(found.email, idToPassword(id));
          if (!legacy.error) res = legacy;
        }
        if (res.error) {
          throw new Error("Wrong password. Tap “Forgot your password?” below to get a new one.");
        }
        await navigate({ to: destination, replace: true });
        return;
      }

      const syntheticEmail = id ? idToEmail(id) : nameToEmail(name);
      const legacyPassword = idToPassword(id);

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: syntheticEmail,
        password: pwd,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            national_id: id || null,
            contact_email: email.trim() || null,
            category: isOther && otherCategory.trim() ? otherCategory.trim() : chosen.label,
            country: location.country,
            city: location.city.trim(),
            area: location.area.trim(),
          },
        },
      });

      if (signUpErr) {
        if (/already registered|already exists|user already/i.test(signUpErr.message)) {
          const existing = await signInWith(syntheticEmail, pwd);
          if (existing.error) {
            const legacy = await signInWith(syntheticEmail, legacyPassword);
            if (legacy.error) {
              throw new Error(
                "You already have an account. Tap “Log in” and use your full name and password.",
              );
            }
          }
          setNotice("You are already a member — we have logged you in. Welcome back!");
          await navigate({ to: destination, replace: true });
          return;
        }
        throw signUpErr;
      }

      if (!signUpData.session) {
        const { error: signInAfterJoinErr } = await signInWith(syntheticEmail, pwd);
        if (signInAfterJoinErr) {
          throw new Error("Your account was made, but we could not log you in. Please tap Log in.");
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
            {mode === "join"
              ? intent === "member"
                ? "Join us"
                : "Partner with us"
              : "Welcome back"}
          </h1>
          <p className="mt-2 text-baba-slate/70">
            {mode === "join"
              ? "Pick your work, then add your name and a password."
              : "Log in with your full name and your password."}
          </p>
        </div>

        {mode === "join" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(
              [
                { key: "member", label: "Join us", hint: "I work or study", icon: Users },
                {
                  key: "partner",
                  label: "Partner with us",
                  hint: "We are an organisation",
                  icon: Building2,
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setIntent(opt.key);
                  setCategoryLabel(
                    (opt.key === "member" ? JOIN_CATEGORIES : PARTNER_CATEGORIES)[0].label,
                  );
                  setOtherCategory("");
                }}
                className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                  intent === opt.key
                    ? "border-baba-blue bg-baba-blue/5"
                    : "border-baba-blue/15 hover:border-baba-blue/40"
                }`}
              >
                <opt.icon className="h-5 w-5 text-baba-blue" />
                <span>
                  <span className="block text-sm font-bold text-baba-slate">{opt.label}</span>
                  <span className="block text-xs text-baba-slate/60">{opt.hint}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-4">
          {mode === "join" && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                {intent === "member" ? "What work do you do?" : "What kind of organisation?"}
              </span>
              <select
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
              >
                {list.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label}
                  </option>
                ))}
              </select>
              {isOther && (
                <input
                  value={otherCategory}
                  onChange={(e) => setOtherCategory(e.target.value)}
                  placeholder={
                    intent === "member" ? "Type the work you do" : "Type your organisation type"
                  }
                  className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                />
              )}
            </label>
          )}

          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
              {mode === "join" && intent === "partner" ? "Organisation Name" : "Full Name"}
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
            {mode === "signin" && (
              <span className="text-[0.7rem] text-baba-slate/50">
                Type your name the same way you wrote it when you joined.
              </span>
            )}
          </label>

          {(mode === "join" || askForId) && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                National Identification No{" "}
                <span className="font-normal normal-case text-baba-slate/50">
                  {mode === "signin" ? "(only to tell you apart)" : "(optional)"}
                </span>
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <IdCard className="h-4 w-4 text-baba-slate/40" />
                <input
                  inputMode="numeric"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="Your National Identification No"
                />
              </div>
              {mode === "join" && (
                <span className="text-[0.7rem] text-baba-slate/50">
                  You can skip this now — but your profile is only complete once you add your ID
                  number and phone number in your profile.
                </span>
              )}
            </label>
          )}


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
                placeholder={mode === "join" ? "Make a password (6 or more)" : "Your password"}
              />
            </div>
            {mode === "join" && <PasswordStrength password={password} />}
          </label>

          {mode === "join" && (
            <>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Type Password Again
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
                    placeholder="Type the same password"
                  />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span className="text-[0.7rem] text-red-500">
                    The two passwords are not the same.
                  </span>
                )}
              </label>

              <div className="grid gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  <MapPin className="h-3.5 w-3.5" /> Where are you?
                </span>
                <LocationPicker value={location} onChange={setLocation} />
                <span className="text-[0.7rem] text-baba-slate/50">
                  Pick your country and town, then type your area (e.g. Westlands, South B).
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
                  Add an email if you want a welcome message and help if you forget your password.
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
            {mode === "join" ? (intent === "member" ? "Join us" : "Partner with us") : "Log In"}
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
          {mode === "join" ? "Already a member?" : "New here?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "join" ? "signin" : "join");
              setError("");
              setNotice("");
              setAskForId(false);
            }}
            className="font-bold text-baba-copper-dark hover:underline"
          >
            {mode === "join" ? "Log in" : "Join us"}
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
