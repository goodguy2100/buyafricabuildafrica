import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Download, CheckCircle2, Send, Users } from "lucide-react";
import {
  listContainers,
  listMembers,
  updateMembers,
  getMemberDetail,
  type MemberRow,
} from "@/lib/admin.functions";
type MemberUpdateVars = {
  ids: string[];
  status?: "pending" | "approved" | "rejected";
  verified?: boolean;
  verification_fee_paid?: boolean;
};
import { CONTAINER_LABELS, feeForRole, formatKsh } from "@/lib/roles";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LoadingBlock,
  ErrorBlock,
  EmptyState,
  StatusBadge,
  Check,
  exportCsv,
} from "./shared";

export function MembersSection() {
  const queryClient = useQueryClient();
  const containersFn = useServerFn(listContainers);
  const membersFn = useServerFn(listMembers);
  const updateFn = useServerFn(updateMembers);

  const [container, setContainer] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);

  const containersQuery = useQuery({
    queryKey: ["admin-containers"],
    queryFn: () => containersFn(),
  });
  const membersQuery = useQuery({
    queryKey: ["admin-members", container],
    queryFn: () => membersFn({ data: container ? { container_type: container } : {} }),
  });

  const mutation = useMutation({
    mutationFn: (vars: MemberUpdateVars) => updateFn({ data: vars }),
    onSuccess: (_res, vars) => {
      toast.success(`Updated ${vars.ids.length} member(s)`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const members = membersQuery.data ?? [];

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleAll = () =>
    setSelected((s) =>
      s.size === members.length ? new Set() : new Set(members.map((m) => m.id)),
    );

  const doExport = () => {
    exportCsv(
      `members-${container ?? "all"}.csv`,
      (selected.size ? members.filter((m) => selected.has(m.id)) : members).map((m) => ({
        Name: m.full_name ?? "",
        Email: m.email ?? "",
        Phone: m.phone ?? "",
        Role: m.user_role ?? m.role,
        Container: m.container_type ? CONTAINER_LABELS[m.container_type] : "",
        Joined: new Date(m.created_at).toLocaleDateString(),
        Verified: m.verified ? "Yes" : "No",
        FeePaid: m.verification_fee_paid ? "Yes" : "No",
        Status: m.status,
      })),
    );
    toast.success("CSV exported");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* container sidebar */}
      <aside className="rounded-2xl border border-baba-blue/10 bg-card p-3">
        <button
          onClick={() => setContainer(null)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium ${
            container === null ? "bg-baba-blue/10 text-baba-blue" : "text-baba-slate/70"
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" /> All members
          </span>
        </button>
        <div className="mt-1 space-y-0.5">
          {(containersQuery.data ?? []).map((c) => (
            <button
              key={c.container_id}
              onClick={() => setContainer(c.container_type)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium ${
                container === c.container_type
                  ? "bg-baba-blue/10 text-baba-blue"
                  : "text-baba-slate/70 hover:bg-baba-blue/5"
              }`}
            >
              <span>{c.display_name}</span>
              <span className="rounded-full bg-baba-blue/10 px-2 text-xs font-bold text-baba-blue">
                {c.member_count}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* main */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold text-baba-blue">
            {container ? CONTAINER_LABELS[container] : "All members"}
            <span className="ml-2 text-sm font-normal text-baba-slate/50">
              ({members.length})
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={selected.size === 0 || mutation.isPending}
              onClick={() => setConfirmApprove(true)}
              className="flex items-center gap-1.5 rounded-lg baba-cta px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve Selected
            </button>
            <button
              disabled={selected.size === 0}
              onClick={() =>
                toast.info("Open the Notifications tab to message this container in bulk.")
              }
              className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/15 px-3 py-2 text-sm font-semibold text-baba-blue disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> Message
            </button>
            <button
              onClick={doExport}
              className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/15 px-3 py-2 text-sm font-semibold text-baba-blue"
            >
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        {membersQuery.isLoading ? (
          <LoadingBlock />
        ) : membersQuery.isError ? (
          <ErrorBlock
            message={(membersQuery.error as Error).message}
            onRetry={() => membersQuery.refetch()}
          />
        ) : members.length === 0 ? (
          <EmptyState>No members in this group yet.</EmptyState>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-baba-blue/10 bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-baba-blue/10 text-left text-xs uppercase tracking-wide text-baba-slate/50">
                  <th className="p-3">
                    <Checkbox
                      checked={selected.size === members.length && members.length > 0}
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-center">Verified</th>
                  <th className="p-3 text-center">Fee</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className="cursor-pointer border-b border-baba-blue/5 last:border-0 hover:bg-baba-blue/5"
                    onClick={() => setDetailId(m.id)}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(m.id)}
                        onCheckedChange={() => toggle(m.id)}
                      />
                    </td>
                    <td className="p-3 font-medium text-baba-slate">
                      {m.full_name ?? "—"}
                    </td>
                    <td className="p-3 text-baba-slate/70">{m.email ?? "—"}</td>
                    <td className="p-3 text-baba-slate/70">{m.phone ?? "—"}</td>
                    <td className="p-3 text-baba-slate/70">{m.user_role ?? m.role}</td>
                    <td className="p-3 text-baba-slate/70">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <Check ok={m.verified} />
                    </td>
                    <td className="p-3 text-center">
                      <Check ok={m.verification_fee_paid} />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MemberDetailDialog
        id={detailId}
        onClose={() => setDetailId(null)}
        onUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-members"] });
          queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
        }}
      />

      <AlertDialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve {selected.size} member(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the selected members as approved. You can change it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                mutation.mutate({ ids: [...selected], status: "approved" })
              }
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MemberDetailDialog({
  id,
  onClose,
  onUpdated,
}: {
  id: string | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const detailFn = useServerFn(getMemberDetail);
  const updateFn = useServerFn(updateMembers);
  const q = useQuery({
    queryKey: ["admin-member", id],
    queryFn: () => detailFn({ data: { id: id! } }),
    enabled: !!id,
  });
  const mutation = useMutation({
    mutationFn: (vars: MemberUpdateVars) => updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Member updated");
      q.refetch();
      onUpdated();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const m: MemberRow | undefined = q.data?.member;

  return (
    <Dialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{m?.full_name ?? "Member profile"}</DialogTitle>
          <DialogDescription>{m?.email ?? ""}</DialogDescription>
        </DialogHeader>
        {q.isLoading || !m ? (
          <LoadingBlock />
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Field label="Phone" value={m.phone} />
              <Field label="National ID" value={m.national_id} />
              <Field label="Location" value={m.location} />
              <Field label="Role" value={m.user_role ?? m.role} />
              <Field label="Occupation" value={m.occupation} />
              <Field label="Education" value={m.education_level} />
              <Field label="Field of study" value={m.field_of_study} />
              <Field label="Institution" value={m.institution_name} />
              <Field label="Years experience" value={m.years_experience} />
              <Field label="Employment" value={m.employment_status} />
              <Field label="Interests" value={m.industries.join(", ")} />
              <Field label="Looking for" value={m.looking_for.join(", ")} />
            </div>

            <div className="rounded-xl border border-baba-blue/10 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-baba-slate">Payment</span>
                <StatusBadge status={m.verification_fee_paid ? "delivered" : "pending"} />
              </div>
              <p className="mt-1 text-baba-slate/60">
                Fee: {formatKsh(feeForRole(m.user_role ?? m.role))} ·{" "}
                {m.verification_fee_paid ? "Paid" : "Not paid"}
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-baba-slate">Application history</h4>
              {(q.data?.applications ?? []).length === 0 ? (
                <p className="text-sm text-baba-slate/50">No applications yet.</p>
              ) : (
                <ul className="space-y-2">
                  {q.data!.applications.map((a: any) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-baba-blue/10 px-3 py-2 text-sm"
                    >
                      <span className="text-baba-slate">
                        {a.opportunity_title}{" "}
                        <span className="text-baba-slate/40">({a.opportunity_kind})</span>
                      </span>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-baba-blue/10 pt-4">
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ ids: [m.id], status: "approved" })}
                className="rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Approve
              </button>
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ ids: [m.id], status: "rejected" })}
                className="rounded-lg border-2 border-red-300 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ ids: [m.id], verified: !m.verified })}
                className="rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue disabled:opacity-50"
              >
                {m.verified ? "Unverify" : "Verify"}
              </button>
              <button
                disabled={mutation.isPending}
                onClick={() =>
                  mutation.mutate({ ids: [m.id], verification_fee_paid: !m.verification_fee_paid })
                }
                className="rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue disabled:opacity-50"
              >
                Mark fee {m.verification_fee_paid ? "unpaid" : "paid"}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-baba-slate/40">{label}</dt>
      <dd className="text-baba-slate">{value && value !== "" ? value : "—"}</dd>
    </div>
  );
}
