import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, LogOut, LayoutDashboard, LogIn, ChevronDown } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import babaLogo from "@/assets/baba-logo-vibrant.png";
import { supabase } from "@/integrations/supabase/client";
import { getIsAdmin } from "@/lib/registrations.functions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Primary links stay inline; the rest live in the "More" menu to reduce clutter.
const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/pillars", label: "Pillars" },
  { to: "/events", label: "Events" },
] as const;

const moreLinks = [
  { to: "/directory", label: "National Directory" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/contact", label: "Contact" },
] as const;

const navLinks = [...primaryLinks, ...moreLinks] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const checkAdmin = useServerFn(getIsAdmin);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSignedIn(!!data.session);
      if (data.session) {
        try {
          const admin = await checkAdmin();
          if (active) setIsAdmin(!!admin);
        } catch {
          if (active) setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    sync();
    const { data: sub } = supabase.auth.onAuthStateChange(() => sync());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-baba-blue/10 bg-baba-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 lg:px-8">
        <Link to="/" className="shrink-0">
          <img
            src={babaLogo}
            alt="Buy Africa Build Africa logo"
            className="h-20 w-auto object-contain lg:h-24"
          />
        </Link>

        <nav className="hidden items-center gap-3 xl:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="font-display text-[0.72rem] font-semibold uppercase tracking-wide text-baba-slate/70 transition-colors hover:text-baba-blue 2xl:text-[0.78rem]"
              activeProps={{ className: "text-baba-blue" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 xl:flex">
          <Link
            to="/register"
            className="rounded-full baba-cta px-4 py-2 text-sm font-semibold text-white"
          >
            Join as Artisans
          </Link>
          <Link
            to="/register"
            className="rounded-full border-2 border-baba-blue px-4 py-2 text-sm font-semibold text-baba-blue transition-colors hover:bg-baba-blue hover:text-baba-cream"
          >
            Join as Professional
          </Link>
          <Link
            to="/partners"
            className="rounded-full border-2 border-baba-copper px-4 py-2 text-sm font-semibold text-baba-copper-dark transition-colors hover:bg-baba-copper hover:text-baba-slate"
          >
            Register as Partner
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-full border-2 border-baba-blue/20 px-4 py-2 text-sm font-semibold text-baba-blue"
            >
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          )}
          {signedIn ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 rounded-full border-2 border-baba-blue/20 px-4 py-2 text-sm font-semibold text-baba-blue"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-baba-slate/70 hover:text-baba-blue"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-baba-slate/70 hover:text-baba-blue"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-baba-blue xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-baba-blue/10 bg-baba-cream px-5 py-4 xl:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-baba-slate/80 hover:bg-secondary"
                activeProps={{ className: "text-baba-blue" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="rounded-full baba-cta px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Join as Artisans
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="rounded-full border-2 border-baba-blue px-4 py-2.5 text-center text-sm font-semibold text-baba-blue"
            >
              Join as Professional
            </Link>
            <Link
              to="/partners"
              onClick={() => setOpen(false)}
              className="rounded-full border-2 border-baba-copper px-4 py-2.5 text-center text-sm font-semibold text-baba-copper-dark"
            >
              Register as Partner
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-full border-2 border-baba-blue/20 px-4 py-2.5 text-center text-sm font-semibold text-baba-blue"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin
              </Link>
            )}
            {signedIn ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-full border-2 border-baba-blue/20 px-4 py-2.5 text-center text-sm font-semibold text-baba-blue"
                >
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-baba-slate/70"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-baba-slate/70"
              >
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
