import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { User, IdCard, Mail, Loader2, Lock, MapPin, Users, Phone, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { createRegistration, updateMyProfile, type RoleValue } from "@/lib/registrations.functions";
import { lookupLoginEmail } from "@/lib/login-lookup.functions";
import { confirmSignup } from "@/lib/signup.functions";
import { LocationPicker, EMPTY_LOCATION, type LocationValue } from "@/components/LocationPicker";
import { PasswordStrength, scorePassword } from "@/components/PasswordStrength";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } =>
    typeof search.redirect === "string" ? { redirect: search.redirect } : {},
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

/* ------------------------------ professions ------------------------------ */

type ProfessionOption = {
  key: string;
  label: string; // "I am ..."
  role: RoleValue;
  trade?: string;
  example: string; // ego-glazing example for "what have you done?"
};

/** Every profession we celebrate — the more, the merrier. Nobody is left out. */
const PROFESSIONS: ProfessionOption[] = [
  // The big ones
  { key: "architect", label: "I am an Architect", role: "professional_exp", example: "e.g. I have designed a beautiful building that people love." },
  { key: "engineer", label: "I am an Engineer", role: "professional_exp", example: "e.g. I have engineered structures that serve my community." },
  { key: "interior-designer", label: "I am an Interior Designer", role: "professional_exp", example: "e.g. I have turned rooms into stunning, welcoming spaces." },
  { key: "quantity-surveyor", label: "I am a Quantity Surveyor", role: "professional_exp", example: "e.g. I have kept big projects on budget, down to the last shilling." },
  { key: "project-manager", label: "I am a Project Manager", role: "professional_exp", example: "e.g. I have led teams that delivered projects on time." },
  { key: "contractor", label: "I am a Contractor", role: "professional_exp", example: "e.g. I have built projects from the ground up." },
  // The hands — jobs Africa depends on
  { key: "welder", label: "I am a Welder", role: "artisan", trade: "welder", example: "e.g. I have welded gates and structures that are strong, clean and artistic." },
  { key: "plumber", label: "I am a Plumber", role: "artisan", trade: "plumber", example: "e.g. I have done neat, reliable plumbing that never leaks." },
  { key: "mason", label: "I am a Mason", role: "artisan", trade: "mason", example: "e.g. I have laid bricks and stone that stand tall for years." },
  { key: "electrician", label: "I am an Electrician", role: "artisan", trade: "electrician", example: "e.g. I have wired homes and shops safely and neatly." },
  { key: "painter", label: "I am a Painter", role: "artisan", trade: "painter", example: "e.g. I have given walls beautiful, smooth finishes." },
  { key: "tiler", label: "I am a Tiler", role: "artisan", trade: "tiler", example: "e.g. I have done beautiful bathroom and floor tiling." },
  { key: "carpenter", label: "I am a Carpenter", role: "artisan", trade: "carpenter", example: "e.g. I have crafted furniture and fittings that last." },
  { key: "gypsum-fabricator", label: "I am a Gypsum Fabricator", role: "artisan", trade: "gypsum_installer", example: "e.g. I have made ceilings and partitions that look elegant." },
  { key: "steel-fixer", label: "I am a Steel Fixer", role: "artisan", trade: "other", example: "e.g. I have tied the steel that holds strong buildings together." },
  { key: "roofer", label: "I am a Roofer", role: "artisan", trade: "other", example: "e.g. I have put up roofs that keep families safe and dry." },
  { key: "glass-aluminium", label: "I am a Glass & Aluminium Fitter", role: "artisan", trade: "other", example: "e.g. I have fitted windows and doors that look sharp." },
  { key: "metal-fabricator", label: "I am a Metal Fabricator", role: "artisan", trade: "other", example: "e.g. I have shaped metal into useful, beautiful things." },
  { key: "landscaper", label: "I am a Landscaper", role: "artisan", trade: "other", example: "e.g. I have turned bare ground into beautiful green spaces." },
  // Learners
  { key: "student", label: "I am a Student", role: "professional_young", example: "e.g. I am learning my craft and hungry to grow." },
  { key: "other", label: "I do something else (type it below)", role: "artisan", trade: "other", example: "Tell us something you have made or done that you are proud of." },
];

const MAX_PROFESSIONS = 6;

/** Highest tier wins the role: professional > artisan > student. */
function deriveRole(keys: string[]): RoleValue {
  const roles = keys
    .map((k) => PROFESSIONS.find((p) => p.key === k)?.role)
    .filter(Boolean) as RoleValue[];
  if (roles.includes("professional_exp")) return "professional_exp";
  if (roles.includes("artisan")) return "artisan";
  return "professional_young";
}

const EDUCATION_OPTIONS = [
  "Primary school",
  "Secondary school",
  "Certificate",
  "Diploma",
  "Bachelor's degree",
  "Master's degree or higher",
];
const EMPLOYMENT_OPTIONS = ["Employed", "Business owner / Entrepreneur", "Freelancer", "Student", "Other"];
const YEARS_OPTIONS = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "More than 10 years"];

function sanitizeRedirect(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function idToEmail(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return `id${clean}@baba.local`;
}


/** Members can join without an ID number, so build a login address from the name.
 *  Deterministic (no random suffix) so a retried signup lands on the same
 *  account instead of spawning duplicates. */
function nameToEmail(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24) || "member";
  return `${slug}@baba.local`;
}


function AuthPage() {
  const navigate = useNavigate();
  const submitRegistration = useServerFn(createRegistration);
  const saveProfile = useServerFn(updateMyProfile);
  const findLogin = useServerFn(lookupLoginEmail);
  const confirmSignupFn = useServerFn(confirmSignup);

  const [mode, setMode] = useState<"join" | "signin">("join");
  const [intent, setIntent] = useState<"member" | "partner">("member");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [otherProfession, setOtherProfession] = useState("");
  const [projects, setProjects] = useState("");
  const [education, setEducation] = useState("");
  const [employment, setEmployment] = useState("");
  const [years, setYears] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [partnerMessage, setPartnerMessage] = useState("");
  const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
  const [askForId, setAskForId] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // member join wizard: 1 do, 2 work, 3 about, 4 password

  // Arriving from "Become a Partner" opens the organisation form straight away.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("intent") === "partner") {
      setIntent("partner");
    }
  }, []);

  const chosenProfessions = selected
    .map((k) => PROFESSIONS.find((p) => p.key === k))
    .filter(Boolean) as ProfessionOption[];
  const primaryProfession = chosenProfessions[0];
  const isOther = selected.includes("other");
  const professionLabel = (p: ProfessionOption) =>
    p.key === "other" && otherProfession.trim() ? otherProfession.trim() : p.label;
  const toggleProfession = (key: string) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= MAX_PROFESSIONS) return prev;
      return [...prev, key];
    });
  };
  const role: RoleValue =
    intent === "partner" ? "corporate" : deriveRole(selected);
  const artisanType =
    intent === "member"
      ? (chosenProfessions.find((p) => p.trade)?.trade ?? (selected.length ? "other" : undefined))
      : undefined;

  const redirectTo = () =>
    sanitizeRedirect(new URLSearchParams(window.location.search).get("redirect"));

  const finishRegistrationSetup = async (name: string, id: string, phoneNumber: string, loc: LocationValue) => {
    if (intent === "partner") {
      await submitRegistration({
        data: {
          role: "corporate",
          data: {
            fullName: name,
            corporateName: name,
            email: email.trim() || null,
            phone: phoneNumber,
            lookingFor: lookingFor.trim() ? [lookingFor.trim()] : [],
            partnerMessage: partnerMessage.trim() || null,
            occupation: "Partner",
            category: "Partner",
          },
        },
      });
      await saveProfile({
        data: { full_name: name, email: email.trim() || undefined, phone: phoneNumber },
      });
      return;
    }
    const label =
      isOther && otherProfession.trim()
        ? otherProfession.trim()
        : primaryProfession
          ? professionLabel(primaryProfession)
          : "Member";
    await submitRegistration({
      data: {
        role,
        artisan_type: artisanType,
        data: {
          fullName: name,
          nationalId: id,
          phone: phoneNumber,
          email: email.trim() || null,
          category: label,
          occupation: label,
          trade: role === "artisan" ? label : undefined,
          professions: chosenProfessions.map((p) => professionLabel(p)),
          projects: projects.trim() || null,
          education: education || null,
          employmentStatus: employment || null,
          yearsField: years || null,
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
        email: email.trim() || undefined,
        phone: phoneNumber,
        country: loc.country || undefined,
        city: loc.city.trim() || undefined,
        area: loc.area.trim() || undefined,
        location: [loc.area, loc.city, loc.country].filter(Boolean).join(", ") || undefined,
      },
    });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Validate the current wizard slide. Returns an error message or null. */
  const validateStep = (s: number): string | null => {
    if (s === 1) {
      if (selected.length === 0) return "Please pick what you do — tap at least one.";
      if (isOther && !otherProfession.trim()) return "Please type the work you do.";
    }
    if (s === 3) {
      if (!fullName.trim()) return "Please type your full name.";
      if (!phone.trim()) return "Please type your phone number.";
      if (phone.replace(/[^0-9]/g, "").length < 9) {
        return "That phone number looks too short - please type it fully, e.g. 0712 345 678.";
      }
      if (idNumber.trim() && idNumber.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
        return "That National Identification No looks too short. Leave it blank if unsure.";
      }
    }
    if (s === 4) {
      if (!password || password.length < 6) {
        return "Please type your password (6 letters or numbers or more).";
      }
      if (scorePassword(password).score < 2) {
        return "Please pick a stronger password. Make it longer, or add a number.";
      }
      if (password !== confirmPassword) {
        return "The two passwords are not the same. Please type them again.";
      }
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    // Member wizard: advance one slide per submit until the final step.
    if (mode === "join" && intent === "member" && step < 4) {
      const stepErr = validateStep(step);
      if (stepErr) return setError(stepErr);
      setStep(step + 1);
      return;
    }

    const name = fullName.trim();
    const id = idNumber.trim();
    const pwd = password;
    if (!name) return setError("Please type your full name.");
    if (mode === "join") {
      if (!phone.trim()) return setError("Please type your phone number.");
      if (phone.replace(/[^0-9]/g, "").length < 9) {
        return setError("That phone number looks too short - please type it fully, e.g. 0712 345 678.");
      }
    }
    if (!pwd || pwd.length < 6) {
      return setError("Please type your password (6 letters or numbers or more).");
    }
    if (mode === "join" && intent === "member") {
      if (selected.length === 0) {
        return setError("Please pick what you do — tap at least one.");
      }
      if (isOther && !otherProfession.trim()) {
        return setError("Please type the work you do.");
      }
      if (id && id.replace(/[^a-zA-Z0-9]/g, "").length < 4) {
        return setError("That National Identification No looks too short. Leave it blank if unsure.");
      }
      if (scorePassword(pwd).score < 2) {
        return setError("Please pick a stronger password. Make it longer, or add a number.");
      }
      if (pwd !== confirmPassword) {
        return setError("The two passwords are not the same. Please type them again.");
      }
    }
    if (mode === "join" && intent === "partner") {
      if (!email.trim()) {
        return setError("Please type your email so we can reach you.");
      }
      if (scorePassword(pwd).score < 2) {
        return setError("Please pick a stronger password. Make it longer, or add a number.");
      }
      if (pwd !== confirmPassword) {
        return setError("The two passwords are not the same. Please type them again.");
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
        const res = await signInWith(found.email, pwd);
        if (res.error) {
          throw new Error("Wrong password. Tap “Forgot your password?” below to get a new one.");
        }
        await navigate({ to: destination, replace: true });
        return;
      }

      // Prefer the member's real email when provided (so password resets land
      // in a real inbox); fall back to a synthetic internal address otherwise.
      const authEmail = email.trim()
        ? email.trim().toLowerCase()
        : id
          ? idToEmail(id)
          : nameToEmail(name);

      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: authEmail,
        password: pwd,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: name,
            national_id: id || null,
            phone: phone.trim() || null,
            contact_email: email.trim() || null,
            category: isOther && otherProfession.trim()
              ? otherProfession.trim()
              : (primaryProfession ? professionLabel(primaryProfession) : "Member"),
            professions: chosenProfessions.map((p) => professionLabel(p)),
            country: location.country,
            city: location.city.trim(),
            area: location.area.trim(),
          },
        },
      });

      if (signUpErr) {
        if (/already registered|already exists|user already/i.test(signUpErr.message)) {
          let existing = await signInWith(authEmail, pwd);
          if (existing.error && authEmail.endsWith("@baba.local")) {
            // Stale unconfirmed account from an earlier attempt — confirm it
            // server-side, then sign in.
            try {
              const confirm = await confirmSignupFn({ data: { email: authEmail } });
              if (confirm.ok) existing = await signInWith(authEmail, pwd);
            } catch {
              // Fall through to the friendly error below.
            }
          }
          if (existing.error) {
            throw new Error(
              "You already have an account. Tap “Log in” and use your full name and password.",
            );
          }
          // Heal ghost accounts: an earlier attempt may have created the login
          // but not the member record. Re-running setup is safe — it updates
          // the existing registration instead of duplicating it.
          try {
            await finishRegistrationSetup(name, id, phone, location);
          } catch {
            // The login works regardless; details can be finished in the profile page.
          }
          setNotice("You are already a member — we have logged you in. Welcome back!");
          await navigate({ to: destination, replace: true });
          return;
        }
        throw signUpErr;
      }

      if (!signUpData.session) {
        // Email confirmation is enabled for this project. Synthetic @baba.local
        // addresses have no inbox, so confirm those server-side and log in right
        // away. Real emails must confirm via the link we just sent, but their
        // member record is saved below either way — never a ghost account.
        let signedIn = false;
        if (authEmail.endsWith("@baba.local") && signUpData.user) {
          try {
            const confirm = await confirmSignupFn({
              data: { userId: signUpData.user.id, email: authEmail },
            });
            if (confirm.ok) {
              const res = await signInWith(authEmail, pwd);
              signedIn = !res.error;
            }
          } catch {
            // Ignore — the member record is still saved below.
          }
        }
        try {
          await finishRegistrationSetup(name, id, phone, location);
        } catch {
          // The account exists; details can be finished on the profile page.
        }
        if (!signedIn) {
          setNotice(
            authEmail.endsWith("@baba.local")
              ? "Your account was created. Please tap Log in and try again in a moment."
              : "Your account was created — check your email for the confirmation link, then log in.",
          );
          setLoading(false);
          return;
        }
        // Signed in — fall through to navigate.
      }

      try {
        await finishRegistrationSetup(name, id, phone, location);
      } catch {
        // The account exists; if saving details failed the member can finish
        // them on their profile page.
      }
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
              ? intent === "member"
                ? "Tell us what you do — we celebrate every skill, big and small."
                : "Tell us who you are and what you want to do with us — we are all ears."
              : "Log in with your full name and your password."}
          </p>
        </div>

        {mode === "join" && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setIntent("member");
                setSelected([]);
                setOtherProfession("");
              }}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
                intent === "member"
                  ? "border-baba-blue bg-baba-blue/5"
                  : "border-baba-blue/15 hover:border-baba-blue/40"
              }`}
            >
              <Users className="h-5 w-5 text-baba-blue" />
              <span>
                <span className="block text-sm font-bold text-baba-slate">Join us</span>
                <span className="block text-xs text-baba-slate/60">I am working or studying</span>
              </span>
            </button>
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid gap-4">
          {mode === "join" && intent === "member" && (
            <>
              {/* wizard progress */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={`h-2 rounded-full transition-all ${step === s ? "w-8 bg-baba-blue" : step > s ? "w-2 bg-baba-copper" : "w-2 bg-baba-blue/20"}`}
                  />
                ))}
              </div>

              {step === 1 && (
                <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
                  <div className="mb-4 text-center">
                    <h2 className="font-display text-xl font-bold text-baba-slate">What do you do?</h2>
                    <p className="mt-1 text-sm text-baba-slate/60">
                      Pick all that apply — up to {MAX_PROFESSIONS}. We count every single one of you.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PROFESSIONS.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => toggleProfession(p.key)}
                        className={`flex items-center gap-1.5 rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors ${selected.includes(p.key)
                          ? "border-baba-blue bg-baba-blue/5 text-baba-blue"
                          : "border-baba-blue/15 text-baba-slate/70 hover:border-baba-blue/40"}`}
                      >
                        {selected.includes(p.key) && <Check className="h-3.5 w-3.5 shrink-0" />}
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {isOther && (
                    <input
                      value={otherProfession}
                      onChange={(e) => setOtherProfession(e.target.value)}
                      placeholder="Type the work you do"
                      className="mt-3 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                    />
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
                  <div className="mb-4 text-center">
                    <h2 className="font-display text-xl font-bold text-baba-slate">Show us your work</h2>
                    <p className="mt-1 text-sm text-baba-slate/60">This is your moment — show off a little.</p>
                  </div>
                  <div className="grid gap-4">
                    <label className="grid gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                        What have you done?
                      </span>
                      <textarea
                        rows={3}
                        value={projects}
                        onChange={(e) => setProjects(e.target.value)}
                        placeholder={
                          isOther && otherProfession.trim()
                            ? "Tell us something you have made or done that you are proud of."
                            : (primaryProfession?.example ?? "Tell us something you have made or done that you are proud of.")
                        }
                        className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                      />
                      <span className="text-[0.7rem] text-baba-slate/50">
                        Past work, a project, something you built.
                      </span>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                          Level of education
                        </span>
                        <select
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                        >
                          <option value="">Select…</option>
                          {EDUCATION_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                          How do you work?
                        </span>
                        <select
                          value={employment}
                          onChange={(e) => setEmployment(e.target.value)}
                          className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                        >
                          <option value="">Select…</option>
                          {EMPLOYMENT_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="grid gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                        How long have you been doing this?
                      </span>
                      <select
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                        className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                      >
                        <option value="">Select…</option>
                        {YEARS_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "join" && intent === "partner" && (
            <>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  What are you looking for?
                </span>
                <input
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  placeholder="e.g. funding, partnership, training, equipment, mentorship"
                  className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Tell us everything
                </span>
                <textarea
                  rows={10}
                  value={partnerMessage}
                  onChange={(e) => setPartnerMessage(e.target.value)}
                  placeholder="Your vision, your plan, what you want to do with us — write as much as you like. We will read every word."
                  className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                />
                <span className="text-[0.7rem] text-baba-slate/50">
                  Not compulsory — but the more you tell us, the better we can serve you.
                </span>
              </label>
            </>
          )}

          {mode === "join" && intent === "member" && step === 3 && (
            <h2 className="text-center font-display text-xl font-bold text-baba-slate">About you</h2>
          )}
          {!(mode === "join" && intent === "member" && step < 3) && (
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
              {mode === "join" && intent === "partner" ? "Your Name / Organisation Name" : "Full Name"}
            </span>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
              <User className="h-4 w-4 text-baba-slate/40" />
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                placeholder={
                  mode === "join" && intent === "partner"
                    ? "Your name or organisation name"
                    : "e.g. Jane Wanjiru"
                }
              />
            </div>
            {mode === "signin" && (
              <span className="text-[0.7rem] text-baba-slate/50">
                Type your full name (or your ID number) the same way you wrote it when you joined.
              </span>
            )}
          </label>
          )}

          {mode === "join" && (intent === "partner" || (intent === "member" && step === 3)) && (
            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Phone Number <span className="font-normal normal-case text-baba-slate/50">(required)</span>
              </span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                <Phone className="h-4 w-4 text-baba-slate/40" />
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                  placeholder="e.g. 0712 345 678"
                />
              </div>
            </label>
          )}

          {((mode === "join" && intent === "member" && step === 3) || (mode === "signin" && askForId)) && (
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


          {mode === "join" && intent === "member" && step === 4 && (
            <h2 className="text-center font-display text-xl font-bold text-baba-slate">Make your password</h2>
          )}
          {!(mode === "join" && intent === "member" && step < 4) && (
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
          )}

          {mode === "join" && (intent === "partner" || (intent === "member" && step === 4)) && (
            <>
              {mode === "join" && intent === "member" && chosenProfessions.length > 0 && (
                <div className="rounded-2xl border border-baba-copper/20 bg-baba-copper/5 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-baba-copper-dark">You picked</p>
                  <div className="flex flex-wrap gap-1.5">
                    {chosenProfessions.map((p) => (
                      <span key={p.key} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-baba-copper-dark">
                        {professionLabel(p)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

              <label className="grid gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Email{" "}
                  <span className="font-normal normal-case text-baba-slate/50">
                    {intent === "partner" ? "(required)" : "(optional)"}
                  </span>
                </span>
                <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                  <Mail className="h-4 w-4 text-baba-slate/40" />
                  <input
                    required={intent === "partner"}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                    placeholder="you@example.com"
                  />
                </div>
                <span className="text-[0.7rem] text-baba-slate/50">
                  {intent === "partner"
                    ? "We use this to reach you — that is all."
                    : "Add an email if you want a welcome message and help if you forget your password."}
                </span>
              </label>
            </>
          )}

          {mode === "join" && intent === "member" && step === 3 && (
            <div className="grid gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                <MapPin className="h-3.5 w-3.5" /> Where are you?
              </span>
              <LocationPicker value={location} onChange={setLocation} />
              <span className="text-[0.7rem] text-baba-slate/50">
                Pick your country and town, then type your area (e.g. Westlands, South B).
              </span>
            </div>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {notice && (
            <p className="rounded-lg border border-baba-blue/20 bg-baba-blue/5 px-3.5 py-2.5 text-sm font-medium text-baba-blue">
              {notice}
            </p>
          )}

          {mode === "join" && intent === "member" ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-baba-blue/15 px-4 py-2.5 text-sm font-semibold text-baba-slate/70 transition-colors hover:border-baba-blue/40"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {step === 4 ? "Join us" : "Next"}
                {step < 4 && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "join" ? "Partner with us" : "Log In"}
            </button>
          )}
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
