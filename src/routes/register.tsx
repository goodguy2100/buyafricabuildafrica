import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Briefcase, Building2, Check, ArrowRight, PartyPopper } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { saveAccount, type AccountRole } from "@/lib/account";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Get Started | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Join the Buy Africa Build Africa network for free. Sign up as an individual, professional, or organization to access skills, opportunities and events.",
      },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: GetStarted,
});

/* ---------------------------------- data --------------------------------- */

const OCCUPATIONS = [
  "Architect", "Engineer", "Quantity Surveyor", "Interior Designer", "Urban Planner",
  "Project Manager", "Contractor", "Mason", "Tiler", "Electrician", "Plumber",
  "Painter", "Welder", "Carpenter", "Gypsum Installer", "General Artisan",
  "Entrepreneur", "Youth (General)", "Researcher", "Student", "Other",
];

const EXPERIENCE = [
  "Less than 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years",
];

const INDUSTRIES = [
  "Construction", "Real Estate", "Manufacturing", "Education", "Government Projects",
  "NGO/Development Work", "Private Sector", "Other",
];

const ORG_TYPES = [
  "Government Institution", "Government Agency", "Public Institution", "NGO",
  "Development Partner", "Private Sector Company", "Manufacturer", "Supplier",
  "SME", "Financial Institution", "Investor", "University", "Educational Institution",
];

type FormState = Record<string, string | string[]>;

const roleCards: { role: AccountRole; icon: typeof User; title: string; desc: string }[] = [
  { role: "individual", icon: User, title: "Architects", desc: "Sign up as an individual looking to build skills and opportunities." },
  { role: "professional", icon: Briefcase, title: "Professional", desc: "Sign up as a working professional or skilled tradesperson." },
  { role: "organization", icon: Building2, title: "Organization", desc: "Register your organization as a partner." },
];

/* -------------------------------- component ------------------------------- */

function GetStarted() {
  const [step, setStep] = useState(0); // 0 role, 1 form, 2 welcome
  const [role, setRole] = useState<AccountRole | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const chooseRole = (r: AccountRole) => {
    setRole(r);
    setForm({});
    setErrors({});
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
    const email = (form.email || form.contactEmail) as string | undefined;
    const emailKey = form.email !== undefined ? "email" : "contactEmail";
    if (email && !next[emailKey] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next[emailKey] = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate() || !role) return;
    saveAccount({ role, data: { ...form } }); // verified: false is set inside
    setStep(2);
  };

  const totalSteps = 3;

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        {/* Progress */}
        <div className="mx-auto mb-10 max-w-xl">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-baba-slate/60">
            <span>Step {step + 1} of {totalSteps}</span>
            <span className="text-baba-blue">
              {["Choose Path", "Your Details", "Welcome"][step]}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-baba-blue/10">
            <div
              className="h-full rounded-full bg-baba-blue transition-all"
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: role selection */}
        {step === 0 && (
          <div>
            <div className="text-center">
              <h1 className="font-display text-3xl font-extrabold text-baba-blue">Get Started</h1>
              <p className="mt-2 text-baba-slate/70">
                Signing up is completely free. Choose the path that fits you.
              </p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {roleCards.map((c) => (
                <button
                  key={c.role}
                  onClick={() => chooseRole(c.role)}
                  className="group flex flex-col items-center rounded-2xl border-2 border-baba-blue/10 bg-card p-6 text-center transition-colors hover:border-baba-blue"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-baba-blue/10 text-baba-blue transition-colors group-hover:bg-baba-blue group-hover:text-white">
                    <c.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">{c.title}</h3>
                  <p className="mt-2 text-sm text-baba-slate/60">{c.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-baba-copper-dark">
                    Continue <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: form */}
        {step === 1 && role && (
          <div>
            <h1 className="font-display text-3xl font-extrabold text-baba-blue">
              {role === "individual" && "Individual Sign Up"}
              {role === "professional" && "Professional Sign Up"}
              {role === "organization" && "Organization Sign Up"}
            </h1>
            <p className="mt-2 text-baba-slate/70">
              Fields marked with <span className="text-baba-copper-dark">*</span> are required. Signing up is free.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {role === "individual" && (
                <IndividualFields form={form} errors={errors} set={set} toggle={toggle} />
              )}
              {role === "professional" && (
                <ProfessionalFields form={form} errors={errors} set={set} toggle={toggle} />
              )}
              {role === "organization" && (
                <OrganizationFields form={form} errors={errors} set={set} toggle={toggle} />
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="rounded-lg border-2 border-baba-blue/30 px-6 py-2.5 text-sm font-semibold text-baba-blue"
              >
                Back
              </button>
              <button
                onClick={submit}
                className="rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark"
              >
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
              Your account has been created. Explore courses, job listings, and events — verify
              your account anytime you're ready to apply.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/opportunities"
                className="rounded-full baba-cta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-baba-blue/25"
              >
                Explore Opportunities
              </Link>
              <Link
                to="/events"
                className="rounded-full border-2 border-baba-copper px-6 py-3 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate"
              >
                See Events
              </Link>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

/* --------------------------- required-field logic -------------------------- */

function requiredFields(role: AccountRole, form: FormState): string[] {
  if (role === "individual") {
    return ["fullName", "email", "phone", "nationalId", "employmentStatus", "occupation", "yearsExperience", "location"];
  }
  if (role === "professional") {
    const base = ["fullName", "email", "phone", "nationalId", "employmentStatus", "occupation", "yearsExperience", "educationLevel", "institutionName", "fieldOfStudy", "location"];
    if (form.employmentStatus === "Employed") base.push("organizationName", "jobTitle", "yearsAtOrganization");
    return base;
  }
  return ["organizationName", "contactPerson", "contactEmail", "contactPhone", "yearsInOperation", "businessLicense", "organizationType", "staffSize", "location"];
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
      <Field label="Email" name="email" type="email" required {...{ form, errors, set }} />
      <Field label="Phone Number" name="phone" required {...{ form, errors, set }} />
      <Field label="National ID Number" name="nationalId" required {...{ form, errors, set }} />
      <SelectField label="Employment Status" name="employmentStatus" required
        options={["Fundi/Artisan", "Freelancer", "Employed", "Unemployed", "Self-Employed"]}
        {...{ form, errors, set }} />
      <SelectField label="Primary Occupation / Skill Area" name="occupation" required
        options={OCCUPATIONS} {...{ form, errors, set }} />
      <SelectField label="Years of Experience" name="yearsExperience" required
        options={EXPERIENCE} {...{ form, errors, set }} />
      <Field label="Location (City/Town)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Area of Interest" name="areasOfInterest"
        options={["Skills Training", "Job Opportunities", "Event Notifications", "Networking", "Other"]}
        {...{ form, toggle }} />
      <MultiSelect label="Industries Interested In" name="industries"
        options={INDUSTRIES} {...{ form, toggle }} />
    </>
  );
}

function ProfessionalFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Full Name" name="fullName" required {...{ form, errors, set }} />
      <Field label="Email" name="email" type="email" required {...{ form, errors, set }} />
      <Field label="Phone Number" name="phone" required {...{ form, errors, set }} />
      <Field label="National ID Number" name="nationalId" required {...{ form, errors, set }} />
      <SelectField label="Employment Status" name="employmentStatus" required
        options={["Employed", "Unemployed", "Self-Employed"]} {...{ form, errors, set }} />
      {form.employmentStatus === "Employed" && (
        <>
          <Field label="Organization Name" name="organizationName" required {...{ form, errors, set }} />
          <Field label="Job Title" name="jobTitle" required {...{ form, errors, set }} />
          <Field label="Years at Organization" name="yearsAtOrganization" required {...{ form, errors, set }} />
        </>
      )}
      <SelectField label="Primary Occupation / Skill Area" name="occupation" required
        options={OCCUPATIONS} {...{ form, errors, set }} />
      <SelectField label="Years of Experience" name="yearsExperience" required
        options={EXPERIENCE} {...{ form, errors, set }} />
      <SelectField label="Highest Education Level" name="educationLevel" required
        options={["Primary", "Secondary", "Certificate", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "Other"]}
        {...{ form, errors, set }} />
      <Field label="Institution Name" name="institutionName" required {...{ form, errors, set }} />
      <Field label="Field of Study / Course" name="fieldOfStudy" required {...{ form, errors, set }} />
      <Field label="Location (City/Town)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Area of Interest" name="areasOfInterest"
        options={["Skills Training", "Job Placement", "Event Notifications", "Networking", "Consulting Opportunities"]}
        {...{ form, toggle }} />
      <MultiSelect label="Industries Interested In" name="industries"
        options={INDUSTRIES} {...{ form, toggle }} />
    </>
  );
}

function OrganizationFields({ form, errors, set, toggle }: FieldProps) {
  return (
    <>
      <Field label="Organization Name" name="organizationName" required {...{ form, errors, set }} />
      <Field label="Contact Person Full Name" name="contactPerson" required {...{ form, errors, set }} />
      <Field label="Contact Email" name="contactEmail" type="email" required {...{ form, errors, set }} />
      <Field label="Contact Phone Number" name="contactPhone" required {...{ form, errors, set }} />
      <Field label="Years in Operation" name="yearsInOperation" required {...{ form, errors, set }} />
      <Field label="Business License Number" name="businessLicense" required {...{ form, errors, set }} />
      <SelectField label="Organization Type" name="organizationType" required
        options={ORG_TYPES} {...{ form, errors, set }} />
      <SelectField label="Number of People/Staff" name="staffSize" required
        options={["1-10", "11-50", "51-200", "200+"]} {...{ form, errors, set }} />
      <Field label="Location (City/Town)" name="location" required {...{ form, errors, set }} />
      <MultiSelect label="Areas of Interest" name="areasOfInterest"
        options={["Partnership Opportunities", "Bulk Skills Training", "Talent Sourcing", "Event Collaboration"]}
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
