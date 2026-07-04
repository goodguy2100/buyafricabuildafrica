import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Users, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import {
  listOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  listApplicants,
  type Opportunity,
} from "@/lib/admin.functions";
import { CONTAINER_LABELS } from "@/lib/roles";
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
import { LoadingBlock, ErrorBlock, EmptyState, StatusBadge } from "./shared";

const KINDS = [
  { key: "event", label: "Events" },
  { key: "job", label: "Jobs" },
  { key: "course", label: "Courses" },
] as const;

type Kind = (typeof KINDS)[number]["key"];

export function OpportunitiesSection() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listOpportunities);
  const deleteFn = useServerFn(deleteOpportunity);
  const updateFn = useServerFn(updateOpportunity);

  const [tab, setTab] = useState<Kind>("event");
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [creating, setCreating] = useState(false);
  const [applicantsFor, setApplicantsFor] = useState<Opportunity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);

  const q = useQuery({ queryKey: ["admin-opportunities"], queryFn: () => listFn() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-opportunities"] });
    queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Opportunity deleted");
      setDeleteTarget(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (v: { id: string; status?: Opportunity["status"]; completed?: boolean }) =>
      updateFn({ data: v }),
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = (q.data ?? []).filter((o) => o.kind === tab);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-baba-blue/15 bg-card p-1">
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => setTab(k.key)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                tab === k.key ? "baba-cta text-white" : "text-baba-slate/60"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> New opportunity
        </button>
      </div>

      {q.isLoading ? (
        <LoadingBlock />
      ) : q.isError ? (
        <ErrorBlock message={(q.error as Error).message} onRetry={() => q.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState>No {tab}s yet. Create your first one.</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((o) => {
            const past = o.event_date && new Date(o.event_date) < new Date();
            return (
              <div key={o.id} className="rounded-2xl border border-baba-blue/10 bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-baba-slate">{o.title}</h3>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-xs text-baba-slate/50">
                  {o.kind} · posted {new Date(o.created_at).toLocaleDateString()}
                </p>
                {o.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-baba-slate/70">{o.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {o.target_containers.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-baba-blue/10 px-2 py-0.5 text-xs text-baba-blue"
                    >
                      {CONTAINER_LABELS[c] ?? c}
                    </span>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-1 text-sm text-baba-slate/60">
                  <Users className="h-4 w-4" /> {o.applicants_count} applicants
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditing(o)}
                    className="flex items-center gap-1 rounded-lg border border-baba-blue/15 px-2.5 py-1.5 text-xs font-semibold text-baba-blue"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setApplicantsFor(o)}
                    className="flex items-center gap-1 rounded-lg border border-baba-blue/15 px-2.5 py-1.5 text-xs font-semibold text-baba-blue"
                  >
                    <Users className="h-3.5 w-3.5" /> Applicants
                  </button>
                  {o.status !== "closed" ? (
                    <button
                      onClick={() => statusMut.mutate({ id: o.id, status: "closed" })}
                      className="rounded-lg border border-baba-blue/15 px-2.5 py-1.5 text-xs font-semibold text-baba-slate/70"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      onClick={() => statusMut.mutate({ id: o.id, status: "open" })}
                      className="rounded-lg border border-baba-blue/15 px-2.5 py-1.5 text-xs font-semibold text-baba-slate/70"
                    >
                      Reopen
                    </button>
                  )}
                  {o.kind === "event" && past && !o.completed && (
                    <button
                      onClick={() => statusMut.mutate({ id: o.id, completed: true, status: "closed" })}
                      className="flex items-center gap-1 rounded-lg border border-green-300 px-2.5 py-1.5 text-xs font-semibold text-green-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark completed
                    </button>
                  )}
                  {o.kind === "event" && o.completed && (
                    <span className="rounded-lg bg-green-100 px-2.5 py-1.5 text-xs font-semibold text-green-700">
                      Completed · gallery ready
                    </span>
                  )}
                  <button
                    onClick={() => setDeleteTarget(o)}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <OpportunityForm
          initial={editing}
          defaultKind={tab}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            invalidate();
          }}
        />
      )}

      <ApplicantsDialog opportunity={applicantsFor} onClose={() => setApplicantsFor(null)} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the opportunity and its gallery media. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OpportunityForm({
  initial,
  defaultKind,
  onClose,
  onSaved,
}: {
  initial: Opportunity | null;
  defaultKind: Kind;
  onClose: () => void;
  onSaved: () => void;
}) {
  const createFn = useServerFn(createOpportunity);
  const updateFn = useServerFn(updateOpportunity);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [kind, setKind] = useState<Kind>((initial?.kind as Kind) ?? defaultKind);
  const [status, setStatus] = useState<Opportunity["status"]>(initial?.status ?? "draft");
  const [containers, setContainers] = useState<string[]>(initial?.target_containers ?? []);
  const [eventDate, setEventDate] = useState(initial?.event_date?.slice(0, 16) ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline?.slice(0, 10) ?? "");

  const mutation = useMutation({
    mutationFn: (publish: boolean) => {
      const payload = {
        title,
        description,
        kind,
        status: publish ? (status === "draft" ? "open" : status) : "draft",
        target_containers: containers,
        event_date: eventDate || null,
        location: location || null,
        deadline: deadline || null,
      } as const;
      return initial
        ? updateFn({ data: { id: initial.id, ...payload } })
        : createFn({ data: payload });
    },
    onSuccess: () => {
      toast.success(initial ? "Opportunity updated" : "Opportunity created");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleContainer = (c: string) =>
    setContainers((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit opportunity" : "New opportunity"}</DialogTitle>
          <DialogDescription>Target specific containers and publish or save as draft.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={setTitle} />
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-baba-slate/70">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={kind} onChange={(v) => setKind(v as Kind)} options={KINDS.map((k) => ({ value: k.key, label: k.label }))} />
            <Select
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as Opportunity["status"])}
              options={["draft", "open", "upcoming", "paused", "closed", "expired"].map((s) => ({ value: s, label: s }))}
            />
          </div>
          {kind === "event" && (
            <Input label="Event date/time" type="datetime-local" value={eventDate} onChange={setEventDate} />
          )}
          {(kind === "event" || kind === "job") && (
            <Input label="Location" value={location} onChange={setLocation} />
          )}
          <Input label="Application deadline" type="date" value={deadline} onChange={setDeadline} />

          <div>
            <span className="mb-1 block text-sm font-semibold text-baba-slate/70">
              Target containers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CONTAINER_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleContainer(key)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    containers.includes(key)
                      ? "baba-cta text-white"
                      : "border border-baba-blue/15 text-baba-slate/60"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-baba-blue/10 pt-4">
            <button
              disabled={!title || mutation.isPending}
              onClick={() => mutation.mutate(false)}
              className="rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue disabled:opacity-50"
            >
              Save as draft
            </button>
            <button
              disabled={!title || mutation.isPending}
              onClick={() => mutation.mutate(true)}
              className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ApplicantsDialog({
  opportunity,
  onClose,
}: {
  opportunity: Opportunity | null;
  onClose: () => void;
}) {
  const fn = useServerFn(listApplicants);
  const q = useQuery({
    queryKey: ["admin-applicants", opportunity?.title],
    queryFn: () => fn({ data: { title: opportunity!.title } }),
    enabled: !!opportunity,
  });

  return (
    <Dialog open={!!opportunity} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Applicants — {opportunity?.title}</DialogTitle>
          <DialogDescription>Everyone who applied to this opportunity.</DialogDescription>
        </DialogHeader>
        {q.isLoading ? (
          <LoadingBlock />
        ) : (q.data ?? []).length === 0 ? (
          <EmptyState>No applications yet.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {(q.data ?? []).map((a: any) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-baba-blue/10 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium text-baba-slate">
                    {a.applicant_name ?? a.applicant_email ?? "Applicant"}
                  </div>
                  <div className="text-xs text-baba-slate/50">
                    {new Date(a.created_at).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-baba-slate/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-baba-slate/70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm capitalize"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
