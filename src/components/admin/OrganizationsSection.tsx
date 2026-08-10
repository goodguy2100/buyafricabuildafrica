import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Building2, Mail, Phone, MessageSquareText } from "lucide-react";
import { listMembers } from "@/lib/admin.functions";
import { LoadingBlock, ErrorBlock, EmptyState, StatusBadge } from "./shared";

/**
 * Organizations & Partners — the people who reached out. Their words matter,
 * so the message they wrote is shown front and centre. Read, then follow up.
 */
export function OrganizationsSection() {
  const fn = useServerFn(listMembers);
  const q = useQuery({ queryKey: ["admin-orgs"], queryFn: () => fn() });

  const orgs = (q.data ?? []).filter((m) => (m.user_role ?? m.role) === "corporate");

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-baba-slate">Organizations & Partners</h2>
        <p className="mt-1 text-sm text-baba-slate/60">
          Every partner who reached out — read what they wrote, then follow up.
        </p>
      </div>

      {q.isLoading ? (
        <LoadingBlock />
      ) : q.isError ? (
        <ErrorBlock message={(q.error as Error).message} onRetry={() => q.refetch()} />
      ) : orgs.length === 0 ? (
        <EmptyState>No partner submissions yet.</EmptyState>
      ) : (
        <div className="grid gap-5">
          {orgs.map((o) => {
            const d = (o.data ?? {}) as Record<string, unknown>;
            const message =
              typeof d.partnerMessage === "string" && d.partnerMessage.trim()
                ? d.partnerMessage
                : typeof d.partner_message === "string" && d.partner_message.trim()
                  ? d.partner_message
                  : null;
            const looking = Array.isArray(o.looking_for) ? o.looking_for : [];
            return (
              <div key={o.id} className="rounded-2xl border border-baba-blue/10 bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-copper/10">
                      <Building2 className="h-5 w-5 text-baba-copper-dark" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-baba-slate">
                        {o.full_name ?? "Unnamed"}
                      </h3>
                      <p className="text-xs text-baba-slate/50">
                        Corporate partner · joined {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-baba-slate/70">
                  {o.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-baba-blue" /> {o.email}
                    </span>
                  )}
                  {o.phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-baba-blue" /> {o.phone}
                    </span>
                  )}
                </div>

                {looking.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {looking.map((l) => (
                      <span
                        key={l}
                        className="rounded-full bg-baba-blue/10 px-2.5 py-0.5 text-xs text-baba-blue"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                )}

                {message && (
                  <div className="mt-4 rounded-xl border border-baba-copper/20 bg-baba-copper/5 p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-baba-copper-dark">
                      <MessageSquareText className="h-3.5 w-3.5" /> What they told us
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-baba-slate/85">
                      {message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
