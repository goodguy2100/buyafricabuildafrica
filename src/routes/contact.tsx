import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Buy Africa Build Africa (BABA)" },
      {
        name: "description",
        content:
          "Get in touch with BABA for general inquiries, partnerships, government collaboration, media or member support.",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const categories = ["General", "Partnership", "Government", "Media", "Support"];

function Contact() {
  const [category, setCategory] = useState("General");
  const [sent, setSent] = useState(false);

  return (
    <PageShell>
      <section className="border-b border-baba-blue/10 bg-baba-blue/5">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-baba-copper-dark">
            Get In Touch
          </span>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-baba-slate sm:text-5xl">
            Contact BABA
          </h1>
          <p className="mt-4 max-w-2xl text-baba-slate/70">
            Whether you're an artisan, partner or institution, our team is ready to help you
            build with us.
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
              <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                Query Type
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      category === c
                        ? "bg-baba-blue text-baba-cream"
                        : "bg-secondary text-baba-slate/70 hover:bg-baba-blue/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" placeholder="John Doe" required />
                <Field label="Email" placeholder="john@example.com" type="email" required />
                <Field label="Organization" placeholder="Optional" />
                <Field label="Phone" placeholder="+254 746216258" />
              </div>
              <div className="mt-5">
                <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
                  Message
                </span>
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help?"
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
            <h3 className="font-display text-lg font-bold">County Offices</h3>
            <p className="mt-2 text-sm text-baba-cream/70">
              BABA operates regional desks across 47 counties. Member support is available
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
