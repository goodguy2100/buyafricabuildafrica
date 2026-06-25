import { useId } from "react";

export function AfricaMap({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 500 600" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Africa continent outline */}
      <path d="M250 30 L280 45 L300 60 L310 80 L320 100 L330 120 L340 140 
               L350 160 L355 180 L360 200 L365 220 L370 240 L375 260
               L380 280 L385 300 L380 320 L370 340 L360 360
               L350 380 L340 400 L330 420 L320 440 L310 460
               L300 480 L290 500 L280 520 L270 540 L260 555
               L250 565 L240 555 L230 540 L220 520 L210 500
               L200 480 L190 460 L180 440 L170 420 L160 400
               L150 380 L140 360 L130 340 L120 320 L115 300
               L110 280 L115 260 L120 240 L125 220 L130 200
               L135 180 L140 160 L150 140 L160 120 L170 100
               L180 80 L190 65 L200 50 L210 40 L220 35 L230 32 L240 30 L250 30Z"
        fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" />
      
      {/* Country dots */}
      <circle cx="180" cy="320" r="4" fill="#C5A059" className="animate-pulse-glow" /> {/* Nigeria */}
      <circle cx="240" cy="370" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* Kenya */}
      <circle cx="230" cy="420" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* Tanzania */}
      <circle cx="270" cy="440" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* South Africa */}
      <circle cx="200" cy="200" r="4" fill="#C5A059" className="animate-pulse-glow" /> {/* Egypt */}
      <circle cx="250" cy="300" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* DRC */}
      <circle cx="140" cy="360" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* Ghana */}
      <circle cx="180" cy="240" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* Sudan */}
      <circle cx="320" cy="400" r="3" fill="#C5A059" className="animate-pulse-glow" /> {/* Madagascar */}
      <circle cx="220" cy="470" r="4" fill="#C5A059" className="animate-pulse-glow" /> {/* Botswana */}
      
      {/* Dot labels */}
      <text x="180" y="315" textAnchor="end" fontSize="8" fill="currentColor" fillOpacity="0.6">Nigeria</text>
      <text x="240" y="365" textAnchor="end" fontSize="8" fill="currentColor" fillOpacity="0.6">Kenya</text>
      <text x="200" y="195" textAnchor="end" fontSize="8" fill="currentColor" fillOpacity="0.6">Egypt</text>
      <text x="280" y="445" textAnchor="start" fontSize="8" fill="currentColor" fillOpacity="0.6">South Africa</text>
    </svg>
  );
}
