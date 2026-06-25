import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { value, ref };
}

export function Counter({
  target,
  label,
  suffix = "",
  tone = "light",
}: {
  target: number;
  label: string;
  suffix?: string;
  tone?: "light" | "dark";
}) {
  const { value, ref } = useCountUp(target);
  const valueColor = tone === "dark" ? "text-baba-blue" : "text-baba-cream";
  const labelColor = tone === "dark" ? "text-baba-slate/60" : "text-baba-copper";
  return (
    <div className="text-center">
      <span
        ref={ref}
        className={`block font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${valueColor}`}
      >
        {value.toLocaleString()}
        {suffix}
      </span>
      <span className={`mt-1 block text-[0.65rem] font-semibold uppercase tracking-widest ${labelColor}`}>
        {label}
      </span>
    </div>
  );
}

/** Small pulsing badge that signals a live, real-time data feed. */
export function LiveBadge({ label = "Live Impact" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-baba-blue/20 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-widest text-baba-blue shadow-sm backdrop-blur">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />
      </span>
      {label}
    </span>
  );
}
