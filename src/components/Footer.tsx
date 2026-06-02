import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { BabaLogo } from "./BabaLogo";

const columns = [
  {
    title: "Explore",
    links: [
      { to: "/pillars", label: "The Five Pillars" },
      { to: "/directory", label: "National Directory" },
      { to: "/opportunities", label: "Opportunities" },
      { to: "/about", label: "About BABA" },
    ],
  },
  {
    title: "Get Involved",
    links: [
      { to: "/register", label: "Become a Member" },
      { to: "/partners", label: "Become a Partner" },
      { to: "/contact", label: "Member Support" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="bg-baba-slate text-baba-alabaster">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <div className="[&_span]:text-baba-alabaster">
            <BabaLogo className="h-11 w-11" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-baba-alabaster/70">
            Buy Africa Build Africa is dedicated to the industrial transformation of the
            continent through human capital, local value addition and institutional
            partnerships.
          </p>
          <div className="mt-5 space-y-2 text-sm text-baba-alabaster/70">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-baba-copper" /> Nairobi, Kenya
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-baba-copper" /> +254 712 345 678
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-baba-copper" /> hello@buildafrica.org
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <h4 className="font-display text-sm font-bold uppercase tracking-wide text-baba-copper">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-baba-alabaster/70 transition-colors hover:text-baba-alabaster"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-4">
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-baba-copper">
            Newsletter
          </h4>
          <p className="mt-4 text-sm text-baba-alabaster/70">
            Stay updated on the latest industrial opportunities across Africa.
          </p>
          {done ? (
            <p className="mt-4 text-sm font-semibold text-baba-copper">
              Thank you — you're subscribed.
            </p>
          ) : (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setDone(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-baba-alabaster placeholder:text-baba-alabaster/40 focus:border-baba-copper focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-baba-copper px-4 py-2.5 text-sm font-semibold text-baba-slate transition-colors hover:bg-baba-copper-dark"
              >
                Subscribe
              </button>
            </form>
          )}
          <div className="mt-6 flex items-center gap-3 text-baba-alabaster/60">
            <Globe className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">Pan-African Network</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-baba-alabaster/50 sm:flex-row lg:px-8">
          <p>© 2024 Buy Africa Build Africa. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-baba-alabaster">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-baba-alabaster">
              Terms of Service
            </Link>
            <span className="text-baba-copper">Built for the Bold</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
