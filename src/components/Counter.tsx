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
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const { value, ref } = useCountUp(target);
  return (
    <div className="text-center">
      <span
        ref={ref}
        className="block font-display text-3xl font-extrabold tracking-tight text-baba-alabaster sm:text-4xl"
      >
        {value.toLocaleString()}
        {suffix}
      </span>
      <span className="mt-1 block text-[0.65rem] font-semibold uppercase tracking-widest text-baba-copper">
        {label}
      </span>
    </div>
  );
}
