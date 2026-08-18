import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import {
  Loader2,
  Users,
  FileUp,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  LogOut,
  Plus,
  UserPlus,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import {
  bulkImportRegistrations,
  getPartnerOrgSummary,
  listPartnerUsers,
  getMyAccess,
  addPartnerAdmin,
  type ImportRow,
  type BulkImportResult,
} from "@/lib/partner.functions";
import type { RegistrationRow } from "@/lib/registrations.functions";
import {
  PROFESSIONS,
  EDUCATION_OPTIONS,
  EMPLOYMENT_OPTIONS,
  YEARS_OPTIONS,
} from "@/lib/wizard-options";

export const Route = createFileRoute("/_authenticated/partner")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw redirect({ to: "/auth", search: { redirect: "/partner" } });
    }
    const { data: pa, error } = await supabase
      .from("partner_admins")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (error || !pa) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  head: () => ({ meta: [{ title: "Partner Portal | BABA" }] }),
  component: PartnerPortal,
});

type Tab = "overview" | "members" | "import";

/** Parse pasted/uploaded rows: Name, ID, Phone [, occupation, education, employment]. */
function parseImportText(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ImportRow[] = [];
  for (const line of lines) {
    // Tolerate comma, tab, pipe or runs of whitespace as separators.
    const parts = line
      .split(/[,\t|]+|\s{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length < 3) continue;
    const [name, national_id, phone, occupation, education_level, employment_status] = parts;
    rows.push({
      name,
      national_id,
      phone,
      occupation: occupation || undefined,
      education_level: education_level || undefined,
      employment_status: employment_status || undefined,
    });
  }
  return rows;
}

function PartnerPortal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const summaryFn = useServerFn(getPartnerOrgSummary);
  const usersFn = useServerFn(listPartnerUsers);
  const accessFn = useServerFn(getMyAccess);
  const importFn = useServerFn(bulkImportRegistrations);
  const addAdminFn = useServerFn(addPartnerAdmin);

  const accessQuery = useQuery({ queryKey: ["partner-access"], queryFn: () => accessFn() });
  const summaryQuery = useQuery({ queryKey: ["partner-summary"], queryFn: () => summaryFn() });
  // Always scoped to the caller's own org — even when they're a super admin.
  // The server also defaults admins with their own org to that org, so this
  // stays correct even on the very first render.
  const usersQuery = useQuery({
    queryKey: ["partner-users", accessQuery.data?.partnerOrgId ?? "me"],
    queryFn: () =>
      usersFn({
        data: { partner_org_id: accessQuery.data?.partnerOrgId ?? undefined },
      }),
    enabled: !!accessQuery.data,
  });

  const [tab, setTab] = useState<Tab>("overview");
  const [importText, setImportText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [importProgress, setImportProgress] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Simple one-person-at-a-time form (the boomer-friendly path).
  const emptyDraft = {
    name: "",
    national_id: "",
    phone: "",
    profession: "",
    profession_other: "",
    education_level: "",
    employment_status: "",
    years_experience: "",
    temporary_password: "",
  };
  const [draft, setDraft] = useState(emptyDraft);
  const [memberList, setMemberList] = useState<ImportRow[]>([]);
  const [draftError, setDraftError] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminMsg, setNewAdminMsg] = useState("");

  const parsed = useMemo(() => (importText.trim() ? parseImportText(importText) : []), [importText]);

  // Everything queued: typed one-by-one + any pasted rows.
  const rowsToImport = useMemo(() => [...memberList, ...parsed], [memberList, parsed]);

  const addMemberToList = () => {
    setDraftError("");
    const name = draft.name.trim();
    const idDigits = draft.national_id.replace(/[^0-9]/g, "");
    const phoneDigits = draft.phone.replace(/[^0-9]/g, "");
    if (name.length < 2) return setDraftError("Please type their full name.");
    if (idDigits.length < 6) return setDraftError("The ID number looks too short — type the full number.");
    if (phoneDigits.length < 9) return setDraftError("The phone number looks too short — e.g. 0712 345 678.");
    if (draft.profession === "other" && !draft.profession_other.trim()) {
      return setDraftError("They picked “Other” — type what they do.");
    }
    if (draft.temporary_password.trim() && draft.temporary_password.trim().length < 6) {
      return setDraftError("The temporary password must be 6 characters or more.");
    }
    setMemberList((prev) => [
      ...prev,
      {
        name,
        national_id: idDigits,
        phone: draft.phone.trim(),
        profession: draft.profession || undefined,
        profession_other: draft.profession === "other" ? draft.profession_other.trim() : undefined,
        education_level: draft.education_level || undefined,
        employment_status: draft.employment_status || undefined,
        years_experience: draft.years_experience || undefined,
        temporary_password: draft.temporary_password.trim() || undefined,
      },
    ]);
    setDraft(emptyDraft);
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      setImportResult(null);
      const all = rowsToImport;
      if (all.length === 0) throw new Error("No people added yet. Add a member below or paste a list.");
      // Send in batches of 100 so each request stays fast.
      const aggregate: BulkImportResult = {
        total: all.length,
        created: 0,
        duplicates: 0,
        errors: 0,
        profileComplete: 0,
        incomplete: 0,
        errorRows: [],
      };
      for (let i = 0; i < all.length; i += 100) {
        const chunk = all.slice(i, i + 100);
        setImportProgress(`Importing ${Math.min(i + 100, all.length)} of ${all.length}…`);
        const res = await importFn({ data: { rows: chunk } });
        aggregate.created += res.created;
        aggregate.duplicates += res.duplicates;
        aggregate.errors += res.errors;
        aggregate.profileComplete += res.profileComplete;
        aggregate.incomplete += res.incomplete;
        aggregate.errorRows.push(...res.errorRows.map((e) => ({ ...e, row: e.row + i })));
      }
      return aggregate;
    },
    onSuccess: (res) => {
      setImportResult(res);
      setImportProgress(null);
      setImportText("");
      setFileName(null);
      setMemberList([]);
      queryClient.invalidateQueries({ queryKey: ["partner-summary"] });
      queryClient.invalidateQueries({ queryKey: ["partner-users"] });
    },
    onError: (err) => setImportResult({ total: 0, created: 0, duplicates: 0, errors: 1, profileComplete: 0, incomplete: 0, errorRows: [{ row: 0, reason: err instanceof Error ? err.message : "Import failed" }] }),
  });

  const addAdminMutation = useMutation({
    mutationFn: () =>
      addAdminFn({
        data: {
          email: newAdminEmail.trim(),
          partner_org_id: accessQuery.data?.partnerOrgId ?? "",
          can_add_other_admins: false,
        },
      }),
    onSuccess: () => {
      setNewAdminEmail("");
      setNewAdminMsg("Added! That person can now log in and use the partner portal.");
    },
    onError: (err) =>
      setNewAdminMsg(err instanceof Error ? err.message : "Could not add that person."),
  });

  if (accessQuery.isLoading || summaryQuery.isLoading || usersQuery.isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  const access = accessQuery.data;
  const summary = summaryQuery.data;
  const users = usersQuery.data ?? [];

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: "/partner" }, replace: true });
  };

  const statusBadge = (r: RegistrationRow) => {
    if (r.account_status === "provisional") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
          <Clock className="h-3 w-3" /> Provisional
        </span>
      );
    }
    if (r.account_status === "suspended") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
          <AlertTriangle className="h-3 w-3" /> Suspended
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
        <CheckCircle2 className="h-3 w-3" /> Active
      </span>
    );
  };

  const NAV: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: "overview", label: "Overview", icon: Users },
    { key: "members", label: "My Members", icon: ShieldCheck },
    { key: "import", label: "Register New Users", icon: FileUp },
  ];

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-baba-blue">Partner Portal</h1>
            <p className="mt-1 text-baba-slate/60">
              {access?.orgName ? `${access.orgName} — ` : ""}your registered members and registrations.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/dashboard"
              className="rounded-lg border border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-slate/70 hover:border-baba-blue/40"
            >
              My dashboard
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg border border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-slate/70 hover:border-baba-blue/40"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* nav */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-baba-blue/10 bg-card p-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === n.key ? "baba-cta text-white" : "text-baba-slate/60 hover:bg-baba-blue/5"
                }`}
              >
                <Icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && summary && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total registered" value={summary.total} icon={<Users className="h-5 w-5" />} />
            <StatCard label="Provisional (awaiting first login)" value={summary.provisional} icon={<Clock className="h-5 w-5" />} accent="amber" />
            <StatCard label="Active members" value={summary.active} icon={<CheckCircle2 className="h-5 w-5" />} accent="green" />
            <StatCard label="Verified" value={summary.verified} icon={<ShieldCheck className="h-5 w-5" />} accent="blue" />
            <StatCard label="Pending verification" value={summary.pendingVerification} icon={<AlertTriangle className="h-5 w-5" />} accent="amber" />
            <StatCard label="Need to finish their details" value={summary.needsWizard} icon={<FileUp className="h-5 w-5" />} />
          </div>
        )}

        {tab === "members" && (
          <div className="overflow-x-auto rounded-2xl border border-baba-blue/10 bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-baba-blue/10 text-xs uppercase tracking-wide text-baba-slate/60">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">ID No.</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-baba-slate/60">
                      No members yet — head to “Register New Users” to import your list.
                    </td>
                  </tr>
                )}
                {users.map((r) => (
                  <tr key={r.id} className="border-b border-baba-blue/5">
                    <td className="px-4 py-3 font-semibold text-baba-slate">{r.full_name ?? "—"}</td>
                    <td className="px-4 py-3 text-baba-slate/70">{r.national_id ?? "—"}</td>
                    <td className="px-4 py-3 text-baba-slate/70">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3">{statusBadge(r)}</td>
                    <td className="px-4 py-3">
                      {r.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                          <Clock className="h-3 w-3" /> Not verified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-baba-slate/60">
                      {new Date(r.created_at).toLocaleDateString("en-KE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "import" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-baba-blue/10 bg-card p-6">
              <h2 className="font-display text-xl font-bold text-baba-slate">Add your members</h2>
              <p className="mt-1 text-sm text-baba-slate/60">
                One person at a time — only their <span className="font-semibold">name, ID and phone</span> are
                needed. Everything else is optional; they confirm their details at first login.
              </p>

              {/* simple form */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    Full name <span className="text-baba-copper-dark">*</span>
                  </span>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. Jane Wanjiru"
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    National ID No. <span className="text-baba-copper-dark">*</span>
                  </span>
                  <input
                    inputMode="numeric"
                    value={draft.national_id}
                    onChange={(e) => setDraft({ ...draft, national_id: e.target.value })}
                    placeholder="e.g. 12345678"
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  />
                </label>
                <label className="grid gap-1.5 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    Phone number <span className="text-baba-copper-dark">*</span>
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    placeholder="e.g. 0712 345 678"
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  />
                </label>

                <label className="grid gap-1.5 sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                    What do they do? <span className="font-normal normal-case text-baba-slate/50">(optional — they can choose at first login)</span>
                  </span>
                  <select
                    value={draft.profession}
                    onChange={(e) => setDraft({ ...draft, profession: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  >
                    <option value="">Not sure — leave blank</option>
                    {PROFESSIONS.map((p) => (
                      <option key={p.key} value={p.key}>{p.label.replace(/^I am an? /, "").replace(/^I do something else.*/, "Something else (type it)")}</option>
                    ))}
                  </select>
                </label>
                {draft.profession === "other" && (
                  <label className="grid gap-1.5 sm:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Their work</span>
                    <input
                      value={draft.profession_other}
                      onChange={(e) => setDraft({ ...draft, profession_other: e.target.value })}
                      placeholder="e.g. Tailor"
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                    />
                  </label>
                )}
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Level of education</span>
                  <select
                    value={draft.education_level}
                    onChange={(e) => setDraft({ ...draft, education_level: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  >
                    <option value="">Not sure — leave blank</option>
                    {EDUCATION_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">How do they work?</span>
                  <select
                    value={draft.employment_status}
                    onChange={(e) => setDraft({ ...draft, employment_status: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  >
                    <option value="">Not sure — leave blank</option>
                    {EMPLOYMENT_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Years of experience</span>
                  <select
                    value={draft.years_experience}
                    onChange={(e) => setDraft({ ...draft, years_experience: e.target.value })}
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  >
                    <option value="">Not sure — leave blank</option>
                    {YEARS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Temporary password</span>
                  <input
                    value={draft.temporary_password}
                    onChange={(e) => setDraft({ ...draft, temporary_password: e.target.value })}
                    placeholder="Leave blank = their ID number"
                    className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  />
                  <span className="text-[0.7rem] text-baba-slate/50">
                    Blank means they first log in with their ID number. They set their own password at first login.
                  </span>
                </label>
              </div>

              {draftError && <p className="mt-3 text-sm font-medium text-destructive">{draftError}</p>}

              <button
                type="button"
                onClick={addMemberToList}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark"
              >
                <Plus className="h-4 w-4" /> Add to list
              </button>

              {/* pending list */}
              {memberList.length > 0 && (
                <div className="mt-5 rounded-xl border border-baba-blue/10 bg-baba-blue/5">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-sm font-bold text-baba-slate">
                      {memberList.length} person{memberList.length === 1 ? "" : "s"} on your list
                    </p>
                    <button
                      type="button"
                      onClick={() => setMemberList([])}
                      className="text-xs font-semibold text-baba-slate/50 hover:text-red-500"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="grid gap-1.5 border-t border-baba-blue/10 px-4 py-3">
                    {memberList.map((m, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-baba-slate">{m.name}</span>
                          <span className="block truncate text-xs text-baba-slate/60">
                            ID {m.national_id} · {m.phone}
                            {m.temporary_password ? " · custom password" : ""}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setMemberList((prev) => prev.filter((_, j) => j !== i))}
                          className="shrink-0 text-baba-slate/40 transition-colors hover:text-red-500"
                          aria-label={`Remove ${m.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* paste / upload — advanced option */}
              <button
                type="button"
                onClick={() => setShowPaste((v) => !v)}
                className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-baba-blue hover:underline"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showPaste ? "rotate-180" : ""}`} />
                Have a long list? Paste it instead
              </button>

              {showPaste && (
                <div className="mt-3 grid gap-3">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">Paste your list</span>
                    <textarea
                      rows={7}
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder={"Jane Wanjiru, 12345678, 0712345678\nJohn Otieno, 87654321, 0729876543"}
                      className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                    />
                    <span className="text-[0.7rem] text-baba-slate/50">
                      One person per line: <span className="font-semibold">Name, ID Number, Phone</span>. A file
                      works too (button below).
                    </span>
                  </label>

                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setFileName(f.name);
                      const reader = new FileReader();
                      reader.onload = () => setImportText(String(reader.result ?? ""));
                      reader.readAsText(f);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-baba-blue/20 px-4 py-2.5 text-sm font-semibold text-baba-slate transition-colors hover:bg-baba-blue/5"
                  >
                    <FileUp className="h-4 w-4" /> {fileName ? `Loaded: ${fileName}` : "…or upload a CSV / text file"}
                  </button>
                </div>
              )}

              {(importText.trim() || memberList.length > 0) && (
                <div className="mt-4 rounded-xl border border-baba-blue/10 bg-baba-blue/5 px-4 py-3 text-sm">
                  <span className="font-bold text-baba-blue">{rowsToImport.length}</span>{" "}
                  <span className="text-baba-slate/70">
                    person{rowsToImport.length === 1 ? "" : "s"} ready to register
                    {parsed.length > 0 && parsed.length !== importText.trim().split(/\r?\n/).filter(Boolean).length
                      ? " (some pasted lines are missing Name, ID or Phone)"
                      : ""}
                  </span>
                </div>
              )}

              {importProgress && (
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-baba-blue">
                  <Loader2 className="h-4 w-4 animate-spin" /> {importProgress}
                </p>
              )}

              {importResult && (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <p className="font-bold">Import finished</p>
                  <ul className="mt-1 grid gap-0.5 text-emerald-800">
                    <li>✅ {importResult.created} account{importResult.created === 1 ? "" : "s"} created ({importResult.profileComplete} complete profiles, {importResult.incomplete} need details at first login)</li>
                    {importResult.duplicates > 0 && <li>⏭️ {importResult.duplicates} skipped — already registered</li>}
                    {importResult.errors > 0 && (
                      <li>
                        ⚠️ {importResult.errors} error{importResult.errors === 1 ? "" : "s"}
                        {importResult.errorRows.slice(0, 10).map((e) => (
                          <span key={e.row} className="block pl-4 text-xs text-red-700">
                            Row {e.row}: {e.reason}
                          </span>
                        ))}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <button
                type="button"
                disabled={rowsToImport.length === 0 || importMutation.isPending}
                onClick={() => importMutation.mutate()}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg baba-cta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Registering…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Register {rowsToImport.length || ""} people
                  </>
                )}
              </button>
            </div>

            <div className="grid gap-4 self-start">
              {access?.canAddOtherAdmins && (
                <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
                  <h3 className="flex items-center gap-2 font-display text-base font-bold text-baba-slate">
                    <Plus className="h-4 w-4 text-baba-blue" /> Add a colleague
                  </h3>
                  <p className="mt-1 text-xs text-baba-slate/60">
                    They need an account first — add their email and they become an admin of your organisation.
                  </p>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="mt-3 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={!newAdminEmail.trim() || addAdminMutation.isPending}
                    onClick={() => addAdminMutation.mutate()}
                    className="mt-2 w-full rounded-lg bg-baba-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-baba-blue-dark disabled:opacity-60"
                  >
                    {addAdminMutation.isPending ? "Adding…" : "Add as partner admin"}
                  </button>
                  {newAdminMsg && <p className="mt-2 text-xs font-medium text-baba-blue">{newAdminMsg}</p>}
                </div>
              )}
              <div className="rounded-2xl border border-baba-blue/10 bg-card p-5 text-xs text-baba-slate/60">
                <p className="font-bold uppercase tracking-wide text-baba-slate/70">What you can see</p>
                <ul className="mt-2 grid gap-1">
                  <li>• Members registered under your organisation only</li>
                  <li>• Their registration &amp; verification status</li>
                  <li>• No revenue or payment data</li>
                  <li>• No other organisations' members</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function StatCard({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent?: "green" | "amber" | "blue" }) {
  const tone =
    accent === "green"
      ? "bg-green-100 text-green-700"
      : accent === "amber"
        ? "bg-amber-100 text-amber-700"
        : accent === "blue"
          ? "bg-baba-blue/10 text-baba-blue"
          : "bg-secondary text-baba-slate/70";
  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
      <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>{icon}</span>
      <p className="mt-3 font-display text-3xl font-extrabold text-baba-slate">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-baba-slate/60">{label}</p>
    </div>
  );
}
