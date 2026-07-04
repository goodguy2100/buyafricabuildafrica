import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Clock, Briefcase } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getAdminOverview } from "@/lib/admin.functions";
import { formatKsh } from "@/lib/roles";
import { StatCard, LoadingBlock, ErrorBlock, CHART_COLORS } from "./shared";

export function OverviewSection() {
  const fn = useServerFn(getAdminOverview);
  const q = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });

  if (q.isLoading) return <LoadingBlock />;
  if (q.isError)
    return <ErrorBlock message={(q.error as Error).message} onRetry={() => q.refetch()} />;
  const o = q.data!;

  const signupData = o.signupsByDay.map((d) => ({
    date: d.date.slice(5),
    Individuals: d.individual,
    Professionals: d.professional,
    Artisans: d.artisan,
    Corporates: d.corporate,
  }));

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={o.totalMembers} icon={<Users className="h-5 w-5" />} />
        <StatCard
          label="Revenue This Month"
          value={formatKsh(o.revenueThisMonth)}
          hint={`All time: ${formatKsh(o.revenueAllTime)}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Approvals"
          value={o.pendingApprovals}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Active Opportunities"
          value={o.activeOpportunities}
          icon={<Briefcase className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-baba-blue/10 bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-bold text-baba-slate">
            Member signups — last 30 days
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Individuals" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Professionals" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Artisans" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Corporates" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-baba-blue/10 bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-bold text-baba-slate">Revenue by role</h3>
          {o.revenueByRole.length === 0 ? (
            <p className="py-16 text-center text-sm text-baba-slate/50">
              No paid verifications yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={o.revenueByRole}
                  dataKey="amount"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(e: any) => e.label}
                >
                  {o.revenueByRole.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatKsh(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-baba-blue/10 bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-baba-slate">
          Members by container
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {o.membersByContainer.map((c) => (
            <div
              key={c.container_type}
              className="rounded-xl border border-baba-blue/10 bg-baba-blue/5 px-4 py-3"
            >
              <div className="font-display text-xl font-extrabold text-baba-blue">
                {c.member_count}
              </div>
              <div className="text-xs text-baba-slate/60">{c.display_name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
