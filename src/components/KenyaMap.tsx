import kenyaMap from "@/assets/kenya-map.webp";

const regions = [
  { name: "Nairobi", x: 58, y: 64 },
  { name: "Central", x: 56, y: 45 },
  { name: "Rift Valley", x: 40, y: 57 },
  { name: "Western", x: 23, y: 45 },
  { name: "Coast", x: 78, y: 82 },
];

export function KenyaMap() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
      <img
        src={kenyaMap}
        alt="Map of Kenya showing BABA active regions"
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-0">
        {regions.map((r, i) => (
          <span
            key={r.name}
            className="absolute whitespace-nowrap text-xs font-bold text-baba-slate animate-fade-in"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.15}s`,
            }}
          >
            {r.name}
          </span>
        ))}
      </div>
    </div>
  );
}

