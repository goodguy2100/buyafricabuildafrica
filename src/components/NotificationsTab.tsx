import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";
import {
  listMyNotifications,
  markNotificationsRead,
  type MyNotification,
} from "@/lib/notifications.functions";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationsTab() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listMyNotifications);
  const markFn = useServerFn(markNotificationsRead);

  const q = useQuery({ queryKey: ["my-notifications"], queryFn: () => listFn() });
  const mark = useMutation({
    mutationFn: (ids: string[]) => markFn({ data: { ids } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  const items: MyNotification[] = q.data ?? [];
  const unread = items.filter((n) => !n.read_at);

  if (q.isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-baba-blue" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-baba-blue">Notifications</h2>
        {unread.length > 0 && (
          <button
            onClick={() => mark.mutate(unread.map((n) => n.id))}
            className="flex items-center gap-1.5 rounded-lg border-2 border-baba-blue/15 px-3 py-1.5 text-xs font-semibold text-baba-blue"
          >
            <Check className="h-3.5 w-3.5" /> Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-baba-blue/10 bg-card p-10 text-center">
          <Bell className="mx-auto h-6 w-6 text-baba-blue/40" />
          <p className="mt-2 text-sm text-baba-slate/60">No messages yet.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl border bg-card p-4 ${
                n.read_at ? "border-baba-blue/10" : "border-baba-blue/40 bg-baba-blue/5"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-baba-slate">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-baba-slate/70">{n.body}</p>
                  )}
                  <p className="mt-2 text-xs text-baba-slate/45">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read_at && (
                  <button
                    onClick={() => mark.mutate([n.id])}
                    className="shrink-0 text-xs font-semibold text-baba-blue"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
