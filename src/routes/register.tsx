import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  HardHat,
  GraduationCap,
  Briefcase,
  Building2,
  Package,
  Check,
  Upload,
  Camera,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Secure Membership Registration | BABA" },
      {
        name: "description",
        content:
          "Join the Buy Africa Build Africa network. Register as an artisan, student, professional, contractor or supplier with secure M-PESA or card checkout.",
      },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),
  component: Register,
});

const tiers = [
  { key: "Artisans", icon: HardHat, price: 100, note: "Annual commitment for skilled manual workforce." },
  { key: "Student", icon: GraduationCap, price: 100, note: "Special rate for those currently in training." },
  { key: "Professional", icon: Briefcase, price: 500, note: "Standard tier for corporate & creative experts." },
  { key: "Contractor", icon: Building2, price: 500, note: "For registered builders and project managers." },
  { key: "Supplier", icon: Package, price: 500, note: "Access to the continent's procurement grid." },
] as const;

const counties = [
  "Nairobi, Kenya",
  "Mombasa, Kenya",
  "Kisumu, Kenya",
  "Nakuru, Kenya",
  "Eldoret, Kenya",
  "Kiambu, Kenya",
];

const steps = ["Profile Category", "Professional Details", "Secure Activation"];

function Register() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<(typeof tiers)[number]["key"]>("Artisans");
  const [pay, setPay] = useState<"mpesa" | "card">("mpesa");

  const selectedTier = tiers.find((t) => t.key === tier)!;

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
        {/* Stepper */}
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    i <= step
                      ? "bg-baba-blue text-baba-cream"
                      : "border-2 border-baba-slate/20 text-baba-slate/40"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={`mt-2 hidden text-[0.65rem] font-bold uppercase tracking-wide sm:block ${
                    i <= step ? "text-baba-blue" : "text-baba-slate/40"
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    i < step ? "bg-baba-blue" : "bg-baba-slate/15"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            {/* Step 1: Category */}
            {step === 0 && (
              <div>
                <h1 className="font-display text-3xl font-extrabold text-baba-blue">
                  Select Your Path
                </h1>
                <p className="mt-2 text-baba-slate/70">
                  Choose the membership tier that aligns with your professional standing.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tiers.map((t) => {
                    const sel = tier === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => setTier(t.key)}
                        className={`relative rounded-2xl border-2 p-5 text-left transition-colors ${
                          sel
                            ? "border-baba-blue bg-baba-blue/5"
                            : "border-baba-blue/10 bg-card hover:border-baba-blue/30"
                        }`}
                      >
                        {sel && (
                          <Check className="absolute right-4 top-4 h-5 w-5 text-baba-blue" />
                        )}
                        <t.icon className="h-6 w-6 text-baba-copper-dark" />
                        <h3 className="mt-4 font-display text-lg font-bold text-baba-slate">
                          {t.key}
                        </h3>
                        <p className="mt-1 font-display text-lg font-bold text-baba-copper-dark">
                          KES {t.price}
                        </p>
                        <p className="mt-2 text-xs text-baba-slate/60">{t.note}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 1 && (
              <div>
                <h1 className="font-display text-3xl font-extrabold text-baba-blue">
                  Professional Details
                </h1>
                <p className="mt-2 text-baba-slate/70">
                  Help us forge your professional identity within the BABA network.
                </p>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Full Name" placeholder="John Doe" />
                  <Field label="Phone Number" placeholder="+254 746216258" />
                  <Field label="Email Address" placeholder="john@example.com" type="email" />
                  <div>
                    <Label>Primary Location</Label>
                    <select className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none">
                      {counties.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <Field label="Profession / Skill" placeholder="e.g. Civil Engineer" />
                  <div>
                    <Label>Years of Experience</Label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2">
                      {["0–2 yrs", "3–5 yrs", "5+ yrs"].map((y, i) => (
                        <YearChip key={y} label={y} defaultActive={i === 1} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <UploadBox
                    icon={Camera}
                    title="Profile Photo"
                    hint="Drag and drop or click to upload"
                  />
                  <UploadBox
                    icon={Upload}
                    title="Portfolio / Credentials"
                    hint="Upload PDF, DOCX or ZIP (Max 10MB)"
                  />
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 2 && (
              <div>
                <h1 className="font-display text-3xl font-extrabold text-baba-blue">
                  Almost There
                </h1>
                <p className="mt-2 text-baba-slate/70">
                  Review your membership and complete secure activation using the panel.
                </p>
                <div className="mt-6 rounded-2xl border border-baba-blue/10 bg-card p-6">
                  <h3 className="font-display text-lg font-bold text-baba-slate">
                    What you get
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-baba-slate/70">
                    {[
                      "Verified profile in the National Directory",
                      "Access to the pan-African talent database",
                      "Industry-standard legal advocacy & protection",
                      "Priority access to opportunities and tenders",
                    ].map((b) => (
                      <li key={b} className="flex gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-baba-blue" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-lg border-2 border-baba-blue/30 px-6 py-2.5 text-sm font-semibold text-baba-blue disabled:opacity-40"
              >
                Back
              </button>
              {step < 2 && (
                <button
                  onClick={() => setStep((s) => Math.min(2, s + 1))}
                  className="rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-baba-cream transition-colors hover:bg-baba-blue-dark"
                >
                  Continue
                </button>
              )}
            </div>
          </div>

          {/* Checkout panel */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-baba-blue/10 bg-card shadow-sm">
              <div className="bg-baba-blue p-5 text-baba-cream">
                <h2 className="font-display text-lg font-bold">Secure Activation</h2>
                <p className="text-xs text-baba-cream/70">
                  Finalize your professional entry
                </p>
              </div>
              <div className="space-y-4 p-5">
                <Row label="Member Tier" value={selectedTier.key} />
                <Row label="Subscription" value="Annual" />
                <div className="flex items-center justify-between border-t border-baba-blue/10 pt-4">
                  <span className="font-display font-bold text-baba-slate">Total Due</span>
                  <span className="font-display text-xl font-extrabold text-baba-copper-dark">
                    KES {selectedTier.price}.00
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-secondary p-1">
                  <button
                    onClick={() => setPay("mpesa")}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-colors ${
                      pay === "mpesa" ? "bg-card text-baba-blue shadow-sm" : "text-baba-slate/60"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" /> M-PESA
                  </button>
                  <button
                    onClick={() => setPay("card")}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-colors ${
                      pay === "card" ? "bg-card text-baba-blue shadow-sm" : "text-baba-slate/60"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" /> Card
                  </button>
                </div>

                {pay === "mpesa" ? (
                  <div>
                    <Label>M-PESA Number</Label>
                    <input
                      placeholder="+254 712345678"
                      className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm focus:border-baba-blue focus:outline-none"
                    />
                    <p className="mt-2 text-xs italic text-baba-slate/50">
                      You will receive an STK push on your phone to authorize the
                      transaction.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-baba-blue/10 bg-secondary/60 p-4 text-sm text-baba-slate/70">
                      <p className="flex items-center gap-2 font-semibold text-baba-slate">
                        <CreditCard className="h-4 w-4 text-baba-blue" /> Card payments
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed">
                        You'll be redirected to our certified payment partner to
                        enter your card details securely. Your card information is
                        handled entirely by the processor and never touches our
                        servers.
                      </p>
                    </div>
                  </div>
                )}

                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-baba-blue py-3 text-sm font-bold text-baba-cream transition-colors hover:bg-baba-blue-dark">
                  Continue to Secure Payment <ShieldCheck className="h-4 w-4" />
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-baba-copper-dark">
                  <Lock className="h-3.5 w-3.5" /> Processed by a PCI-compliant payment partner
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-xl border border-baba-copper/30 bg-baba-copper/5 p-4">
              <ShieldCheck className="h-5 w-5 shrink-0 text-baba-copper-dark" />
              <div>
                <p className="font-display text-sm font-bold text-baba-slate">
                  BABA Protection
                </p>
                <p className="mt-0.5 text-xs text-baba-slate/60">
                  Your membership includes professional verification, access to the
                  pan-African talent database, and industry-standard legal advocacy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
      {children}
    </span>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate placeholder:text-baba-slate/40 focus:border-baba-blue focus:outline-none"
      />
    </div>
  );
}

function YearChip({ label, defaultActive }: { label: string; defaultActive?: boolean }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <button
      onClick={() => setActive((v) => !v)}
      className={`rounded-lg border-2 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-baba-blue bg-baba-blue/5 text-baba-blue"
          : "border-input text-baba-slate/60"
      }`}
    >
      {label}
    </button>
  );
}

function UploadBox({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Upload;
  title: string;
  hint: string;
}) {
  return (
    <div>
      <Label>{title}</Label>
      <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input py-8 text-center transition-colors hover:border-baba-blue/40">
        <Icon className="h-7 w-7 text-baba-blue/60" />
        <span className="text-xs text-baba-slate/55">{hint}</span>
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-baba-slate/60">{label}</span>
      <span className="font-display font-bold text-baba-blue">{value}</span>
    </div>
  );
}
