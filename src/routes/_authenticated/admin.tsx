import { createFileRoute, useRouter, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Loader2,
  LayoutDashboard,
  Users,
  DollarSign,
  Briefcase,
  Bell,
  Images,
  Settings,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { getIsAdmin } from "@/lib/registrations.functions";
import { OverviewSection } from "@/components/admin/OverviewSection";
import { MembersSection } from "@/components/admin/MembersSection";
import { PaymentsSection } from "@/components/admin/PaymentsSection";
import { OpportunitiesSection } from "@/components/admin/OpportunitiesSection";
import { NotificationsSection } from "@/components/admin/NotificationsSection";
import { GallerySection } from "@/components/admin/GallerySection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw redirect({ to: "/auth", search: { redirect: "/admin" } });
    }

    const { data: isAdmin, error } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (error || !isAdmin) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  head: () => ({
    meta: [{ title: "Admin Dashboard | BABA" }],
  }),
  component: AdminPage,
  errorComponent: AdminError,
});

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "members", label: "Members", icon: Users },
  { key: "payments", label: "Payments", icon: DollarSign },
  { key: "opportunities", label: "Opportunities", icon: Briefcase },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "gallery", label: "Gallery", icon: Images },
  { key: "settings", label: "Settings", icon: Settings },
] as const;

type NavKey = (typeof NAV)[number]["key"];

function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <PageShell>
      <section className="mx-auto max-w-lg px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-extrabold text-baba-blue">Access problem</h1>
        <p className="mt-2 text-baba-slate/70">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </section>
    </PageShell>
  );
}

function AdminPage() {
  const isAdminFn = useServerFn(getIsAdmin);
  const adminQuery = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const [tab, setTab] = useState<NavKey>("overview");

  if (adminQuery.isLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-baba-blue" />
        </div>
      </PageShell>
    );
  }

  if (adminQuery.data !== true) {
    return (
      <PageShell>
        <section className="mx-auto max-w-lg px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold text-baba-blue">Admins only</h1>
          <p className="mt-2 text-baba-slate/70">
            Your account doesn't have admin access to this page.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-block rounded-lg baba-cta px-6 py-2.5 text-sm font-semibold text-white"
          >
            Go to your dashboard
          </Link>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-extrabold text-baba-blue">Admin Dashboard</h1>
          <p className="mt-1 text-baba-slate/60">
            Manage members, revenue, opportunities, messaging and media.
          </p>
        </div>

        {/* horizontal nav */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-xl border border-baba-blue/10 bg-card p-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button
                key={n.key}
                onClick={() => setTab(n.key)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === n.key
                    ? "baba-cta text-white"
                    : "text-baba-slate/60 hover:bg-baba-blue/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && <OverviewSection />}
        {tab === "members" && <MembersSection />}
        {tab === "payments" && <PaymentsSection />}
        {tab === "opportunities" && <OpportunitiesSection />}
        {tab === "notifications" && <NotificationsSection />}
        {tab === "gallery" && <GallerySection />}
        {tab === "settings" && <SettingsSection />}
      </section>
    </PageShell>
  );
}
