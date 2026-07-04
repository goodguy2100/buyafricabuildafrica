import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  Loader2,
  UserCircle,
  Compass,
  ClipboardList,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Lock,
  FileUp,
  FileText,
  Download,
  Calendar,
  Briefcase,
  GraduationCap,
  Check,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyProfile,
  getMyRegistrations,
  updateMyProfile,
  type ProfileRow,
  type RegistrationRow,
} from "@/lib/registrations.functions";
import { ROLE_FEES, ROLE_LABELS, formatKsh, isProfessional } from "@/lib/roles";
import type { RoleValue } from "@/lib/registrations.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My Dashboard | BABA" }] }),
  component: DashboardPage,
  errorComponent: DashboardError,
});

function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <PageShell>
      <section className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold text-baba-blue">Something went wrong</h1>
        <p className="mt-2 text-baba-slate/70">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </PageShell>
  );
}

type Tab = "profile" | "opportunities" | "registrations" | "settings";

const TABS: { id: Tab; label: string; icon: typeof UserCircle }[] = [
  { id: "profile", label: "My Profile", icon: UserCircle },
  { id: "opportunities", label: "Opportunities", icon: Compass },
  { id: "registrations", label: "My Registrations", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function DashboardPage() {
  const profileFn = useServerFn(getMyProfile);
  const regsFn = useServerFn(getMyRegistrations);
  const router = useRouter();

  const profileQuery = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const regsQuery = useQuery({ queryKey: ["my-registrations"], queryFn: () => regsFn() });

  const [tab, setTab] = useState<Tab>("profile");
  const [navOpen, setNavOpen] = useState(false);

  const registrations = regsQuery.data ?? [];
  const role = (registrations[0]?.role ?? "individual") as RoleValue;
  const verified = registrations.some((r) => r.verified);
  const fee = ROLE_FEES[role] ?? 100;

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", search: { redirect: "/dashboard" } });
  };

  if (profileQuery.isLoading || regsQuery.isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  const profile = profileQuery.data ?? null;
  const displayName = profile?.full_name || profile?.email || "Your account";

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        {/* Mobile nav toggle */}
        <button
          onClick={() => setNavOpen((v) => !v)}
          className="mb-4 flex items-center gap-2 rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue lg:hidden"
        >
          {navOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />} Menu
        </button>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className={`${navOpen ? "block" : "hidden"} lg:block`}>
            <nav className="sticky top-24 grid gap-1 rounded-2xl border border-baba-blue/10 bg-card p-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    setNavOpen(false);
                  }}
                  className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                    tab === t.id
                      ? "bg-baba-blue text-white"
                      : "text-baba-slate/70 hover:bg-secondary"
                  }`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
              <button
                onClick={signOut}
                className="mt-1 flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-baba-slate/70 hover:bg-secondary"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <div className="min-w-0">
            {/* Profile card */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-baba-blue/10 bg-card p-5">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-baba-blue/10 text-baba-blue">
                  <UserCircle className="h-8 w-8" />
                </span>
                <div>
                  <h1 className="font-display text-xl font-extrabold text-baba-blue">{displayName}</h1>
                  <p className="text-sm text-baba-slate/60">
                    {ROLE_LABELS[role] ?? role}
                    {profile?.location ? ` · ${profile.location}` : ""}
                  </p>
                </div>
              </div>
              {verified ? (
                <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3.5 py-1.5 text-sm font-bold text-green-700">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-bold text-amber-700">
                  <Lock className="h-4 w-4" /> Verify — {formatKsh(fee)}
                </span>
              )}
            </div>

            {tab === "profile" && <ProfileTab profile={profile} role={role} />}
            {tab === "opportunities" && (
              <OpportunitiesTab
                verified={verified}
                fee={fee}
                role={role}
                artisanType={registrations[0]?.artisan_type ?? null}
                profile={profile}
              />
            )}
            {tab === "registrations" && <RegistrationsTab registrations={registrations} />}
            {tab === "settings" && <SettingsTab profile={profile} />}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

/* ------------------------------ Profile tab ------------------------------- */

function ProfileTab({ profile, role }: { profile: ProfileRow | null; role: RoleValue }) {
  const saveFn = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const pro = isProfessional(role);

  const extra = (profile?.extra ?? {}) as Record<string, unknown>;
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [skills, setSkills] = useState((extra.skills as string) ?? "");
  const [industries, setIndustries] = useState((extra.industries as string) ?? "");
  const [certifications, setCertifications] = useState((extra.certifications as string) ?? "");
  const [cvName, setCvName] = useState(profile?.cv_url ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          full_name: fullName,
          phone,
          location,
          bio,
          cv_url: cvName,
          extra: { skills, industries, certifications },
        },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
  });

  const onPickCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCvName(file.name);
  };

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-baba-slate">My Profile</h2>
      <p className="mt-1 text-sm text-baba-slate/60">
        Keep your details current. Read-only details come from your registration.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <ReadOnly label="Email" value={profile?.email ?? "—"} />
        <Editable label="Full Name" value={fullName} onChange={setFullName} />
        <Editable label="Phone" value={phone} onChange={setPhone} />
        <Editable label="Location" value={location} onChange={setLocation} />
      </div>

      <div className="mt-4 grid gap-4">
        <EditableArea label={pro ? "Professional Summary" : "Bio / About"} value={bio} onChange={setBio} />
        <Editable label="Skills / Interests" value={skills} onChange={setSkills} />
        <Editable label="Industries" value={industries} onChange={setIndustries} />
        {(pro || role === "artisan") && (
          <Editable label="Certifications / Training" value={certifications} onChange={setCertifications} />
        )}
      </div>

      {pro && (
        <div className="mt-5 rounded-xl border border-dashed border-baba-blue/25 p-5">
          <h3 className="text-sm font-bold text-baba-slate">Curriculum Vitae (CV)</h3>
          {cvName ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 rounded-lg bg-baba-blue/5 px-3 py-2 text-sm text-baba-slate">
                <FileText className="h-4 w-4 text-baba-blue" /> {cvName}
              </span>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/20 px-3 py-2 text-sm font-semibold text-baba-blue opacity-60"
                title="File storage coming soon"
              >
                <Download className="h-4 w-4" /> Download
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/20 px-3 py-2 text-sm font-semibold text-baba-blue"
              >
                <FileUp className="h-4 w-4" /> Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-baba-blue/25 py-8 text-sm text-baba-slate/60 transition-colors hover:border-baba-blue"
            >
              <FileUp className="h-6 w-6 text-baba-blue" />
              Click to upload your CV (.pdf, .docx)
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={onPickCv}
          />
          <p className="mt-2 text-xs text-baba-slate/50">
            File storage isn't live yet — we save the file name for now.
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex items-center gap-2 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Profile
        </button>
        {mutation.isSuccess && !mutation.isPending && (
          <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        {mutation.isError && (
          <span className="text-sm font-semibold text-destructive">Could not save.</span>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Opportunities tab ---------------------------- */

type OppKind = "event" | "job" | "course";
interface Opp {
  kind: OppKind;
  title: string;
  meta: string;
  desc: string;
}

const OPPORTUNITIES: Opp[] = [
  { kind: "event", title: "BABA National Skills Expo", meta: "Nairobi · Upcoming", desc: "Connect with builders, artisans and partners across the country." },
  { kind: "event", title: "Youth in Construction Forum", meta: "Regional · Upcoming", desc: "A day of mentorship, panels and networking for young talent." },
  { kind: "job", title: "Site Supervisor", meta: "BuildCo · Nairobi", desc: "Oversee residential construction projects on active sites." },
  { kind: "job", title: "Certified Electrician", meta: "PowerLine Ltd · Mombasa", desc: "Installation and maintenance for commercial buildings." },
  { kind: "course", title: "Advanced Masonry Techniques", meta: "6 weeks", desc: "Hands-on training toward a recognized certification." },
  { kind: "course", title: "Project Management Fundamentals", meta: "4 weeks", desc: "Core skills for leading construction and trade projects." },
];

const OPP_ICON: Record<OppKind, typeof Calendar> = {
  event: Calendar,
  job: Briefcase,
  course: GraduationCap,
};
const OPP_CTA: Record<OppKind, string> = {
  event: "Register for Event",
  job: "Apply",
  course: "Enroll",
};

function OpportunitiesTab({ verified, fee }: { verified: boolean; fee: number }) {
  const [filter, setFilter] = useState<"all" | OppKind>("all");
  const [gate, setGate] = useState<OppKind | null>(null);

  const items = OPPORTUNITIES.filter((o) => filter === "all" || o.kind === filter);

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-baba-slate">Opportunities</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "event", "job", "course"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              filter === f
                ? "border-baba-blue bg-baba-blue/5 text-baba-blue"
                : "border-input text-baba-slate/60 hover:border-baba-blue/30"
            }`}
          >
            {f === "all" ? "All" : f === "event" ? "Events" : f === "job" ? "Jobs" : "Courses"}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4">
        {items.map((o, i) => {
          const Icon = OPP_ICON[o.kind];
          return (
            <div key={i} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-baba-blue/10 p-4">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-baba-blue/10 text-baba-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold text-baba-slate">{o.title}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-baba-copper-dark">{o.meta}</p>
                  <p className="mt-1 text-sm text-baba-slate/60">{o.desc}</p>
                </div>
              </div>
              <button
                onClick={() => (verified ? undefined : setGate(o.kind))}
                disabled={verified}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${
                  verified
                    ? "cursor-not-allowed bg-baba-slate/15 text-baba-slate/50"
                    : "baba-cta text-white"
                }`}
                title={verified ? "Coming soon" : "Verify to continue"}
              >
                {OPP_CTA[o.kind]}
              </button>
            </div>
          );
        })}
      </div>

      {gate && (
        <GateModal kind={gate} fee={fee} onClose={() => setGate(null)} />
      )}
    </div>
  );
}

function GateModal({ kind, fee, onClose }: { kind: OppKind; fee: number; onClose: () => void }) {
  const verb = kind === "event" ? "register" : kind === "job" ? "apply" : "enroll";
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-baba-slate/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl border border-baba-blue/10 bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
          <ShieldCheck className="h-6 w-6 text-baba-blue" />
        </div>
        <h2 className="mt-4 font-display text-xl font-extrabold text-baba-blue">
          Verify your account to {verb}
        </h2>
        <p className="mt-2 text-sm text-baba-slate/70">
          A one-time {formatKsh(fee)} fee verifies your account across the BABA network.
        </p>
        <button
          disabled
          className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-baba-slate/20 py-3 text-sm font-bold text-baba-slate/60"
        >
          <Lock className="h-4 w-4" /> Payment Integration Coming Soon
        </button>
        <p className="mt-3 text-center text-xs text-baba-slate/50">
          You'll complete payment once our payment system is live.
        </p>
        <button onClick={onClose} className="mt-3 w-full text-center text-sm font-semibold text-baba-slate/60 hover:text-baba-blue">
          Close
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Registrations tab ---------------------------- */

function RegistrationsTab({ registrations }: { registrations: RegistrationRow[] }) {
  if (registrations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-baba-blue/20 bg-card p-10 text-center">
        <p className="text-baba-slate/60">
          You haven't registered for anything yet.{" "}
          <Link to="/opportunities" className="font-semibold text-baba-copper-dark hover:underline">
            Explore opportunities.
          </Link>
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-baba-slate">My Registrations</h2>
      <div className="mt-4 grid gap-3">
        {registrations.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-baba-blue/10 p-4">
            <div>
              <span className="rounded-full bg-baba-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-baba-blue">
                Registration
              </span>
              <h3 className="mt-1.5 font-display font-bold text-baba-slate">
                {ROLE_LABELS[r.role as RoleValue] ?? r.role}
                {r.artisan_type ? ` — ${r.artisan_type}` : ""}
              </h3>
              <p className="text-sm text-baba-slate/60">
                Registered {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                r.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {r.verified ? "Verified" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Settings tab ------------------------------ */

function SettingsTab({ profile }: { profile: ProfileRow | null }) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [pwMsg, setPwMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const changePassword = async () => {
    setPwMsg("");
    if (password.length < 6) {
      setPwMsg("Password must be at least 6 characters.");
      return;
    }
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPwBusy(false);
    setPwMsg(error ? error.message : "Password updated.");
    if (!error) setPassword("");
  };

  const changeEmail = async () => {
    setEmailMsg("");
    setEmailBusy(true);
    const { error } = await supabase.auth.updateUser({ email });
    setEmailBusy(false);
    setEmailMsg(error ? error.message : "Check your inbox to confirm the new email.");
  };

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
        <h2 className="font-display text-lg font-bold text-baba-slate">Change Password</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid flex-1 gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">New Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
            />
          </label>
          <button
            onClick={changePassword}
            disabled={pwBusy}
            className="flex items-center gap-2 rounded-lg baba-cta px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pwBusy && <Loader2 className="h-4 w-4 animate-spin" />} Update
          </button>
        </div>
        {pwMsg && <p className="mt-2 text-sm font-medium text-baba-slate/70">{pwMsg}</p>}
      </div>

      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
        <h2 className="font-display text-lg font-bold text-baba-slate">Update Email</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="grid flex-1 gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
            />
          </label>
          <button
            onClick={changeEmail}
            disabled={emailBusy}
            className="flex items-center gap-2 rounded-lg baba-cta px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {emailBusy && <Loader2 className="h-4 w-4 animate-spin" />} Update
          </button>
        </div>
        {emailMsg && <p className="mt-2 text-sm font-medium text-baba-slate/70">{emailMsg}</p>}
      </div>

      <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
        <h2 className="font-display text-lg font-bold text-baba-slate">Notification Preferences</h2>
        <p className="mt-2 text-sm text-baba-slate/60">
          Notification settings will appear here once the notification engine is live.
        </p>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-card p-6">
        <h2 className="font-display text-lg font-bold text-destructive">Delete Account</h2>
        <p className="mt-2 text-sm text-baba-slate/60">
          Deleting your account is permanent and removes your registrations. Account deletion will be
          enabled soon — contact us if you need to remove your account now.
        </p>
        <button
          disabled
          className="mt-4 cursor-not-allowed rounded-lg bg-destructive/20 px-5 py-2.5 text-sm font-bold text-destructive/70"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ small inputs ------------------------------ */

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">{label}</span>
      <p className="mt-1.5 rounded-lg bg-secondary px-3.5 py-2.5 text-sm text-baba-slate/70">{value}</p>
    </div>
  );
}

function Editable({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
      />
    </label>
  );
}

function EditableArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">{label}</span>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
      />
    </label>
  );
}
