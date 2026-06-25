import kenyaMap from "@/assets/kenya-map.png";

// Pop order: Nairobi → Coast → Central → Rift Valley → Western
const regions = [
  { name: "Nairobi", x: 62, y: 66 },
  { name: "Coast", x: 80, y: 86 },
  { name: "Central", x: 60, y: 52 },
  { name: "Rift Valley", x: 42, y: 56 },
  { name: "Western", x: 24, y: 46 },
];

export function KenyaMap() {
  return (
    <div className="relative mx-auto aspect-[417/548] w-full max-w-sm">
      <img
        src={kenyaMap}
        alt="Map of Kenya showing BABA active regions"
        className="h-full w-full object-contain"
        loading="lazy"
      />

      <div className="absolute inset-0">
        {regions.map((r, i) => (
          <div
            key={r.name}
            className="baba-pin absolute flex items-center gap-1.5"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${0.3 + i * 0.45}s`,
            }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-baba-copper"
                style={{ animation: `baba-pin-ping 1.6s ease-out ${0.6 + i * 0.45}s infinite` }}
              />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-baba-copper ring-2 ring-white/70" />
            </span>
            <span className="whitespace-nowrap text-xs font-bold text-white drop-shadow">
              {r.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
