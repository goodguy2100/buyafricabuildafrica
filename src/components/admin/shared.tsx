import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

/** Brand-consistent chart palette. */
export const CHART_COLORS = [
  "hsl(186 89% 29%)", // baba-blue
  "hsl(35 90% 50%)", // copper-dark
  "hsl(186 70% 42%)", // blue-light
  "hsl(45 95% 55%)", // copper
  "hsl(195 25% 38%)", // slate-ish
  "hsl(160 60% 40%)",
  "hsl(280 45% 55%)",
  "hsl(0 60% 55%)",
  "hsl(210 60% 50%)",
  "hsl(120 40% 45%)",
  "hsl(330 55% 55%)",
  "hsl(50 70% 45%)",
];

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-baba-blue/10 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/50">
          {label}
        </span>
        {icon && <span className="text-baba-blue/70">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-2xl font-extrabold text-baba-blue lg:text-3xl">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-baba-slate/50">{hint}</div>}
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-baba-blue">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-baba-slate/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:bg-red-950/30">
      <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-baba-blue/20 p-10 text-center text-sm text-baba-slate/60">
      {children}
    </div>
  );
}

/** Download an array of objects as a CSV file. */
export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    delivered: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    open: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    scheduled: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    upcoming: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    paused: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    draft: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    closed: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    expired: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
        map[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="font-bold text-green-600">✓</span>
  ) : (
    <span className="font-bold text-baba-slate/30">✗</span>
  );
}
