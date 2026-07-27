import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";
import { syncMembersToSheet, getSheetsStatus } from "@/lib/sheets.functions";
import { SectionHeading, LoadingBlock } from "./shared";

export function SheetsSyncSection() {
  const statusFn = useServerFn(getSheetsStatus);
  const syncFn = useServerFn(syncMembersToSheet);

  const status = useQuery({ queryKey: ["admin-sheets-status"], queryFn: () => statusFn() });

  const syncMut = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r) => toast.success(`Synced ${r.synced} members to Google Sheets.`),
    onError: (e: Error) => toast.error(e.message),
  });

  const configured = status.data?.hasSheetsKey && status.data?.hasSpreadsheetId;
  const sheetUrl = status.data?.spreadsheetId
    ? `https://docs.google.com/spreadsheets/d/${status.data.spreadsheetId}/edit`
    : null;

  return (
    <section className="rounded-2xl border border-baba-blue/10 bg-card p-5">
      <SectionHeading
        title="Google Sheets sync"
        subtitle="Mirror every member row into your Google Sheet, and auto-append on new signups."
      />

      {status.isLoading ? (
        <LoadingBlock />
      ) : configured ? (
        <div className="grid gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            <span>Connected. New signups append automatically.</span>
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold underline"
              >
                Open sheet <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <button
            disabled={syncMut.isPending}
            onClick={() => syncMut.mutate()}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {syncMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Full re-sync now
          </button>
          <p className="text-xs text-baba-slate/60">
            Overwrites "Sheet1" with the latest snapshot of all members.
          </p>
        </div>
      ) : (
        <SetupInstructions status={status.data} />
      )}
    </section>
  );
}

function SetupInstructions({
  status,
}: {
  status?: { hasSheetsKey: boolean; hasSpreadsheetId: boolean };
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1500);
    });
  };
  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <div>
          <p className="font-semibold">Setup needed</p>
          <p className="text-xs">Two things unlock this sync:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs">
            <li>
              {status?.hasSheetsKey ? "✅" : "⬜"} Connect Google Sheets in your Lovable workspace
              (Settings → Integrations → Google Sheets). Sign in as the Google account that owns the
              destination sheet.
            </li>
            <li>
              {status?.hasSpreadsheetId ? "✅" : "⬜"} Save your spreadsheet ID as a secret named{" "}
              <button
                onClick={() => copy("GOOGLE_SHEETS_MEMBERS_SPREADSHEET_ID", "name")}
                className="rounded bg-white/70 px-1 font-mono text-[0.7rem]"
              >
                GOOGLE_SHEETS_MEMBERS_SPREADSHEET_ID {copied === "name" && "✓"}
              </button>
              . Grab the ID from the sheet URL:{" "}
              <code className="text-[0.7rem]">
                docs.google.com/spreadsheets/d/<strong>THIS_PART</strong>/edit
              </code>
            </li>
          </ol>
        </div>
      </div>
      <p className="text-xs text-baba-slate/60">
        Once both are set, this panel switches to sync controls and every new signup appends a row
        automatically.
      </p>
    </div>
  );
}
