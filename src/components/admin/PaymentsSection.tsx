import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { listTransactions } from "@/lib/admin.functions";
import { formatKsh } from "@/lib/roles";
import {
  StatCard,
  LoadingBlock,
  ErrorBlock,
  EmptyState,
  StatusBadge,
  CHART_COLORS,
  exportCsv,
} from "./shared";

export function PaymentsSection() {
  const fn = useServerFn(listTransactions);
  const q = useQuery({ queryKey: ["admin-transactions"], queryFn: () => fn() });

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const txns = q.data ?? [];

  const filtered = useMemo(() => {
    return txns.filter((t) => {
      if (roleFilter !== "all" && t.role !== roleFilter) return false;
      if (statusFilter === "paid" && !t.paid) return false;
      if (statusFilter === "pending" && t.paid) return false;
      if (from && new Date(t.date) < new Date(from)) return false;
      if (to && new Date(t.date) > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [txns, roleFilter, statusFilter, from, to]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    let all = 0,
      month = 0,
      week = 0,
      paidCount = 0;
    const byRole: Record<string, number> = {};
    for (const t of txns) {
      if (!t.paid) continue;
      all += t.amount;
      paidCount++;
      byRole[t.role] = (byRole[t.role] ?? 0) + 1;
      if (new Date(t.date) >= monthStart) month += t.amount;
      if (new Date(t.date) >= weekStart) week += t.amount;
    }
    return {
      all,
      month,
      week,
      avg: paidCount ? Math.round(all / paidCount) : 0,
      byRole: Object.entries(byRole).map(([role, count]) => ({ role, count })),
    };
  }, [txns]);

  const roles = [...new Set(txns.map((t) => t.role))];

  if (q.isLoading) return <LoadingBlock />;
  if (q.isError)
    return <ErrorBlock message={(q.error as Error).message} onRetry={() => q.refetch()} />;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatKsh(stats.all)} />
        <StatCard label="This Month" value={formatKsh(stats.month)} />
        <StatCard label="This Week" value={formatKsh(stats.week)} />
        <StatCard label="Avg Transaction" value={formatKsh(stats.avg)} />
      </div>

      <div className="mt-6 rounded-2xl border border-baba-blue/10 bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-baba-slate">
          Paying members by role
        </h3>
        {stats.byRole.length === 0 ? (
          <p className="py-8 text-center text-sm text-baba-slate/50">No payments yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.byRole}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="role" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.byRole.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">Role</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          >
            <option value="all">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-semibold text-baba-slate/60">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-baba-blue/15 bg-card px-3 py-2 text-sm"
          />
        </label>
        <button
          onClick={() => {
            exportCsv(
              "revenue-report.csv",
              filtered.map((t) => ({
                Date: new Date(t.date).toLocaleDateString(),
                User: t.user_name,
                Role: t.role,
                Amount: t.amount,
                Status: t.paid ? "Paid" : "Pending",
                Reference: t.reference,
              })),
            );
            toast.success("Revenue report exported");
          }}
          className="flex items-center gap-1.5 rounded-lg baba-cta px-4 py-2 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" /> Export Revenue Report
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-baba-blue/10 bg-card">
        {filtered.length === 0 ? (
          <EmptyState>No transactions match the filters.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-baba-blue/10 text-left text-xs uppercase tracking-wide text-baba-slate/50">
                <th className="p-3">Date</th>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-baba-blue/5 last:border-0">
                  <td className="p-3 text-baba-slate/70">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-medium text-baba-slate">{t.user_name}</td>
                  <td className="p-3 text-baba-slate/70">{t.role}</td>
                  <td className="p-3 font-semibold text-baba-slate">{formatKsh(t.amount)}</td>
                  <td className="p-3">
                    <StatusBadge status={t.paid ? "delivered" : "pending"} />
                  </td>
                  <td className="p-3 font-mono text-xs text-baba-slate/50">{t.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
