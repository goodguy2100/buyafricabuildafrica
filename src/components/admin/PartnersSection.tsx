import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Building2,
  Plus,
  Trash2,
  UserPlus,
  ShieldCheck,
  Users,
  FileUp,
  Pencil,
} from "lucide-react";
import {
  listPartnerOrgs,
  createPartnerOrg,
  renamePartnerOrg,
  listPartnerAdmins,
  addPartnerAdmin,
  removePartnerAdmin,
  setPartnerAdminPermissions,
  listPartnerUsers,
  bulkImportRegistrations,
  type ImportRow,
  type BulkImportResult,
} from "@/lib/partner.functions";

export function PartnersSection() {
  const queryClient = useQueryClient();
  const orgsFn = useServerFn(listPartnerOrgs);
  const adminsFn = useServerFn(listPartnerAdmins);

  const orgsQuery = useQuery({ queryKey: ["partner-orgs"], queryFn: () => orgsFn() });
  const adminsQuery = useQuery({ queryKey: ["partner-admins"], queryFn: () => adminsFn() });

  const [newOrgName, setNewOrgName] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [msg, setMsg] = useState("");

  const orgs = orgsQuery.data ?? [];
  const admins = adminsQuery.data ?? [];
  const selectedOrg = orgs.find((o) => o.id === selectedOrgId) ?? null;
  const selectedOrgAdmins = admins.filter((a) => a.partner_org_id === selectedOrgId);

  const createOrg = useMutation({
    mutationFn: () => createPartnerOrg({ data: { org_name: newOrgName.trim() } }),
    onSuccess: (org: any) => {
      setNewOrgName("");
      setSelectedOrgId(org.id);
      queryClient.invalidateQueries({ queryKey: ["partner-orgs"] });
      setMsg("Organisation created.");
    },
    onError: (err) => setMsg(err instanceof Error ? err.message : "Could not create organisation."),
  });

  const renameOrg = useMutation({
    mutationFn: () => renamePartnerOrg({ data: { org_id: editingOrgId!, org_name: editingName.trim() } }),
    onSuccess: () => {
      setEditingOrgId(null);
      queryClient.invalidateQueries({ queryKey: ["partner-orgs"] });
    },
    onError: (err) => setMsg(err instanceof Error ? err.message : "Could not rename."),
  });

  const addAdmin = useMutation({
    mutationFn: () =>
      addPartnerAdmin({
        data: { email: newAdminEmail.trim(), partner_org_id: selectedOrgId!, can_add_other_admins: false },
      }),
    onSuccess: () => {
      setNewAdminEmail("");
      queryClient.invalidateQueries({ queryKey: ["partner-admins"] });
      setMsg("Partner admin added.");
    },
    onError: (err) => setMsg(err instanceof Error ? err.message : "Could not add partner admin."),
  });

  const removeAdmin = useMutation({
    mutationFn: (userId: string) => removePartnerAdmin({ data: { user_id: userId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-admins"] }),
    onError: (err) => setMsg(err instanceof Error ? err.message : "Could not remove."),
  });

  const togglePerm = useMutation({
    mutationFn: ({ userId, value }: { userId: string; value: boolean }) =>
      setPartnerAdminPermissions({ data: { user_id: userId, can_add_other_admins: value } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["partner-admins"] }),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* LEFT: orgs */}
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-baba-slate">
          <Building2 className="h-5 w-5 text-baba-blue" /> Partner organisations
        </h2>
        <p className="mt-1 text-sm text-baba-slate/60">
          Each partner org has its own admins and registered members. Members can only ever see their own org.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organisation name"
            className="flex-1 rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
          />
          <button
            onClick={() => createOrg.mutate()}
            disabled={!newOrgName.trim() || createOrg.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        <div className="mt-4 grid gap-2">
          {orgsQuery.isLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin text-baba-blue" />}
          {orgs.length === 0 && !orgsQuery.isLoading && (
            <p className="py-6 text-center text-sm text-baba-slate/60">No partner organisations yet.</p>
          )}
          {orgs.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelectedOrgId(o.id)}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selectedOrgId === o.id
                  ? "border-baba-blue bg-baba-blue/5"
                  : "border-baba-blue/10 hover:border-baba-blue/40"
              }`}
            >
              <span>
                <span className="block text-sm font-bold text-baba-slate">{o.org_name}</span>
                <span className="block text-xs text-baba-slate/60">
                  {o.member_count} member{o.member_count === 1 ? "" : "s"} · {o.admin_count} admin{o.admin_count === 1 ? "" : "s"}
                </span>
              </span>
              <Pencil
                className="h-4 w-4 shrink-0 text-baba-slate/40"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingOrgId(o.id);
                  setEditingName(o.org_name);
                }}
              />
            </button>
          ))}
        </div>

        {editingOrgId && (
          <div className="mt-3 flex gap-2 rounded-xl border border-baba-blue/15 bg-baba-blue/5 p-3">
            <input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm focus:border-baba-blue focus:outline-none"
            />
            <button
              onClick={() => renameOrg.mutate()}
              className="rounded-lg baba-cta px-3 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
            <button
              onClick={() => setEditingOrgId(null)}
              className="rounded-lg border border-baba-blue/20 px-3 py-2 text-sm font-semibold text-baba-slate/70"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: selected org management */}
      <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
        {!selectedOrg ? (
          <p className="py-10 text-center text-sm text-baba-slate/60">
            Pick an organisation to manage its admins and import its list.
          </p>
        ) : (
          <>
            <h2 className="font-display text-lg font-bold text-baba-slate">{selectedOrg.org_name}</h2>

            {/* admins */}
            <h3 className="mt-4 text-xs font-bold uppercase tracking-wide text-baba-slate/70">Partner admins</h3>
            <div className="mt-2 grid gap-2">
              {selectedOrgAdmins.length === 0 && (
                <p className="text-sm text-baba-slate/60">No admins yet — add the partner's contact below.</p>
              )}
              {selectedOrgAdmins.map((a) => (
                <div key={a.user_id} className="flex items-center justify-between gap-3 rounded-xl border border-baba-blue/10 px-3.5 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-baba-slate">
                      {a.full_name ?? a.email ?? "Member"}
                    </span>
                    <span className="block truncate text-xs text-baba-slate/60">{a.email}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-baba-slate/70">
                      <input
                        type="checkbox"
                        checked={a.can_add_other_admins}
                        onChange={(e) => togglePerm.mutate({ userId: a.user_id, value: e.target.checked })}
                        className="h-3.5 w-3.5 accent-baba-blue"
                      />
                      add admins
                    </label>
                    <button
                      onClick={() => removeAdmin.mutate(a.user_id)}
                      className="text-baba-slate/40 transition-colors hover:text-red-500"
                      aria-label={`Remove ${a.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="admin email (they must have an account)"
                className="flex-1 rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
              />
              <button
                onClick={() => addAdmin.mutate()}
                disabled={!newAdminEmail.trim() || !selectedOrgId || addAdmin.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-baba-blue px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" /> Add
              </button>
            </div>

            {/* bulk import for this org */}
            <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-baba-slate/70">
              Bulk import for {selectedOrg.org_name}
            </h3>
            <textarea
              rows={5}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={"Jane Wanjiru, 12345678, 0712345678, Plumber, Certificate, Employed\nJohn Otieno, 87654321, 0729876543"}
              className="mt-2 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
            />
            <p className="mt-1 text-[0.7rem] text-baba-slate/50">
              One per line: Name, ID Number, Phone — optional: occupation, education, employment.
            </p>
            <button
              onClick={async () => {
                const rows: ImportRow[] = importText
                  .split(/\r?\n/)
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const p = line.split(/[,\t|]+|\s{2,}/).map((x) => x.trim()).filter(Boolean);
                    return {
                      name: p[0] ?? "",
                      national_id: p[1] ?? "",
                      phone: p[2] ?? "",
                      occupation: p[3] || undefined,
                      education_level: p[4] || undefined,
                      employment_status: p[5] || undefined,
                    };
                  })
                  .filter((r) => r.name && r.national_id && r.phone);
                if (rows.length === 0) return setMsg("No valid rows found.");
                setMsg("");
                const res = await bulkImportRegistrations({
                  data: { rows, partner_org_id: selectedOrgId! },
                });
                setImportResult(res);
                setImportText("");
                queryClient.invalidateQueries({ queryKey: ["partner-orgs"] });
              }}
              className="mt-3 inline-flex items-center gap-2 rounded-lg baba-cta px-5 py-2.5 text-sm font-semibold text-white"
            >
              <FileUp className="h-4 w-4" /> Import {importText.trim() ? "list" : "people"}
            </button>

            {importResult && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                <p className="font-bold">Result</p>
                <p className="mt-0.5">
                  ✅ {importResult.created} created · ⏭️ {importResult.duplicates} duplicates · ⚠️ {importResult.errors} errors
                  <span className="block text-xs">
                    {importResult.profileComplete} complete profiles, {importResult.incomplete} need details at first login
                  </span>
                </p>
                {importResult.errorRows.slice(0, 5).map((e) => (
                  <span key={e.row} className="block text-xs text-red-700">
                    Row {e.row}: {e.reason}
                  </span>
                ))}
              </div>
            )}

            {msg && <p className="mt-3 text-sm font-medium text-baba-blue">{msg}</p>}
          </>
        )}
      </div>
    </div>
  );
}
