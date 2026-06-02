interface BabaLogoProps {
  className?: string;
  showText?: boolean;
}

export function BabaLogo({ className = "h-10 w-10", showText = true }: BabaLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="babaCopper" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5A059" />
            <stop offset="100%" stopColor="#A68648" />
          </linearGradient>
        </defs>
        <path
          d="M100 40 C110 40, 125 45, 135 60 C145 75, 140 90, 135 105 C130 120, 120 135, 110 150 C105 158, 100 165, 95 160 C90 155, 80 145, 75 130 C70 115, 65 100, 70 85 C75 70, 85 45, 100 40 Z"
          fill="#0A6C74"
        />
        <path
          d="M90 70 L110 70 M95 85 L115 85 M100 100 L120 100"
          stroke="#FAF9F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M105 60 L105 110"
          stroke="#FAF9F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M60 140 C50 130, 45 110, 50 90 C55 70, 70 55, 85 50"
          fill="none"
          stroke="url(#babaCopper)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M140 140 C150 130, 155 110, 150 90 C145 70, 130 55, 115 50"
          fill="none"
          stroke="url(#babaCopper)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="font-display text-xl font-extrabold tracking-tight text-baba-teal">
          BABA
        </span>
      )}
    </div>
  );
}
