import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send, Eye } from "lucide-react";
import {
  listNotifications,
  sendNotification,
  createPopup,
  togglePopup,
  listContainers,
  type NotificationRow,
} from "@/lib/admin.functions";
import { CONTAINER_LABELS } from "@/lib/roles";
import { Switch } from "@/components/ui/switch";
import { LoadingBlock, EmptyState, StatusBadge } from "./shared";

const TABS = [
  { key: "send", label: "Send Notification" },
  { key: "history", label: "History" },
  { key: "popup", label: "Pop-up Manager" },
] as const;

export function NotificationsSection() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("send");
  return (
    <div>
      <div className="mb-5 inline-flex rounded-xl border border-baba-blue/15 bg-card p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              tab === t.key ? "baba-cta text-white" : "text-baba-slate/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "send" && <SendTab />}
      {tab === "history" && <HistoryTab />}
      {tab === "popup" && <PopupTab />}
    </div>
  );
}

function SendTab() {
  const queryClient = useQueryClient();
  const containersFn = useServerFn(listContainers);
  const sendFn = useServerFn(sendNotification);
  const containers = useQuery({ queryKey: ["admin-containers"], queryFn: () => containersFn() });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipientType, setRecipientType] = useState<"all" | "container" | "applicants">("all");
  const [container, setContainer] = useState("");
  const [messageType, setMessageType] = useState<"text" | "popup" | "email" | "all">("text");
  const [scheduleFor, setScheduleFor] = useState("");
  const [preview, setPreview] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      sendFn({
        data: {
          title,
          body,
          recipient_type: recipientType,
          recipient_container: recipientType === "container" ? container : null,
          message_type: messageType,
          scheduled_for: scheduleFor || null,
        },
      }),
    onSuccess: (row: NotificationRow) => {
      toast.success(
        row.status === "scheduled"
          ? `Scheduled for ${row.sent_count} members`
          : `Message sent to ${row.sent_count} members`,
      );
      setTitle("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-baba-blue/10 bg-card p-5">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Message">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Recipients">
          <select
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value as any)}
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          >
            <option value="all">All members</option>
            <option value="container">Specific container</option>
            <option value="applicants">Applicants of an opportunity</option>
          </select>
        </Field>
        {recipientType === "container" && (
          <Field label="Container">
            <select
              value={container}
              onChange={(e) => setContainer(e.target.value)}
              className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {(containers.data ?? []).map((c) => (
                <option key={c.container_id} value={c.container_type}>
                  {c.display_name} ({c.member_count})
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Message type">
          <select
            value={messageType}
            onChange={(e) => setMessageType(e.target.value as any)}
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          >
            <option value="text">Text announcement</option>
            <option value="popup">Pop-up alert</option>
            <option value="email">Email</option>
            <option value="all">All of the above</option>
          </select>
        </Field>
        <Field label="Schedule (leave empty to send now)">
          <input
            type="datetime-local"
            value={scheduleFor}
            onChange={(e) => setScheduleFor(e.target.value)}
            className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </Field>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          <button
            disabled={!title || (recipientType === "container" && !container) || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {scheduleFor ? "Schedule" : "Send now"}
          </button>
        </div>
      </div>

      {preview && (
        <div className="rounded-2xl border border-baba-blue/10 bg-baba-blue/5 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-baba-slate/50">
            Preview
          </p>
          <div className="rounded-xl border border-baba-blue/15 bg-card p-4 shadow-sm">
            <h4 className="font-display text-lg font-bold text-baba-slate">
              {title || "Notification title"}
            </h4>
            <p className="mt-1 text-sm text-baba-slate/70">{body || "Message body…"}</p>
            <p className="mt-3 text-xs text-baba-slate/40">
              To:{" "}
              {recipientType === "all"
                ? "All members"
                : recipientType === "container"
                  ? CONTAINER_LABELS[container] ?? "container"
                  : "Applicants"}{" "}
              · {messageType}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTab() {
  const fn = useServerFn(listNotifications);
  const q = useQuery({ queryKey: ["admin-notifications"], queryFn: () => fn() });
  if (q.isLoading) return <LoadingBlock />;
  const rows = (q.data ?? []).filter((n) => !n.is_popup || n.message_type !== "popup");
  if (rows.length === 0) return <EmptyState>No notifications sent yet.</EmptyState>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-baba-blue/10 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-baba-blue/10 text-left text-xs uppercase tracking-wide text-baba-slate/50">
            <th className="p-3">Date</th>
            <th className="p-3">Recipients</th>
            <th className="p-3">Message</th>
            <th className="p-3">Sent</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n.id} className="border-b border-baba-blue/5 last:border-0">
              <td className="p-3 text-baba-slate/70">
                {new Date(n.scheduled_for ?? n.created_at).toLocaleDateString()}
              </td>
              <td className="p-3 text-baba-slate/70">
                {n.recipient_type === "container"
                  ? CONTAINER_LABELS[n.recipient_container ?? ""] ?? n.recipient_container
                  : n.recipient_type === "all"
                    ? "All members"
                    : "Applicants"}
              </td>
              <td className="p-3">
                <span className="font-medium text-baba-slate">{n.title}</span>
              </td>
              <td className="p-3 text-baba-slate/70">{n.sent_count}</td>
              <td className="p-3">
                <StatusBadge status={n.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PopupTab() {
  const queryClient = useQueryClient();
  const containersFn = useServerFn(listContainers);
  const listFn = useServerFn(listNotifications);
  const createFn = useServerFn(createPopup);
  const toggleFn = useServerFn(togglePopup);

  const containers = useQuery({ queryKey: ["admin-containers"], queryFn: () => containersFn() });
  const q = useQuery({ queryKey: ["admin-notifications"], queryFn: () => listFn() });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [banner, setBanner] = useState("");
  const [link, setLink] = useState("");
  const [container, setContainer] = useState("");
  const [showFrom, setShowFrom] = useState("");
  const [showUntil, setShowUntil] = useState("");

  const createMut = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          title,
          body,
          banner_url: banner || null,
          link_url: link || null,
          recipient_container: container || null,
          active: true,
          show_from: showFrom || null,
          show_until: showUntil || null,
        },
      }),
    onSuccess: () => {
      toast.success("Pop-up created");
      setTitle("");
      setBody("");
      setBanner("");
      setLink("");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMut = useMutation({
    mutationFn: (v: { id: string; active: boolean }) => toggleFn({ data: v }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const popups = (q.data ?? []).filter((n) => n.is_popup);
  const active = popups.filter((p) => p.active);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-baba-blue/10 bg-card p-5">
        <h3 className="font-display text-lg font-bold text-baba-slate">Create pop-up</h3>
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm" />
        </Field>
        <Field label="Banner image URL">
          <input value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="https://…" className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm" />
        </Field>
        <Field label="Body text">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm" />
        </Field>
        <Field label="Link (optional)">
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm" />
        </Field>
        <Field label="Show to container (empty = everyone)">
          <select value={container} onChange={(e) => setContainer(e.target.value)} className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm">
            <option value="">Everyone</option>
            {(containers.data ?? []).map((c) => (
              <option key={c.container_id} value={c.container_type}>{c.display_name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Show from">
            <input type="date" value={showFrom} onChange={(e) => setShowFrom(e.target.value)} className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm" />
          </Field>
          <Field label="Show until">
            <input type="date" value={showUntil} onChange={(e) => setShowUntil(e.target.value)} className="w-full rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm" />
          </Field>
        </div>
        <button
          disabled={!title || createMut.isPending}
          onClick={() => createMut.mutate()}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Create pop-up
        </button>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-baba-slate/50">
            Preview
          </p>
          <div className="rounded-xl border border-baba-blue/15 bg-card p-4 shadow-sm">
            {banner && (
              <img src={banner} alt="banner" className="mb-3 h-28 w-full rounded-lg object-cover" />
            )}
            <h4 className="font-display text-lg font-bold text-baba-slate">{title || "Pop-up title"}</h4>
            <p className="mt-1 text-sm text-baba-slate/70">{body || "Pop-up body…"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
          <h3 className="mb-3 font-display text-lg font-bold text-baba-slate">
            Active pop-ups ({active.length})
          </h3>
          {popups.length === 0 ? (
            <EmptyState>No pop-ups yet.</EmptyState>
          ) : (
            <ul className="space-y-2">
              {popups.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-baba-blue/10 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-baba-slate">{p.title}</div>
                    <div className="text-xs text-baba-slate/50">
                      {p.recipient_container
                        ? CONTAINER_LABELS[p.recipient_container] ?? p.recipient_container
                        : "Everyone"}
                    </div>
                  </div>
                  <Switch
                    checked={p.active}
                    onCheckedChange={(v) => toggleMut.mutate({ id: p.id, active: v })}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-baba-slate/70">{label}</span>
      {children}
    </label>
  );
}
