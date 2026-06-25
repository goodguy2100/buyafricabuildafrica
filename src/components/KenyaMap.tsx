import kenyaMap from "@/assets/kenya-map.png";

// Pop order: Nairobi → Coast → Central → Rift Valley → Western
const regions = [
  { name: "Nairobi", x: 57, y: 58 },
  { name: "Coast", x: 72, y: 80 },
  { name: "Central", x: 56, y: 43 },
  { name: "Rift Valley", x: 39, y: 50 },
  { name: "Western", x: 19, y: 45 },
];

export function KenyaMap() {
  return (
    <div className="relative mx-auto aspect-[744/956] w-full max-w-sm">
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
            <span className="relative flex h-3 w-3">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-baba-copper"
                style={{ animation: `baba-pin-ping 1.6s ease-out ${0.6 + i * 0.45}s infinite` }}
              />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-baba-copper ring-2 ring-white" />
            </span>
            <span className="whitespace-nowrap text-xs font-bold text-baba-slate">
              {r.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
