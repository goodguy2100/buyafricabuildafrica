import { useMemo } from "react";

export function scorePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; hint: string } {
  if (!pw) return { score: 0, label: "", hint: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const s = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const label = ["Too weak", "Weak", "Okay", "Strong", "Very strong"][s];
  const hint =
    s < 2
      ? "Use 8+ characters, mix upper/lowercase, add a number or symbol."
      : s < 3
        ? "Nice — add a symbol or make it longer for a strong password."
        : "";
  return { score: s, label, hint };
}

export function PasswordStrength({ password }: { password: string }) {
  const { score, label, hint } = useMemo(() => scorePassword(password), [password]);
  if (!password) return null;
  const colors = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-baba-blue", "bg-emerald-500"];
  return (
    <div className="mt-1 grid gap-1">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < score ? colors[score] : "bg-baba-slate/15"}`}
          />
        ))}
      </div>
      <p className="text-[0.7rem] text-baba-slate/60">
        <span className="font-semibold">{label}</span>
        {hint ? ` — ${hint}` : ""}
      </p>
    </div>
  );
}
