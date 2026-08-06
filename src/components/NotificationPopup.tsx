import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X } from "lucide-react";
import {
  listMyNotifications,
  markNotificationsRead,
  type MyNotification,
} from "@/lib/notifications.functions";
import { supabase } from "@/integrations/supabase/client";

/**
 * Shows unread pop-up notifications sent by admins to a signed-in member.
 * Dismissing marks the notification read so it never returns.
 */
export function NotificationPopup() {
  const listFn = useServerFn(listMyNotifications);
  const markFn = useServerFn(markNotificationsRead);
  const [item, setItem] = useState<MyNotification | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      try {
        const rows = await listFn();
        const popup = rows.find((n) => n.is_popup && !n.read_at);
        if (active && popup) setItem(popup);
      } catch {
        /* silent — popups are non-critical */
      }
    })();
    return () => {
      active = false;
    };
  }, [listFn]);

  if (!item) return null;

  const dismiss = () => {
    const id = item.id;
    setItem(null);
    markFn({ data: { ids: [id] } }).catch(() => undefined);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-baba-blue/15 bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-lg font-extrabold text-baba-blue">{item.title}</h2>
          <button onClick={dismiss} aria-label="Dismiss" className="text-baba-slate/50">
            <X className="h-5 w-5" />
          </button>
        </div>
        {item.banner_url && (
          <img src={item.banner_url} alt="" className="mt-3 w-full rounded-xl object-cover" />
        )}
        {item.body && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-baba-slate/75">{item.body}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          {item.link_url && (
            <a
              href={item.link_url}
              onClick={dismiss}
              className="rounded-lg border-2 border-baba-blue/15 px-4 py-2 text-sm font-semibold text-baba-blue"
            >
              Open
            </a>
          )}
          <button
            onClick={dismiss}
            className="rounded-lg baba-cta px-5 py-2 text-sm font-semibold text-white"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
