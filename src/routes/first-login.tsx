import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  IdCard,
  Phone,
  User,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  PartyPopper,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { completeFirstLogin, getFirstLoginState } from "@/lib/partner.functions";
import { PasswordStrength } from "@/components/PasswordStrength";
import {
  PROFESSIONS,
  deriveRole,
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  type ProfessionOption,
} from "@/lib/wizard-options";
import type { RoleValue } from "@/lib/registrations.functions";

export const Route = createFileRoute("/first-login")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: "/first-login" } });
    }
  },
  head: () => ({ meta: [{ title: "Finish Setting Up | BABA" }] }),
  component: FirstLoginPage,
});

function FirstLoginPage() {
  const navigate = useNavigate();
  const stateFn = useServerFn(getFirstLoginState);
  const completeFn = useServerFn(completeFirstLogin);

  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<Awaited<ReturnType<typeof stateFn>>["registration"]>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1 confirm identity, 2 details, 3 password
  const [confirmed, setConfirmed] = useState(false);

  // step 2 state
  const [selected, setSelected] = useState<string[]>([]);
  const [otherProfession, setOtherProfession] = useState("");
  const [education, setEducation] = useState("");
  const [employment, setEmployment] = useState("");

  // step 3 state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    stateFn().then((res) => {
      setRegistration(res.registration);
      const r = res.registration;
      if (r && r.account_status === "provisional" && r.first_login) {
        // Prefill whatever the partner list already gave us.
        setEducation(r.education_level ?? "");
        setEmployment(r.employment_status ?? "");
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = registration;
  const needsDetails = useMemo(
    () =>
      !!(r && !r.profile_complete) ||
      !!(
        r &&
        r.profile_complete &&
        (!r.occupation || !r.education_level || !r.employment_status)
      ),
    [r],
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  // Nothing to complete — normal member.
  if (!r || r.account_status !== "provisional" || !r.first_login) {
    navigate({ to: "/dashboard", replace: true });
    return null;
  }

  const chosenProfessions = selected
    .map((k) => PROFESSIONS.find((p) => p.key === k))
    .filter(Boolean) as ProfessionOption[];
  const primaryProfession = chosenProfessions[0];
  const isOther = selected.includes("other");
  const professionLabel = (p: ProfessionOption) =>
    p.key === "other" && otherProfession.trim() ? otherProfession.trim() : p.label;
  const role: RoleValue = deriveRole(selected);
  const artisanType = chosenProfessions.find((p) => p.trade)?.trade ?? (selected.length ? "other" : undefined);
  const occupationLabel =
    isOther && otherProfession.trim()
      ? otherProfession.trim()
      : primaryProfession
        ? professionLabel(primaryProfession)
        : "";

  const validateStep1 = () => {
    if (!confirmed) return "Please confirm that these are your details.";
    return null;
  };
  const validateStep2 = () => {
    if (needsDetails) {
      if (selected.length === 0) return "Please pick what you do.";
      if (isOther && !otherProfession.trim()) return "Please type the work you do.";
      if (!education.trim()) return "Please choose your level of education.";
      if (!employment.trim()) return "Please choose how you work.";
    }
    return null;
  };

  const submit = async () => {
    setError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) return setError(err);
      setStep(needsDetails ? 2 : 3);
      return;
    }
    if (step === 2) {
      const err = validateStep2();
      if (err) return setError(err);
      setStep(3);
      return;
    }
    // step 3 — set permanent password, then mark the account complete.
    if (!password || password.length < 6) {
      return setError("Please type your password (6 letters or numbers or more).");
    }
    if (password !== confirmPassword) {
      return setError("The two passwords are not the same. Please type them again.");
    }
    setLoading(true);
    try {
      const { error: pwErr } = await supabase.auth.updateUser({ password });
      if (pwErr) throw new Error(pwErr.message);

      await completeFn({
        data: {
          role: needsDetails ? role : undefined,
          artisan_type: needsDetails ? artisanType : undefined,
          occupation: needsDetails ? occupationLabel : undefined,
          education_level: needsDetails ? education : undefined,
          employment_status: needsDetails ? employment : undefined,
        },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <PageShell>
        <section className="mx-auto max-w-xl px-5 py-20 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <PartyPopper className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-baba-blue">
            You're all set, {r.full_name?.split(" ")[0] || "welcome"}! 🎉
          </h1>
          <p className="mt-3 text-baba-slate/70">
            Your identity is confirmed and your account is now active with your own password.
            Welcome to Buy Africa Build Africa.
          </p>
          <div className="mt-8">
            <Link
              to="/dashboard"
              className="rounded-full baba-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25"
            >
              Go to your dashboard
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold text-baba-blue">
            {step === 1 ? "Is this you?" : step === 2 ? "A little about your work" : "Choose your password"}
          </h1>
          <p className="mt-2 text-baba-slate/70">
            {step === 1
              ? "Your account was created from a partner's list. Confirm these details are yours — this is your identity check."
              : step === 2
                ? "Just a few quick choices so your profile is complete."
                : "Your temporary password (your ID number) will stop working once you set your own."}
          </p>
        </div>

        {/* progress dots */}
        <div className="mt-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-2 rounded-full transition-all ${step === s ? "w-8 bg-baba-blue" : step > s ? "w-2 bg-baba-copper" : "w-2 bg-baba-blue/20"}`}
            />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-8 grid gap-4"
        >
          {step === 1 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="grid gap-3 text-sm">
                <DetailRow icon={<User className="h-4 w-4 text-baba-blue" />} label="Full name" value={r.full_name ?? "—"} />
                <DetailRow icon={<IdCard className="h-4 w-4 text-baba-blue" />} label="National ID No." value={r.national_id ?? "—"} />
                <DetailRow icon={<Phone className="h-4 w-4 text-baba-blue" />} label="Phone" value={r.phone ?? "—"} />
                {r.occupation && <DetailRow label="Occupation" value={r.occupation} />}
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-baba-blue/15 bg-baba-blue/5 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-baba-blue"
                />
                <span className="text-sm text-baba-slate">
                  <span className="font-bold">These are my details.</span> I confirm that my name, ID number and
                  phone number above are correct.
                </span>
              </label>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-baba-slate/50">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                This is step two of your verification — your ID number was step one.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">What do you do?</span>
                  <select
                    value={selected[0] ?? ""}
                    onChange={(e) => setSelected(e.target.value ? [e.target.value] : [])}
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  >
                    <option value="">Select — what do you do?</option>
                    {PROFESSIONS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                {isOther && (
                  <input
                    value={otherProfession}
                    onChange={(e) => setOtherProfession(e.target.value)}
                    placeholder="Type the work you do"
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  />
                )}
                {!r.education_level && (
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Level of education</span>
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
                )}
                {!r.employment_status && (
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">How do you work?</span>
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
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <div className="grid gap-4">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">New password</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Lock className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={6}
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="Make a password (6 or more)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Type password again</span>
                  <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
                    <Lock className="h-4 w-4 text-baba-slate/40" />
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
                      placeholder="Type the same password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="shrink-0 text-baba-slate/40 transition-colors hover:text-baba-slate/70"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <span className="text-[0.7rem] text-red-500">The two passwords are not the same.</span>
                  )}
                </label>
                <p className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                  <Lock className="h-3.5 w-3.5" />
                  Your ID number will no longer work as a password after this.
                </p>
              </div>
            </div>
          )}

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}

          <div className="mt-2 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
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
              {step === 3 ? (
                <>
                  <Check className="h-4 w-4" /> Finish &amp; activate my account
                </>
              ) : (
                <>
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-baba-slate/70">
          Not you?{" "}
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
            className="font-bold text-baba-copper-dark hover:underline"
          >
            Sign out and log in with your own details
          </button>
        </p>
      </section>
    </PageShell>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-baba-blue/10 pb-2">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-baba-slate/60">
        {icon}
        {label}
      </span>
      <span className="text-right font-semibold text-baba-slate">{value}</span>
    </div>
  );
}
