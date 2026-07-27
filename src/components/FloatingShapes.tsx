import { useEffect, useRef } from "react";
import { useMotion } from "@/lib/motion";

export type ShapePreset = "home" | "directory" | "pillars" | "opportunities" | "default";

type Shape = {
  left: string;
  top: string;
  size: number;
  delay: number;
  dur: number;
  rot: number;
  kind: "sq" | "orb" | "ring" | "diamond";
  tone: "blue" | "gold" | "copper" | "sky";
  /** Parallax speed multiplier for scroll (-0.15 .. 0.15 recommended). */
  speed: number;
};

const toneClass: Record<Shape["tone"], string> = {
  blue: "from-baba-blue/25 to-baba-blue-light/10 border-baba-blue/25",
  gold: "from-brand-yellow/30 to-baba-copper/10 border-brand-yellow/30",
  copper: "from-baba-copper/25 to-baba-copper-dark/10 border-baba-copper/25",
  sky: "from-baba-blue-light/25 to-baba-blue/5 border-baba-blue-light/30",
};

const shapeClass = (kind: Shape["kind"]) => {
  switch (kind) {
    case "orb": return "rounded-full";
    case "ring": return "rounded-full border-2 bg-transparent";
    case "diamond": return "rounded-lg rotate-45";
    default: return "rounded-2xl";
  }
};

// Per-route palettes — each page gets a distinct vibe.
const PRESETS: Record<ShapePreset, Shape[]> = {
  home: [
    { left: "6%",  top: "12%", size: 78,  delay: 0,   dur: 22, rot: -12, kind: "sq",   tone: "blue",   speed: 0.08 },
    { left: "82%", top: "8%",  size: 54,  delay: 3,   dur: 26, rot: 18,  kind: "sq",   tone: "gold",   speed: -0.06 },
    { left: "18%", top: "68%", size: 110, delay: 6,   dur: 30, rot: 24,  kind: "sq",   tone: "copper", speed: 0.12 },
    { left: "72%", top: "78%", size: 64,  delay: 1.5, dur: 24, rot: -8,  kind: "orb",  tone: "blue",   speed: -0.09 },
    { left: "48%", top: "38%", size: 40,  delay: 4,   dur: 20, rot: 30,  kind: "sq",   tone: "gold",   speed: 0.05 },
    { left: "38%", top: "88%", size: 90,  delay: 2,   dur: 28, rot: -20, kind: "orb",  tone: "blue",   speed: 0.10 },
    { left: "90%", top: "48%", size: 70,  delay: 5,   dur: 26, rot: 10,  kind: "orb",  tone: "copper", speed: -0.08 },
    { left: "3%",  top: "42%", size: 46,  delay: 7,   dur: 23, rot: -14, kind: "sq",   tone: "gold",   speed: 0.07 },
  ],
  // Directory: airier, cooler, ring accents (like map ripples).
  directory: [
    { left: "8%",  top: "18%", size: 120, delay: 0,   dur: 34, rot: 0,   kind: "ring", tone: "blue",   speed: 0.10 },
    { left: "88%", top: "24%", size: 80,  delay: 2,   dur: 28, rot: 0,   kind: "ring", tone: "sky",    speed: -0.08 },
    { left: "72%", top: "70%", size: 150, delay: 4,   dur: 38, rot: 0,   kind: "ring", tone: "blue",   speed: 0.12 },
    { left: "14%", top: "82%", size: 60,  delay: 1,   dur: 24, rot: 0,   kind: "orb",  tone: "sky",    speed: -0.06 },
    { left: "48%", top: "50%", size: 34,  delay: 3,   dur: 22, rot: 0,   kind: "orb",  tone: "gold",   speed: 0.14 },
    { left: "30%", top: "12%", size: 44,  delay: 5,   dur: 26, rot: 0,   kind: "orb",  tone: "blue",   speed: 0.05 },
  ],
  // Pillars: bold, structural — diamonds & solid squares in warm tones.
  pillars: [
    { left: "10%", top: "14%", size: 70,  delay: 0,   dur: 24, rot: 0,   kind: "diamond", tone: "copper", speed: 0.09 },
    { left: "78%", top: "10%", size: 58,  delay: 2,   dur: 28, rot: 0,   kind: "diamond", tone: "gold",   speed: -0.07 },
    { left: "20%", top: "62%", size: 96,  delay: 5,   dur: 32, rot: 12,  kind: "sq",      tone: "blue",   speed: 0.11 },
    { left: "82%", top: "58%", size: 84,  delay: 3,   dur: 30, rot: -14, kind: "sq",      tone: "copper", speed: -0.10 },
    { left: "50%", top: "36%", size: 44,  delay: 4,   dur: 22, rot: 0,   kind: "diamond", tone: "gold",   speed: 0.06 },
    { left: "40%", top: "86%", size: 68,  delay: 1,   dur: 26, rot: 24,  kind: "sq",      tone: "blue",   speed: 0.13 },
  ],
  // Opportunities: energetic, upward — orbs rising through gold accents.
  opportunities: [
    { left: "12%", top: "80%", size: 74,  delay: 0,   dur: 20, rot: 0,   kind: "orb", tone: "gold",   speed: 0.14 },
    { left: "86%", top: "72%", size: 96,  delay: 2,   dur: 24, rot: 0,   kind: "orb", tone: "copper", speed: 0.12 },
    { left: "28%", top: "40%", size: 46,  delay: 4,   dur: 18, rot: 0,   kind: "orb", tone: "gold",   speed: 0.16 },
    { left: "68%", top: "30%", size: 62,  delay: 1,   dur: 22, rot: 0,   kind: "orb", tone: "blue",   speed: 0.10 },
    { left: "48%", top: "8%",  size: 82,  delay: 3,   dur: 26, rot: 12,  kind: "sq",  tone: "copper", speed: -0.06 },
    { left: "6%",  top: "16%", size: 40,  delay: 5,   dur: 20, rot: -8,  kind: "sq",  tone: "gold",   speed: 0.08 },
  ],
  default: [
    { left: "10%", top: "20%", size: 70,  delay: 0,   dur: 24, rot: -10, kind: "sq",  tone: "blue",   speed: 0.08 },
    { left: "80%", top: "18%", size: 54,  delay: 3,   dur: 28, rot: 14,  kind: "sq",  tone: "gold",   speed: -0.06 },
    { left: "20%", top: "72%", size: 90,  delay: 6,   dur: 30, rot: 20,  kind: "orb", tone: "copper", speed: 0.10 },
    { left: "78%", top: "78%", size: 60,  delay: 2,   dur: 26, rot: -8,  kind: "orb", tone: "blue",   speed: -0.08 },
  ],
};

export function FloatingShapes({ preset = "default" }: { preset?: ShapePreset }) {
  const { motionEnabled, isCompact } = useMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Reduce visual load on mobile: keep only every 3rd shape.
  const shapes = isCompact
    ? PRESETS[preset].filter((_, i) => i % 3 === 0)
    : PRESETS[preset];

  // rAF-throttled scroll → CSS custom property for parallax.
  // Skip entirely on mobile — scroll listeners + transforms kill perf.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !motionEnabled || isCompact) {
      if (wrap) wrap.style.setProperty("--baba-scroll", "0");
      return;
    }
    let raf = 0;
    let pending = false;
    const update = () => {
      raf = 0;
      pending = false;
      wrap.style.setProperty("--baba-scroll", String(window.scrollY));
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [motionEnabled, preset, isCompact]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      data-motion={motionEnabled ? "on" : "off"}
    >
      {shapes.map((s, i) => (
        <span
          key={`${preset}-${i}`}
          className="baba-shape-wrap absolute block"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            ["--baba-parallax" as string]: String(s.speed),
          }}
        >
          <span
            className={`baba-shape block h-full w-full bg-gradient-to-br ${toneClass[s.tone]} border ${shapeClass(s.kind)}`}
            style={{
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.dur}s`,
              ["--baba-rot" as string]: `${s.rot}deg`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
