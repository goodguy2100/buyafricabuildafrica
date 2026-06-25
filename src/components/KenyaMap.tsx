import { MapPin } from "lucide-react";
import kenyaMap from "@/assets/kenya-map.webp";

const regions = [
  { name: "Nairobi", x: 60, y: 64 },
  { name: "Central", x: 56, y: 54 },
  { name: "Rift Valley", x: 42, y: 50 },
  { name: "Western", x: 26, y: 50 },
  { name: "Coast", x: 78, y: 82 },
];

export function KenyaMap() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
      <img
        src={kenyaMap}
        alt="Map of Kenya showing BABA active regions"
        className="h-full w-full object-contain opacity-80 drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
      />

      <div className="absolute inset-0">
        {regions.map((r, i) => (
          <div
            key={r.name}
            className="absolute flex items-center gap-1.5 animate-fade-in"
            style={{
              left: `${r.x}%`,
              top: `${r.y}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.15}s`,
            }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full bg-baba-copper opacity-75"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-baba-copper" />
            </span>
            <span className="whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-baba-slate shadow-sm">
              {r.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
