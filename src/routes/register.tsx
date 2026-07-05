import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  User,
  Briefcase,
  Building2,
  Wrench,
  Check,
  ArrowRight,
  ArrowLeft,
  PartyPopper,
  Loader2,
  LogIn,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import {
  createRegistration,
  updateMyProfile,
  type RoleValue,
} from "@/lib/registrations.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Get Started | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Join the Buy Africa Build Africa network for free. Sign up as an individual, artisan, professional, or corporate partner to access skills, opportunities and events.",
      },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: GetStarted,
});

/* ---------------------------------- data --------------------------------- */

const OCCUPATIONS = [
  "Architect", "Engineer", "Quantity Surveyor", "Interior Designer", "Urban Planner",
  "Project Manager", "Contractor", "Entrepreneur", "Researcher", "Consultant", "Other",
];

const TRADES = [
  "Plumber", "Electrician", "Mason", "Carpenter", "Painter", "Welder", "Tiler",
  "Gypsum Installer", "Other",
];

const INDUSTRIES = [
  "Construction", "Real Estate", "Manufacturing", "Education", "Government",
  "NGO", "Private Sector", "Other",
];

const CORPORATE_TYPES = [
  "Government Institution", "Government Agency", "NGO", "Development Partner",
  "Private Company", "Manufacturer", "Supplier", "SME", "Financial Institution",
  "Investor", "University", "Educational Institution", "Other",
];

type FormState = Record<string, string | string[]>;

/* -------------------------------- component ------------------------------- */

function GetStarted() {
  const navigate = useNavigate();
  const submitRegistration = useServerFn(createRegistration);
  const saveProfile = useServerFn(updateMyProfile);
  const [authState, setAuthState] = useState<"checking" | "in" | "out">("checking");
  const [step, setStep] = useState(0); // 0 role, 1 form, 2 welcome
  const [proChoosing, setProChoosing] = useState(false);
  const [role, setRole] = useState<RoleValue | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthState(data.session ? "in" : "out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthState(session ? "in" : "out");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const set = (key: string, value: string | string[]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };
  const toggle = (key: string, value: string) => {
    setForm((f) => {
      const arr = Array.isArray(f[key]) ? (f[key] as string[]) : [];
      return { ...f, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const chooseRole = (r: RoleValue) => {
    setRole(r);
    setForm({});
    setErrors({});
    setProChoosing(false);
    setStep(1);
  };

  const validate = (): boolean => {
    if (!role) return false;
    const required = requiredFields(role, form);
    const next: Record<string, string> = {};
    for (const key of required) {
      const v = form[key];
      if (Array.isArray(v) ? v.length === 0 : !String(v ?? "").trim()) {
        next[key] = "This field is required.";
      }
    }
    const emailKey = form.email !== undefined ? "email" : "contactEmail";
    const email = (form.email || form.contactEmail) as string | undefined;
    if (email && !next[emailKey] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next[emailKey] = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate() || !role) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitRegistration({
        data: {
          role,
          artisan_type: role === "artisan" ? (form.trade as string) : undefined,
          data: { ...form },
        },
      });
      // Keep the profile record in sync so the dashboard shows the basics.
      const fullName = (form.fullName || form.contactPerson) as string | undefined;
      const phone = (form.phone || form.contactPhone) as string | undefined;
      const location = form.location as string | undefined;
      try {
        await saveProfile({
          data: {
            ...(fullName ? { full_name: fullName } : {}),
            ...(phone ? { phone } : {}),
            ...(location ? { location } : {}),
          },
        });
      } catch {
        // Non-fatal — registration already saved.
      }
      setStep(2);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save your registration. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 3;

  if (authState === "checking") {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  if (authState === "out") {
    return (
      <PageShell>
        <section className="mx-auto max-w-md px-5 py-16 text-center lg:px-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-baba-blue/10 text-baba-blue">
            <LogIn className="h-8 w-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-baba-blue">Get Started</h1>
          <p className="mt-3 text-baba-slate/70">
            Create a free login or sign in first — this links your registration to your account so you
            can track it anytime. Signing up is completely free.
          </p>
          <Link
            to="/auth"
            search={{ redirect: "/register" }}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full baba-cta px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25"
          >
            Sign in or create account <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        {/* Progress */}
        <div className="mx-auto mb-10 max-w-xl">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-baba-slate/60">
            <span>Step {step + 1} of {totalSteps}</span>
            <span className="text-baba-blue">{["Choose Path", "Your Details", "Welcome"][step]}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-baba-blue/10">
            <div
              className="h-full rounded-full bg-baba-blue transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: role selection */}
        {step === 0 && !proChoosing && (
          <div>
            <div className="text-center">
              <h1 className="font-display text-3xl font-extrabold text-baba-blue">Get Started</h1>
              <p className="mt-2 text-baba-slate/70">
                Signing up is completely free. Choose the path that fits you.
              </p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <RoleCard
                icon={Wrench}
                title="Artisan"
                desc="Skilled trades and specialized services."
                onClick={() => chooseRole("artisan")}
              />
              <RoleCard
                icon={Briefcase}
                title="Professional"
                desc="Career-focused — job and training access."
                onClick={() => setProChoosing(true)}
              />
              <RoleCard
                icon={Building2}
                title="Corporate"
                desc="Business registration and talent access."
                onClick={() => chooseRole("corporate")}
              />
            </div>
          </div>
        )}

        {/* Step 1b: professional branch */}
        {step === 0 && proChoosing && (
          <div>
            <button
              onClick={() => setProChoosing(false)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-baba-blue"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-center">
              <h1 className="font-display text-3xl font-extrabold text-baba-blue">
                What kind of professional are you?
              </h1>
              <p className="mt-2 text-baba-slate/70">This helps us tailor your opportunities.</p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <RoleCard
                icon={Sparkles}
                title="Young Professional (Students)"
                desc="Less than 5 years (zero Experience) in your field, still building experience."
                onClick={() => chooseRole("professional_young")}
              />
              <RoleCard
                icon={GraduationCap}
                title="Experienced Professional"
                desc="5+ years, an established career."
                onClick={() => chooseRole("professional_exp")}
              />
            </div>
          </div>
        )}

        {/* Step 2: form */}
        {step === 1 && role && (
          <div>
            <h1 className="font-display text-3xl font-extrabold text-baba-blue">
              {role === "individual" && "Individual Sign Up"}
              {role === "professional_young" && "Young Professional Sign Up"}
              {role === "professional_exp" && "Experienced Professional Sign Up"}
              {role === "artisan" && "Artisan Sign Up"}
              {role === "corporate" && "Corporate Sign Up"}
            </h1>
            <p className="mt-2 text-baba-slate/70">
              Fields marked with <span className="text-baba-copper-dark">*</span> are required. Signing up is free.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {role === "individual" && <IndividualFields {...{ form, errors, set, toggle }} />}
              {role === "professional_young" && <YoungProFields {...{ form, errors, set, toggle }} />}
              {role === "professional_exp" && <ExpProFields {...{ form, errors, set, toggle }} />}
              {role === "artisan" && <ArtisanFields {...{ form, errors, set, toggle }} />}
              {role === "corporate" && <CorporateFields {...{ form, errors, set, toggle }} />}
            </div>

            {submitError && <p className="mt-4 text-sm font-medium text-destructive">{submitError}</p>}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  setStep(0);
                  setRole(null);
                }}
                disabled={submitting}
                className="rounded-lg border-2 border-baba-blue/30 px-6 py-2.5 text-sm font-semibold text-baba-blue disabled:opacity-60"
              >
                Back
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Free Account
              </button>
            </div>
          </div>
        )}

        {/* Step 3: welcome */}
        {step === 2 && (
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-baba-blue/10 text-baba-blue">
              <PartyPopper className="h-8 w-8" />
            </span>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-baba-blue">Welcome!</h1>
            <p className="mt-3 text-baba-slate/70">
              Your registration is saved. Head to your dashboard to manage your profile, explore
              opportunities and track your registrations.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/dashboard"
                className="rounded-full baba-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/opportunities"
                className="rounded-full border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate"
              >
                Explore Opportunities
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function RoleCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof User;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center rounded-2xl border-2 border-baba-blue/10 bg-card p-6 text-center transition-colors hover:border-baba-blue"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-baba-blue/10 text-baba-blue transition-colors group-hover:bg-baba-blue group-hover:text-white">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{title}</h3>
      <p className="mt-2 text-sm text-baba-slate/60">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-baba-copper-dark">
        Continue <ArrowRight className="h-4 w-4" />
      </span>
    </button>
  );
}

/* --------------------------- required-field logic -------------------------- */

function requiredFields(role: RoleValue, form: FormState): string[] {
  if (role === "individual") {
    return ["fullName", "phone", "nationalId", "occupation", "location"];
  }
  if (role === "professional_young") {
    return [
      "fullName", "phone", "nationalId", "occupation", "yearsField",
      "education", "institutionName", "fieldOfStudy", "location",
    ];
  }
  if (role === "professional_exp") {
    const base = [
      "fullName", "phone", "nationalId", "occupation", "yearsField",
      "employmentStatus", "education", "institutionName", "fieldOfStudy", "location",
    ];
    if (form.employmentStatus === "Employed") base.push("organizationName", "jobTitle", "yearsAtOrg");
    return base;
  }
  if (role === "artisan") {
    return ["fullName", "phone", "nationalId", "trade", "yearsTrade", "areasServed", "canTravel"];
  }
  return [
    "corporateName", "contactPerson", "contactPhone", "yearsInOperation",
    "businessLicense", "corporateType", "staffSize", "location",
  ];
}

/* ------------------------------ field groups ------------------------------ */

type FieldProps = {
  form: FormState;
  errors: Record<string, string>;
  set: (k: string, v: string | string[]) => void;
  toggle: (k: string, v: string) => void;
};

function IndividualFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Full Name" name="fullName" required {...{ form, errors, set }} />
      <Field label="Email (optional)" name="email" type="email" {...{ form, errors, set }} />
      <Field label="Phone Number" name="phone" required {...{ form, errors, set }} />
      <Field label="National ID Number" name="nationalId" required {...{ form, errors, set }} />
      <SelectField label="Primary Occupation / Skill Area" name="occupation" required options={OCCUPATIONS} {...{ form, errors, set }} />
      <Field label="Location (City/Town)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Industries Interested In" name="industries" options={INDUSTRIES} {...{ form, toggle }} />
      <MultiSelect label="What are you looking for?" name="lookingFor"
        options={["Skills Training", "Job Opportunities", "Event Notifications", "Networking", "Other"]}
        {...{ form, toggle }} />
    </>
  );
}

function YoungProFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Full Name" name="fullName" required {...{ form, errors, set }} />
      <Field label="Email (optional)" name="email" type="email" {...{ form, errors, set }} />
      <Field label="Phone Number" name="phone" required {...{ form, errors, set }} />
      <Field label="National ID Number" name="nationalId" required {...{ form, errors, set }} />
      <SelectField label="Primary Occupation" name="occupation" required options={OCCUPATIONS} {...{ form, errors, set }} />
      <SelectField label="Years in field" name="yearsField" required
        options={["Less than 1 year", "1-2 years", "2-3 years", "3-5 years"]} {...{ form, errors, set }} />
      <SelectField label="Highest Education" name="education" required
        options={["Secondary", "Certificate", "Diploma", "Bachelor's", "Master's", "Other"]} {...{ form, errors, set }} />
      <Field label="Institution Name" name="institutionName" required {...{ form, errors, set }} />
      <Field label="Field of Study" name="fieldOfStudy" required {...{ form, errors, set }} />
      <Field label="Location (City/Town)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Industries Interested In" name="industries" options={INDUSTRIES} {...{ form, toggle }} />
      <MultiSelect label="What are you looking for?" name="lookingFor"
        options={["Job opportunities", "Training/courses", "Networking", "Mentorship", "Other"]}
        {...{ form, toggle }} />
    </>
  );
}

function ExpProFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Full Name" name="fullName" required {...{ form, errors, set }} />
      <Field label="Email" name="email" type="email" required {...{ form, errors, set }} />
      <Field label="Phone Number" name="phone" required {...{ form, errors, set }} />
      <Field label="National ID Number" name="nationalId" required {...{ form, errors, set }} />
      <SelectField label="Primary Occupation" name="occupation" required options={OCCUPATIONS} {...{ form, errors, set }} />
      <SelectField label="Years in field" name="yearsField" required
        options={["5-10 years", "10-15 years", "15-20 years", "20+ years"]} {...{ form, errors, set }} />
      <SelectField label="Current Employment Status" name="employmentStatus" required
        options={["Employed", "Unemployed", "Self-Employed", "Retired"]} {...{ form, errors, set }} />
      {form.employmentStatus === "Employed" && (
        <>
          <Field label="Organization Name" name="organizationName" required {...{ form, errors, set }} />
          <Field label="Job Title" name="jobTitle" required {...{ form, errors, set }} />
          <Field label="Years at Organization" name="yearsAtOrg" required {...{ form, errors, set }} />
        </>
      )}
      <SelectField label="Highest Education" name="education" required
        options={["Bachelor's", "Master's", "PhD", "Professional Cert", "Other"]} {...{ form, errors, set }} />
      <Field label="Institution Name" name="institutionName" required {...{ form, errors, set }} />
      <Field label="Field of Study" name="fieldOfStudy" required {...{ form, errors, set }} />
      <Field label="Professional Certifications (if any)" name="certifications" {...{ form, errors, set }} />
      <Field label="Location (City/Town)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Industries Interested In" name="industries" options={INDUSTRIES} {...{ form, toggle }} />
      <MultiSelect label="What are you looking for?" name="lookingFor"
        options={["Senior roles", "Consulting work", "Training/mentorship", "Board positions", "Networking", "Other"]}
        {...{ form, toggle }} />
    </>
  );
}

function ArtisanFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Full Name" name="fullName" required {...{ form, errors, set }} />
      <Field label="Email" name="email" type="email" required {...{ form, errors, set }} />
      <Field label="Phone Number" name="phone" required {...{ form, errors, set }} />
      <Field label="National ID Number" name="nationalId" required {...{ form, errors, set }} />
      <SelectField label="Trade / Specialization" name="trade" required options={TRADES} {...{ form, errors, set }} />
      <Field label="Years in trade" name="yearsTrade" required {...{ form, errors, set }} />
      <Field label="Areas served (Location)" name="areasServed" required {...{ form, errors, set }} />
      <SelectField label="Can travel for work?" name="canTravel" required options={["Yes", "No"]} {...{ form, errors, set }} />
      <TextField label="Certifications / Training completed" name="trainingCompleted" {...{ form, set }} />
      <TextField label="Services offered (brief description)" name="services" {...{ form, set }} />
      <MultiSelect label="Interested in" name="lookingFor"
        options={["Skills training", "Job opportunities", "Certification programs", "Networking"]}
        {...{ form, toggle }} />
    </>
  );
}

function CorporateFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Corporate Name" name="corporateName" required {...{ form, errors, set }} />
      <Field label="Contact Person Full Name" name="contactPerson" required {...{ form, errors, set }} />
      <Field label="Contact Email" name="contactEmail" type="email" required {...{ form, errors, set }} />
      <Field label="Contact Phone Number" name="contactPhone" required {...{ form, errors, set }} />
      <Field label="Years in operation" name="yearsInOperation" required {...{ form, errors, set }} />
      <Field label="Business License Number" name="businessLicense" required {...{ form, errors, set }} />
      <SelectField label="Corporate Type" name="corporateType" required options={CORPORATE_TYPES} {...{ form, errors, set }} />
      <SelectField label="Approximate staff size" name="staffSize" required
        options={["1-10", "11-50", "51-200", "201-500", "500+"]} {...{ form, errors, set }} />
      <Field label="Location (Headquarters)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Primary industries" name="industries" options={INDUSTRIES} {...{ form, toggle }} />
      <MultiSelect label="What are you looking for?" name="lookingFor"
        options={["Hire talent", "Partner for training", "Access talent network", "Event collaboration"]}
        {...{ form, toggle }} />
    </>
  );
}

/* ----------------------------- shared inputs ------------------------------ */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
      {children} {required && <span className="text-baba-copper-dark">*</span>}
    </span>
  );
}

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs font-medium text-destructive">{msg}</p>;
}

function Field({
  label, name, type = "text", required, form, errors, set,
}: {
  label: string; name: string; type?: string; required?: boolean;
  form: FormState; errors: Record<string, string>; set: (k: string, v: string | string[]) => void;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={(form[name] as string) ?? ""}
        onChange={(e) => set(name, e.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-baba-slate placeholder:text-baba-slate/40 focus:border-baba-blue focus:outline-none ${
          errors[name] ? "border-destructive" : "border-input"
        }`}
      />
      <ErrorText msg={errors[name]} />
    </div>
  );
}

function TextField({
  label, name, form, set,
}: {
  label: string; name: string;
  form: FormState; set: (k: string, v: string | string[]) => void;
}) {
  return (
    <div className="sm:col-span-2">
      <Label>{label}</Label>
      <textarea
        rows={2}
        value={(form[name] as string) ?? ""}
        onChange={(e) => set(name, e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate placeholder:text-baba-slate/40 focus:border-baba-blue focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label, name, options, required, form, errors, set,
}: {
  label: string; name: string; options: string[]; required?: boolean;
  form: FormState; errors: Record<string, string>; set: (k: string, v: string | string[]) => void;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select
        value={(form[name] as string) ?? ""}
        onChange={(e) => set(name, e.target.value)}
        className={`mt-1.5 w-full rounded-lg border bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none ${
          errors[name] ? "border-destructive" : "border-input"
        }`}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ErrorText msg={errors[name]} />
    </div>
  );
}

function MultiSelect({
  label, name, options, form, toggle,
}: {
  label: string; name: string; options: string[];
  form: FormState; toggle: (k: string, v: string) => void;
}) {
  const selected = Array.isArray(form[name]) ? (form[name] as string[]) : [];
  return (
    <div className="sm:col-span-2">
      <Label>{label}</Label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(name, o)}
              className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-baba-blue bg-baba-blue/5 text-baba-blue"
                  : "border-input text-baba-slate/60 hover:border-baba-blue/30"
              }`}
            >
              {active && <Check className="h-3.5 w-3.5" />} {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
