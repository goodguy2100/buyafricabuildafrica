import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, ShieldCheck, ShieldOff, ChevronDown, ChevronUp } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import {
  listAllRegistrations,
  setRegistrationVerified,
  getIsAdmin,
  type AdminRegistrationRow,
} from "@/lib/registrations.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Admin — Registrations | BABA" }],
  }),
  component: AdminPage,
  errorComponent: AdminError,
});

function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <PageShell>
      <section className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold text-baba-blue">Access problem</h1>
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

function AdminPage() {
  const isAdminFn = useServerFn(getIsAdmin);
  const listFn = useServerFn(listAllRegistrations);
  const verifyFn = useServerFn(setRegistrationVerified);
  const queryClient = useQueryClient();

  const adminQuery = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const regsQuery = useQuery({
    queryKey: ["all-registrations"],
    queryFn: () => listFn(),
    enabled: adminQuery.data === true,
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; verified: boolean }) => verifyFn({ data: vars }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-registrations"] }),
  });

  if (adminQuery.isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  if (adminQuery.data !== true) {
    return (
      <PageShell>
        <section className="mx-auto max-w-lg px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold text-baba-blue">Admins only</h1>
          <p className="mt-2 text-baba-slate/70">
            Your account doesn't have admin access to this page.
          </p>
          <Link to="/" className="mt-6 inline-block rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white">
            Go home
          </Link>
        </section>
      </PageShell>
    );
  }

  const rows = regsQuery.data ?? [];
  const verifiedCount = rows.filter((r) => r.verified).length;

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-baba-blue">Registrations</h1>
            <p className="mt-1 text-baba-slate/70">
              Review submissions, view account details and manage verification.
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="rounded-xl border border-baba-blue/10 bg-card px-4 py-2 text-center">
              <div className="font-display text-xl font-extrabold text-baba-blue">{rows.length}</div>
              <div className="text-xs text-baba-slate/60">Total</div>
            </div>
            <div className="rounded-xl border border-baba-blue/10 bg-card px-4 py-2 text-center">
              <div className="font-display text-xl font-extrabold text-baba-copper-dark">{verifiedCount}</div>
              <div className="text-xs text-baba-slate/60">Verified</div>
            </div>
          </div>
        </div>

        {regsQuery.isLoading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-baba-blue/20 p-8 text-center text-baba-slate/60">
            No registration submissions yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-4">
            {rows.map((row) => (
              <RegistrationCard
                key={row.id}
                row={row}
                pending={mutation.isPending && mutation.variables?.id === row.id}
                onToggle={() => mutation.mutate({ id: row.id, verified: !row.verified })}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function RegistrationCard({
  row,
  pending,
  onToggle,
}: {
  row: AdminRegistrationRow;
  pending: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const data = (row.data ?? {}) as Record<string, unknown>;
  const displayName =
    (data.fullName as string) ||
    (data.organizationName as string) ||
    row.full_name ||
    row.email ||
    "Unnamed";

  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-bold text-baba-slate">{displayName}</h3>
            <span className="rounded-full bg-baba-blue/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-baba-blue">
              {row.role}
            </span>
            {row.verified ? (
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700">
                Verified
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                Unverified
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-baba-slate/60">
            {row.email ?? "no email"} · {new Date(row.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            disabled={pending}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
              row.verified
                ? "border-2 border-baba-slate/20 text-baba-slate"
                : "baba-cta text-white"
            }`}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : row.verified ? (
              <ShieldOff className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {row.verified ? "Unverify" : "Verify"}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 rounded-lg border-2 border-baba-blue/15 px-3 py-2 text-sm font-semibold text-baba-blue"
          >
            Details {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-baba-blue/10 pt-4 sm:grid-cols-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="text-sm">
              <dt className="text-xs font-bold uppercase tracking-wide text-baba-slate/50">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
              </dt>
              <dd className="text-baba-slate">
                {Array.isArray(value)
                  ? value.join(", ")
                  : value === "" || value == null
                    ? "—"
                    : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
