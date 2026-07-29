import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

interface SheetsAuth {
  lovableApiKey: string;
  sheetsApiKey: string;
  spreadsheetId: string;
}

function readSheetsAuth(): SheetsAuth {
  const lovableApiKey = process.env.LOVABLE_API_KEY;
  const sheetsApiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_MEMBERS_SPREADSHEET_ID;
  if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured.");
  if (!sheetsApiKey) {
    throw new Error(
      "Google Sheets isn't connected yet. Ask an admin to connect the Google Sheets integration.",
    );
  }
  if (!spreadsheetId) {
    throw new Error(
      "No spreadsheet configured yet. Set GOOGLE_SHEETS_MEMBERS_SPREADSHEET_ID to your Google Sheet ID.",
    );
  }
  return { lovableApiKey, sheetsApiKey, spreadsheetId };
}

async function sheetsFetch(auth: SheetsAuth, path: string, init: RequestInit = {}) {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.lovableApiKey}`,
      "X-Connection-Api-Key": auth.sheetsApiKey,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Sheets error [${res.status}]: ${body.slice(0, 500)}`);
  }
  return res;
}

const HEADERS = [
  "Created At", "Full Name", "Email", "Phone", "National ID",
  "Role", "Trade / Type", "Experience", "Country", "City", "Area",
  "Occupation", "Industries", "Looking For", "Verified", "Status",
];

interface RegRow {
  created_at: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  user_role: string | null;
  role: string | null;
  artisan_type: string | null;
  professional_experience: string | null;
  country: string | null;
  city: string | null;
  area: string | null;
  occupation: string | null;
  industries: string[] | null;
  looking_for: string[] | null;
  verified: boolean;
  status: string | null;
}

/**
 * Susan's rule: one tab per category. Young pros never mix with experienced
 * pros, and each artisan trade lives in its own tab (Plumbers, Masons, …).
 * Anything unmapped falls into "Other".
 */
function tabFor(r: RegRow): string {
  const role = (r.user_role ?? r.role ?? "").toLowerCase();
  if (role === "artisan") {
    const t = (r.artisan_type ?? "").trim();
    if (!t) return "Artisans - Other";
    // Pluralise cleanly for common trades; otherwise use the raw label.
    const nice = t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (/^(Plumber|Mason|Painter|Carpenter|Welder|Tiler|Electrician|Engineer|Architect|Interior Designer|Quantity Surveyor|Gypsum Installer)$/i.test(nice)) {
      return nice.endsWith("s") ? nice : `${nice}s`;
    }
    return `Artisans - ${nice}`;
  }
  if (role === "professional_young") return "Young Professionals";
  if (role === "professional_exp") return "Experienced Professionals";
  if (role === "individual") return "Individuals";
  if (role === "corporate") return "Corporate & NGO";
  return "Other";
}

function rowFor(r: RegRow): (string | number | boolean)[] {
  return [
    r.created_at ?? "",
    r.full_name ?? "",
    r.email ?? "",
    r.phone ?? "",
    r.national_id ?? "",
    r.user_role ?? r.role ?? "",
    r.artisan_type ?? "",
    r.professional_experience ?? "",
    r.country ?? "",
    r.city ?? "",
    r.area ?? "",
    r.occupation ?? "",
    (r.industries ?? []).join(", "),
    (r.looking_for ?? []).join(", "),
    r.verified ? "yes" : "no",
    r.status ?? "",
  ];
}

async function listExistingTabs(auth: SheetsAuth): Promise<Set<string>> {
  const res = await sheetsFetch(
    auth,
    `/spreadsheets/${auth.spreadsheetId}?fields=sheets.properties.title`,
    { method: "GET" },
  );
  const json = (await res.json()) as { sheets?: { properties?: { title?: string } }[] };
  return new Set((json.sheets ?? []).map((s) => s.properties?.title ?? "").filter(Boolean));
}

async function ensureTab(auth: SheetsAuth, existing: Set<string>, title: string) {
  if (existing.has(title)) return;
  try {
    await sheetsFetch(auth, `/spreadsheets/${auth.spreadsheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title } } }],
      }),
    });
    existing.add(title);
  } catch (e) {
    // Tab may have been added concurrently — ignore duplicate errors.
    if (!/already exists/i.test(String(e))) throw e;
    existing.add(title);
  }
}

function quoteTab(title: string): string {
  // Sheet names with spaces/specials need single quotes in A1 refs.
  return `'${title.replace(/'/g, "''")}'`;
}

async function assertAdmin(supabase: { from: (t: string) => { select: (c: string) => { eq: (col: string, v: string) => { eq: (col: string, v: string) => { maybeSingle: () => Promise<{ data: unknown }> } } } } }, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

/**
 * Full re-sync: one tab per category, each rewritten from scratch so removed
 * rows don't linger. Empty categories still get a headers-only tab.
 */
export const syncMembersToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ synced: number; tabs: string[]; spreadsheetId: string }> => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId);
    const auth = readSheetsAuth();

    const { data, error } = await supabase
      .from("registrations")
      .select(
        "created_at, full_name, email, phone, national_id, user_role, role, artisan_type, professional_experience, country, city, area, occupation, industries, looking_for, verified, status",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as RegRow[];

    // Group by tab.
    const grouped = new Map<string, RegRow[]>();
    for (const r of rows) {
      const t = tabFor(r);
      const arr = grouped.get(t) ?? [];
      arr.push(r);
      grouped.set(t, arr);
    }

    const existing = await listExistingTabs(auth);
    for (const title of grouped.keys()) {
      await ensureTab(auth, existing, title);
    }

    for (const [title, list] of grouped) {
      const range = `${quoteTab(title)}!A1`;
      const clearRange = `${quoteTab(title)}!A1:Z`;
      await sheetsFetch(auth, `/spreadsheets/${auth.spreadsheetId}/values/${encodeURIComponent(clearRange)}:clear`, {
        method: "POST",
        body: "{}",
      });
      const values = [HEADERS, ...list.map(rowFor)];
      await sheetsFetch(
        auth,
        `/spreadsheets/${auth.spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
        { method: "PUT", body: JSON.stringify({ values }) },
      );
    }

    return {
      synced: rows.length,
      tabs: Array.from(grouped.keys()),
      spreadsheetId: auth.spreadsheetId,
    };
  });

/**
 * Append a single row for a newly registered user (called when signup completes).
 * Silently succeeds even if Sheets isn't configured, so signup never fails on this.
 */
export const appendMemberRowToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ registration_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ appended: boolean; tab?: string; reason?: string }> => {
    const { supabase, userId } = context;
    try {
      const { data: reg, error } = await supabase
        .from("registrations")
        .select(
          "user_id, created_at, full_name, email, phone, national_id, user_role, role, artisan_type, professional_experience, country, city, area, occupation, industries, looking_for, verified, status",
        )
        .eq("id", data.registration_id)
        .maybeSingle();
      if (error || !reg) return { appended: false, reason: "not found" };
      if ((reg as { user_id: string }).user_id !== userId) {
        await assertAdmin(supabase as never, userId);
      }
      const auth = readSheetsAuth();
      const row = reg as RegRow;
      const title = tabFor(row);

      const existing = await listExistingTabs(auth);
      await ensureTab(auth, existing, title);

      // If the tab was just created, seed headers first.
      const headerRes = await sheetsFetch(
        auth,
        `/spreadsheets/${auth.spreadsheetId}/values/${encodeURIComponent(`${quoteTab(title)}!A1:P1`)}`,
        { method: "GET" },
      );
      const headerJson = (await headerRes.json()) as { values?: unknown[][] };
      if (!headerJson.values || headerJson.values.length === 0) {
        await sheetsFetch(
          auth,
          `/spreadsheets/${auth.spreadsheetId}/values/${encodeURIComponent(`${quoteTab(title)}!A1`)}?valueInputOption=RAW`,
          { method: "PUT", body: JSON.stringify({ values: [HEADERS] }) },
        );
      }

      await sheetsFetch(
        auth,
        `/spreadsheets/${auth.spreadsheetId}/values/${encodeURIComponent(`${quoteTab(title)}!A1:append`)}?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        { method: "POST", body: JSON.stringify({ values: [rowFor(row)] }) },
      );
      return { appended: true, tab: title };
    } catch (e) {
      return { appended: false, reason: e instanceof Error ? e.message : "unknown" };
    }
  });

/** Status probe — used by the admin UI. */
export const getSheetsStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase as never, userId);
    return {
      hasSheetsKey: !!process.env.GOOGLE_SHEETS_API_KEY,
      hasSpreadsheetId: !!process.env.GOOGLE_SHEETS_MEMBERS_SPREADSHEET_ID,
      spreadsheetId: process.env.GOOGLE_SHEETS_MEMBERS_SPREADSHEET_ID ?? null,
    };
  });
