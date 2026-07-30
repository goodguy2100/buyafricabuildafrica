import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Loader2, ArrowLeft, User, IdCard, Phone } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot your password? | BABA" },
      {
        name: "description",
        content: "Get help logging back in to your BABA account — by email or by your name and ID.",
      },
      { property: "og:title", content: "Forgot your password? | BABA" },
      { property: "og:description", content: "Get help logging back in to your BABA account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [tab, setTab] = useState<"email" | "help">("email");

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-5 py-16 lg:px-8">
        <Link
          to="/auth"
          className="mb-6 inline-flex items-center gap-1 text-sm text-baba-slate/70 hover:text-baba-blue"
        >
          <ArrowLeft className="h-4 w-4" /> Back to log in
        </Link>
        <h1 className="font-display text-3xl font-extrabold text-baba-blue">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm text-baba-slate/70">
          Choose one way below. If you did not give us an email, use the second way.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {(
            [
              { key: "email", label: "I have an email" },
              { key: "help", label: "No email — help me" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "border-baba-blue bg-baba-blue/5 text-baba-blue"
                  : "border-baba-blue/15 text-baba-slate/70 hover:border-baba-blue/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "email" ? <EmailReset /> : <ManualHelp />}
      </section>
    </PageShell>
  );
}

function EmailReset() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We could not send the email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-xl border border-baba-blue/20 bg-baba-blue/5 p-5 text-sm text-baba-slate">
        <p className="font-semibold text-baba-blue">Check your email.</p>
        <p className="mt-1">
          If we have an account for <strong>{email}</strong>, a link to make a new password is on
          the way. Look in your spam folder too.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">
          Your email
        </span>
        <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
          <Mail className="h-4 w-4 text-baba-slate/40" />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
            placeholder="you@example.com"
          />
        </div>
      </label>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send me a link
      </button>
    </form>
  );
}

function ManualHelp() {
  const [name, setName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !idNumber.trim() || !phone.trim()) {
      return setError("Please fill in your name, your ID number and your phone number.");
    }
    setLoading(true);
    try {
      const clean = idNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      const { error: insErr } = await supabase.from("contact_messages").insert({
        name: name.trim(),
        email: `id${clean}@baba.local`,
        phone: phone.trim(),
        query_type: "password_reset",
        message: `Password help request. Full name: ${name.trim()}. National Identification No: ${idNumber.trim()}. Phone: ${phone.trim()}.`,
      });
      if (insErr) throw insErr;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 rounded-xl border border-baba-blue/20 bg-baba-blue/5 p-5 text-sm text-baba-slate">
        <p className="font-semibold text-baba-blue">We got your request.</p>
        <p className="mt-1">
          Our team will call or text you on <strong>{phone}</strong> to help you get back in. Please
          keep your ID close by.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-4">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        Tell us who you are and our team will help you make a new password.
      </p>
      <Field label="Full name" icon={User} value={name} onChange={setName} placeholder="e.g. Jane Wanjiru" />
      <Field
        label="National Identification No"
        icon={IdCard}
        value={idNumber}
        onChange={setIdNumber}
        placeholder="Your ID number"
      />
      <Field label="Phone number" icon={Phone} value={phone} onChange={setPhone} placeholder="e.g. 0712 345 678" />
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg baba-cta py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Ask for help
      </button>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-baba-slate/70">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-card px-3.5 focus-within:border-baba-blue">
        <Icon className="h-4 w-4 text-baba-slate/40" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-2.5 text-sm text-baba-slate focus:outline-none"
        />
      </div>
    </label>
  );
}
