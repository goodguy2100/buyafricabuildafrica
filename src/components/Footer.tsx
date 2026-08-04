import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Globe, Mail, MapPin, Phone, Instagram, Linkedin } from "lucide-react";
import babaLogo from "@/assets/baba-logo.webp";

const columns = [
  {
    title: "Explore",
    to: "/pillars",
    links: [
      { to: "/pillars", label: "The Five Pillars" },
      { to: "/about", label: "About BABA" },
    ],
  },
  {
    title: "Get Involved",
    to: "/register",
    links: [
      { to: "/register", label: "Become a Member" },
      { to: "/partners", label: "Become a Partner" },
      { to: "/contact", label: "Member Support" },
    ],
  },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="bg-baba-blue text-baba-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <img
            src={babaLogo}
            alt="Buy Africa Build Africa logo"
            width={600}
            height={489}
            loading="lazy"
            decoding="async"
            className="h-24 w-auto object-contain"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-baba-cream">
            Buy Africa Build Africa is dedicated to the industrial transformation of the
            continent through human capital, local value addition and institutional
            partnerships.
          </p>
          <div className="mt-5 space-y-2 text-sm text-baba-cream">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-baba-copper" /> Head Office — Riara Road, Victoria Courts Building, HQ Offices
            </p>
            <p className="flex items-center gap-2">
              {"\n"}
            </p>
            <p className="flex items-center gap-2">
              {"\n"}
            </p>
            <p className="flex items-center gap-2">
              {"\n"}
            </p>
            <p className="flex items-center gap-2">
              {""}
            </p>
            <p className="mt-3 text-xs text-baba-cream/90">
              We will expand to other developing countries as well.
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-baba-copper" />+254 746216258
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-baba-copper" /> info@buyafricabuildafrica.org
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <Link
              to={col.to}
              className="font-display text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-yellow-200 via-baba-yellow to-amber-400 bg-clip-text text-transparent transition-opacity hover:opacity-80"
            >
              {col.title}
            </Link>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-baba-cream transition-colors hover:text-baba-cream"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-4">
          <Link
            to="/events"
            className="font-display text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-yellow-200 via-baba-yellow to-amber-400 bg-clip-text text-transparent transition-opacity hover:opacity-80"
          >
            Newsletter
          </Link>
          <p className="mt-4 text-sm text-baba-cream">
            Stay updated on the latest industrial opportunities across Africa.
          </p>
          {done ? (
            <p className="mt-4 text-sm font-semibold text-baba-yellow">
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
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-baba-cream placeholder:text-baba-cream/80 focus:border-baba-copper focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg baba-cta px-4 py-2.5 text-sm font-semibold text-white"
              >
                Subscribe
              </button>
            </form>
          )}
          <div className="mt-6 flex items-center gap-3 text-baba-cream/90">
            <Globe className="h-5 w-5" />
            <span className="text-xs uppercase tracking-wide">Pan-African Network</span>
          </div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-baba-cream/90">
              Follow us
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://www.instagram.com/buyafrica.buildafrica"
                target="_blank"
                rel="noreferrer"
                aria-label="Buy Africa Build Africa on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-baba-cream transition-colors hover:border-baba-copper hover:bg-baba-copper hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/buyafricabuildafrica"
                target="_blank"
                rel="noreferrer"
                aria-label="Buy Africa Build Africa on LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-baba-cream transition-colors hover:border-baba-copper hover:bg-baba-copper hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-baba-cream/90 sm:flex-row lg:px-8">
          <p>© 2024 Buy Africa Build Africa. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:text-baba-cream">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-baba-cream">
              Terms of Service
            </Link>
            <span className="text-baba-copper">Built for the Bold</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
