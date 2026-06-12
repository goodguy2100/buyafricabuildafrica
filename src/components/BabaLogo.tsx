import React from "react";

interface BabaLogoProps {
  className?: string;
  showText?: boolean;
}

export function BabaLogo({ className = "h-14 w-14", showText = true }: BabaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className ? "" : ""}`}>
      {/* Scalable SVG logo — simple emblem (buildings + hands) so it remains crisp at any size */}
      <svg
        viewBox="0 0 120 120"
        role="img"
        aria-label="Buy Africa Build Africa logo"
        className="shrink-0"
        width="56"
        height="56"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#049c98" />
            <stop offset="100%" stopColor="#07b6c6" />
          </linearGradient>
        </defs>

        {/* background rounded shape */}
        <rect x="0" y="0" width="120" height="120" rx="20" fill="url(#g1)" />

        {/* buildings */}
        <rect x="36" y="38" width="12" height="34" rx="1.5" fill="#ffffff" opacity="0.95" />
        <rect x="52" y="30" width="14" height="42" rx="1.5" fill="#ffffff" opacity="0.95" />
        <rect x="70" y="44" width="8" height="28" rx="1" fill="#ffffff" opacity="0.95" />

        {/* windows */}
        <rect x="38" y="42" width="3" height="4" rx="0.5" fill="#049c98" />
        <rect x="38" y="48" width="3" height="4" rx="0.5" fill="#049c98" />
        <rect x="54" y="34" width="3" height="4" rx="0.5" fill="#049c98" />
        <rect x="60" y="34" width="3" height="4" rx="0.5" fill="#049c98" />
        <rect x="72" y="48" width="2" height="3" rx="0.4" fill="#049c98" />

        {/* hands (stylized) */}
        <path d="M20 80 C32 60, 44 58, 56 72" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.95" />
        <path d="M100 80 C88 60, 76 58, 64 72" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.95" />
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="font-display text-lg font-extrabold tracking-wide text-baba-teal">
            Buy Africa
          </div>
          <div className="font-display text-lg font-extrabold tracking-wide text-baba-teal">
            Build Africa
          </div>
        </div>
      )}
    </div>
  );
}
