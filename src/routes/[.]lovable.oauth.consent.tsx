import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

type AuthorizationDetails = {
  client?: { name?: string; client_uri?: string; redirect_uris?: string[] } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
  scopes?: string[] | null;
  requested_scopes?: string[] | null;
} | null;

// Local typed wrapper — supabase.auth.oauth is beta and may not be visible to TS.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: { message: string } | null }>;
};
function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) {
      throw redirect({ to: "/auth", search: { redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <PageShell>
      <main className="mx-auto max-w-lg p-8">
        <h1 className="text-2xl font-semibold mb-3">Authorization error</h1>
        <p className="text-muted-foreground">
          Could not load this authorization request: {String((error as Error)?.message ?? error)}
        </p>
      </main>
    </PageShell>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";
  const scopes = details?.requested_scopes ?? details?.scopes ?? [];

  return (
    <PageShell>
      <main className="mx-auto max-w-lg p-8">
        <h1 className="text-2xl font-semibold mb-2">
          Connect {clientName} to your BABA account
        </h1>
        <p className="text-muted-foreground mb-4">
          {clientName} will be able to call this app's enabled tools while you are signed in.
        </p>
        {scopes.length > 0 && (
          <div className="mb-4 text-sm">
            <p className="font-medium mb-1">Requested permissions</p>
            <ul className="list-disc pl-5 text-muted-foreground">
              {scopes.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-6">
          This does not bypass BABA's permissions or backend policies.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive mb-4">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button disabled={busy} onClick={() => decide(true)}>
            Approve
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => decide(false)}>
            Cancel connection
          </Button>
        </div>
      </main>
    </PageShell>
  );
}
