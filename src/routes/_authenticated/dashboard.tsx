import { createFileRoute, useRouter, Link, useNavigate } from "@tanstack/react-router";
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
  Bell,
} from "lucide-react";
import { NotificationsTab } from "@/components/NotificationsTab";
import { MyEventsTab } from "@/components/MyEventsTab";
import { getUnreadNotificationCount } from "@/lib/notifications.functions";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyProfile,
  getMyRegistrations,
  updateMyProfile,
  type ProfileRow,
  type RegistrationRow,
} from "@/lib/registrations.functions";
import { ROLE_LABELS } from "@/lib/roles";
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

/** Internal login addresses are not real contact emails — never show them. */
function realEmail(value?: string | null): string {
  const v = (value ?? "").trim();
  return v && !v.toLowerCase().endsWith("@baba.local") ? v : "";
}

type Tab = "profile" | "notifications" | "opportunities" | "registrations" | "myevents" | "settings";

const TABS: { id: Tab; label: string; icon: typeof UserCircle }[] = [
  { id: "profile", label: "My Profile", icon: UserCircle },
  { id: "myevents", label: "My Events", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "opportunities", label: "Opportunities", icon: Compass },
  { id: "registrations", label: "My Registrations", icon: ClipboardList },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];


function DashboardPage() {
  const profileFn = useServerFn(getMyProfile);
  const regsFn = useServerFn(getMyRegistrations);
  const router = useRouter();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const regsQuery = useQuery({ queryKey: ["my-registrations"], queryFn: () => regsFn() });

  const [tab, setTab] = useState<Tab>("profile");
  const [navOpen, setNavOpen] = useState(false);

  const notifCountFn = useServerFn(getUnreadNotificationCount);
  const unreadQuery = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: () => notifCountFn(),
    refetchInterval: 60_000,
  });
  const unread = unreadQuery.data ?? 0;

  const registrations = regsQuery.data ?? [];
  const role = (registrations[0]?.role ?? "individual") as RoleValue;
  const verified = registrations.some((r) => r.verified);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", search: { redirect: "/dashboard" }, replace: true });
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
  const displayName = profile?.full_name || realEmail(profile?.email) || "Your account";

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
                <button
                  onClick={() => router.navigate({ to: "/pillars" })}
                  className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-200"
                >
                  <Lock className="h-4 w-4" /> Not verified — Verify
                </button>
              )}
              <button
                onClick={() => {
                  setTab("notifications");
                  setNavOpen(false);
                }}
                className="relative flex items-center gap-1.5 rounded-full border-2 border-baba-blue/15 px-3.5 py-1.5 text-sm font-semibold text-baba-slate/70 transition-colors hover:border-baba-blue/40"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                Notifications
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>
            </div>

            {tab === "profile" && (
              <ProfileTab profile={profile} role={role} reg={registrations[0] ?? null} />
            )}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "myevents" && <MyEventsTab />}

            {tab === "opportunities" && (
              <OpportunitiesTab
                verified={verified}
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

function ProfileTab({
  profile,
  role,
  reg,
}: {
  profile: ProfileRow | null;
  role: RoleValue;
  reg: RegistrationRow | null;
}) {
  const saveFn = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();

  const [email, setEmail] = useState(realEmail(profile?.email) || realEmail(reg?.email));
  const [phone, setPhone] = useState(profile?.phone ?? reg?.phone ?? "");
  const [location, setLocation] = useState(profile?.location ?? reg?.location ?? "");

  const idLabel = role === "corporate" ? "Registration / ID No" : "National ID";
  const missing = [!phone.trim() ? "phone number" : null].filter(Boolean) as string[];

  const mutation = useMutation({
    mutationFn: () => saveFn({ data: { email, phone, location } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    },
  });

  const humanize = (v: string | null | undefined) =>
    v ? v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : null;

  const summary: { label: string; value: string }[] = [
    { label: "Full name", value: reg?.full_name ?? profile?.full_name ?? "—" },
    { label: idLabel, value: reg?.national_id ?? "—" },
    { label: "Role", value: ROLE_LABELS[role] ?? role },
  ];
  if (reg?.artisan_type) summary.push({ label: "Trade", value: humanize(reg.artisan_type) ?? reg.artisan_type });
  if (reg?.education_level) summary.push({ label: "Education", value: reg.education_level });
  if (reg?.employment_status) summary.push({ label: "Employment", value: reg.employment_status });
  if (reg?.years_experience) summary.push({ label: "Years experience", value: reg.years_experience });

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-baba-slate">My Profile</h2>
      <p className="mt-1 text-sm text-baba-slate/60">
        Your sign-up details are shown below. Only phone, location and email can be changed.
      </p>

      {missing.length > 0 ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Your profile is not complete yet.</strong> Please add your {missing.join(" and ")} below.
        </p>
      ) : (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <strong>Your profile is complete.</strong> You'll be verified by the BABA team.
        </p>
      )}

      <div className="mt-5 rounded-xl border border-baba-blue/10 bg-secondary/40 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-baba-slate/50">
          Your sign-up summary
        </p>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {summary.map((row) => (
            <ReadOnly key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-baba-slate/50">
        You can change
      </p>
      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        <Editable label="Email (optional)" value={email} onChange={setEmail} />
        <Editable label="Phone" value={phone} onChange={setPhone} />
        <Editable label="Location" value={location} onChange={setLocation} />
      </div>

      <IdDocumentUpload profile={profile} />

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

/* ----------------------- National ID document upload ---------------------- */

function IdDocumentUpload({ profile }: { profile: ProfileRow | null }) {
  const saveFn = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const extra = (profile?.extra ?? {}) as Record<string, unknown>;
  const existingPath = (extra.id_document_path as string) ?? "";
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const upload = async (file: File) => {
    setStatus("busy");
    setMessage("");
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Please log in again.");
      if (file.size > 8 * 1024 * 1024) throw new Error("That file is too big. Use one under 8 MB.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${uid}/id-document.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("member-ids")
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (upErr) throw upErr;
      await saveFn({ data: { extra: { ...extra, id_document_path: path } } });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setStatus("done");
      setMessage("Your ID was sent. Thank you.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  const view = async () => {
    const { data } = await supabase.storage.from("member-ids").createSignedUrl(existingPath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-5 rounded-xl border border-dashed border-baba-blue/25 p-5">
      <h3 className="text-sm font-bold text-baba-slate">Your ID (National Identification No)</h3>
      <p className="mt-1 text-xs text-baba-slate/60">
        You can add a photo of your ID here at any time. Only you and the BABA team can see it.
      </p>

      {existingPath ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-lg bg-baba-blue/5 px-3 py-2 text-sm text-baba-slate">
            <FileText className="h-4 w-4 text-baba-blue" /> ID saved
          </span>
          <button
            type="button"
            onClick={view}
            className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/20 px-3 py-2 text-sm font-semibold text-baba-blue"
          >
            <Download className="h-4 w-4" /> View
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/20 px-3 py-2 text-sm font-semibold text-baba-blue"
          >
            <FileUp className="h-4 w-4" /> Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-baba-blue/25 py-8 text-sm text-baba-slate/60 transition-colors hover:border-baba-blue"
        >
          {status === "busy" ? (
            <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
          ) : (
            <FileUp className="h-6 w-6 text-baba-blue" />
          )}
          Tap to add a photo of your ID (or a PDF)
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      {message && (
        <p
          className={`mt-2 text-xs font-medium ${
            status === "error" ? "text-destructive" : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}


/* --------------------------- Opportunities tab ---------------------------- */

type OppKind = "event" | "job" | "course";
type Audience = RoleValue;
interface Opp {
  kind: OppKind;
  title: string;
  meta: string;
  desc: string;
  /** Roles this is most relevant to. Empty = open to everyone. */
  roles: Audience[];
  /** Keywords matched against the user's trade, skills and industries. */
  tags: string[];
}

const OPPORTUNITIES: Opp[] = [
  { kind: "event", title: "BABA National Skills Expo", meta: "Nairobi · Upcoming", desc: "Connect with builders, artisans and partners across the country.", roles: [], tags: ["construction", "building", "networking", "trade"] },
  { kind: "event", title: "Youth in Construction Forum", meta: "Regional · Upcoming", desc: "A day of mentorship, panels and networking for young talent.", roles: ["professional_young", "individual"], tags: ["construction", "mentorship", "youth", "career"] },
  { kind: "event", title: "Corporate Procurement Summit", meta: "Nairobi · Upcoming", desc: "Meet suppliers and win construction supply contracts.", roles: ["corporate"], tags: ["procurement", "supply", "business", "manufacturing"] },
  { kind: "job", title: "Site Supervisor", meta: "BuildCo · Nairobi", desc: "Oversee residential construction projects on active sites.", roles: ["professional_exp", "professional_young"], tags: ["construction", "supervision", "management", "masonry"] },
  { kind: "job", title: "Certified Electrician", meta: "PowerLine Ltd · Mombasa", desc: "Installation and maintenance for commercial buildings.", roles: ["artisan"], tags: ["electrical", "electrician", "solar", "wiring"] },
  { kind: "job", title: "Plumbing Technician", meta: "AquaFix · Nakuru", desc: "Pipe fitting and maintenance for new developments.", roles: ["artisan"], tags: ["plumbing", "pipe", "plumber", "fitting"] },
  { kind: "course", title: "Advanced Masonry Techniques", meta: "6 weeks", desc: "Hands-on training toward a recognized certification.", roles: ["artisan"], tags: ["masonry", "mason", "bricklaying", "construction"] },
  { kind: "course", title: "Solar & Electrical Installation", meta: "5 weeks", desc: "Certified training in solar and electrical systems.", roles: ["artisan"], tags: ["electrical", "solar", "electrician", "wiring"] },
  { kind: "course", title: "Project Management Fundamentals", meta: "4 weeks", desc: "Core skills for leading construction and trade projects.", roles: ["professional_young", "professional_exp"], tags: ["management", "leadership", "projects", "business"] },
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

/** Split free-text fields into normalized keyword tokens. */
function tokenize(...values: (string | null | undefined)[]): string[] {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

/** Relevance score for an opportunity against the current user's profile. */
function scoreOpp(o: Opp, role: RoleValue, userTokens: string[]): number {
  let score = 0;
  if (o.roles.includes(role)) score += 3;
  for (const tag of o.tags) {
    if (userTokens.some((t) => t === tag || t.includes(tag) || tag.includes(t))) {
      score += 1;
    }
  }
  return score;
}

function OpportunitiesTab({
  verified,
  role,
  artisanType,
  profile,
}: {
  verified: boolean;
  role: RoleValue;
  artisanType: string | null;
  profile: ProfileRow | null;
}) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"foryou" | "all" | OppKind>("foryou");

  const extra = (profile?.extra ?? {}) as Record<string, unknown>;
  const userTokens = tokenize(role, artisanType, extra.skills as string, extra.industries as string);

  const scored = OPPORTUNITIES.map((o) => ({ o, score: scoreOpp(o, role, userTokens) }));

  const items =
    filter === "foryou"
      ? scored
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((s) => s.o)
      : scored.filter((s) => filter === "all" || s.o.kind === filter).map((s) => s.o);

  const scoreMap = new Map(scored.map((s) => [s.o, s.score]));

  const FILTERS: { id: "foryou" | "all" | OppKind; label: string }[] = [
    { id: "foryou", label: "For You" },
    { id: "all", label: "All" },
    { id: "event", label: "Events" },
    { id: "job", label: "Jobs" },
    { id: "course", label: "Courses" },
  ];

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-baba-slate">Opportunities</h2>
      <p className="mt-1 text-sm text-baba-slate/60">
        Matched to your role{artisanType ? `, ${artisanType}` : ""}.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.id
                ? "border-baba-blue bg-baba-blue/5 text-baba-blue"
                : "border-input text-baba-slate/60 hover:border-baba-blue/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-baba-blue/20 p-10 text-center text-sm text-baba-slate/60">
          {filter === "foryou"
            ? "No matches for your role yet. Check back soon."
            : "Nothing here right now. Check back soon."}
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {items.map((o, i) => {
            const Icon = OPP_ICON[o.kind];
            const matched = (scoreMap.get(o) ?? 0) > 0;
            const isEvent = o.kind === "event";
            // Verified members sign up for real (on the events page); everyone
            // else sees the sign-up button and is sent to the pillars to verify.
            const ctaAction = isEvent
              ? () => navigate({ to: verified ? "/events" : "/pillars" })
              : () => navigate({ to: "/pillars" });
            const ctaDisabled = verified && !isEvent;
            return (
              <div key={i} className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-baba-blue/10 p-4">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-baba-blue/10 text-baba-blue">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display font-bold text-baba-slate">{o.title}</h3>
                      {matched && filter !== "foryou" && (
                        <span className="rounded-full bg-baba-copper/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-baba-copper-dark">
                          Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-baba-copper-dark">{o.meta}</p>
                    <p className="mt-1 text-sm text-baba-slate/60">{o.desc}</p>
                  </div>
                </div>
                <button
                  onClick={ctaAction}
                  disabled={ctaDisabled}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${
                    ctaDisabled
                      ? "cursor-not-allowed bg-baba-slate/15 text-baba-slate/50"
                      : "baba-cta text-white"
                  }`}
                >
                  {ctaDisabled ? "Coming soon" : "Sign up"}
                </button>
              </div>
            );
          })}
        </div>
      )}
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
          <Link to="/events" className="font-semibold text-baba-copper-dark hover:underline">
            Explore upcoming events.
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
  const [email, setEmail] = useState(realEmail(profile?.email));
  const [pwMsg, setPwMsg] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const saveFn = useServerFn(updateMyProfile);
  const queryClient = useQueryClient();


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
