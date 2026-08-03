import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, KeyRound, Check, Search, Copy } from "lucide-react";
import {
  listSupportRequests,
  updateSupportRequest,
  findMemberForReset,
  adminResetMemberPassword,
  type SupportRequest,
  type MemberMatch,
} from "@/lib/admin.functions";
import { LoadingBlock, EmptyState, SectionHeading } from "./shared";

const FILTERS = [
  { key: "password", label: "Password help" },
  { key: "open", label: "Open" },
  { key: "all", label: "All messages" },
] as const;

export function SupportSection() {
  const listFn = useServerFn(listSupportRequests);
  const q = useQuery({ queryKey: ["support-requests"], queryFn: () => listFn() });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("password");
  const [resetFor, setResetFor] = useState<SupportRequest | null>(null);

  const rows = useMemo(() => {
    const all = q.data ?? [];
    if (filter === "password") return all.filter((r) => r.query_type === "password_reset");
    if (filter === "open") return all.filter((r) => r.status !== "resolved");
    return all;
  }, [q.data, filter]);

  return (
    <div>
      <SectionHeading
        title="Support & password help"
        subtitle="Members who asked for help getting back into their account, plus every contact message."
      />

      <div className="mb-5 inline-flex rounded-xl border border-baba-blue/15 bg-card p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              filter === f.key ? "baba-cta text-white" : "text-baba-slate/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {q.isLoading ? (
        <LoadingBlock />
      ) : rows.length === 0 ? (
        <EmptyState>Nothing here right now.</EmptyState>
      ) : (
        <div className="grid gap-3">
          {rows.map((r) => (
            <RequestCard key={r.id} r={r} onReset={() => setResetFor(r)} />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-baba-blue/10 bg-card p-5">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-baba-blue">
          <KeyRound className="h-5 w-5" /> Reset a member's password
        </h3>
        <p className="mt-1 text-sm text-baba-slate/60">
          Search by name, ID number or phone, then set a new password and read it out to them.
        </p>
        <ResetTool prefill={resetFor} />
      </div>
    </div>
  );
}

function RequestCard({ r, onReset }: { r: SupportRequest; onReset: () => void }) {
  const queryClient = useQueryClient();
  const updateFn = useServerFn(updateSupportRequest);
  const mut = useMutation({
    mutationFn: (status: "new" | "in_progress" | "resolved") =>
      updateFn({ data: { id: r.id, status } }),
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["support-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isPasswordHelp = r.query_type === "password_reset";

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-baba-slate">
            {r.name}
            {isPasswordHelp && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                Password help
              </span>
            )}
            {r.status === "resolved" && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Resolved
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-baba-slate/50">
            {new Date(r.created_at).toLocaleString()}
            {r.phone ? ` · ${r.phone}` : ""}
            {r.email && !r.email.endsWith("@baba.local") ? ` · ${r.email}` : ""}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-baba-slate/80">{r.message}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPasswordHelp && (
            <button
              onClick={onReset}
              className="rounded-lg baba-cta px-3 py-2 text-xs font-semibold text-white"
            >
              Help them reset
            </button>
          )}
          {r.status !== "resolved" && (
            <button
              disabled={mut.isPending}
              onClick={() => mut.mutate("resolved")}
              className="flex items-center gap-1 rounded-lg border border-baba-blue/20 px-3 py-2 text-xs font-semibold text-baba-slate/70"
            >
              <Check className="h-3.5 w-3.5" /> Mark resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResetTool({ prefill }: { prefill: SupportRequest | null }) {
  const searchFn = useServerFn(findMemberForReset);
  const resetFn = useServerFn(adminResetMemberPassword);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<MemberMatch[] | null>(null);
  const [issued, setIssued] = useState<{ name: string; password: string } | null>(null);
  const [customPw, setCustomPw] = useState("");

  const effectiveTerm = term || prefill?.name || "";

  const searchMut = useMutation({
    mutationFn: () => searchFn({ data: { q: effectiveTerm.trim() } }),
    onSuccess: (rows) => {
      setResults(rows);
      if (rows.length === 0) toast.info("No member matched that search.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMut = useMutation({
    mutationFn: (m: MemberMatch) =>
      resetFn({
        data: {
          user_id: m.user_id,
          ...(customPw.trim().length >= 8 ? { new_password: customPw.trim() } : {}),
          ...(prefill ? { request_id: prefill.id } : {}),
        },
      }),
    onSuccess: (res, m) => {
      setIssued({ name: m.full_name ?? "Member", password: res.password });
      toast.success("New password set");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">
            Name, ID number or phone
          </span>
          <input
            value={effectiveTerm}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Jane Wanjiru"
            className="w-64 rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">
            New password (optional)
          </span>
          <input
            value={customPw}
            onChange={(e) => setCustomPw(e.target.value)}
            placeholder="Leave blank to auto-generate"
            className="w-60 rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <button
          disabled={effectiveTerm.trim().length < 2 || searchMut.isPending}
          onClick={() => searchMut.mutate()}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {searchMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Find member
        </button>
      </div>

      {issued && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">New password for {issued.name}</p>
          <p className="mt-1 flex items-center gap-2">
            <code className="rounded bg-white px-2 py-1 font-mono text-base">{issued.password}</code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(issued.password);
                toast.success("Copied");
              }}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-800"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
          </p>
          <p className="mt-2 text-xs">
            Read this out or text it to them, and ask them to change it in their dashboard after
            logging in.
          </p>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="mt-4 grid gap-2">
          {results.map((m) => (
            <div
              key={m.user_id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-baba-blue/10 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-baba-slate">{m.full_name || "—"}</p>
                <p className="text-xs text-baba-slate/50">
                  ID: {m.national_id || "—"} · {m.phone || "no phone"}
                </p>
              </div>
              <button
                disabled={resetMut.isPending}
                onClick={() => resetMut.mutate(m)}
                className="rounded-lg baba-cta px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {resetMut.isPending ? "Setting…" : "Set new password"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
