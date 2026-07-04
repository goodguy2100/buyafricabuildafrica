import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2, Download } from "lucide-react";
import {
  listAdmins,
  addAdminByEmail,
  removeAdmin,
  listMembers,
  listTransactions,
  listOpportunities,
} from "@/lib/admin.functions";
import { LoadingBlock, EmptyState, exportCsv, SectionHeading } from "./shared";

export function SettingsSection() {
  return (
    <div className="space-y-8">
      <PlatformSettings />
      <AdminManagement />
      <DataExport />
    </div>
  );
}

function PlatformSettings() {
  return (
    <section className="rounded-2xl border border-baba-blue/10 bg-card p-5">
      <SectionHeading title="Platform" subtitle="Basic identity and future integrations" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-baba-slate/70">Platform name</span>
          <input
            defaultValue="Buy Africa Build Africa (BABA)"
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-baba-slate/70">Logo URL</span>
          <input
            placeholder="https://…"
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-baba-blue/20 p-4 text-sm text-baba-slate/60">
        <p className="font-semibold text-baba-slate">Payment settings</p>
        <p>Payment gateway configuration will be added here when payments go live.</p>
      </div>
    </section>
  );
}

function AdminManagement() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listAdmins);
  const addFn = useServerFn(addAdminByEmail);
  const removeFn = useServerFn(removeAdmin);

  const q = useQuery({ queryKey: ["admin-admins"], queryFn: () => listFn() });
  const [email, setEmail] = useState("");

  const addMut = useMutation({
    mutationFn: () => addFn({ data: { email } }),
    onSuccess: () => {
      toast.success("Admin added");
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (user_id: string) => removeFn({ data: { user_id } }),
    onSuccess: () => {
      toast.success("Admin removed");
      queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-2xl border border-baba-blue/10 bg-card p-5">
      <SectionHeading title="Admin users" subtitle="Add or remove admins by email" />
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-baba-slate/70">Member email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="w-64 rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <button
          disabled={!email || addMut.isPending}
          onClick={() => addMut.mutate()}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {addMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Add admin
        </button>
      </div>
      {q.isLoading ? (
        <LoadingBlock />
      ) : (q.data ?? []).length === 0 ? (
        <EmptyState>No admins found.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {(q.data ?? []).map((a: { user_id: string; email: string | null; full_name: string | null }) => (
            <li
              key={a.user_id}
              className="flex items-center justify-between rounded-lg border border-baba-blue/10 px-3 py-2 text-sm"
            >
              <span className="text-baba-slate">{a.full_name ?? a.email ?? a.user_id}</span>
              <button
                onClick={() => removeMut.mutate(a.user_id)}
                className="flex items-center gap-1 text-xs font-semibold text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DataExport() {
  const membersFn = useServerFn(listMembers);
  const txnsFn = useServerFn(listTransactions);
  const oppsFn = useServerFn(listOpportunities);
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (kind: "members" | "transactions" | "opportunities") => {
    setBusy(kind);
    try {
      if (kind === "members") {
        const rows = await membersFn({ data: {} });
        exportCsv("all-members.csv", rows as unknown as Record<string, unknown>[]);
      } else if (kind === "transactions") {
        const rows = await txnsFn();
        exportCsv("all-transactions.csv", rows as unknown as Record<string, unknown>[]);
      } else {
        const rows = await oppsFn();
        exportCsv("all-opportunities.csv", rows as unknown as Record<string, unknown>[]);
      }
      toast.success("Export ready");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rounded-2xl border border-baba-blue/10 bg-card p-5">
      <SectionHeading title="Data export" subtitle="Download full CSV snapshots" />
      <div className="flex flex-wrap gap-2">
        {(["members", "transactions", "opportunities"] as const).map((k) => (
          <button
            key={k}
            disabled={busy === k}
            onClick={() => run(k)}
            className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold capitalize text-baba-blue disabled:opacity-50"
          >
            {busy === k ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export {k}
          </button>
        ))}
      </div>
    </section>
  );
}
