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

async function assertAdmin(supabase: { from: (t: string) => { select: (c: string) => { eq: (col: string, v: string) => { eq: (col: string, v: string) => { maybeSingle: () => Promise<{ data: unknown }> } } } } }, userId: string) {
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

/**
 * Full re-sync: writes headers + every registration row to Sheet1.
 * Overwrites the sheet content.
 */
export const syncMembersToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ synced: number; spreadsheetId: string }> => {
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
    const values = [HEADERS, ...rows.map(rowFor)];

    // Clear then write, so removed rows don't linger.
    await sheetsFetch(auth, `/spreadsheets/${auth.spreadsheetId}/values/Sheet1:clear`, {
      method: "POST",
      body: "{}",
    });
    await sheetsFetch(
      auth,
      `/spreadsheets/${auth.spreadsheetId}/values/Sheet1!A1?valueInputOption=RAW`,
      { method: "PUT", body: JSON.stringify({ values }) },
    );
    return { synced: rows.length, spreadsheetId: auth.spreadsheetId };
  });

/**
 * Append a single row for a newly registered user (called when signup completes).
 * Silently succeeds even if Sheets isn't configured, so signup never fails on this.
 */
export const appendMemberRowToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ registration_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ appended: boolean; reason?: string }> => {
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
      // Only the row owner (or admin) can append their own row.
      if ((reg as { user_id: string }).user_id !== userId) {
        await assertAdmin(supabase as never, userId);
      }
      const auth = readSheetsAuth();
      await sheetsFetch(
        auth,
        `/spreadsheets/${auth.spreadsheetId}/values/Sheet1!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        { method: "POST", body: JSON.stringify({ values: [rowFor(reg as RegRow)] }) },
      );
      return { appended: true };
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
