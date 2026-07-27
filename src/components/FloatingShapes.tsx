// Ambient background: soft floating translucent squares + orbs.
// Purely decorative, non-interactive, low-cost CSS animations.
const shapes = [
  { left: "6%",  top: "12%", size: 78,  delay: 0,    dur: 22, rot: -12, kind: "sq",  tone: "blue"   },
  { left: "82%", top: "8%",  size: 54,  delay: 3,    dur: 26, rot: 18,  kind: "sq",  tone: "gold"   },
  { left: "18%", top: "68%", size: 110, delay: 6,    dur: 30, rot: 24,  kind: "sq",  tone: "copper" },
  { left: "72%", top: "78%", size: 64,  delay: 1.5,  dur: 24, rot: -8,  kind: "sq",  tone: "blue"   },
  { left: "48%", top: "38%", size: 40,  delay: 4,    dur: 20, rot: 30,  kind: "sq",  tone: "gold"   },
  { left: "38%", top: "88%", size: 90,  delay: 2,    dur: 28, rot: -20, kind: "orb", tone: "blue"   },
  { left: "90%", top: "48%", size: 70,  delay: 5,    dur: 26, rot: 10,  kind: "orb", tone: "copper" },
  { left: "3%",  top: "42%", size: 46,  delay: 7,    dur: 23, rot: -14, kind: "sq",  tone: "gold"   },
];

const toneClass: Record<string, string> = {
  blue:   "from-baba-blue/25 to-baba-blue-light/10 border-baba-blue/25",
  gold:   "from-brand-yellow/30 to-baba-copper/10 border-brand-yellow/30",
  copper: "from-baba-copper/25 to-baba-copper-dark/10 border-baba-copper/25",
};

export function FloatingShapes() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {shapes.map((s, i) => (
        <span
          key={i}
          className={`baba-shape absolute block bg-gradient-to-br ${toneClass[s.tone]} border backdrop-blur-[2px] ${
            s.kind === "orb" ? "rounded-full" : "rounded-2xl"
          }`}
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
            ["--baba-rot" as string]: `${s.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
