import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { LocationPicker, EMPTY_LOCATION } from "@/components/LocationPicker";
import { AFRICA_COUNTRIES } from "@/lib/africa-locations";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Partner with BABA | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Partner with BABA — companies, organisations, institutions and government bodies working with us on skills, local content and opportunities across Africa.",
      },
      { property: "og:title", content: "Partner with BABA" },
      {
        property: "og:description",
        content:
          "Tell us about your company, organisation or institution and our partnerships team will get back to you.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [country, setCountry] = useState("");
  const [loc, setLoc] = useState(EMPTY_LOCATION);
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <section className="border-b border-baba-blue/10 bg-baba-blue/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Collaboration
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Partner with BABA
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Companies, organisations, institutions and government bodies — tell us who you are and
            our team will get back to you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="rounded-3xl border border-baba-blue/10 bg-card p-8">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-baba-blue/10">
                <Check className="h-7 w-7 text-baba-blue" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-baba-slate">
                Message sent
              </h2>
              <p className="mt-2 text-baba-slate/65">
                Thank you for reaching out. Our team will respond within 2 business days.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label htmlFor="country" className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Country
              </label>
              <select
                id="country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate focus:border-baba-blue focus:outline-none"
              >
                <option value="">Select your country</option>
                {AFRICA_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
              <p className="mt-1.5 text-xs text-baba-slate/50">
                Where your organisation is based.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Organisation Name" placeholder="Company, organisation or institution" required />
                <Field label="Contact Person" placeholder="Jane Wanjiru" />
                <Field label="Email (optional)" placeholder="info@example.com" type="email" />
                <Field label="Phone" placeholder="+254 746216258" />
              </div>

              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Where are you?
                </span>
                <div className="mt-1.5">
                  <LocationPicker value={loc} onChange={setLoc} />
                </div>
              </div>

              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Message
                </span>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us how you would like to partner with BABA"
                  className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate placeholder:text-baba-slate/40 focus:border-baba-blue focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="mt-6 rounded-lg baba-cta px-6 py-3 text-sm font-semibold text-white"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <InfoCard icon={Mail} title="Email" value="info@buyafricabuildafrica.org" />
          <InfoCard icon={Phone} title="Phone" value="+254 746216258" />
          <InfoCard icon={MapPin} title="Head Office" value="Nairobi, Kenya" />
          <div className="rounded-2xl bg-baba-slate p-6 text-baba-cream">
            <h3 className="font-display text-lg font-bold">HQ & Support</h3>
            <p className="mt-2 text-sm text-baba-cream/70">
              BABA operates in Kenya,&nbsp;Head Office — Riara Road, Victoria Courts Building, HQ Offices. Member support is available
              Monday–Friday, 8am–5pm EAT.
            </p>
          </div>
        </aside>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
        {label}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-baba-slate placeholder:text-baba-slate/40 focus:border-baba-blue focus:outline-none"
      />
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof Mail;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-baba-blue/10 bg-card p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-baba-blue/10">
        <Icon className="h-5 w-5 text-baba-blue" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-baba-slate/50">
          {title}
        </p>
        <p className="font-semibold text-baba-slate">{value}</p>
      </div>
    </div>
  );
}
